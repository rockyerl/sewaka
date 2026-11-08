import { relations, sql, type SQLWrapper } from "drizzle-orm";
import {
  boolean,
  check,
  foreignKey,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgPolicy,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const createdAt = () =>
  timestamp("created_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow();
const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());

export const workspaceRole = pgEnum("workspace_role", [
  "OWNER",
  "PARTNER",
  "FAMILY",
  "COORDINATOR",
]);
export const taskStatus = pgEnum("task_status", [
  "TODO",
  "IN_PROGRESS",
  "COMPLETED",
]);
export const taskPriority = pgEnum("task_priority", ["LOW", "MEDIUM", "HIGH"]);
export const vendorStatus = pgEnum("vendor_status", [
  "SHORTLISTED",
  "CONTACTED",
  "BOOKED",
]);
export const rsvpStatus = pgEnum("rsvp_status", [
  "PENDING",
  "ACCEPTED",
  "DECLINED",
]);
export const notificationType = pgEnum("notification_type", [
  "TASK_REMINDER",
  "DUE_DATE",
  "BUDGET_ALERT",
  "INVITATION",
  "SYSTEM",
]);
export const notificationRead = pgEnum("notification_read", ["UNREAD", "READ"]);
export const subscriptionStatus = pgEnum("subscription_status", [
  "ACTIVE",
  "PAST_DUE",
  "EXPIRED",
  "CANCELLED",
  "REFUNDED",
]);
export const paymentStatus = pgEnum("payment_status", [
  "PENDING",
  "COMPLETED",
  "FAILED",
  "REFUNDED",
]);
export const quotationStatus = pgEnum("quotation_status", [
  "PENDING",
  "ACCEPTED",
  "REJECTED",
]);

function workspacePolicy(workspaceId: SQLWrapper) {
  const isCurrentWorkspace = sql`
    ${workspaceId} = nullif(current_setting('app.workspace_id', true), '')::uuid
  `;

  const canRead = sql`
    ${isCurrentWorkspace}
    and public.has_workspace_role(
      ${workspaceId},
      nullif(current_setting('app.user_id', true), '')::uuid,
      null
    )
  `;
  const canWrite = sql`
    ${isCurrentWorkspace}
    and public.has_workspace_role(
      ${workspaceId},
      nullif(current_setting('app.user_id', true), '')::uuid,
      ARRAY['OWNER', 'PARTNER', 'COORDINATOR']::text[]
    )
  `;

  return [
    pgPolicy("workspace_member_read", {
      for: "select",
      to: "sewaka_app",
      using: canRead,
    }),
    pgPolicy("workspace_collaborator_write", {
      for: "all",
      to: "sewaka_app",
      using: canWrite,
      withCheck: canWrite,
    }),
  ];
}

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name"),
    email: text("email").unique(),
    emailVerified: timestamp("email_verified", { withTimezone: true, mode: "date" }),
    image: text("image"),
    role: text("role").default("user"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("users_created_at_idx").on(table.createdAt)],
);

export const userCredentials = pgTable("user_credentials", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  passwordHash: text("password_hash").notNull(),
  passwordUpdatedAt: timestamp("password_updated_at", {
    withTimezone: true,
    mode: "date",
  })
    .notNull()
    .defaultNow(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (table) => [
    primaryKey({ columns: [table.provider, table.providerAccountId] }),
    index("accounts_user_id_idx").on(table.userId),
  ],
);

export const sessions = pgTable(
  "sessions",
  {
    sessionToken: text("session_token").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { withTimezone: true, mode: "date" }).notNull(),
  },
  (table) => [index("sessions_user_id_idx").on(table.userId)],
);

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull().unique(),
    expires: timestamp("expires", { withTimezone: true, mode: "date" }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.identifier, table.token] }),
    index("verification_tokens_expires_idx").on(table.expires),
  ],
);

export const weddingWorkspaces = pgTable(
  "wedding_workspaces",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    coupleOne: text("couple_one"),
    coupleTwo: text("couple_two"),
    weddingDate: timestamp("wedding_date", { withTimezone: true, mode: "date" }),
    location: text("location"),
    totalBudget: numeric("total_budget", { precision: 14, scale: 2 })
      .notNull()
      .default("0"),
    timezone: text("timezone").notNull().default("Asia/Jakarta"),
    culturalTradition: text("cultural_tradition").default("JAWA"),
    invitationSlug: text("invitation_slug").unique(),
    invitationQuote: text("invitation_quote"),
    dressCode: text("dress_code"),
    story: text("story"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("wedding_workspaces_created_at_idx").on(table.createdAt),
    check("wedding_workspaces_budget_nonnegative", sql`${table.totalBudget} >= 0`),
    pgPolicy("workspace_owner_read", {
      for: "select",
      to: "sewaka_app",
      using: sql`
        id = nullif(current_setting('app.workspace_id', true), '')::uuid
        and public.has_workspace_role(
          ${table.id},
          nullif(current_setting('app.user_id', true), '')::uuid,
          ARRAY['OWNER']::text[]
        )
      `,
    }),
    pgPolicy("workspace_owner_write", {
      for: "all",
      to: "sewaka_app",
      using: sql`
        id = nullif(current_setting('app.workspace_id', true), '')::uuid
        and public.has_workspace_role(
          ${table.id},
          nullif(current_setting('app.user_id', true), '')::uuid,
          ARRAY['OWNER']::text[]
        )
      `,
      withCheck: sql`
        id = nullif(current_setting('app.workspace_id', true), '')::uuid
        and public.has_workspace_role(
          ${table.id},
          nullif(current_setting('app.user_id', true), '')::uuid,
          ARRAY['OWNER']::text[]
        )
      `,
    }),
    pgPolicy("workspace_create_for_user", {
      for: "insert",
      to: "sewaka_app",
      withCheck: sql`
        id = nullif(current_setting('app.workspace_id', true), '')::uuid
        and nullif(current_setting('app.user_id', true), '')::uuid is not null
      `,
    }),
  ],
).enableRLS();

