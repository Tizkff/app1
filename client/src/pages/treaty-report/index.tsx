import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { Contract, ExposureFile } from "@shared/schema";
import { format } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function TreatyReportPage() {
  const [selectedContractId, setSelectedContractId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: contracts } = useQuery<Contract[]>({
    queryKey: ["/api/contracts"],
  });

  const { data: selectedContract } = useQuery<Contract>({
    queryKey: [`/api/contracts/${selectedContractId}`],
    enabled: !!selectedContractId,
  });

  const { data: contractLinks } = useQuery<any[]>({
    queryKey: [`/api/contracts/${selectedContractId}/links`],
    enabled: !!selectedContractId,
  });

  const { data: exposureFiles } = useQuery<ExposureFile[]>({
    queryKey: ["/api/exposure-files"],
    enabled: !!contractLinks,
  });

  const filteredContracts = contracts?.filter(
    (contract) =>
      contract.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.contractNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sample modeling data - This would come from your API
  const modelingData = [
    { month: "Jan", baseline: 400, optimistic: 450, pessimistic: 350 },
    { month: "Feb", baseline: 420, optimistic: 480, pessimistic: 360 },
    { month: "Mar", baseline: 450, optimistic: 520, pessimistic: 380 },
    { month: "Apr", baseline: 470, optimistic: 550, pessimistic: 390 },
    { month: "May", baseline: 500, optimistic: 580, pessimistic: 420 },
    { month: "Jun", baseline: 520, optimistic: 600, pessimistic: 440 },
  ];

  const linkedExposureFiles = exposureFiles?.filter(
    (file) => contractLinks?.some((link) => link.exposureFileId === file.id)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Single Treaty Report</h1>
        <p className="text-muted-foreground">
          Comprehensive view of contract exposure and modeling results
        </p>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contracts by name or number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={selectedContractId} onValueChange={setSelectedContractId}>
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Select a contract" />
          </SelectTrigger>
          <SelectContent>
            {filteredContracts?.map((contract) => (
              <SelectItem key={contract.id} value={contract.id.toString()}>
                {contract.contractNumber} - {contract.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedContract && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Contract Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2">
                <div>
                  <dt className="font-medium">Contract Number</dt>
                  <dd>{selectedContract.contractNumber}</dd>
                </div>
                <div>
                  <dt className="font-medium">Name</dt>
                  <dd>{selectedContract.name}</dd>
                </div>
                <div>
                  <dt className="font-medium">Inception Date</dt>
                  <dd>{format(new Date(selectedContract.inceptionDate), "PPP")}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Exposure Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2">
                {linkedExposureFiles?.map((file) => (
                  <div key={file.id} className="border-b pb-2 last:border-0">
                    <dt className="font-medium">File {file.fileId}</dt>
                    <dd className="space-y-1 mt-1">
                      <div>Total GWP: {file.totalGWP}</div>
                      <div>TSI Amount: {file.tsiAmount}</div>
                      <div>Policies Count: {file.count}</div>
                    </dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Modeling Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={modelingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="baseline"
                      stroke="#8884d8"
                      name="Baseline Scenario"
                    />
                    <Line
                      type="monotone"
                      dataKey="optimistic"
                      stroke="#82ca9d"
                      name="Optimistic Scenario"
                    />
                    <Line
                      type="monotone"
                      dataKey="pessimistic"
                      stroke="#ff7300"
                      name="Pessimistic Scenario"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
