import ContractTable from "@/components/contract-table";

export default function ContractsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Contracts</h1>
        <p className="text-muted-foreground">
          Manage contract and exposure file relationships
        </p>
      </div>
      <ContractTable />
    </div>
  );
}
