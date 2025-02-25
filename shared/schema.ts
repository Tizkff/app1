import { pgTable, text, serial, integer, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const contracts = pgTable("contracts", {
  id: serial("id").primaryKey(),
  contractNumber: text("contract_number").notNull(),
  name: text("name").notNull(),
  inceptionDate: timestamp("inception_date").notNull(),
});

export const exposureFiles = pgTable("exposure_files", {
  id: serial("id").primaryKey(),
  fileId: text("file_id").notNull(),
  importedBy: text("imported_by").notNull(),
  importedAt: timestamp("imported_at").notNull(),
  count: integer("count").notNull(),
  totalGWP: decimal("total_gwp").notNull(),
  tsiAmount: decimal("tsi_amount").notNull(),
  exposureByCountry: text("exposure_by_country").notNull(), // JSON string
  exposureByIndustry: text("exposure_by_industry").notNull(), // JSON string
  currencyDistribution: text("currency_distribution").notNull(), // JSON string
});

export const contractExposureLinks = pgTable("contract_exposure_links", {
  id: serial("id").primaryKey(),
  contractId: integer("contract_id").notNull(),
  exposureFileId: integer("exposure_file_id").notNull(),
});

export const insertContractSchema = createInsertSchema(contracts).pick({
  contractNumber: true,
  name: true,
  inceptionDate: true,
});

export const insertExposureFileSchema = createInsertSchema(exposureFiles).pick({
  fileId: true,
  importedBy: true,
  importedAt: true,
  count: true,
  totalGWP: true,
  tsiAmount: true,
  exposureByCountry: true,
  exposureByIndustry: true,
  currencyDistribution: true,
});

export const insertContractExposureLinkSchema = createInsertSchema(contractExposureLinks).pick({
  contractId: true,
  exposureFileId: true,
});

export type Contract = typeof contracts.$inferSelect;
export type ExposureFile = typeof exposureFiles.$inferSelect;
export type ContractExposureLink = typeof contractExposureLinks.$inferSelect;

export type InsertContract = z.infer<typeof insertContractSchema>;
export type InsertExposureFile = z.infer<typeof insertExposureFileSchema>;
export type InsertContractExposureLink = z.infer<typeof insertContractExposureLinkSchema>;