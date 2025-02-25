import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContractExposureLinkSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/contracts", async (_req, res) => {
    const contracts = await storage.getContracts();
    res.json(contracts);
  });

  app.get("/api/contracts/:id", async (req, res) => {
    const contract = await storage.getContract(Number(req.params.id));
    if (!contract) {
      return res.status(404).json({ message: "Contract not found" });
    }
    res.json(contract);
  });

  app.get("/api/exposure-files", async (_req, res) => {
    const files = await storage.getExposureFiles();
    res.json(files);
  });

  app.get("/api/contracts/:id/links", async (req, res) => {
    const links = await storage.getContractLinks(Number(req.params.id));
    res.json(links);
  });

  app.post("/api/contracts/:id/links", async (req, res) => {
    const contractId = Number(req.params.id);
    const result = insertContractExposureLinkSchema.safeParse({
      ...req.body,
      contractId,
    });

    if (!result.success) {
      return res.status(400).json({ message: "Invalid request body" });
    }

    const link = await storage.createContractLink(result.data);
    res.status(201).json(link);
  });

  app.delete("/api/contracts/:contractId/links/:exposureFileId", async (req, res) => {
    await storage.deleteContractLink(
      Number(req.params.contractId),
      Number(req.params.exposureFileId)
    );
    res.status(204).send();
  });

  const httpServer = createServer(app);
  return httpServer;
}