export const workspaceMembers = pgTable(
  "workspace_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => weddingWorkspaces.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: workspaceRole("role").notNull().default("PARTNER"),
    createdAt: createdAt(),
  },
  (table) => [
    uniqueIndex("workspace_members_workspace_user_uidx").on(
      table.workspaceId,
      table.userId,
    ),
    uniqueIndex("workspace_members_one_owner_per_user_uidx")
      .on(table.userId)
      .where(sql`${table.role} = 'OWNER'`),
    index("workspace_members_user_id_idx").on(table.userId),
    pgPolicy("workspace_member_read_by_user", {
      for: "select",
      to: "sewaka_app",
      using: sql`
        ${table.userId} = nullif(current_setting('app.user_id', true), '')::uuid
      `,
    }),
    pgPolicy("workspace_member_read_self", {
      for: "select",
      to: "sewaka_app",
      using: sql`
        ${table.workspaceId} = nullif(current_setting('app.workspace_id', true), '')::uuid
        and ${table.userId} = nullif(current_setting('app.user_id', true), '')::uuid
      `,
    }),
    pgPolicy("workspace_owner_read_members", {
      for: "select",
      to: "sewaka_app",
      using: sql`
        ${table.workspaceId} = nullif(current_setting('app.workspace_id', true), '')::uuid
        and public.has_workspace_role(
          ${table.workspaceId},
          nullif(current_setting('app.user_id', true), '')::uuid,
          ARRAY['OWNER']::text[]
        )
      `,
    }),
    pgPolicy("workspace_owner_add_self", {
      for: "insert",
      to: "sewaka_app",
      withCheck: sql`
        ${table.workspaceId} = nullif(current_setting('app.workspace_id', true), '')::uuid
        and ${table.role} = 'OWNER'
        and ${table.userId} = nullif(current_setting('app.user_id', true), '')::uuid
        and exists (
          select 1 from public.wedding_workspaces as ws
          where ws.id = ${table.workspaceId}
        )
      `,
    }),
    pgPolicy("workspace_owner_add_collaborator", {
      for: "insert",
      to: "sewaka_app",
      withCheck: sql`
        ${table.workspaceId} = nullif(current_setting('app.workspace_id', true), '')::uuid
        and ${table.role} in ('PARTNER', 'FAMILY', 'COORDINATOR')
        and public.has_workspace_role(
          ${table.workspaceId},
          nullif(current_setting('app.user_id', true), '')::uuid,
          ARRAY['OWNER']::text[]
        )
      `,
    }),
    pgPolicy("workspace_owner_update_collaborator", {
      for: "update",
      to: "sewaka_app",
      using: sql`
        ${table.workspaceId} = nullif(current_setting('app.workspace_id', true), '')::uuid
        and ${table.role} <> 'OWNER'
        and public.has_workspace_role(
          ${table.workspaceId},
          nullif(current_setting('app.user_id', true), '')::uuid,
          ARRAY['OWNER']::text[]
        )
      `,
      withCheck: sql`
        ${table.workspaceId} = nullif(current_setting('app.workspace_id', true), '')::uuid
        and ${table.role} in ('PARTNER', 'FAMILY', 'COORDINATOR')
        and public.has_workspace_role(
          ${table.workspaceId},
          nullif(current_setting('app.user_id', true), '')::uuid,
          ARRAY['OWNER']::text[]
        )
      `,
    }),
    pgPolicy("workspace_owner_delete_collaborator", {
      for: "delete",
      to: "sewaka_app",
      using: sql`
        ${table.workspaceId} = nullif(current_setting('app.workspace_id', true), '')::uuid
        and ${table.role} <> 'OWNER'
        and public.has_workspace_role(
          ${table.workspaceId},
          nullif(current_setting('app.user_id', true), '')::uuid,
          ARRAY['OWNER']::text[]
        )
      `,
    }),
  ],
).enableRLS();

export const weddingEvents = pgTable(
  "wedding_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => weddingWorkspaces.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    eventDate: timestamp("event_date", { withTimezone: true, mode: "date" }),
    location: text("location"),
    notes: text("notes"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("wedding_events_workspace_date_idx").on(
      table.workspaceId,
      table.eventDate,
    ),
    ...workspacePolicy(table.workspaceId),
  ],
).enableRLS();

export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => weddingWorkspaces.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    notes: text("notes"),
    status: taskStatus("status").notNull().default("TODO"),
    priority: taskPriority("priority").notNull().default("MEDIUM"),
    dueDate: timestamp("due_date", { withTimezone: true, mode: "date" }),
    assignedToId: uuid("assigned_to_id").references(() => users.id, {
      onDelete: "set null",
    }),
    categoryId: uuid("category_id").references(() => taskCategories.id, {
      onDelete: "set null",
    }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("tasks_workspace_status_due_idx").on(
      table.workspaceId,
      table.status,
      table.dueDate,
    ),
    index("tasks_assigned_to_id_idx").on(table.assignedToId),
    index("tasks_category_id_idx").on(table.categoryId),
    foreignKey({
      name: "tasks_assignee_workspace_member_fk",
      columns: [table.workspaceId, table.assignedToId],
      foreignColumns: [workspaceMembers.workspaceId, workspaceMembers.userId],
    }),
    foreignKey({
      name: "tasks_workspace_category_fk",
      columns: [table.workspaceId, table.categoryId],
      foreignColumns: [taskCategories.workspaceId, taskCategories.id],
    }),
    ...workspacePolicy(table.workspaceId),
  ],
).enableRLS();

export const budgets = pgTable(
  "budgets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .unique()
      .references(() => weddingWorkspaces.id, { onDelete: "cascade" }),
    totalAmount: numeric("total_amount", { precision: 14, scale: 2 })
      .notNull()
      .default("0"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    check("budgets_total_nonnegative", sql`${table.totalAmount} >= 0`),
    ...workspacePolicy(table.workspaceId),
  ],
).enableRLS();

export const budgetEntries = pgTable(
  "budget_entries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => weddingWorkspaces.id, { onDelete: "cascade" }),
    amount: numeric("amount", { precision: 14, scale:2 })
      .notNull(),
    entryDate: timestamp("entry_date", { withTimezone: false, mode: "date" })
      .notNull()
      .defaultNow(),
    description: text("description"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("budget_entries_workspace_idx").on(table.workspaceId),
    index("budget_entries_date_idx").on(table.workspaceId, table.entryDate),
    check("budget_entries_amount_nonnegative", sql`${table.amount} >= 0`),
    ...workspacePolicy(table.workspaceId),
  ],
).enableRLS();

export const budgetCategories = pgTable(
  "budget_categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => weddingWorkspaces.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    allocatedAmount: numeric("allocated_amount", { precision: 14, scale: 2 })
      .notNull()
      .default("0"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("budget_categories_workspace_name_uidx").on(
      table.workspaceId,
      table.name,
    ),
    uniqueIndex("budget_categories_workspace_id_uidx").on(
      table.workspaceId,
      table.id,
    ),
    check(
      "budget_categories_allocation_nonnegative",
      sql`${table.allocatedAmount} >= 0`,
    ),
    ...workspacePolicy(table.workspaceId),
  ],
).enableRLS();

