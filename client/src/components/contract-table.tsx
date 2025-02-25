import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Contract, ContractExposureLink, ExposureFile } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function ContractTable() {
  const { data: contracts, isLoading: loadingContracts } = useQuery<Contract[]>({
    queryKey: ["/api/contracts"],
  });

  const { data: exposureFiles, isLoading: loadingFiles } = useQuery<ExposureFile[]>({
    queryKey: ["/api/exposure-files"],
  });

  const contractLinks = useQuery<{ [key: number]: ContractExposureLink[] }>({
    queryKey: ["/api/contract-links"],
    queryFn: async () => {
      if (!contracts) return {};
      const links: { [key: number]: ContractExposureLink[] } = {};
      await Promise.all(
        contracts.map(async (contract) => {
          const response = await fetch(`/api/contracts/${contract.id}/links`);
          links[contract.id] = await response.json();
        })
      );
      return links;
    },
    enabled: !!contracts,
  });

  if (loadingContracts || loadingFiles || contractLinks.isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Contract Name</TableHead>
          <TableHead>Linked Exposure Files</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {contracts?.map((contract) => {
          const links = contractLinks.data?.[contract.id] || [];
          const linkedFiles = links
            .map((link) =>
              exposureFiles?.find((f) => f.id === link.exposureFileId)
            )
            .filter((f): f is ExposureFile => !!f);

          return (
            <TableRow key={contract.id}>
              <TableCell>{contract.name}</TableCell>
              <TableCell>
                {linkedFiles.map((file) => file.fileId).join(", ") || "None"}
              </TableCell>
              <TableCell>
                <Link href={`/contracts/${contract.id}`}>
                  <Button variant="outline" size="sm">
                    Manage Links
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
