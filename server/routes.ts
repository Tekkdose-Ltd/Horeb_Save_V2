import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import {
  createUser,
  authenticateUser,
  getUserById,
  requireAuth,
} from "./auth";
import { db } from "./db";
import { storage } from "./storage";
import { groupService } from "./services/groupService";

/**
 * API ROUTES
 * 
 * Real authentication + stub endpoints for other features
 */

export async function registerRoutes(app: Express): Promise<Server> {
  
  // ==================== HEALTH CHECK ====================
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      message: "Server running with authentication",
      timestamp: new Date().toISOString(),
      database: db ? "connected" : "not configured",
    });
  });

  // ==================== AUTHENTICATION ENDPOINTS ====================
  
  // Get current user
  app.get("/api/auth/user", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = await getUserById(req.session.userId);
      
      if (!user) {
        req.session.destroy(() => {});
        return res.status(401).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error: any) {
      console.error("Error getting user:", error);
      res.status(500).json({ message: error.message || "Failed to get user" });
    }
  });

  // Login endpoint
  app.post("/api/auth/login", async (req, res) => {
    if (!db) {
      return res.status(503).json({ 
        message: "Database not configured. Add DATABASE_URL to .env" 
      });
    }

    try {
      const schema = z.object({
        email: z.string().email("Invalid email address"),
        password: z.string().min(1, "Password is required"),
      });

      const { email, password } = schema.parse(req.body);

      const user = await authenticateUser(email, password);

      if (!user) {
        return res.status(401).json({ 
          message: "Invalid email or password" 
        });
      }

      // Create session
      req.session.userId = user.id;

      res.json({ 
        message: "Login successful",
        user 
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: error.errors[0].message 
        });
      }
      console.error("Login error:", error);
      res.status(500).json({ 
        message: error.message || "Login failed" 
      });
    }
  });

  // Register endpoint - Full registration with all profile details
  app.post("/api/auth/register", async (req, res) => {
    if (!db) {
      return res.status(503).json({ 
        message: "Database not configured. Add DATABASE_URL to .env" 
      });
    }

    try {
      const { updateProfileSchema } = await import("@shared/schema");
      const { users } = await import("@shared/schema");
      
      const schema = z.object({
        email: z.string().email("Invalid email address"),
        password: z.string()
          .min(8, "Password must be at least 8 characters")
          .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
          .regex(/[a-z]/, "Password must contain at least one lowercase letter")
          .regex(/[0-9]/, "Password must contain at least one number"),
        confirmPassword: z.string().optional(),
      }).merge(updateProfileSchema);

      const { email, password, confirmPassword, ...profileData } = schema.parse(req.body);

      // Create user with hashed password
      const user = await createUser(email, password);

      if (!user) {
        return res.status(500).json({ 
          message: "Failed to create user" 
        });
      }

      // Update profile with additional information
      const { eq } = await import("drizzle-orm");
      const [updatedUser] = await db
        .update(users)
        .set({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          phoneNumber: profileData.phoneNumber,
          dateOfBirth: new Date(profileData.dateOfBirth),
          addressLine1: profileData.addressLine1,
          addressLine2: profileData.addressLine2 || null,
          city: profileData.city,
          postcode: profileData.postcode,
          country: profileData.country,
          profileCompleted: true,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id))
        .returning();

      // Create session
      req.session.userId = user.id;

      res.status(201).json({ 
        message: "Registration successful",
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          profileCompleted: updatedUser.profileCompleted,
        }
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: error.errors[0].message 
        });
      }
      if (error.message === "Email already exists") {
        return res.status(409).json({ 
          message: "An account with this email already exists" 
        });
      }
      console.error("Registration error:", error);
      res.status(500).json({ 
        message: error.message || "Registration failed" 
      });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Logout redirect endpoint
  app.get("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
      }
      res.redirect("/");
    });
  });

  // Login redirect endpoint
  app.get("/api/login", (req, res) => {
    res.redirect("/auth");
  });

  // Update profile (protected)
  app.put("/api/auth/profile", requireAuth, async (req, res) => {
    if (!db) {
      return res.status(503).json({ 
        message: "Database not configured. Add DATABASE_URL to .env" 
      });
    }

    try {
      const { updateProfileSchema } = await import("@shared/schema");
      const { users } = await import("@shared/schema");
      const { eq } = await import("drizzle-orm");

      // Validate the request body
      const profileData = updateProfileSchema.parse(req.body);

      // Update the user's profile
      const [updatedUser] = await db
        .update(users)
        .set({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          phoneNumber: profileData.phoneNumber,
          dateOfBirth: new Date(profileData.dateOfBirth),
          addressLine1: profileData.addressLine1,
          addressLine2: profileData.addressLine2 || null,
          city: profileData.city,
          postcode: profileData.postcode,
          country: profileData.country,
          profileCompleted: true,
          updatedAt: new Date(),
        })
        .where(eq(users.id, req.session.userId!))
        .returning();

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        message: "Profile updated successfully",
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          profileCompleted: updatedUser.profileCompleted,
        },
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: error.errors[0].message 
        });
      }
      console.error("Profile update error:", error);
      res.status(500).json({ 
        message: error.message || "Failed to update profile" 
      });
    }
  });

  // ==================== USER ENDPOINTS ====================
  
  // Upload profile image (protected)
  app.post("/api/user/profile-image", requireAuth, async (req, res) => {
    try {
      // TODO: Implement file upload with multer and cloudinary
      // For now, return a not implemented error with helpful message
      res.status(501).json({ 
        message: "Profile image upload endpoint not yet implemented. Please add multer middleware and cloudinary integration.",
        note: "This endpoint requires: 1) multer for file upload handling, 2) cloudinary configuration for image storage, 3) database update to store profileImageUrl"
      });
    } catch (error: any) {
      console.error("Profile image upload error:", error);
      res.status(500).json({ 
        message: error.message || "Failed to upload profile image" 
      });
    }
  });
  
  // Get user stats (stub)
  app.get("/api/user/stats", (req, res) => {
    res.status(501).json({ 
      message: "User stats endpoint not implemented" 
    });
  });

  // ==================== STRIPE PAYMENT ENDPOINTS ====================
  
  // Create Stripe Setup Session for linking payment methods (protected)
  app.post("/api/stripe/setup-session", requireAuth, async (req, res) => {
    try {
      // TODO: Implement Stripe Setup Session creation
      // This endpoint should:
      // 1. Create a Stripe Customer if user doesn't have one
      // 2. Create a Setup Intent for payment method collection
      // 3. Return the Setup Session URL for redirect
      // 4. Handle webhook for setup completion
      
      res.status(501).json({ 
        message: "Stripe Setup Session endpoint not yet implemented",
        note: "This endpoint requires: 1) Stripe SDK integration, 2) Customer creation/retrieval, 3) Setup Intent creation, 4) Webhook handling for payment method attached event",
        requiredEnvVars: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"],
        nextSteps: [
          "Install @stripe/stripe-js package",
          "Create Stripe customer for user",
          "Generate Setup Intent",
          "Return checkout session URL",
          "Setup webhook endpoint for 'setup_intent.succeeded' event"
        ]
      });
    } catch (error: any) {
      console.error("Stripe setup session error:", error);
      res.status(500).json({ 
        message: error.message || "Failed to create payment setup session" 
      });
    }
  });

  // Stripe webhook handler for payment events
  app.post("/api/stripe/webhook", async (req, res) => {
    try {
      // TODO: Implement Stripe webhook handler
      // Handle events: setup_intent.succeeded, payment_method.attached, etc.
      
      res.status(501).json({ 
        message: "Stripe webhook endpoint not yet implemented",
        note: "This endpoint handles Stripe events for payment method linking and payment processing"
      });
    } catch (error: any) {
      console.error("Stripe webhook error:", error);
      res.status(500).json({ 
        message: error.message || "Webhook processing failed" 
      });
    }
  });

  // ==================== GROUP CONTRIBUTION ENDPOINTS ====================

  app.post("/api/groups/activate_contribution", requireAuth, async (req, res) => {
    if (!db) {
      return res.status(503).json({
        message: "Database not configured. Add DATABASE_URL to .env",
      });
    }

    try {
      const schema = z.object({
        group_id: z.string().min(1, "Group ID is required"),
      });

      const { group_id } = schema.parse(req.body);
      const group = await storage.getGroupWithMembers(group_id);

      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }

      const userId = req.session?.userId;
      if (!userId || group.creatorId !== userId) {
        return res.status(403).json({
          message: "Only group admins can start the payment rotation",
        });
      }

      if (group.status === "active") {
        return res.status(400).json({
          message: "This group is already active",
        });
      }

      if (group.members.length < group.maxMembers) {
        return res.status(400).json({
          message: "All members must join before starting the payment rotation",
        });
      }

      const incompleteMembers = group.members.filter(
        (member) => !member.user.profileCompleted || !member.user.stripeCustomerId
      );

      if (incompleteMembers.length > 0) {
        const names = incompleteMembers
          .map((member) => {
            const first = member.user.firstName || "";
            const last = member.user.lastName || "";
            return `${first} ${last}`.trim() || member.user.email;
          })
          .join(", ");

        return res.status(400).json({
          message: `All members must complete their payment setup before starting rotation. Missing: ${names}`,
        });
      }

      const nextPayoutDate = (() => {
        const now = new Date();
        const nextDate = new Date(now);

        switch (group.frequency) {
          case "hourly":
            nextDate.setHours(now.getHours() + 1);
            break;
          case "weekly":
            nextDate.setDate(now.getDate() + 7);
            break;
          case "bi-weekly":
            nextDate.setDate(now.getDate() + 14);
            break;
          case "monthly":
          default:
            nextDate.setMonth(now.getMonth() + 1);
            break;
        }

        return nextDate;
      })();

      await storage.updateGroup(group.id, {
        status: "active",
        startDate: new Date(),
        currentRound: 1,
        nextPayoutDate,
      });

      await groupService.assignPayoutOrder(group.id);
      await groupService.createContributionsForRound(group, 1);

      return res.json({
        message: "Payment rotation started successfully",
        groupId: group.id,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }

      console.error("Activate contribution error:", error);
      return res.status(500).json({
        message: error.message || "Failed to start payment rotation",
      });
    }
  });

  // ==================== GROUPS ENDPOINTS ====================
  
  // Get user's groups (stub)
  app.get("/api/groups/my", (req, res) => {
    res.status(501).json({ 
      message: "My groups endpoint not implemented" 
    });
  });

  // Get public groups (stub)
  app.get("/api/groups/public", (req, res) => {
    res.status(501).json({ 
      message: "Public groups endpoint not implemented" 
    });
  });

  // Create group (stub)
  app.post("/api/groups", (req, res) => {
    res.status(501).json({ 
      message: "Create group endpoint not implemented" 
    });
  });

  // Get group details (stub)
  app.get("/api/groups/:id", (req, res) => {
    res.status(501).json({ 
      message: "Group details endpoint not implemented" 
    });
  });

  // Update group (stub)
  app.put("/api/groups/:id", (req, res) => {
    res.status(501).json({ 
      message: "Update group endpoint not implemented" 
    });
  });

  // Delete group (stub)
  app.delete("/api/groups/:id", (req, res) => {
    res.status(501).json({ 
      message: "Delete group endpoint not implemented" 
    });
  });

  // Join group (stub)
  app.post("/api/groups/:id/join", (req, res) => {
    res.status(501).json({ 
      message: "Join group endpoint not implemented" 
    });
  });

  // Leave group (stub)
  app.post("/api/groups/:id/leave", (req, res) => {
    res.status(501).json({ 
      message: "Leave group endpoint not implemented" 
    });
  });

  // Get group members (stub)
  app.get("/api/groups/:id/members", (req, res) => {
    res.status(501).json({ 
      message: "Group members endpoint not implemented" 
    });
  });

  // ==================== TRANSACTIONS ENDPOINTS ====================
  
  // Get user transactions (stub)
  app.get("/api/transactions/my", (req, res) => {
    res.status(501).json({ 
      message: "Transactions endpoint not implemented" 
    });
  });

  // Get user contributions (stub)
  app.get("/api/contributions/my", (req, res) => {
    res.status(501).json({ 
      message: "Contributions endpoint not implemented" 
    });
  });

  // Create transaction (stub)
  app.post("/api/transactions", (req, res) => {
    res.status(501).json({ 
      message: "Create transaction endpoint not implemented" 
    });
  });

  // ==================== NOTIFICATIONS ENDPOINTS ====================
  
  // Get notifications (stub)
  app.get("/api/notifications", (req, res) => {
    res.status(501).json({ 
      message: "Notifications endpoint not implemented" 
    });
  });

  // Mark notification as read (stub)
  app.put("/api/notifications/:id/read", (req, res) => {
    res.status(501).json({ 
      message: "Mark notification read not implemented" 
    });
  });

  // ==================== PAYMENT ENDPOINTS ====================
  
  // Setup intent (stub)
  app.post("/api/payment/setup-intent", (req, res) => {
    res.status(501).json({ 
      message: "Payment setup endpoint not implemented" 
    });
  });

  // Get payment methods (stub)
  app.get("/api/payment/methods", (req, res) => {
    res.status(501).json({ 
      message: "Payment methods endpoint not implemented" 
    });
  });

  // Add payment method (stub)
  app.post("/api/payment/methods", (req, res) => {
    res.status(501).json({ 
      message: "Add payment method endpoint not implemented" 
    });
  });

  // Delete payment method (stub)
  app.delete("/api/payment/methods/:id", (req, res) => {
    res.status(501).json({ 
      message: "Delete payment method endpoint not implemented" 
    });
  });

  // ==================== WAITLIST ENDPOINT ====================
  
  // Join waitlist (stub)
  app.post("/api/waitlist/join", (req, res) => {
    res.status(501).json({ 
      message: "Waitlist endpoint not implemented - Add your database logic here" 
    });
  });

  // ==================== CATCH ALL ====================
  
  // Catch-all for undefined routes handled by error middleware

  return createServer(app);
}