export const expenses = pgTable(
  "expenses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => weddingWorkspaces.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id"),
    amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
    note: text("note"),
    expenseDate: timestamp("expense_date", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("expenses_workspace_date_idx").on(table.workspaceId, table.expenseDate),
    index("expenses_workspace_category_idx").on(
      table.workspaceId,
      table.categoryId,
    ),
    foreignKey({
      name: "expenses_workspace_category_fk",
      columns: [table.workspaceId, table.categoryId],
      foreignColumns: [budgetCategories.workspaceId, budgetCategories.id],
    }),
    check("expenses_amount_nonnegative", sql`${table.amount} >= 0`),
    ...workspacePolicy(table.workspaceId),
  ],
).enableRLS();

// Expense Attachments (BGT-13) — lampiran file di expense
export const expenseAttachments = pgTable(
  "expense_attachments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    expenseId: uuid("expense_id")
      .notNull()
      .references(() => expenses.id, { onDelete: "cascade" }),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => weddingWorkspaces.id, { onDelete: "cascade" }),
    fileName: text("file_name").notNull(),
    fileUrl: text("file_url").notNull(),
    fileSize: integer("file_size").notNull(),
    mimeType: text("mime_type").notNull(),
    uploadedBy: uuid("uploaded_by")
      .notNull()
      .references(() => users.id),
    createdAt: createdAt(),
  },
  (table) => [
    index("expense_attachments_expense_idx").on(table.expenseId),
    ...workspacePolicy(table.workspaceId),
  ]
).enableRLS();

export const expenseAttachmentRelations = relations(expenseAttachments, ({ one }) => ({
  expense: one(expenses, {
    fields: [expenseAttachments.expenseId],
    references: [expenses.id],
  }),
  workspace: one(weddingWorkspaces, {
    fields: [expenseAttachments.workspaceId],
    references: [weddingWorkspaces.id],
  }),
  uploader: one(users, {
    fields: [expenseAttachments.uploadedBy],
    references: [users.id],
  }),
}));

export const vendors = pgTable(
  "vendors",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => weddingWorkspaces.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    category: text("category").notNull(),
    contactName: text("contact_name"),
    phone: text("phone"),
    email: text("email"),
    notes: text("notes"),
    status: vendorStatus("status").notNull().default("SHORTLISTED"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("vendors_workspace_category_idx").on(table.workspaceId, table.category),
    ...workspacePolicy(table.workspaceId),
  ],
).enableRLS();

export const guests = pgTable(
  "guests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => weddingWorkspaces.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    email: text("email"),
    phone: text("phone"),
    category: text("category"),
    side: text("side"),
    rsvpStatus: rsvpStatus("rsvp_status").notNull().default("PENDING"),
    plusOnes: integer("plus_ones").notNull().default(0),
    invitationCode: text("invitation_code"),
    wishes: text("wishes"),
    checkedIn: boolean("checked_in").notNull().default(false),
    checkedInAt: timestamp("checked_in_at", { withTimezone: true, mode: "date" }),
    isVip: boolean("is_vip").notNull().default(false),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("guests_workspace_rsvp_idx").on(table.workspaceId, table.rsvpStatus),
    check("guests_plus_ones_nonnegative", sql`${table.plusOnes} >= 0`),
    ...workspacePolicy(table.workspaceId),
  ],
).enableRLS();

export const activityLogs = pgTable(
  "activity_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => weddingWorkspaces.id, { onDelete: "cascade" }),
    actorId: uuid("actor_id").references(() => users.id, { onDelete: "set null" }),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: uuid("entity_id"),
    metadata: jsonb("metadata"),
    createdAt: createdAt(),
  },
  (table) => [
    index("activity_logs_workspace_created_idx").on(
      table.workspaceId,
      table.createdAt,
    ),
    ...workspacePolicy(table.workspaceId),
  ],
).enableRLS();

export const culturalRundowns = pgTable(
  "cultural_rundowns",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => weddingWorkspaces.id, { onDelete: "cascade" }),
    eventId: uuid("event_id").references(() => weddingEvents.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    ceremonyType: text("ceremony_type"),
    timeStart: text("time_start").notNull(),
    timeEnd: text("time_end").notNull(),
    picName: text("pic_name"),
    location: text("location"),
    attire: text("attire"),
    rituals: jsonb("rituals"),
    notes: text("notes"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("cultural_rundowns_workspace_sort_idx").on(
      table.workspaceId,
      table.sortOrder,
    ),
    ...workspacePolicy(table.workspaceId),
  ],
).enableRLS();

// Curated Vendors Directory (Brand Guidelines Fitur #1)
export const curatedVendors = pgTable(
  "curated_vendors",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    tradition: text("tradition").notNull(),
    category: text("category").notNull(),
    tagline: text("tagline").notNull(),
    description: text("description").notNull(),
    locationCity: text("location_city").notNull(),
    priceRange: text("price_range").notNull(),
    instagramHandle: text("instagram_handle"),
    whatsappNumber: text("whatsapp_number").notNull(),
    rating: numeric("rating", { precision: 3, scale: 2 }).notNull().default("5.0"),
    reviewCount: integer("review_count").notNull().default(12),
    isVerified: boolean("is_verified").notNull().default(true),
    specialties: jsonb("specialties").notNull().default([]),
    createdAt: createdAt(),
  },
  (table) => [
    index("curated_vendors_tradition_category_idx").on(table.tradition, table.category),
    pgPolicy("curated_vendors_read", {
      for: "select",
      to: "sewaka_app",
      using: sql`true`,
    }),
  ],
).enableRLS();

// Cultural Seserahan, Mahar & Hantaran Tracker (Brand Guidelines Roadmap Fase 2)
export const culturalSeserahanItems = pgTable(
  "cultural_seserahan_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => weddingWorkspaces.id, { onDelete: "cascade" }),
    boxNumber: integer("box_number").notNull().default(1),
    giverParty: text("giver_party").notNull().default("GROOM_TO_BRIDE"),
    title: text("title").notNull(),
    category: text("category").notNull().default("LAINNYA"),
    estimatedCost: numeric("estimated_cost", { precision: 14, scale: 2 }).notNull().default("0"),
    actualCost: numeric("actual_cost", { precision: 14, scale: 2 }).notNull().default("0"),
    status: text("status").notNull().default("PLANNED"),
    notes: text("notes"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("cultural_seserahan_workspace_box_idx").on(table.workspaceId, table.boxNumber),
    ...workspacePolicy(table.workspaceId),
  ],
).enableRLS();

// Task Categories (TSK-03)
export const taskCategories = pgTable(
  "task_categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => weddingWorkspaces.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    color: text("color"),
    createdAt: createdAt(),
  },
  (table) => [
    uniqueIndex("task_categories_workspace_name_uidx").on(
      table.workspaceId,
      table.name,
    ),
    ...workspacePolicy(table.workspaceId),
  ],
).enableRLS();

