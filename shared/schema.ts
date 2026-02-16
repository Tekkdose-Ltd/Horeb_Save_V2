import { sql, relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  decimal,
  integer,
  boolean,
  uuid,
  pgEnum
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table 
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table 
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(), // hashed password
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  phoneNumber: varchar("phone_number"),
  dateOfBirth: timestamp("date_of_birth"),
  addressLine1: varchar("address_line_1"),
  addressLine2: varchar("address_line_2"),
  city: varchar("city"),
  postcode: varchar("postcode"),
  country: varchar("country").default('United Kingdom'),
  profileCompleted: boolean("profile_completed").default(false),
  
  // Banking & Payout Information
  bankAccountHolderName: varchar("bank_account_holder_name"),
  bankAccountNumber: varchar("bank_account_number"), // Last 4 digits only for display
  bankSortCode: varchar("bank_sort_code"),
  bankName: varchar("bank_name"),
  stripeAccountId: varchar("stripe_account_id"), // Stripe Connected Account ID for payouts
  bankDetailsVerified: boolean("bank_details_verified").default(false),
  bankDetailsCompletedAt: timestamp("bank_details_completed_at"),
  
  // Payment Information
  stripeCustomerId: varchar("stripe_customer_id"), // For making contributions
  
  // Trust & Statistics
  trustScore: decimal("trust_score", { precision: 3, scale: 2 }).default('0.00'),
  totalGroupsCompleted: integer("total_groups_completed").default(0),
  onTimePaymentRate: decimal("on_time_payment_rate", { precision: 5, scale: 2 }).default('0.00'),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const groupStatusEnum = pgEnum('group_status', ['draft', 'active', 'completed', 'cancelled']);
export const contributionStatusEnum = pgEnum('contribution_status', ['pending', 'paid', 'overdue', 'failed']);
export const transactionTypeEnum = pgEnum('transaction_type', ['contribution', 'payout', 'refund']);

export const groups = pgTable("groups", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  creatorId: varchar("creator_id").notNull().references(() => users.id),
  maxMembers: integer("max_members").notNull(),
  contributionAmount: decimal("contribution_amount", { precision: 10, scale: 2 }).notNull(),
  frequency: varchar("frequency").notNull(), // 'weekly', 'monthly', 'bi-weekly'
  status: groupStatusEnum("status").default('draft'),
  currentRound: integer("current_round").default(1),
  totalRounds: integer("total_rounds").notNull(),
  nextPayoutDate: timestamp("next_payout_date"),
  startDate: timestamp("start_date"),
  completedAt: timestamp("completed_at"),
  inviteCode: varchar("invite_code").unique(),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const groupMembers = pgTable("group_members", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: uuid("group_id").notNull().references(() => groups.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  joinedAt: timestamp("joined_at").defaultNow(),
  payoutOrder: integer("payout_order"),
  hasReceivedPayout: boolean("has_received_payout").default(false),
  payoutReceivedAt: timestamp("payout_received_at"),
  trustRating: decimal("trust_rating", { precision: 3, scale: 2 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const contributions = pgTable("contributions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: uuid("group_id").notNull().references(() => groups.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  round: integer("round").notNull(),
  dueDate: timestamp("due_date").notNull(),
  paidDate: timestamp("paid_date"),
  status: contributionStatusEnum("status").default('pending'),
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: uuid("group_id").notNull().references(() => groups.id, { onDelete: 'cascade' }),
  fromUserId: varchar("from_user_id").references(() => users.id),
  toUserId: varchar("to_user_id").references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  type: transactionTypeEnum("type").notNull(),
  round: integer("round"),
  description: text("description"),
  stripeTransactionId: varchar("stripe_transaction_id"),
  processedAt: timestamp("processed_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  groupId: uuid("group_id").references(() => groups.id, { onDelete: 'cascade' }),
  type: varchar("type").notNull(), // 'payment_due', 'payment_received', 'payout_ready', 'group_joined', etc.
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  createdGroups: many(groups),
  groupMemberships: many(groupMembers),
  contributions: many(contributions),
  sentTransactions: many(transactions, { relationName: 'sentTransactions' }),
  receivedTransactions: many(transactions, { relationName: 'receivedTransactions' }),
  notifications: many(notifications),
}));

export const groupsRelations = relations(groups, ({ one, many }) => ({
  creator: one(users, {
    fields: [groups.creatorId],
    references: [users.id],
  }),
  members: many(groupMembers),
  contributions: many(contributions),
  transactions: many(transactions),
  notifications: many(notifications),
}));

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
  group: one(groups, {
    fields: [groupMembers.groupId],
    references: [groups.id],
  }),
  user: one(users, {
    fields: [groupMembers.userId],
    references: [users.id],
  }),
}));

export const contributionsRelations = relations(contributions, ({ one }) => ({
  group: one(groups, {
    fields: [contributions.groupId],
    references: [groups.id],
  }),
  user: one(users, {
    fields: [contributions.userId],
    references: [users.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  group: one(groups, {
    fields: [transactions.groupId],
    references: [groups.id],
  }),
  fromUser: one(users, {
    fields: [transactions.fromUserId],
    references: [users.id],
    relationName: 'sentTransactions',
  }),
  toUser: one(users, {
    fields: [transactions.toUserId],
    references: [users.id],
    relationName: 'receivedTransactions',
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  group: one(groups, {
    fields: [notifications.groupId],
    references: [groups.id],
  }),
}));

// Schema types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type Group = typeof groups.$inferSelect;
export type InsertGroup = typeof groups.$inferInsert;

export type GroupMember = typeof groupMembers.$inferSelect;
export type InsertGroupMember = typeof groupMembers.$inferInsert;

export type Contribution = typeof contributions.$inferSelect;
export type InsertContribution = typeof contributions.$inferInsert;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// Zod schemas
export const insertGroupSchema = createInsertSchema(groups).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  inviteCode: true,
  currentRound: true,
  completedAt: true,
});

export const insertGroupMemberSchema = createInsertSchema(groupMembers).omit({
  id: true,
  createdAt: true,
  joinedAt: true,
  hasReceivedPayout: true,
  payoutReceivedAt: true,
});

export const insertContributionSchema = createInsertSchema(contributions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  paidDate: true,
  stripePaymentIntentId: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
  processedAt: true,
  stripeTransactionId: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

// User profile update schema for onboarding
export const updateProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  phoneNumber: z.string().min(10, "Please enter a valid phone number").max(20),
  dateOfBirth: z.string().refine((date) => {
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age >= 18;
  }, "You must be at least 18 years old"),
  addressLine1: z.string().min(1, "Address is required").max(255),
  addressLine2: z.string().max(255).optional(),
  city: z.string().min(1, "City is required").max(100),
  postcode: z.string().min(3, "Postcode is required").max(20),
  country: z.string().min(1, "Country is required").max(100),
});

export type UpdateProfile = z.infer<typeof updateProfileSchema>;
