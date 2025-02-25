import {
  type Contract,
  type ExposureFile,
  type ContractExposureLink,
  type InsertContract,
  type InsertExposureFile,
  type InsertContractExposureLink,
} from "@shared/schema";

interface DetailedExposureData {
  companyName: string;
  policyNumber: string;
  revenue: number;
  currency: string;
  iso3Country: string;
  inceptionDate: string;
  expiryDate: string;
  policyLimit: number;
  policyAttachment: number;
  policyDeductible: number;
  policyGWP: number;
}

interface TopCompany {
  name: string;
  sumInsured: number;
}

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
    const sampleDetailedData: DetailedExposureData[] = [
      {
        companyName: "Global Tech Industries",
        policyNumber: "POL-2024-001",
        revenue: 500000000,
        currency: "USD",
        iso3Country: "USA",
        inceptionDate: "2024-01-01",
        expiryDate: "2024-12-31",
        policyLimit: 10000000,
        policyAttachment: 1000000,
        policyDeductible: 50000,
        policyGWP: 250000
      },
      {
        companyName: "European Manufacturing Corp",
        policyNumber: "POL-2024-002",
        revenue: 750000000,
        currency: "EUR",
        iso3Country: "DEU",
        inceptionDate: "2024-02-15",
        expiryDate: "2025-02-14",
        policyLimit: 15000000,
        policyAttachment: 2000000,
        policyDeductible: 75000,
        policyGWP: 375000
      },
      {
        companyName: "Asian Tech Solutions",
        policyNumber: "POL-2024-003",
        revenue: 300000000,
        currency: "JPY",
        iso3Country: "JPN",
        inceptionDate: "2024-03-01",
        expiryDate: "2025-02-28",
        policyLimit: 8000000,
        policyAttachment: 1000000,
        policyDeductible: 40000,
        policyGWP: 200000
      }
    ];

    const sampleTopCompanies: TopCompany[] = [
      { name: "Global Tech Industries", sumInsured: 10000000 },
      { name: "European Manufacturing Corp", sumInsured: 15000000 },
      { name: "Asian Tech Solutions", sumInsured: 8000000 },
      { name: "American Insurance Group", sumInsured: 12000000 },
      { name: "British Financial Services", sumInsured: 9000000 }
    ].sort((a, b) => b.sumInsured - a.sumInsured).slice(0, 20);

    // Add sample contracts
    const sampleContracts: InsertContract[] = [
      {
        contractNumber: "CNT-2024-001",
        name: "Contract 1",
        inceptionDate: new Date("2024-01-01"),
      },
      {
        contractNumber: "CNT-2024-002",
        name: "Contract 2",
        inceptionDate: new Date("2024-02-15"),
      },
      {
        contractNumber: "CNT-2024-003",
        name: "Contract 3",
        inceptionDate: new Date("2024-03-01"),
      },
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
        }),
        matchedCompaniesPercent: "85.50",
        topCompanies: JSON.stringify(sampleTopCompanies),
        detailedData: JSON.stringify(sampleDetailedData)
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
        }),
        matchedCompaniesPercent: "92.00",
        topCompanies: JSON.stringify(sampleTopCompanies),
        detailedData: JSON.stringify(sampleDetailedData)
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