// Checklist Templates (TSK-01)
export const checklistTemplates = pgTable(
  "checklist_templates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    milestone: text("milestone").notNull(),
    description: text("description"),
    tasks: jsonb("tasks").notNull(),
    isDefault: text("is_default").notNull().default("true"),
    createdAt: createdAt(),
  },
  (table) => [
    index("checklist_templates_milestone_idx").on(table.milestone),
  ],
);

// Template Tasks — tugas yang dibuat dari template
export const templateTasks = pgTable(
  "template_tasks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    templateId: uuid("template_id")
      .notNull()
      .references(() => checklistTemplates.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    categoryId: uuid("category_id"),
    offsetDays: integer("offset_days").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: createdAt(),
  },
  (table) => [
    index("template_tasks_template_idx").on(table.templateId),
  ],
);

// Vendor Quotations (VND-08)
export const vendorQuotations = pgTable(
  "vendor_quotations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => weddingWorkspaces.id, { onDelete: "cascade" }),
    vendorId: uuid("vendor_id")
      .notNull()
      .references(() => vendors.id, { onDelete: "cascade" }),
    quotationNumber: text("quotation_number"),
    amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
    description: text("description"),
    status: quotationStatus("status").notNull().default("PENDING"),
    quotedDate: timestamp("quoted_date", { withTimezone: true, mode: "date" }),
    validUntil: timestamp("valid_until", { withTimezone: true, mode: "date" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("vendor_quotations_vendor_idx").on(table.workspaceId, table.vendorId),
    foreignKey({
      name: "vendor_quotations_workspace_vendor_fk",
      columns: [table.workspaceId, table.vendorId],
      foreignColumns: [vendors.workspaceId, vendors.id],
    }),
    check("vendor_quotations_amount_nonnegative", sql`${table.amount} >= 0`),
    ...workspacePolicy(table.workspaceId),
  ],
).enableRLS();

// Vendor Payments (VND-10)
export const vendorPayments = pgTable(
  "vendor_payments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => weddingWorkspaces.id, { onDelete: "cascade" }),
    vendorId: uuid("vendor_id")
      .notNull()
      .references(() => vendors.id, { onDelete: "cascade" }),
    quotationId: uuid("quotation_id").references(() => vendorQuotations.id, {
      onDelete: "set null",
    }),
    amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
    paymentType: text("payment_type").notNull().default("DP"),
    paymentDate: timestamp("payment_date", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    note: text("note"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("vendor_payments_vendor_idx").on(table.workspaceId, table.vendorId),
    foreignKey({
      name: "vendor_payments_workspace_vendor_fk",
      columns: [table.workspaceId, table.vendorId],
      foreignColumns: [vendors.workspaceId, vendors.id],
    }),
    check("vendor_payments_amount_nonnegative", sql`${table.amount} >= 0`),
    ...workspacePolicy(table.workspaceId),
  ],
).enableRLS();

// Documents (DOC-01, DOC-02, DOC-08)
export const documents = pgTable(
  "documents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => weddingWorkspaces.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    category: text("category").notNull(),
    filePath: text("file_path").notNull(),
    fileSize: integer("file_size").notNull(),
    mimeType: text("mime_type").notNull(),
    uploadedById: uuid("uploaded_by_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: createdAt(),
  },
  (table) => [
    index("documents_workspace_category_idx").on(
      table.workspaceId,
      table.category,
    ),
    check("documents_file_size_positive", sql`${table.fileSize} > 0`),
    ...workspacePolicy(table.workspaceId),
  ],
).enableRLS();

// Notifications (COL-05)
export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => weddingWorkspaces.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: notificationType("type").notNull(),
    title: text("title").notNull(),
    message: text("message").notNull(),
    read: notificationRead("read").notNull().default("UNREAD"),
    entityType: text("entity_type"),
    entityId: uuid("entity_id"),
    createdAt: createdAt(),
  },
  (table) => [
    index("notifications_user_read_idx").on(
      table.workspaceId,
      table.userId,
      table.read,
    ),
    ...workspacePolicy(table.workspaceId),
  ],
).enableRLS();

