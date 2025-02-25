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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search } from "lucide-react";
import { format } from "date-fns";

export default function ContractTable() {
  const [searchTerm, setSearchTerm] = useState("");

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

  const ExposureFileTooltip = ({ file }: { file: ExposureFile }) => {
    return (
      <div className="p-3 max-w-xs">
        <div className="space-y-2 text-sm">
          <p>Imported by: {file.importedBy}</p>
          <p>Count: {file.count}</p>
          <p>Total GWP: {file.totalGWP}</p>
          <p>TSI Amount: {file.tsiAmount}</p>
        </div>
      </div>
    );
  };

  const filteredContracts = contracts?.filter((contract) =>
    contract.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.contractNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search contracts by name or number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Contract Number</TableHead>
            <TableHead>Contract Name</TableHead>
            <TableHead>Inception Date</TableHead>
            <TableHead>Linked Exposure Files</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredContracts?.map((contract) => {
            const links = contractLinks.data?.[contract.id] || [];
            const linkedFiles = links
              .map((link) =>
                exposureFiles?.find((f) => f.id === link.exposureFileId)
              )
              .filter((f): f is ExposureFile => !!f);

            return (
              <TableRow key={contract.id}>
                <TableCell>{contract.contractNumber}</TableCell>
                <TableCell>{contract.name}</TableCell>
                <TableCell>
                  {format(new Date(contract.inceptionDate), "PPP")}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    {linkedFiles.map((file) => (
                      <Tooltip key={file.id}>
                        <TooltipTrigger asChild>
                          <Link href={`/exposure/${file.id}`}>
                            <Button
                              variant="link"
                              className="p-0 h-auto font-medium"
                            >
                              {file.fileId}
                            </Button>
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent>
                          <ExposureFileTooltip file={file} />
                        </TooltipContent>
                      </Tooltip>
                    ))}
                    {linkedFiles.length === 0 && "None"}
                  </div>
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
    </div>
  );
}