import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
export const registrations = sqliteTable("registrations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  participantName: text("participant_name").notNull(),
  participantType: text("participant_type").notNull(),
  age: integer("age"),
  guardianName: text("guardian_name"),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  participants: integer("participants").notNull(),
  amount: integer("amount").notNull(),
  transactionId: text("transaction_id").notNull(),
  paymentStatus: text("payment_status").notNull().default("submitted"),
  createdAt: text("created_at").notNull(),
}, (table) => [uniqueIndex("idx_registrations_transaction_id").on(table.transactionId)]);
