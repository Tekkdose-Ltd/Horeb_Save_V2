import {
  users,
  groups,
  groupMembers,
  contributions,
  transactions,
  notifications,
  sessions,
  type User,
  type UpsertUser,
  type Group,
  type InsertGroup,
  type GroupMember,
  type InsertGroupMember,
  type Contribution,
  type InsertContribution,
  type Transaction,
  type InsertTransaction,
  type Notification,
  type InsertNotification,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, sql, count, avg, sum } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<{ user: User; isNewUser: boolean }>;
  updateUserTrustScore(userId: string, trustScore: number): Promise<void>;
  updateUserStripeCustomerId(
    userId: string,
    stripeCustomerId: string
  ): Promise<User>;

  // Group operations
  createGroup(group: InsertGroup): Promise<Group>;
  getGroup(id: string): Promise<Group | undefined>;
  getGroupWithMembers(
    id: string
  ): Promise<
    (Group & { members: (GroupMember & { user: User })[] }) | undefined
  >;
  getUserGroups(userId: string): Promise<(Group & { memberCount: number })[]>;
  getPublicGroups(limit?: number): Promise<(Group & { memberCount: number })[]>;
  updateGroup(id: string, updates: Partial<Group>): Promise<Group>;
  deleteGroup(id: string): Promise<void>;

  // Group member operations
  addGroupMember(member: InsertGroupMember): Promise<GroupMember>;
  getGroupMembers(groupId: string): Promise<(GroupMember & { user: User })[]>;
  updateGroupMember(
    groupId: string,
    userId: string,
    updates: Partial<GroupMember>
  ): Promise<GroupMember>;
  removeGroupMember(groupId: string, userId: string): Promise<void>;

  // Contribution operations
  createContribution(contribution: InsertContribution): Promise<Contribution>;
  getContribution(id: string): Promise<Contribution | undefined>;
  getUserContributions(
    userId: string,
    groupId?: string
  ): Promise<Contribution[]>;
  getGroupContributions(
    groupId: string,
    round?: number
  ): Promise<Contribution[]>;
  updateContribution(
    id: string,
    updates: Partial<Contribution>
  ): Promise<Contribution>;
  getOverdueContributions(): Promise<Contribution[]>;

  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getUserTransactions(userId: string, limit?: number): Promise<Transaction[]>;
  getGroupTransactions(groupId: string): Promise<Transaction[]>;

  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(
    userId: string,
    unreadOnly?: boolean
  ): Promise<Notification[]>;
  markNotificationAsRead(id: string): Promise<void>;
  markAllNotificationsAsRead(userId: string): Promise<void>;

  // Analytics operations
  getUserStats(userId: string): Promise<{
    activeGroups: number;
    totalSaved: number;
    trustScore: number;
    completedGroups: number;
    onTimePaymentRate: number;
  }>;

  getGroupStats(groupId: string): Promise<{
    totalContributions: number;
    currentRound: number;
    nextPayoutAmount: number;
    nextPayoutRecipient: string | null;
  }>;

  // Session operations
  getUserSessions(userId: string): Promise<any[]>;
  deleteUserSessions(userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(
    userData: UpsertUser
  ): Promise<{ user: User; isNewUser: boolean }> {
    // First check if user exists
    const existingUser = await this.getUser(userData.id);
    const isNewUser = !existingUser;

    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();

    return { user, isNewUser };
  }

  async updateUserTrustScore(
    userId: string,
    trustScore: number
  ): Promise<void> {
    await db
      .update(users)
      .set({ trustScore: trustScore.toString(), updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async updateUserStripeCustomerId(
    userId: string,
    stripeCustomerId: string
  ): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ stripeCustomerId, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Group operations
  async createGroup(group: InsertGroup): Promise<Group> {
    const inviteCode = Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase();
    const [newGroup] = await db
      .insert(groups)
      .values({ ...group, inviteCode })
      .returning();
    return newGroup;
  }

  async getGroup(id: string): Promise<Group | undefined> {
    const [group] = await db.select().from(groups).where(eq(groups.id, id));
    return group;
  }

  async getGroupWithMembers(
    id: string
  ): Promise<
    (Group & { members: (GroupMember & { user: User })[] }) | undefined
  > {
    const group = await this.getGroup(id);
    if (!group) return undefined;

    const members = await db
      .select()
      .from(groupMembers)
      .innerJoin(users, eq(groupMembers.userId, users.id))
      .where(and(eq(groupMembers.groupId, id), eq(groupMembers.isActive, true)))
      .orderBy(asc(groupMembers.payoutOrder));

    return {
      ...group,
      members: members.map((row) => ({
        ...row.group_members,
        user: row.users,
      })),
    };
  }

  async getUserGroups(
    userId: string
  ): Promise<(Group & { memberCount: number })[]> {
    const result = await db
      .select({
        ...groups,
        memberCount: count(groupMembers.id),
      })
      .from(groups)
      .innerJoin(groupMembers, eq(groups.id, groupMembers.groupId))
      .where(
        and(eq(groupMembers.userId, userId), eq(groupMembers.isActive, true))
      )
      .groupBy(groups.id)
      .orderBy(desc(groups.createdAt));

    return result;
  }

  async getPublicGroups(
    limit = 10
  ): Promise<(Group & { memberCount: number })[]> {
    const result = await db
      .select({
        ...groups,
        memberCount: count(groupMembers.id),
      })
      .from(groups)
      .leftJoin(
        groupMembers,
        and(
          eq(groups.id, groupMembers.groupId),
          eq(groupMembers.isActive, true)
        )
      )
      .where(and(eq(groups.isPublic, true), eq(groups.status, "draft")))
      .groupBy(groups.id)
      .orderBy(desc(groups.createdAt))
      .limit(limit);

    return result;
  }

  async updateGroup(id: string, updates: Partial<Group>): Promise<Group> {
    const [updatedGroup] = await db
      .update(groups)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(groups.id, id))
      .returning();
    return updatedGroup;
  }

  async deleteGroup(id: string): Promise<void> {
    await db.delete(groups).where(eq(groups.id, id));
  }

  // Group member operations
  async addGroupMember(member: InsertGroupMember): Promise<GroupMember> {
    const [newMember] = await db
      .insert(groupMembers)
      .values(member)
      .returning();
    return newMember;
  }

  async getGroupMembers(
    groupId: string
  ): Promise<(GroupMember & { user: User })[]> {
    const result = await db
      .select()
      .from(groupMembers)
      .innerJoin(users, eq(groupMembers.userId, users.id))
      .where(
        and(eq(groupMembers.groupId, groupId), eq(groupMembers.isActive, true))
      )
      .orderBy(asc(groupMembers.payoutOrder));

    return result.map((row) => ({
      ...row.group_members,
      user: row.users,
    }));
  }

  async updateGroupMember(
    groupId: string,
    userId: string,
    updates: Partial<GroupMember>
  ): Promise<GroupMember> {
    const [updatedMember] = await db
      .update(groupMembers)
      .set(updates)
      .where(
        and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId))
      )
      .returning();
    return updatedMember;
  }

  async removeGroupMember(groupId: string, userId: string): Promise<void> {
    await db
      .update(groupMembers)
      .set({ isActive: false })
      .where(
        and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId))
      );
  }

  // Contribution operations
  async createContribution(
    contribution: InsertContribution
  ): Promise<Contribution> {
    const [newContribution] = await db
      .insert(contributions)
      .values(contribution)
      .returning();
    return newContribution;
  }

  async getContribution(id: string): Promise<Contribution | undefined> {
    const [contribution] = await db
      .select()
      .from(contributions)
      .where(eq(contributions.id, id));
    return contribution;
  }

  async getUserContributions(
    userId: string,
    groupId?: string
  ): Promise<Contribution[]> {
    let query = db
      .select()
      .from(contributions)
      .where(eq(contributions.userId, userId));

    if (groupId) {
      query = query.where(
        and(
          eq(contributions.userId, userId),
          eq(contributions.groupId, groupId)
        )
      );
    }

    return query.orderBy(desc(contributions.createdAt));
  }

  async getGroupContributions(
    groupId: string,
    round?: number
  ): Promise<Contribution[]> {
    let query = db
      .select()
      .from(contributions)
      .where(eq(contributions.groupId, groupId));

    if (round) {
      query = query.where(
        and(eq(contributions.groupId, groupId), eq(contributions.round, round))
      );
    }

    return query.orderBy(desc(contributions.createdAt));
  }

  async updateContribution(
    id: string,
    updates: Partial<Contribution>
  ): Promise<Contribution> {
    const [updatedContribution] = await db
      .update(contributions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(contributions.id, id))
      .returning();
    return updatedContribution;
  }

  async getOverdueContributions(): Promise<Contribution[]> {
    return db
      .select()
      .from(contributions)
      .where(and(eq(contributions.status, "pending"), sql`due_date < NOW()`))
      .orderBy(asc(contributions.dueDate));
  }

  // Transaction operations
  async createTransaction(
    transaction: InsertTransaction
  ): Promise<Transaction> {
    const [newTransaction] = await db
      .insert(transactions)
      .values(transaction)
      .returning();
    return newTransaction;
  }

  async getUserTransactions(
    userId: string,
    limit = 10
  ): Promise<Transaction[]> {
    return db
      .select()
      .from(transactions)
      .where(sql`from_user_id = ${userId} OR to_user_id = ${userId}`)
      .orderBy(desc(transactions.createdAt))
      .limit(limit);
  }

  async getGroupTransactions(groupId: string): Promise<Transaction[]> {
    return db
      .select()
      .from(transactions)
      .where(eq(transactions.groupId, groupId))
      .orderBy(desc(transactions.createdAt));
  }

  // Notification operations
  async createNotification(
    notification: InsertNotification
  ): Promise<Notification> {
    const [newNotification] = await db
      .insert(notifications)
      .values(notification)
      .returning();
    return newNotification;
  }

  async getUserNotifications(
    userId: string,
    unreadOnly = false
  ): Promise<Notification[]> {
    let query = db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId));

    if (unreadOnly) {
      query = query.where(
        and(eq(notifications.userId, userId), eq(notifications.isRead, false))
      );
    }

    return query.orderBy(desc(notifications.createdAt));
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));
  }

  // Analytics operations
  async getUserStats(userId: string): Promise<{
    activeGroups: number;
    totalSaved: number;
    trustScore: number;
    completedGroups: number;
    onTimePaymentRate: number;
  }> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const [activeGroupsResult] = await db
      .select({ count: count() })
      .from(groupMembers)
      .innerJoin(groups, eq(groupMembers.groupId, groups.id))
      .where(
        and(
          eq(groupMembers.userId, userId),
          eq(groupMembers.isActive, true),
          eq(groups.status, "active")
        )
      );

    const [totalSavedResult] = await db
      .select({ total: sum(contributions.amount) })
      .from(contributions)
      .where(
        and(eq(contributions.userId, userId), eq(contributions.status, "paid"))
      );

    return {
      activeGroups: activeGroupsResult.count,
      totalSaved: Number(totalSavedResult.total || 0),
      trustScore: Number(user.trustScore || 0),
      completedGroups: user.totalGroupsCompleted || 0,
      onTimePaymentRate: Number(user.onTimePaymentRate || 0),
    };
  }

  async getGroupStats(groupId: string): Promise<{
    totalContributions: number;
    currentRound: number;
    nextPayoutAmount: number;
    nextPayoutRecipient: string | null;
  }> {
    const group = await this.getGroup(groupId);
    if (!group) {
      throw new Error("Group not found");
    }

    const [totalContributionsResult] = await db
      .select({ total: sum(contributions.amount) })
      .from(contributions)
      .where(
        and(
          eq(contributions.groupId, groupId),
          eq(contributions.status, "paid")
        )
      );

    const nextRecipient = await db
      .select()
      .from(groupMembers)
      .innerJoin(users, eq(groupMembers.userId, users.id))
      .where(
        and(
          eq(groupMembers.groupId, groupId),
          eq(groupMembers.hasReceivedPayout, false),
          eq(groupMembers.isActive, true)
        )
      )
      .orderBy(asc(groupMembers.payoutOrder))
      .limit(1);

    return {
      totalContributions: Number(totalContributionsResult.total || 0),
      currentRound: group.currentRound || 1,
      nextPayoutAmount:
        Number(group.contributionAmount) * (group.maxMembers || 1),
      nextPayoutRecipient: nextRecipient[0]?.users.id || null,
    };
  }

  // Session operations
  async getUserSessions(userId: string): Promise<any[]> {
    const userSessions = await db
      .select()
      .from(sessions)
      .where(sql`${sessions.sess}::jsonb->'passport'->'user'->'claims'->>'sub' = ${userId}`)
      .orderBy(desc(sessions.expire));

    return userSessions;
  }

  async deleteUserSessions(userId: string): Promise<void> {
    await db
      .delete(sessions)
      .where(sql`${sessions.sess}::jsonb->'passport'->'user'->'claims'->>'sub' = ${userId}`);
  }
}

export const storage = new DatabaseStorage();
