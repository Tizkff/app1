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
import { Search, TrendingDown, TrendingUp } from "lucide-react";
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
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

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

  const modelingData = [
    { month: "Jan", baseline: 400, optimistic: 450, pessimistic: 350, actual: 420 },
    { month: "Feb", baseline: 420, optimistic: 480, pessimistic: 360, actual: 445 },
    { month: "Mar", baseline: 450, optimistic: 520, pessimistic: 380, actual: 460 },
    { month: "Apr", baseline: 470, optimistic: 550, pessimistic: 390, actual: 485 },
    { month: "May", baseline: 500, optimistic: 580, pessimistic: 420, actual: 510 },
    { month: "Jun", baseline: 520, optimistic: 600, pessimistic: 440, actual: 530 },
    { month: "Jul", baseline: 540, optimistic: 620, pessimistic: 460, actual: null },
    { month: "Aug", baseline: 560, optimistic: 640, pessimistic: 480, actual: null },
    { month: "Sep", baseline: 580, optimistic: 660, pessimistic: 500, actual: null },
    { month: "Oct", baseline: 600, optimistic: 680, pessimistic: 520, actual: null },
    { month: "Nov", baseline: 620, optimistic: 700, pessimistic: 540, actual: null },
    { month: "Dec", baseline: 640, optimistic: 720, pessimistic: 560, actual: null }
  ];

  const comparisonModelingData = [
    { month: "Jan", baseline: 380, optimistic: 420, pessimistic: 320, actual: 400 },
    { month: "Feb", baseline: 400, optimistic: 450, pessimistic: 340, actual: 425 },
    { month: "Mar", baseline: 430, optimistic: 490, pessimistic: 360, actual: 450 },
    { month: "Apr", baseline: 450, optimistic: 520, pessimistic: 370, actual: 460 },
    { month: "May", baseline: 480, optimistic: 550, pessimistic: 400, actual: 490 },
    { month: "Jun", baseline: 500, optimistic: 570, pessimistic: 420, actual: 515 },
    { month: "Jul", baseline: 520, optimistic: 590, pessimistic: 440, actual: null },
    { month: "Aug", baseline: 540, optimistic: 610, pessimistic: 460, actual: null },
    { month: "Sep", baseline: 560, optimistic: 630, pessimistic: 480, actual: null },
    { month: "Oct", baseline: 580, optimistic: 650, pessimistic: 500, actual: null },
    { month: "Nov", baseline: 600, optimistic: 670, pessimistic: 520, actual: null },
    { month: "Dec", baseline: 620, optimistic: 690, pessimistic: 540, actual: null }
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

  const calculatePercentageDifference = (value1: number, value2: number) => {
    if (value2 === 0) return 0;
    const diff = ((value1 - value2) / value2) * 100;
    return diff.toFixed(1);
  };

  const formatChartData = (selectedData: Record<string, number>, comparisonData: Record<string, number>) => {
    const allKeys = new Set([...Object.keys(selectedData), ...Object.keys(comparisonData)]);
    return Array.from(allKeys).map(key => ({
      name: key,
      selected: selectedData[key] || 0,
      comparison: comparisonData[key] || 0,
      difference: calculatePercentageDifference(
        selectedData[key] || 0,
        comparisonData[key] || 0
      )
    }));
  };

  const renderTrendIndicator = (diff: number) => {
    if (diff > 0) {
      return <TrendingUp className="h-4 w-4 text-green-500 inline" />;
    } else if (diff < 0) {
      return <TrendingDown className="h-4 w-4 text-red-500 inline" />;
    }
    return null;
  };

  const getComparisonData = () => {
    if (!linkedExposureFiles?.length || !comparisonExposureFiles?.length) return null;

    const selected = linkedExposureFiles[0];
    const comparison = comparisonExposureFiles[0];

    return {
      country: formatChartData(
        JSON.parse(selected.exposureByCountry),
        JSON.parse(comparison.exposureByCountry)
      ),
      industry: formatChartData(
        JSON.parse(selected.exposureByIndustry),
        JSON.parse(comparison.exposureByIndustry)
      ),
      currency: formatChartData(
        JSON.parse(selected.currencyDistribution),
        JSON.parse(comparison.currencyDistribution)
      )
    };
  };

  const comparisonData = getComparisonData();

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
            <SelectValue placeholder="Select a contract to view report" />
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
          comparisonContractId ? (
            <Button 
              variant="outline" 
              onClick={() => setComparisonContractId("")}
              className="whitespace-nowrap"
            >
              Clear Comparison
            </Button>
          ) : (
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
          )
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
              <CardTitle>Exposure Metrics Comparison</CardTitle>
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
                    <h3 className="font-semibold mb-2">Metrics Comparison</h3>
                    <dl className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <dt className="font-medium">Total GWP Difference</dt>
                        <dd className="text-2xl font-bold flex items-center gap-2">
                          {calculatePercentageDifference(
                            selectedMetrics.totalGWP,
                            comparisonMetrics.totalGWP
                          )}%
                          {renderTrendIndicator(selectedMetrics.totalGWP - comparisonMetrics.totalGWP)}
                        </dd>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <dt className="font-medium">Total TSI Difference</dt>
                        <dd className="text-2xl font-bold flex items-center gap-2">
                          {calculatePercentageDifference(
                            selectedMetrics.totalTSI,
                            comparisonMetrics.totalTSI
                          )}%
                          {renderTrendIndicator(selectedMetrics.totalTSI - comparisonMetrics.totalTSI)}
                        </dd>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <dt className="font-medium">Policy Count Difference</dt>
                        <dd className="text-2xl font-bold flex items-center gap-2">
                          {calculatePercentageDifference(
                            selectedMetrics.totalCount,
                            comparisonMetrics.totalCount
                          )}%
                          {renderTrendIndicator(selectedMetrics.totalCount - comparisonMetrics.totalCount)}
                        </dd>
                      </div>
                    </dl>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {comparisonData && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Country Distribution Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={comparisonData.country}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="selected" name="Selected Treaty" fill="#0088FE" />
                        <Bar dataKey="comparison" name="Comparison Treaty" fill="#00C49F" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Industry Distribution Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={comparisonData.industry}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="selected" name="Selected Treaty" fill="#0088FE" />
                        <Bar dataKey="comparison" name="Comparison Treaty" fill="#00C49F" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Currency Distribution Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={comparisonData.currency}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="selected" name="Selected Treaty" fill="#0088FE" />
                        <Bar dataKey="comparison" name="Comparison Treaty" fill="#00C49F" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

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
                    <Line
                      data={modelingData}
                      type="monotone"
                      dataKey="actual"
                      stroke="#ff4d4f"
                      name="Selected - Actual"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
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
                        <Line
                          data={comparisonModelingData}
                          type="monotone"
                          dataKey="actual"
                          stroke="#ff4d4f"
                          name="Comparison - Actual"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={{ r: 4 }}
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