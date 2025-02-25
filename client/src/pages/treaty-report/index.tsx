import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Link } from "wouter";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function TreatyReportPage() {
  const [selectedContractId, setSelectedContractId] = useState<string>("");
  const [comparisonContractId, setComparisonContractId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: contracts } = useQuery<Contract[]>({
    queryKey: ["/api/contracts"],
  });

  const { data: selectedContract } = useQuery<Contract>({
    queryKey: [`/api/contracts/${selectedContractId}`],
    enabled: !!selectedContractId,
  });

  const { data: comparisonContract } = useQuery<Contract>({
    queryKey: [`/api/contracts/${comparisonContractId}`],
    enabled: !!comparisonContractId,
  });

  const { data: contractLinks } = useQuery<any[]>({
    queryKey: [`/api/contracts/${selectedContractId}/links`],
    enabled: !!selectedContractId,
  });

  const { data: comparisonLinks } = useQuery<any[]>({
    queryKey: [`/api/contracts/${comparisonContractId}/links`],
    enabled: !!comparisonContractId,
  });

  const { data: exposureFiles } = useQuery<ExposureFile[]>({
    queryKey: ["/api/exposure-files"],
    enabled: !!contractLinks || !!comparisonLinks,
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

  // Sample comparison modeling data
  const comparisonModelingData = [
    { month: "Jan", baseline: 380, optimistic: 420, pessimistic: 320 },
    { month: "Feb", baseline: 400, optimistic: 450, pessimistic: 340 },
    { month: "Mar", baseline: 430, optimistic: 490, pessimistic: 360 },
    { month: "Apr", baseline: 450, optimistic: 520, pessimistic: 370 },
    { month: "May", baseline: 480, optimistic: 550, pessimistic: 400 },
    { month: "Jun", baseline: 500, optimistic: 570, pessimistic: 420 },
  ];

  const linkedExposureFiles = exposureFiles?.filter(
    (file) => contractLinks?.some((link) => link.exposureFileId === file.id)
  );

  const comparisonExposureFiles = exposureFiles?.filter(
    (file) => comparisonLinks?.some((link) => link.exposureFileId === file.id)
  );

  const calculateTotalMetrics = (files: ExposureFile[] | undefined) => {
    if (!files) return { totalGWP: 0, totalTSI: 0, totalCount: 0 };
    return files.reduce(
      (acc, file) => ({
        totalGWP: acc.totalGWP + Number(file.totalGWP),
        totalTSI: acc.totalTSI + Number(file.tsiAmount),
        totalCount: acc.totalCount + file.count,
      }),
      { totalGWP: 0, totalTSI: 0, totalCount: 0 }
    );
  };

  const selectedMetrics = calculateTotalMetrics(linkedExposureFiles);
  const comparisonMetrics = calculateTotalMetrics(comparisonExposureFiles);

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
        {selectedContractId && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Compare with Another Treaty</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Select Treaty for Comparison</DialogTitle>
                <DialogDescription>
                  Choose another treaty to compare metrics and modeling results
                </DialogDescription>
              </DialogHeader>
              <Select
                value={comparisonContractId}
                onValueChange={setComparisonContractId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a contract for comparison" />
                </SelectTrigger>
                <SelectContent>
                  {filteredContracts
                    ?.filter((contract) => contract.id.toString() !== selectedContractId)
                    .map((contract) => (
                      <SelectItem key={contract.id} value={contract.id.toString()}>
                        {contract.contractNumber} - {contract.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {selectedContract && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Contract Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
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
                {comparisonContract && (
                  <dl className="space-y-2">
                    <div>
                      <dt className="font-medium">Comparison Contract</dt>
                      <dd>{comparisonContract.contractNumber}</dd>
                    </div>
                    <div>
                      <dt className="font-medium">Name</dt>
                      <dd>{comparisonContract.name}</dd>
                    </div>
                    <div>
                      <dt className="font-medium">Inception Date</dt>
                      <dd>{format(new Date(comparisonContract.inceptionDate), "PPP")}</dd>
                    </div>
                  </dl>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Exposure Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Selected Treaty</h3>
                  <dl className="space-y-2">
                    {linkedExposureFiles?.map((file) => (
                      <div key={file.id} className="border-b pb-2 last:border-0">
                        <dt className="font-medium">
                          <Link href={`/exposure/${file.id}`} className="text-primary hover:underline">
                            File {file.fileId}
                          </Link>
                        </dt>
                        <dd className="space-y-1 mt-1">
                          <div>Total GWP: {file.totalGWP}</div>
                          <div>TSI Amount: {file.tsiAmount}</div>
                          <div>Policies Count: {file.count}</div>
                        </dd>
                      </div>
                    ))}
                    <div className="mt-4 pt-2 border-t">
                      <dt className="font-medium">Combined Metrics</dt>
                      <dd className="space-y-1 mt-1">
                        <div>Total GWP: {selectedMetrics.totalGWP.toFixed(2)}</div>
                        <div>Total TSI: {selectedMetrics.totalTSI.toFixed(2)}</div>
                        <div>Total Policies: {selectedMetrics.totalCount}</div>
                      </dd>
                    </div>
                  </dl>
                </div>

                {comparisonContract && (
                  <div>
                    <h3 className="font-semibold mb-2">Comparison Treaty</h3>
                    <dl className="space-y-2">
                      {comparisonExposureFiles?.map((file) => (
                        <div key={file.id} className="border-b pb-2 last:border-0">
                          <dt className="font-medium">
                            <Link href={`/exposure/${file.id}`} className="text-primary hover:underline">
                              File {file.fileId}
                            </Link>
                          </dt>
                          <dd className="space-y-1 mt-1">
                            <div>Total GWP: {file.totalGWP}</div>
                            <div>TSI Amount: {file.tsiAmount}</div>
                            <div>Policies Count: {file.count}</div>
                          </dd>
                        </div>
                      ))}
                      <div className="mt-4 pt-2 border-t">
                        <dt className="font-medium">Combined Metrics</dt>
                        <dd className="space-y-1 mt-1">
                          <div>Total GWP: {comparisonMetrics.totalGWP.toFixed(2)}</div>
                          <div>Total TSI: {comparisonMetrics.totalTSI.toFixed(2)}</div>
                          <div>Total Policies: {comparisonMetrics.totalCount}</div>
                        </dd>
                      </div>
                    </dl>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Modeling Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="month"
                      allowDuplicatedCategory={false}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {/* Selected Treaty Lines */}
                    <Line
                      data={modelingData}
                      type="monotone"
                      dataKey="baseline"
                      stroke="#8884d8"
                      name="Selected - Baseline"
                      strokeWidth={2}
                    />
                    <Line
                      data={modelingData}
                      type="monotone"
                      dataKey="optimistic"
                      stroke="#82ca9d"
                      name="Selected - Optimistic"
                      strokeWidth={2}
                    />
                    <Line
                      data={modelingData}
                      type="monotone"
                      dataKey="pessimistic"
                      stroke="#ff7300"
                      name="Selected - Pessimistic"
                      strokeWidth={2}
                    />
                    {/* Comparison Treaty Lines (dashed) */}
                    {comparisonContract && (
                      <>
                        <Line
                          data={comparisonModelingData}
                          type="monotone"
                          dataKey="baseline"
                          stroke="#8884d8"
                          name="Comparison - Baseline"
                          strokeDasharray="5 5"
                          strokeWidth={2}
                        />
                        <Line
                          data={comparisonModelingData}
                          type="monotone"
                          dataKey="optimistic"
                          stroke="#82ca9d"
                          name="Comparison - Optimistic"
                          strokeDasharray="5 5"
                          strokeWidth={2}
                        />
                        <Line
                          data={comparisonModelingData}
                          type="monotone"
                          dataKey="pessimistic"
                          stroke="#ff7300"
                          name="Comparison - Pessimistic"
                          strokeDasharray="5 5"
                          strokeWidth={2}
                        />
                      </>
                    )}
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