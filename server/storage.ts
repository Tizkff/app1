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
      },
      {
        companyName: "Nordic Energy Group",
        policyNumber: "POL-2024-004",
        revenue: 450000000,
        currency: "EUR",
        iso3Country: "NOR",
        inceptionDate: "2024-01-15",
        expiryDate: "2025-01-14",
        policyLimit: 12000000,
        policyAttachment: 1500000,
        policyDeductible: 60000,
        policyGWP: 300000
      },
      {
        companyName: "Australian Mining Ltd",
        policyNumber: "POL-2024-005",
        revenue: 600000000,
        currency: "AUD",
        iso3Country: "AUS",
        inceptionDate: "2024-02-01",
        expiryDate: "2025-01-31",
        policyLimit: 20000000,
        policyAttachment: 2500000,
        policyDeductible: 100000,
        policyGWP: 500000
      }
    ];

    const sampleTopCompanies: TopCompany[] = [
      { name: "Global Tech Industries", sumInsured: 10000000 },
      { name: "European Manufacturing Corp", sumInsured: 15000000 },
      { name: "Asian Tech Solutions", sumInsured: 8000000 },
      { name: "American Insurance Group", sumInsured: 12000000 },
      { name: "British Financial Services", sumInsured: 9000000 },
      { name: "Nordic Energy Group", sumInsured: 12000000 },
      { name: "Australian Mining Ltd", sumInsured: 20000000 },
      { name: "Canadian Resources Corp", sumInsured: 11000000 },
      { name: "French Industrial Group", sumInsured: 13000000 },
      { name: "Swiss Banking Solutions", sumInsured: 14000000 }
    ].sort((a, b) => b.sumInsured - a.sumInsured).slice(0, 20);

    // Add sample contracts
    const sampleContracts: InsertContract[] = [
      {
        contractNumber: "CNT-2024-001",
        name: "Global Tech Treaty",
        inceptionDate: new Date("2024-01-01"),
      },
      {
        contractNumber: "CNT-2024-002",
        name: "European Operations Cover",
        inceptionDate: new Date("2024-02-15"),
      },
      {
        contractNumber: "CNT-2024-003",
        name: "Asia-Pacific Portfolio",
        inceptionDate: new Date("2024-03-01"),
      },
      {
        contractNumber: "CNT-2024-004",
        name: "Nordic Energy Treaty",
        inceptionDate: new Date("2024-01-15"),
      },
      {
        contractNumber: "CNT-2024-005",
        name: "Mining Sector Coverage",
        inceptionDate: new Date("2024-02-01"),
      }
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
          "UK": 20,
          "Germany": 15,
          "France": 15,
          "Japan": 10
        }),
        exposureByIndustry: JSON.stringify({
          "Manufacturing": 35,
          "Technology": 25,
          "Services": 20,
          "Energy": 10,
          "Finance": 10
        }),
        currencyDistribution: JSON.stringify({
          "USD": 45,
          "EUR": 30,
          "GBP": 15,
          "JPY": 10
        }),
        matchedCompaniesPercent: "92.50",
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
          "France": 30,
          "Spain": 25,
          "Italy": 20,
          "Germany": 15,
          "Netherlands": 10
        }),
        exposureByIndustry: JSON.stringify({
          "Retail": 30,
          "Healthcare": 25,
          "Finance": 20,
          "Technology": 15,
          "Manufacturing": 10
        }),
        currencyDistribution: JSON.stringify({
          "EUR": 70,
          "USD": 20,
          "GBP": 10
        }),
        matchedCompaniesPercent: "94.00",
        topCompanies: JSON.stringify(sampleTopCompanies),
        detailedData: JSON.stringify(sampleDetailedData)
      },
      {
        fileId: "921456",
        importedBy: "Sarah Johnson",
        importedAt: new Date("2024-02-25T09:45:00Z"),
        count: 175,
        totalGWP: "1800000.00",
        tsiAmount: "18000000.00",
        exposureByCountry: JSON.stringify({
          "Australia": 35,
          "Japan": 25,
          "Singapore": 20,
          "South Korea": 10,
          "New Zealand": 10
        }),
        exposureByIndustry: JSON.stringify({
          "Mining": 30,
          "Technology": 25,
          "Manufacturing": 20,
          "Services": 15,
          "Energy": 10
        }),
        currencyDistribution: JSON.stringify({
          "AUD": 40,
          "JPY": 30,
          "USD": 20,
          "SGD": 10
        }),
        matchedCompaniesPercent: "89.00",
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
    this.createContractLink({ contractId: 1, exposureFileId: 3 });
    this.createContractLink({ contractId: 2, exposureFileId: 1 });
    this.createContractLink({ contractId: 3, exposureFileId: 2 });
    this.createContractLink({ contractId: 4, exposureFileId: 3 });
    this.createContractLink({ contractId: 5, exposureFileId: 1 });

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