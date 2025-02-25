import {
  type Contract,
  type ExposureFile,
  type ContractExposureLink,
  type InsertContract,
  type InsertExposureFile,
  type InsertContractExposureLink,
} from "@shared/schema";

export interface IStorage {
  getContracts(): Promise<Contract[]>;
  getContract(id: number): Promise<Contract | undefined>;
  getExposureFiles(): Promise<ExposureFile[]>;
  getExposureFile(id: number): Promise<ExposureFile | undefined>;
  getContractLinks(contractId: number): Promise<ContractExposureLink[]>;
  createContractLink(link: InsertContractExposureLink): Promise<ContractExposureLink>;
  deleteContractLink(contractId: number, exposureFileId: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private contracts: Map<number, Contract>;
  private exposureFiles: Map<number, ExposureFile>;
  private contractLinks: Map<number, ContractExposureLink>;
  private currentIds: { [key: string]: number };

  constructor() {
    this.contracts = new Map();
    this.exposureFiles = new Map();
    this.contractLinks = new Map();
    this.currentIds = { contracts: 1, exposureFiles: 1, contractLinks: 1 };

    // Add sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Add sample contracts
    const sampleContracts: InsertContract[] = [
      { name: "Contract 1" },
      { name: "Contract 2" },
      { name: "Contract 3" },
    ];

    // Add sample exposure files with more detailed information
    const sampleExposureFiles: InsertExposureFile[] = [
      {
        fileId: "803837",
        importedBy: "John Smith",
        importedAt: new Date("2024-02-20T10:30:00Z"),
        count: 150,
        totalGWP: "1500000.00",
        tsiAmount: "15000000.00",
        exposureByCountry: JSON.stringify({
          "US": 40,
          "UK": 30,
          "Germany": 30
        }),
        exposureByIndustry: JSON.stringify({
          "Manufacturing": 45,
          "Technology": 35,
          "Services": 20
        }),
        currencyDistribution: JSON.stringify({
          "USD": 60,
          "EUR": 25,
          "GBP": 15
        })
      },
      {
        fileId: "890283",
        importedBy: "Emma Davis",
        importedAt: new Date("2024-02-22T14:15:00Z"),
        count: 200,
        totalGWP: "2000000.00",
        tsiAmount: "20000000.00",
        exposureByCountry: JSON.stringify({
          "France": 35,
          "Spain": 35,
          "Italy": 30
        }),
        exposureByIndustry: JSON.stringify({
          "Retail": 40,
          "Healthcare": 35,
          "Finance": 25
        }),
        currencyDistribution: JSON.stringify({
          "EUR": 80,
          "USD": 20
        })
      }
    ];

    sampleContracts.forEach((contract) => {
      const id = this.currentIds.contracts++;
      this.contracts.set(id, { ...contract, id });
    });

    sampleExposureFiles.forEach((file) => {
      const id = this.currentIds.exposureFiles++;
      this.exposureFiles.set(id, { ...file, id });
    });

    // Add some sample links
    this.createContractLink({ contractId: 1, exposureFileId: 1 });
    this.createContractLink({ contractId: 1, exposureFileId: 2 });
  }

  async getContracts(): Promise<Contract[]> {
    return Array.from(this.contracts.values());
  }

  async getContract(id: number): Promise<Contract | undefined> {
    return this.contracts.get(id);
  }

  async getExposureFiles(): Promise<ExposureFile[]> {
    return Array.from(this.exposureFiles.values());
  }

  async getExposureFile(id: number): Promise<ExposureFile | undefined> {
    return this.exposureFiles.get(id);
  }

  async getContractLinks(contractId: number): Promise<ContractExposureLink[]> {
    return Array.from(this.contractLinks.values()).filter(
      (link) => link.contractId === contractId
    );
  }

  async createContractLink(link: InsertContractExposureLink): Promise<ContractExposureLink> {
    const id = this.currentIds.contractLinks++;
    const newLink = { ...link, id };
    this.contractLinks.set(id, newLink);
    return newLink;
  }

  async deleteContractLink(contractId: number, exposureFileId: number): Promise<void> {
    const linkToDelete = Array.from(this.contractLinks.entries()).find(
      ([_, link]) =>
        link.contractId === contractId && link.exposureFileId === exposureFileId
    );
    if (linkToDelete) {
      this.contractLinks.delete(linkToDelete[0]);
    }
  }
}

export const storage = new MemStorage();