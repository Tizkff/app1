import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const contracts = pgTable("contracts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
});

export const exposureFiles = pgTable("exposure_files", {
  id: serial("id").primaryKey(),
  fileId: text("file_id").notNull(),
});

export const contractExposureLinks = pgTable("contract_exposure_links", {
  id: serial("id").primaryKey(),
  contractId: integer("contract_id").notNull(),
  exposureFileId: integer("exposure_file_id").notNull(),
});

export const insertContractSchema = createInsertSchema(contracts).pick({
  name: true,
});

export const insertExposureFileSchema = createInsertSchema(exposureFiles).pick({
  fileId: true,
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