// Subscription Plans (SUB-01)
export const subscriptionPlans = pgTable(
  "subscription_plans",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull().unique(),
    description: text("description"),
    price: numeric("price", { precision: 14, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("IDR"),
    durationMonths: integer("duration_months"),
    maxVendors: integer("max_vendors"),
    maxGuests: integer("max_guests"),
    maxStorageBytes: integer("max_storage_bytes"),
    features: jsonb("features"),
    isActive: text("is_active").notNull().default("true"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("subscription_plans_active_order_idx").on(
      table.isActive,
      table.sortOrder,
    ),
    check("subscription_plans_price_nonnegative", sql`${table.price} >= 0`),
  ],
);

// Subscriptions (SUB-05)
export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .unique()
      .references(() => weddingWorkspaces.id, { onDelete: "cascade" }),
    planId: uuid("plan_id")
      .notNull()
      .references(() => subscriptionPlans.id, { onDelete: "restrict" }),
    status: subscriptionStatus("status").notNull().default("ACTIVE"),
    startedAt: timestamp("started_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }),
    autoRenew: text("auto_renew").notNull().default("true"),
    isTrial: boolean("is_trial").notNull().default(false),
    trialEndsAt: timestamp("trial_ends_at", { withTimezone: true, mode: "date" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("subscriptions_status_expire_idx").on(
      table.status,
      table.expiresAt,
    ),
  ],
);

// Payment Transactions (SUB-04)
export const paymentTransactions = pgTable(
  "payment_transactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    subscriptionId: uuid("subscription_id")
      .notNull()
      .references(() => subscriptions.id, { onDelete: "cascade" }),
    externalId: text("external_id").unique(),
    amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("IDR"),
    status: paymentStatus("status").notNull().default("PENDING"),
    gateway: text("gateway"),
    metadata: jsonb("metadata"),
    paidAt: timestamp("paid_at", { withTimezone: true, mode: "date" }),
    createdAt: createdAt(),
  },
  (table) => [
    index("payment_transactions_subscription_idx").on(table.subscriptionId),
    check("payment_transactions_amount_nonnegative", sql`${table.amount} >= 0`),
  ],
);

export const userRelations = relations(users, ({ many, one }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  memberships: many(workspaceMembers),
  assignedTasks: many(tasks),
  credentials: one(userCredentials, {
    fields: [users.id],
    references: [userCredentials.userId],
  }),
}));

export const workspaceRelations = relations(
  weddingWorkspaces,
  ({ many, one }) => ({
    members: many(workspaceMembers),
    events: many(weddingEvents),
    tasks: many(tasks),
    taskCategories: many(taskCategories),
    budget: one(budgets),
    categories: many(budgetCategories),
    expenses: many(expenses),
    vendors: many(vendors),
    vendorQuotations: many(vendorQuotations),
    vendorPayments: many(vendorPayments),
    guests: many(guests),
    documents: many(documents),
    notifications: many(notifications),
    activityLogs: many(activityLogs),
    subscription: one(subscriptions),
  }),
);

export const workspaceMemberRelations = relations(workspaceMembers, ({ one }) => ({
  user: one(users, {
    fields: [workspaceMembers.userId],
    references: [users.id],
  }),
  workspace: one(weddingWorkspaces, {
    fields: [workspaceMembers.workspaceId],
    references: [weddingWorkspaces.id],
  }),
}));

export const userCredentialRelations = relations(userCredentials, ({ one }) => ({
  user: one(users, {
    fields: [userCredentials.userId],
    references: [users.id],
  }),
}));

export const taskRelations = relations(tasks, ({ one }) => ({
  workspace: one(weddingWorkspaces, {
    fields: [tasks.workspaceId],
    references: [weddingWorkspaces.id],
  }),
  assignedTo: one(users, {
    fields: [tasks.assignedToId],
    references: [users.id],
  }),
  category: one(taskCategories, {
    fields: [tasks.workspaceId, tasks.categoryId],
    references: [taskCategories.workspaceId, taskCategories.id],
  }),
}));

export const expenseRelations = relations(expenses, ({ one }) => ({
  workspace: one(weddingWorkspaces, {
    fields: [expenses.workspaceId],
    references: [weddingWorkspaces.id],
  }),
  category: one(budgetCategories, {
    fields: [expenses.categoryId],
    references: [budgetCategories.id],
  }),
}));

export const guestRelations = relations(guests, ({ one }) => ({
  workspace: one(weddingWorkspaces, {
    fields: [guests.workspaceId],
    references: [weddingWorkspaces.id],
  }),
}));

export const vendorQuotationRelations = relations(vendorQuotations, ({ one }) => ({
  workspace: one(weddingWorkspaces, {
    fields: [vendorQuotations.workspaceId],
    references: [weddingWorkspaces.id],
  }),
  vendor: one(vendors, {
    fields: [vendorQuotations.workspaceId, vendorQuotations.vendorId],
    references: [vendors.workspaceId, vendors.id],
  }),
}));

export const vendorPaymentRelations = relations(vendorPayments, ({ one }) => ({
  workspace: one(weddingWorkspaces, {
    fields: [vendorPayments.workspaceId],
    references: [weddingWorkspaces.id],
  }),
  vendor: one(vendors, {
    fields: [vendorPayments.workspaceId, vendorPayments.vendorId],
    references: [vendors.workspaceId, vendors.id],
  }),
  quotation: one(vendorQuotations, {
    fields: [vendorPayments.quotationId],
    references: [vendorQuotations.id],
  }),
}));

export const documentRelations = relations(documents, ({ one }) => ({
  workspace: one(weddingWorkspaces, {
    fields: [documents.workspaceId],
    references: [weddingWorkspaces.id],
  }),
}));

export const notificationRelations = relations(notifications, ({ one }) => ({
  workspace: one(weddingWorkspaces, {
    fields: [notifications.workspaceId],
    references: [weddingWorkspaces.id],
  }),
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const subscriptionRelations = relations(subscriptions, ({ one, many }) => ({
  workspace: one(weddingWorkspaces, {
    fields: [subscriptions.workspaceId],
    references: [weddingWorkspaces.id],
  }),
  plan: one(subscriptionPlans, {
    fields: [subscriptions.planId],
    references: [subscriptionPlans.id],
  }),
  transactions: many(paymentTransactions),
}));

export const paymentTransactionRelations = relations(paymentTransactions, ({ one }) => ({
  subscription: one(subscriptions, {
    fields: [paymentTransactions.subscriptionId],
    references: [subscriptions.id],
  }),
}));

// Image Gallery (DOC-03)
export const imageGallery = pgTable(
  "image_gallery",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => weddingWorkspaces.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    fileUrl: text("file_url").notNull(),
    fileType: text("file_type").notNull(),
    fileSize: integer("file_size").notNull(),
    uploadedBy: uuid("uploaded_by")
      .notNull()
      .references(() => users.id),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("image_gallery_workspace_idx").on(table.workspaceId),
    ...workspacePolicy(table.workspaceId),
  ]
).enableRLS();

export const imageGalleryRelations = relations(imageGallery, ({ one }) => ({
  workspace: one(weddingWorkspaces, {
    fields: [imageGallery.workspaceId],
    references: [weddingWorkspaces.id],
  }),
  uploader: one(users, {
    fields: [imageGallery.uploadedBy],
    references: [users.id],
  }),
}));

// Vendor Contracts (VND-09)
export const vendorContracts = pgTable(
  "vendor_contracts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => weddingWorkspaces.id, { onDelete: "cascade" }),
    vendorId: uuid("vendor_id")
      .notNull()
      .references(() => vendors.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    fileUrl: text("file_url").notNull(),
    fileType: text("file_type").notNull(),
    fileSize: integer("file_size").notNull(),
    signedDate: timestamp("signed_date", { withTimezone: true, mode: "date" }),
    notes: text("notes"),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("vendor_contracts_workspace_idx").on(table.workspaceId),
    index("vendor_contracts_vendor_idx").on(table.vendorId),
    ...workspacePolicy(table.workspaceId),
  ]
).enableRLS();

export const vendorContractRelations = relations(vendorContracts, ({ one }) => ({
  workspace: one(weddingWorkspaces, {
    fields: [vendorContracts.workspaceId],
    references: [weddingWorkspaces.id],
  }),
  vendor: one(vendors, {
    fields: [vendorContracts.workspaceId, vendorContracts.vendorId],
    references: [vendors.workspaceId, vendors.id],
  }),
  creator: one(users, {
    fields: [vendorContracts.createdBy],
    references: [users.id],
  }),
}));

// Invoices (SUB-09)
export const invoices = pgTable(
  "invoices",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => weddingWorkspaces.id, { onDelete: "cascade" }),
    subscriptionId: uuid("subscription_id")
      .notNull()
      .references(() => subscriptions.id, { onDelete: "cascade" }),
    invoiceNumber: text("invoice_number").notNull().unique(),
    amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
    status: text("status", { enum: ["PENDING", "PAID", "OVERDUE", "CANCELLED"] }).notNull().default("PENDING"),
    dueDate: timestamp("due_date", { withTimezone: true, mode: "date" }).notNull(),
    paidAt: timestamp("paid_at", { withTimezone: true, mode: "date" }),
    fileUrl: text("file_url"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("invoices_workspace_idx").on(table.workspaceId),
    index("invoices_subscription_idx").on(table.subscriptionId),
    ...workspacePolicy(table.workspaceId),
  ]
).enableRLS();

// Wedding Concept (WKS-04) — tema, warna, dan konsep pernikahan
export const weddingConcepts = pgTable(
  "wedding_concepts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .unique()
      .references(() => weddingWorkspaces.id, { onDelete: "cascade" }),
    theme: text("theme"),
    colorPalette: jsonb("color_palette"),
    moodboardImages: jsonb("moodboard_images"),
    description: text("description"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    ...workspacePolicy(table.workspaceId),
  ]
).enableRLS();

export const weddingConceptRelations = relations(weddingConcepts, ({ one }) => ({
  workspace: one(weddingWorkspaces, {
    fields: [weddingConcepts.workspaceId],
    references: [weddingWorkspaces.id],
  }),
}));

// Invitation Customization (INV-01) — setting custom undangan publik per workspace
export const invitationCustomization = pgTable(
  "invitation_customization",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .unique()
      .references(() => weddingWorkspaces.id, { onDelete: "cascade" }),
    couplePhotoUrl: text("couple_photo_url"),
    theme: text("theme").default("emas"), // emas, burgundy, sage, rose, navy
    musicUrl: text("music_url"),
    story: text("story"),
    galleryImageIds: jsonb("gallery_image_ids"), // string[] — array of image_gallery ids
    giftAccounts: jsonb("gift_accounts"), // Array of gift account objects: { type: "bank" | "ewallet", name, number, accountName }
    videoUrl: text("video_url"), // YouTube embed URL or direct video URL
    liveStreamUrl: text("live_stream_url"), // Live streaming URL
    storyTimeline: jsonb("story_timeline"), // Array of { date, title, description, photo_url }
    customFont: text("custom_font").default("Playfair Display"), // Google Fonts name for hero names
    backgroundImageUrl: text("background_image_url"), // Custom background image URL
    heroPhotoUrls: jsonb("hero_photo_urls"), // Array of blob URLs for hero carousel
    enableAnimations: boolean("enable_animations").notNull().default(false), // Enable floating hearts/confetti
    enabled: boolean("enabled").notNull().default(false),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    ...workspacePolicy(table.workspaceId),
  ]
).enableRLS();

export const invitationCustomizationRelations = relations(invitationCustomization, ({ one }) => ({
  workspace: one(weddingWorkspaces, {
    fields: [invitationCustomization.workspaceId],
    references: [weddingWorkspaces.id],
  }),
}));

// Comments (COL-03) — komentar di task, event, atau dokumen
export const commentTargetType = pgEnum("comment_target_type", [
  "TASK",
  "EVENT",
  "DOCUMENT",
  "VENDOR",
]);

export const comments = pgTable(
  "comments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => weddingWorkspaces.id, { onDelete: "cascade" }),
    targetId: uuid("target_id").notNull(),
    targetType: commentTargetType("target_type").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    parentId: uuid("parent_id"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("comments_workspace_target_idx").on(table.workspaceId, table.targetId, table.targetType),
    index("comments_parent_idx").on(table.parentId),
    foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
      name: "comments_parent_fk",
    }),
    ...workspacePolicy(table.workspaceId),
  ]
).enableRLS();

