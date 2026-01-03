import {
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  decimal,
  pgEnum,
} from "drizzle-orm/pg-core";

import type { AdapterAccount } from "next-auth/adapters";

import { createTable } from "./table-creator";

/* -----------------------------------------------------------------------------------------------
 * Auth tables
 * NOTE: auth tables are common to mutiple projects, remember to remove `table filters` before
 * performing any operations
 * -----------------------------------------------------------------------------------------------*/

export const users = pgTable("user", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  username: text("username").unique(),
  password: text("password"),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
});

export const accounts = pgTable(
  "account",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

/* -----------------------------------------------------------------------------------------------
 * App tables
 * -----------------------------------------------------------------------------------------------*/

export const interactionTypeEnum = pgEnum("interaction_type", [
  "meeting",
  "call",
  "demo",
  "email",
  "other",
]);

export const dealStageEnum = pgEnum("deal_stage", [
  "prospecting",
  "qualification",
  "proposal",
  "negotiation",
  "closed_won",
  "closed_lost",
]);

export const myPlaylists = createTable("playlist", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  userId: uuid("userId")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  // @ts-expect-error string is not assignable to type 'string[]'
  songs: text("songs").array().default("{}").notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
});

export const customers = createTable("customer", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("userId")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  company: text("company").notNull(),
  email: text("email"),
  phone: text("phone"),
  notes: text("notes"),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

export const interactions = createTable("interaction", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("userId")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  customerId: uuid("customerId")
    .references(() => customers.id, { onDelete: "cascade" })
    .notNull(),
  dealId: uuid("dealId").references(() => deals.id, { onDelete: "set null" }),
  type: interactionTypeEnum("type").notNull(),
  summary: text("summary").notNull(),
  keyPoints: text("keyPoints").array().notNull(),
  nextSteps: text("nextSteps").array().notNull(),
  followUpDate: timestamp("followUpDate", { mode: "date" }),
  transcribedFromVoice: text("transcribedFromVoice"),
  voiceNoteProcessed: text("voiceNoteProcessed"),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
});

export const deals = createTable("deal", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("userId")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  customerId: uuid("customerId")
    .references(() => customers.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  value: decimal("value", { precision: 12, scale: 2 }),
  stage: dealStageEnum("stage").default("prospecting").notNull(),
  closeDate: timestamp("closeDate", { mode: "date" }),
  description: text("description"),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

export const favorites = createTable("favorite", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("userId")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  // @ts-expect-error string is not assignable to type 'string[]'
  songs: text("songs").array().unique().default("{}").notNull(),
  // @ts-expect-error string is not assignable to type 'string[]'
  albums: text("albums").array().unique().default("{}").notNull(),
  // @ts-expect-error string is not assignable to type 'string[]'
  playlists: text("playlists").array().unique().default("{}").notNull(),
  // @ts-expect-error string is not assignable to type 'string[]'
  artists: text("artists").array().unique().default("{}").notNull(),
  // @ts-expect-error string is not assignable to type 'string[]'
  podcasts: text("podcasts").array().unique().default("{}").notNull(),
});

/* -----------------------------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------------------------*/

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type MyPlaylist = typeof myPlaylists.$inferSelect;
export type NewPlaylist = typeof myPlaylists.$inferInsert;

export type Favorite = typeof favorites.$inferSelect;
export type NewFavorite = typeof favorites.$inferInsert;

export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;

export type Interaction = typeof interactions.$inferSelect;
export type NewInteraction = typeof interactions.$inferInsert;

export type Deal = typeof deals.$inferSelect;
export type NewDeal = typeof deals.$inferInsert;
