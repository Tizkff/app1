import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import type { ExposureFile } from "@shared/schema";
import { format } from "date-fns";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function ExposureListPage() {
  const { data: files, isLoading } = useQuery<ExposureFile[]>({
    queryKey: ["/api/exposure-files"],
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Exposure Files</h1>
        <p className="text-muted-foreground">
          View all exposure files and their details
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>File ID</TableHead>
            <TableHead>Imported At</TableHead>
            <TableHead>Imported By</TableHead>
            <TableHead>Policies Count</TableHead>
            <TableHead>TSI Amount</TableHead>
            <TableHead>GWP</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files?.map((file) => (
            <TableRow key={file.id}>
              <TableCell>{file.fileId}</TableCell>
              <TableCell>
                {format(new Date(file.importedAt), "PPP pp")}
              </TableCell>
              <TableCell>{file.importedBy}</TableCell>
              <TableCell>{file.count}</TableCell>
              <TableCell>{file.tsiAmount}</TableCell>
              <TableCell>{file.totalGWP}</TableCell>
              <TableCell>
                <Link href={`/exposure/${file.id}`}>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