export const commentRelations = relations(comments, ({ one }) => ({
  workspace: one(weddingWorkspaces, {
    fields: [comments.workspaceId],
    references: [weddingWorkspaces.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
}));

// Task Attachments (TSK-10) — lampiran file di task
export const taskAttachments = pgTable(
  "task_attachments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    taskId: uuid("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => weddingWorkspaces.id, { onDelete: "cascade" }),
    fileName: text("file_name").notNull(),
    fileUrl: text("file_url").notNull(),
    fileSize: integer("file_size").notNull(),
    mimeType: text("mime_type").notNull(),
    uploadedBy: uuid("uploaded_by")
      .notNull()
      .references(() => users.id),
    createdAt: createdAt(),
  },
  (table) => [
    index("task_attachments_task_idx").on(table.taskId),
    ...workspacePolicy(table.workspaceId),
  ]
).enableRLS();

// Recurring Tasks (TSK-11) — tugas yang berulang
export const recurringTasks = pgTable(
  "recurring_tasks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => weddingWorkspaces.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    notes: text("notes"),
    priority: taskPriority("priority").notNull().default("MEDIUM"),
    categoryId: uuid("category_id").references(() => taskCategories.id, {
      onDelete: "set null",
    }),
    recurrencePattern: text("recurrence_pattern").notNull(), // DAILY, WEEKLY, BIWEEKLY, MONTHLY
    recurrenceInterval: integer("recurrence_interval").notNull().default(1),
    startDate: timestamp("start_date", { withTimezone: true, mode: "date" }).notNull(),
    endDate: timestamp("end_date", { withTimezone: true, mode: "date" }),
    isActive: boolean("is_active").notNull().default(true),
    lastGeneratedAt: timestamp("last_generated_at", { withTimezone: true, mode: "date" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("recurring_tasks_workspace_idx").on(table.workspaceId),
    foreignKey({
      name: "recurring_tasks_workspace_category_fk",
      columns: [table.workspaceId, table.categoryId],
      foreignColumns: [taskCategories.workspaceId, taskCategories.id],
    }),
    ...workspacePolicy(table.workspaceId),
  ]
).enableRLS();

export const recurringTaskRelations = relations(recurringTasks, ({ one }) => ({
  workspace: one(weddingWorkspaces, {
    fields: [recurringTasks.workspaceId],
    references: [weddingWorkspaces.id],
  }),
  category: one(taskCategories, {
    fields: [recurringTasks.workspaceId, recurringTasks.categoryId],
    references: [taskCategories.workspaceId, taskCategories.id],
  }),
}));

export const taskAttachmentRelations = relations(taskAttachments, ({ one }) => ({
  task: one(tasks, {
    fields: [taskAttachments.taskId],
    references: [tasks.id],
  }),
  workspace: one(weddingWorkspaces, {
    fields: [taskAttachments.workspaceId],
    references: [weddingWorkspaces.id],
  }),
  uploader: one(users, {
    fields: [taskAttachments.uploadedBy],
    references: [users.id],
  }),
}));

// Vendor Portfolio Images (VND-04)
export const vendorPortfolioImages = pgTable(
  "vendor_portfolio_images",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    vendorId: uuid("vendor_id")
      .notNull()
      .references(() => vendors.id, { onDelete: "cascade" }),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => weddingWorkspaces.id, { onDelete: "cascade" }),
    imageUrl: text("image_url").notNull(),
    caption: text("caption"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: createdAt(),
  },
  (table) => [
    index("vendor_portfolio_vendor_idx").on(table.workspaceId, table.vendorId),
    ...workspacePolicy(table.workspaceId),
  ]
).enableRLS();

export const vendorPortfolioImageRelations = relations(vendorPortfolioImages, ({ one }) => ({
  vendor: one(vendors, {
    fields: [vendorPortfolioImages.workspaceId, vendorPortfolioImages.vendorId],
    references: [vendors.workspaceId, vendors.id],
  }),
  workspace: one(weddingWorkspaces, {
    fields: [vendorPortfolioImages.workspaceId],
    references: [weddingWorkspaces.id],
  }),
}));

// Document Shares (DOC-06) — share dokumen ke non-member via link
export const documentShares = pgTable(
  "document_shares",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    documentId: uuid("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => weddingWorkspaces.id, { onDelete: "cascade" }),
    shareCode: text("share_code").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),
    createdAt: createdAt(),
  },
  (table) => [
    index("document_shares_code_idx").on(table.shareCode),
    ...workspacePolicy(table.workspaceId),
  ]
).enableRLS();

