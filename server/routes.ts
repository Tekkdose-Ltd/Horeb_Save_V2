import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { storage } from "./storage";
import { groupService } from "./services/groupService";
import { paymentService } from "./services/paymentService";
import {
  sendGroupInvitationEmail,
  sendWelcomeEmail,
  sendGroupCreatedEmail,
} from "./services/emailService";
import { insertGroupSchema, insertGroupMemberSchema } from "@shared/schema";
import { z } from "zod";
import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
}) : null;

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User stats
  app.get("/api/user/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  // Group routes
  app.post("/api/groups", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;

      // Convert contributionAmount to string for decimal field
      const requestData = {
        ...req.body,
        contributionAmount: req.body.contributionAmount.toString(),
        creatorId: userId,
        totalRounds: req.body.maxMembers, // Default rounds equal to max members
      };

      const groupData = insertGroupSchema.parse(requestData);

      const group = await storage.createGroup(groupData);

      // Add creator as first member
      await storage.addGroupMember({
        groupId: group.id,
        userId,
        payoutOrder: 1,
      });

      // Send group creation email notification
      try {
        const user = await storage.getUser(userId);
        if (user?.email) {
          await sendGroupCreatedEmail(
            user.email,
            user.firstName || user.lastName || "Member",
            group.name,
            requestData.contributionAmount,
            requestData.frequency,
            requestData.maxMembers
          );
        }
      } catch (emailError) {
        console.error("Failed to send group creation email:", emailError);
        // Don't fail the group creation if email fails
      }

      res.json(group);
    } catch (error) {
      console.error("Error creating group:", error);
      if (error instanceof z.ZodError) {
        console.error("Validation errors:", error.issues);
        res.status(400).json({
          message: "Validation failed",
          errors: error.issues,
        });
      } else {
        res.status(400).json({ message: "Failed to create group" });
      }
    }
  });

  app.get("/api/groups/my", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const groups = await storage.getUserGroups(userId);
      res.json(groups);
    } catch (error) {
      console.error("Error fetching user groups:", error);
      res.status(500).json({ message: "Failed to fetch groups" });
    }
  });

  app.get("/api/groups/public", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const groups = await storage.getPublicGroups(limit);
      res.json(groups);
    } catch (error) {
      console.error("Error fetching public groups:", error);
      res.status(500).json({ message: "Failed to fetch public groups" });
    }
  });

  app.get("/api/groups/:id", isAuthenticated, async (req: any, res) => {
    try {
      const groupId = req.params.id;
      const group = await storage.getGroupWithMembers(groupId);

      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }

      // Check if user is member or creator
      const userId = req.user.claims.sub;
      const isMember = group.members.some((member) => member.userId === userId);
      const isCreator = group.creatorId === userId;

      if (!isMember && !isCreator && !group.isPublic) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(group);
    } catch (error) {
      console.error("Error fetching group:", error);
      res.status(500).json({ message: "Failed to fetch group" });
    }
  });

  app.post("/api/groups/:id/join", isAuthenticated, async (req: any, res) => {
    try {
      const groupId = req.params.id;
      const userId = req.user.claims.sub;

      const group = await storage.getGroupWithMembers(groupId);
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }

      if (group.members.length >= group.maxMembers) {
        return res.status(400).json({ message: "Group is full" });
      }

      if (group.status !== "draft") {
        return res
          .status(400)
          .json({ message: "Group is not accepting new members" });
      }

      // Check if user is already a member
      const existingMember = group.members.find(
        (member) => member.userId === userId
      );
      if (existingMember) {
        return res
          .status(400)
          .json({ message: "Already a member of this group" });
      }

      const member = await storage.addGroupMember({
        groupId,
        userId,
        payoutOrder: group.members.length + 1,
      });

      // Create notification
      await storage.createNotification({
        userId,
        groupId,
        type: "group_joined",
        title: "Group Joined",
        message: `You have successfully joined ${group.name}.`,
      });

      res.json(member);
    } catch (error) {
      console.error("Error joining group:", error);
      res.status(400).json({ message: "Failed to join group" });
    }
  });

  app.post("/api/groups/:id/start", isAuthenticated, async (req: any, res) => {
    try {
      const groupId = req.params.id;
      const userId = req.user.claims.sub;

      const group = await storage.getGroup(groupId);
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }

      if (group.creatorId !== userId) {
        return res
          .status(403)
          .json({ message: "Only group creator can start the group" });
      }

      await groupService.startGroup(groupId);
      res.json({ message: "Group started successfully" });
    } catch (error) {
      console.error("Error starting group:", error);
      res.status(400).json({
        message:
          error instanceof Error ? error.message : "Failed to start group",
      });
    }
  });

  app.post("/api/groups/:id/invite", isAuthenticated, async (req: any, res) => {
    try {
      const groupId = req.params.id;
      const userId = req.user.claims.sub;
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const group = await storage.getGroup(groupId);
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }

      if (group.creatorId !== userId) {
        return res
          .status(403)
          .json({ message: "Only group creator can send invitations" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const inviterName =
        `${user.firstName} ${user.lastName}`.trim() || "A CircleSave member";

      await sendGroupInvitationEmail(
        email,
        inviterName,
        group.name,
        group.inviteCode!
      );

      res.json({ message: "Invitation sent successfully" });
    } catch (error) {
      console.error("Error sending invitation:", error);
      res.status(500).json({ message: "Failed to send invitation" });
    }
  });

  // Payment routes
  app.post(
    "/api/contributions/:id/pay",
    isAuthenticated,
    async (req: any, res) => {
      try {
        const contributionId = req.params.id;
        const userId = req.user.claims.sub;

        const contribution = await storage.getContribution(contributionId);
        if (!contribution) {
          return res.status(404).json({ message: "Contribution not found" });
        }

        if (contribution.userId !== userId) {
          return res
            .status(403)
            .json({ message: "Not authorized to pay this contribution" });
        }

        if (contribution.status !== "pending") {
          return res
            .status(400)
            .json({ message: "Contribution is not pending payment" });
        }

        const { clientSecret, paymentIntentId } =
          await paymentService.createPaymentIntent(
            userId,
            contributionId,
            Number(contribution.amount)
          );

        res.json({ clientSecret, paymentIntentId });
      } catch (error) {
        console.error("Error creating payment intent:", error);
        res.status(500).json({ message: "Failed to create payment intent" });
      }
    }
  );

  // Stripe webhook for payment confirmation
  app.post("/api/webhook/stripe", async (req, res) => {
    try {
      const { type, data } = req.body;

      if (type === "payment_intent.succeeded") {
        await paymentService.handlePaymentSuccess(data.object.id);
      } else if (type === "payment_intent.payment_failed") {
        await paymentService.handlePaymentFailure(data.object.id);
      }

      res.json({ received: true });
    } catch (error) {
      console.error("Error handling Stripe webhook:", error);
      res.status(400).json({ message: "Webhook error" });
    }
  });

  // Transaction routes
  app.get("/api/transactions/my", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 10;
      const transactions = await storage.getUserTransactions(userId, limit);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching user transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Notification routes
  app.get("/api/notifications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const unreadOnly = req.query.unread === "true";
      const notifications = await storage.getUserNotifications(
        userId,
        unreadOnly
      );
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.put(
    "/api/notifications/:id/read",
    isAuthenticated,
    async (req: any, res) => {
      try {
        const notificationId = req.params.id;
        await storage.markNotificationAsRead(notificationId);
        res.json({ message: "Notification marked as read" });
      } catch (error) {
        console.error("Error marking notification as read:", error);
        res
          .status(500)
          .json({ message: "Failed to mark notification as read" });
      }
    }
  );

  app.put(
    "/api/notifications/read-all",
    isAuthenticated,
    async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        await storage.markAllNotificationsAsRead(userId);
        res.json({ message: "All notifications marked as read" });
      } catch (error) {
        console.error("Error marking all notifications as read:", error);
        res
          .status(500)
          .json({ message: "Failed to mark all notifications as read" });
      }
    }
  );

  // Contribution routes
  app.get("/api/contributions/my", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const groupId = req.query.groupId as string;
      const contributions = await storage.getUserContributions(userId, groupId);
      res.json(contributions);
    } catch (error) {
      console.error("Error fetching user contributions:", error);
      res.status(500).json({ message: "Failed to fetch contributions" });
    }
  });

  // Payment Methods routes
  app.post("/api/create-setup-intent", isAuthenticated, async (req: any, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ message: "Stripe not configured" });
      }

      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get or create Stripe customer
      let customerId = user.stripeCustomerId;
      if (!customerId && user.email) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: `${user.firstName} ${user.lastName}`.trim(),
        });
        customerId = customer.id;
        await storage.updateUserStripeCustomerId(userId, customerId);
      }

      // Create setup intent
      const setupIntent = await stripe.setupIntents.create({
        customer: customerId,
        payment_method_types: ['card'],
      });

      res.json({ clientSecret: setupIntent.client_secret });
    } catch (error: any) {
      console.error("Error creating setup intent:", error);
      res.status(500).json({ message: "Failed to create setup intent" });
    }
  });

  app.get("/api/payment-methods", isAuthenticated, async (req: any, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ message: "Stripe not configured" });
      }

      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user || !user.stripeCustomerId) {
        return res.json([]);
      }

      const paymentMethods = await stripe.paymentMethods.list({
        customer: user.stripeCustomerId,
        type: 'card',
      });

      res.json(paymentMethods.data);
    } catch (error: any) {
      console.error("Error fetching payment methods:", error);
      res.status(500).json({ message: "Failed to fetch payment methods" });
    }
  });

  app.delete("/api/payment-methods/:id", isAuthenticated, async (req: any, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ message: "Stripe not configured" });
      }

      const paymentMethodId = req.params.id;
      await stripe.paymentMethods.detach(paymentMethodId);

      res.json({ message: "Payment method removed" });
    } catch (error: any) {
      console.error("Error removing payment method:", error);
      res.status(500).json({ message: "Failed to remove payment method" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
