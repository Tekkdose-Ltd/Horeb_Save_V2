import { storage } from "../storage";
import {
  sendPayoutNotificationEmail,
  sendPaymentReminderEmail,
} from "./emailService";
import type { Group, GroupMember, User } from "@shared/schema";

export class GroupService {
  async processGroupRotation(groupId: string): Promise<void> {
    const group = await storage.getGroupWithMembers(groupId);
    if (!group || group.status !== "active") {
      return;
    }

    // Find next member to receive payout
    const nextRecipient = group.members.find(
      (member) => !member.hasReceivedPayout && member.isActive
    );

    if (!nextRecipient) {
      // All members have received payout, complete the group
      await this.completeGroup(groupId);
      return;
    }

    // Calculate payout amount
    const payoutAmount =
      Number(group.contributionAmount) * group.members.length;

    // Create payout transaction
    await storage.createTransaction({
      groupId: group.id,
      toUserId: nextRecipient.userId,
      amount: payoutAmount.toString(),
      type: "payout",
      round: group.currentRound,
      description: `Payout for round ${group.currentRound}`,
    });

    // Mark member as having received payout
    await storage.updateGroupMember(groupId, nextRecipient.userId, {
      hasReceivedPayout: true,
      payoutReceivedAt: new Date(),
    });

    // Send notification
    await storage.createNotification({
      userId: nextRecipient.userId,
      groupId: group.id,
      type: "payout_ready",
      title: "Payout Ready!",
      message: `Your payout of $${payoutAmount} from ${group.name} is ready.`,
    });

    // Send email notification
    if (nextRecipient.user.email) {
      await sendPayoutNotificationEmail(
        nextRecipient.user.email,
        nextRecipient.user.firstName || "Member",
        group.name,
        payoutAmount,
        new Date()
      );
    }

    // Update group for next round
    await storage.updateGroup(groupId, {
      currentRound: group.currentRound + 1,
      nextPayoutDate: this.calculateNextPayoutDate(group),
    });

    // Create contributions for next round if not the last round
    if (group.currentRound < group.totalRounds) {
      await this.createContributionsForRound(group, group.currentRound + 1);
    }
  }

  async createContributionsForRound(
    group: Group & { members: (GroupMember & { user: User })[] },
    round: number
  ): Promise<void> {
    const dueDate = this.calculateNextPayoutDate(group);

    for (const member of group.members) {
      if (member.isActive) {
        await storage.createContribution({
          groupId: group.id,
          userId: member.userId,
          amount: group.contributionAmount,
          round,
          dueDate,
          status: "pending",
        });
      }
    }
  }

  async sendPaymentReminders(): Promise<void> {
    const overdueContributions = await storage.getOverdueContributions();

    for (const contribution of overdueContributions) {
      const user = await storage.getUser(contribution.userId);
      const group = await storage.getGroup(contribution.groupId);

      if (user && group && user.email) {
        await sendPaymentReminderEmail(
          user.email,
          user.firstName || "Member",
          group.name,
          Number(contribution.amount),
          contribution.dueDate
        );

        // Update contribution status to overdue
        await storage.updateContribution(contribution.id, {
          status: "overdue",
        });

        // Create notification
        await storage.createNotification({
          userId: user.id,
          groupId: group.id,
          type: "payment_due",
          title: "Payment Overdue",
          message: `Your payment of $${contribution.amount} for ${group.name} is overdue.`,
        });
      }
    }
  }

  async completeGroup(groupId: string): Promise<void> {
    await storage.updateGroup(groupId, {
      status: "completed",
      completedAt: new Date(),
    });

    // Update trust scores for all members
    const members = await storage.getGroupMembers(groupId);
    for (const member of members) {
      await this.updateMemberTrustScore(member.userId);

      // Update user's completed groups count
      const user = await storage.getUser(member.userId);
      if (user) {
        const { user: updatedUser } = await storage.upsertUser({
          ...user,
          totalGroupsCompleted: (user.totalGroupsCompleted || 0) + 1,
        });
      }
    }
  }

  async updateMemberTrustScore(userId: string): Promise<void> {
    // Calculate trust score based on payment history
    const contributions = await storage.getUserContributions(userId);
    const totalContributions = contributions.length;
    const onTimeContributions = contributions.filter(
      (c) => c.status === "paid" && c.paidDate && c.paidDate <= c.dueDate
    ).length;

    const onTimeRate =
      totalContributions > 0
        ? (onTimeContributions / totalContributions) * 100
        : 0;
    const trustScore = Math.min(5.0, (onTimeRate / 100) * 5); // Max 5.0 trust score

    await storage.updateUserTrustScore(userId, trustScore);
    const { user: updatedUser } = await storage.upsertUser({
      id: userId,
      onTimePaymentRate: onTimeRate.toString(),
    } as any);
  }

  private calculateNextPayoutDate(group: Group): Date {
    const now = new Date();
    const nextDate = new Date(now);

    switch (group.frequency) {
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
  }

  async assignPayoutOrder(groupId: string): Promise<void> {
    const members = await storage.getGroupMembers(groupId);
    const shuffledMembers = [...members].sort(() => Math.random() - 0.5);

    for (let i = 0; i < shuffledMembers.length; i++) {
      await storage.updateGroupMember(groupId, shuffledMembers[i].userId, {
        payoutOrder: i + 1,
      });
    }
  }

  async startGroup(groupId: string): Promise<void> {
    const group = await storage.getGroupWithMembers(groupId);
    if (!group) {
      throw new Error("Group not found");
    }

    if (group.members.length < 2) {
      throw new Error("Group needs at least 2 members to start");
    }

    // Assign payout order
    await this.assignPayoutOrder(groupId);

    // Update group status
    await storage.updateGroup(groupId, {
      status: "active",
      startDate: new Date(),
      nextPayoutDate: this.calculateNextPayoutDate(group),
      totalRounds: group.members.length,
    });

    // Create initial contributions
    await this.createContributionsForRound(group, 1);

    // Notify all members
    for (const member of group.members) {
      await storage.createNotification({
        userId: member.userId,
        groupId: group.id,
        type: "group_started",
        title: "Group Started!",
        message: `${group.name} has started. Your first contribution is due soon.`,
      });
    }
  }
}

export const groupService = new GroupService();