export const documentShareRelations = relations(documentShares, ({ one }) => ({
  document: one(documents, {
    fields: [documentShares.documentId],
    references: [documents.id],
  }),
  workspace: one(weddingWorkspaces, {
    fields: [documentShares.workspaceId],
    references: [weddingWorkspaces.id],
  }),
  creator: one(users, {
    fields: [documentShares.createdBy],
    references: [users.id],
  }),
}));

export const invoiceRelations = relations(invoices, ({ one }) => ({
  workspace: one(weddingWorkspaces, {
    fields: [invoices.workspaceId],
    references: [weddingWorkspaces.id],
  }),
  subscription: one(subscriptions, {
    fields: [invoices.subscriptionId],
    references: [subscriptions.id],
  }),
}));

export const templateTaskRelations = relations(templateTasks, ({ one }) => ({
  template: one(checklistTemplates, {
    fields: [templateTasks.templateId],
    references: [checklistTemplates.id],
  }),
}));

export const checklistTemplateRelations = relations(checklistTemplates, ({ many }) => ({
  tasks: many(templateTasks),
}));

export const taskCategoryRelations = relations(taskCategories, ({ one, many }) => ({
  workspace: one(weddingWorkspaces, {
    fields: [taskCategories.workspaceId],
    references: [weddingWorkspaces.id],
  }),
  tasks: many(tasks),
}));

// Support Tickets (ADM-06) — tiket support dari user
export const supportTickets = pgTable(
  "support_tickets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    workspaceId: uuid("workspace_id")
      .references(() => weddingWorkspaces.id, { onDelete: "set null" }),
    subject: text("subject").notNull(),
    message: text("message").notNull(),
    status: text("status", { enum: ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] }).notNull().default("OPEN"),
    priority: text("priority", { enum: ["LOW", "MEDIUM", "HIGH", "URGENT"] }).notNull().default("MEDIUM"),
    category: text("category").notNull(), // BILLING, TECHNICAL, FEATURE_REQUEST, OTHER
    assignedToId: uuid("assigned_to_id").references(() => users.id, { onDelete: "set null" }),
    resolvedAt: timestamp("resolved_at", { withTimezone: true, mode: "date" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("support_tickets_user_idx").on(table.userId),
    index("support_tickets_status_idx").on(table.status),
    index("support_tickets_created_idx").on(table.createdAt),
  ]
);

export const supportTicketMessages = pgTable(
  "support_ticket_messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ticketId: uuid("ticket_id")
      .notNull()
      .references(() => supportTickets.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    message: text("message").notNull(),
    isInternal: boolean("is_internal").notNull().default(false),
    createdAt: createdAt(),
  },
  (table) => [
    index("support_ticket_messages_ticket_idx").on(table.ticketId),
  ]
);

export const supportTicketRelations = relations(supportTickets, ({ one, many }) => ({
  user: one(users, {
    fields: [supportTickets.userId],
    references: [users.id],
  }),
  workspace: one(weddingWorkspaces, {
    fields: [supportTickets.workspaceId],
    references: [weddingWorkspaces.id],
  }),
  assignedTo: one(users, {
    fields: [supportTickets.assignedToId],
    references: [users.id],
  }),
  messages: many(supportTicketMessages),
}));

export const supportTicketMessageRelations = relations(supportTicketMessages, ({ one }) => ({
  ticket: one(supportTickets, {
    fields: [supportTicketMessages.ticketId],
    references: [supportTickets.id],
  }),
  user: one(users, {
    fields: [supportTicketMessages.userId],
    references: [users.id],
  }),
}));

// Admin Content Management (ADM-05) — CMS untuk konten marketing
export const adminContents = pgTable(
  "admin_contents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    type: text("type").notNull(), // LANDING_PAGE, FAQ, BLOG, TESTIMONIAL, PARTNER
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    content: jsonb("content").notNull(),
    metadata: jsonb("metadata"),
    isActive: boolean("is_active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("admin_contents_type_idx").on(table.type),
    index("admin_contents_active_idx").on(table.isActive),
  ]
);

export const adminContentRelations = relations(adminContents, ({ one }) => ({
  creator: one(users, {
    fields: [adminContents.createdBy],
    references: [users.id],
  }),
}));

// Push Notifications (COL-07) — push notification subscriptions
export const pushNotificationSubscriptions = pgTable(
  "push_notification_subscriptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    endpoint: text("endpoint").notNull(),
    p256dh: text("p256dh").notNull(),
    auth: text("auth").notNull(),
    userAgent: text("user_agent"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("push_notification_subscriptions_user_idx").on(table.userId),
  ]
);

export const pushNotificationSubscriptionRelations = relations(pushNotificationSubscriptions, ({ one }) => ({
  user: one(users, {
    fields: [pushNotificationSubscriptions.userId],
    references: [users.id],
  }),
}));

// Calendar Sync (CAL-06) — external calendar sync
export const calendarSyncs = pgTable(
  "calendar_syncs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => weddingWorkspaces.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(), // GOOGLE, OUTLOOK, APPLE
    calendarId: text("calendar_id").notNull(),
    accessToken: text("access_token").notNull(),
    refreshToken: text("refresh_token"),
    syncDirection: text("sync_direction").notNull().default("BIDIRECTIONAL"), // ONE_WAY, BIDIRECTIONAL
    isActive: boolean("is_active").notNull().default(true),
    lastSyncAt: timestamp("last_sync_at", { withTimezone: true, mode: "date" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("calendar_syncs_user_idx").on(table.userId),
    index("calendar_syncs_workspace_idx").on(table.workspaceId),
    ...workspacePolicy(table.workspaceId),
  ]
).enableRLS();

export const calendarSyncRelations = relations(calendarSyncs, ({ one }) => ({
  user: one(users, {
    fields: [calendarSyncs.userId],
    references: [users.id],
  }),
  workspace: one(weddingWorkspaces, {
    fields: [calendarSyncs.workspaceId],
    references: [weddingWorkspaces.id],
  }),
}));

// WhatsApp Notifications (COL-08) — WhatsApp notification settings
export const whatsappNotifications = pgTable(
  "whatsapp_notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    phoneNumber: text("phone_number").notNull(),
    isEnabled: boolean("is_enabled").notNull().default(true),
    taskReminders: boolean("task_reminders").notNull().default(true),
    budgetAlerts: boolean("budget_alerts").notNull().default(true),
    eventReminders: boolean("event_reminders").notNull().default(true),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("whatsapp_notifications_user_idx").on(table.userId),
  ]
);

export const whatsappNotificationRelations = relations(whatsappNotifications, ({ one }) => ({
  user: one(users, {
    fields: [whatsappNotifications.userId],
    references: [users.id],
  }),
}));

// Feature Flags (ADM-04) — Toggle features on/off per workspace or globally
export const featureFlags = pgTable(
  "feature_flags",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull().unique(),
    description: text("description"),
    isEnabled: boolean("is_enabled").notNull().default(false),
    scope: text("scope").notNull().default("global"), // global, workspace, user
    targetId: uuid("target_id"), // workspace_id or user_id depending on scope
    metadata: jsonb("metadata"),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id, { onDelete: "set null" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("feature_flags_name_idx").on(table.name),
    index("feature_flags_scope_idx").on(table.scope),
  ]
);

export const featureFlagRelations = relations(featureFlags, ({ one }) => ({
  creator: one(users, {
    fields: [featureFlags.createdBy],
    references: [users.id],
  }),
}));

// System Settings (ADM-04) — Platform configuration managed by admin
export const systemSettings = pgTable(
  "system_settings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    key: text("key").notNull().unique(),
    value: jsonb("value").notNull(),
    description: text("description"),
    category: text("category").notNull().default("general"), // general, email, payment, storage, notification
    isPublic: boolean("is_public").notNull().default(false),
    updatedBy: uuid("updated_by")
      .references(() => users.id, { onDelete: "set null" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("system_settings_key_idx").on(table.key),
    index("system_settings_category_idx").on(table.category),
  ]
);

export const systemSettingRelations = relations(systemSettings, ({ one }) => ({
  updater: one(users, {
    fields: [systemSettings.updatedBy],
    references: [users.id],
  }),
}));

// Admin Audit Logs (ADM-09) — Track all admin actions
export const adminAuditLogs = pgTable(
  "admin_audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    adminId: uuid("admin_id")
      .notNull()
      .references(() => users.id, { onDelete: "set null" }),
    action: text("action").notNull(), // create, update, delete, login, logout, export, etc.
    entityType: text("entity_type").notNull(), // user, workspace, plan, payment, content, etc.
    entityId: uuid("entity_id"),
    oldValue: jsonb("old_value"),
    newValue: jsonb("new_value"),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    notes: text("notes"),
    createdAt: createdAt(),
  },
  (table) => [
    index("admin_audit_logs_admin_idx").on(table.adminId),
    index("admin_audit_logs_action_idx").on(table.action),
    index("admin_audit_logs_entity_idx").on(table.entityType, table.entityId),
    index("admin_audit_logs_created_at_idx").on(table.createdAt),
  ]
);

export const adminAuditLogRelations = relations(adminAuditLogs, ({ one }) => ({
  admin: one(users, {
    fields: [adminAuditLogs.adminId],
    references: [users.id],
  }),
}));

// Announcements (ADM-NEW) — Broadcast messages to users
export const announcements = pgTable(
  "announcements",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    type: text("type").notNull().default("info"), // info, warning, error, maintenance
    isActive: boolean("is_active").notNull().default(false),
    startDate: timestamp("start_date", { withTimezone: true, mode: "date" }),
    endDate: timestamp("end_date", { withTimezone: true, mode: "date" }),
    targetAudience: text("target_audience").notNull().default("all"), // all, admin, user, workspace
    targetWorkspaceId: uuid("target_workspace_id").references(() => weddingWorkspaces.id, {
      onDelete: "set null",
    }),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id, { onDelete: "set null" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("announcements_active_idx").on(table.isActive),
    index("announcements_date_idx").on(table.startDate, table.endDate),
    index("announcements_created_at_idx").on(table.createdAt),
  ]
);

export const announcementRelations = relations(announcements, ({ one }) => ({
  creator: one(users, {
    fields: [announcements.createdBy],
    references: [users.id],
  }),
  targetWorkspace: one(weddingWorkspaces, {
    fields: [announcements.targetWorkspaceId],
    references: [weddingWorkspaces.id],
  }),
}));

export const drizzleSchema = {
  users,
  userCredentials,
  accounts,
  sessions,
  verificationTokens,
  weddingWorkspaces,
  workspaceMembers,
  weddingEvents,
  tasks,
  taskCategories,
  checklistTemplates,
  templateTasks,
  budgets,
  budgetCategories,
  expenses,
  expenseAttachments,
  vendors,
  vendorQuotations,
  vendorPayments,
  guests,
  culturalRundowns,
  curatedVendors,
  culturalSeserahanItems,
  documents,
  notifications,
  activityLogs,
  subscriptionPlans,
  subscriptions,
  paymentTransactions,
  imageGallery,
  vendorContracts,
  invoices,
  weddingConcepts,
  invitationCustomization,
  comments,
  taskAttachments,
  recurringTasks,
  vendorPortfolioImages,
  documentShares,
  supportTickets,
  supportTicketMessages,
  adminContents,
  pushNotificationSubscriptions,
  calendarSyncs,
  whatsappNotifications,
  featureFlags,
  systemSettings,
  adminAuditLogs,
  announcements,
  userRelations,
  userCredentialRelations,
  workspaceRelations,
  workspaceMemberRelations,
  taskRelations,
  taskCategoryRelations,
  checklistTemplateRelations,
  templateTaskRelations,
  expenseRelations,
  expenseAttachmentRelations,
  guestRelations,
  vendorQuotationRelations,
  vendorPaymentRelations,
  documentRelations,
  notificationRelations,
  subscriptionRelations,
  paymentTransactionRelations,
  imageGalleryRelations,
  vendorContractRelations,
  invoiceRelations,
  weddingConceptRelations,
  invitationCustomizationRelations,
  commentRelations,
  taskAttachmentRelations,
  recurringTaskRelations,
  vendorPortfolioImageRelations,
  documentShareRelations,
  supportTicketRelations,
  supportTicketMessageRelations,
  adminContentRelations,
  pushNotificationSubscriptionRelations,
  calendarSyncRelations,
  whatsappNotificationRelations,
  featureFlagRelations,
  systemSettingRelations,
  adminAuditLogRelations,
  announcementRelations,
};
