import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search } from "lucide-react";
import { Link } from "wouter";
import type { ExposureFile, DetailedExposureData, TopCompany } from "@shared/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ExposureOverviewPage() {
  const { id } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterField, setFilterField] = useState<string>("all");
  const [filterValue, setFilterValue] = useState("");

  const { data: file, isLoading } = useQuery<ExposureFile>({
    queryKey: [`/api/exposure-files/${id}`],
  });

  const parsedData = useMemo(() => {
    if (!file) return null;

    try {
      return {
        countryData: JSON.parse(file.exposureByCountry),
        industryData: JSON.parse(file.exposureByIndustry),
        currencyData: JSON.parse(file.currencyDistribution),
        topCompanies: JSON.parse(file.topCompanies) as TopCompany[],
        detailedData: JSON.parse(file.detailedData) as DetailedExposureData[],
      };
    } catch (error) {
      console.error("Error parsing JSON data:", error);
      return null;
    }
  }, [file]);

  const filteredDetailedData = useMemo(() => {
    if (!parsedData) return [];

    return parsedData.detailedData.filter(item => {
      const searchMatch = searchTerm.toLowerCase() === "" || 
        Object.values(item).some(val => 
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        );

      if (!searchMatch) return false;

      if (filterField === "all" || !filterValue) return true;

      const itemValue = String(item[filterField as keyof DetailedExposureData]);
      return itemValue.toLowerCase().includes(filterValue.toLowerCase());
    });
  }, [parsedData, searchTerm, filterField, filterValue]);

  const formatChartData = (data: Record<string, number>) =>
    Object.entries(data).map(([name, value]) => ({ name, value }));

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: 0 
    }).format(value);

  if (isLoading) return <div>Loading...</div>;
  if (!file) return <div>Exposure file not found</div>;
  if (!parsedData) return <div>Error parsing exposure file data</div>;

  const { countryData, industryData, currencyData, topCompanies } = parsedData;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/exposure">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Exposure File {file.fileId}
            </h1>
            <p className="text-muted-foreground">
              Detailed exposure file information and analytics
            </p>
          </div>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>See Detailed Exposure Data</Button>
          </DialogTrigger>
          <DialogContent className="max-w-[90vw] w-full max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detailed Exposure Data</DialogTitle>
              <DialogDescription>
                Comprehensive view of all policies and their details
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search in all fields..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select
                value={filterField}
                onValueChange={setFilterField}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by field" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Fields</SelectItem>
                  <SelectItem value="companyName">Company Name</SelectItem>
                  <SelectItem value="policyNumber">Policy Number</SelectItem>
                  <SelectItem value="currency">Currency</SelectItem>
                  <SelectItem value="iso3Country">Country</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Filter value..."
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="w-[200px]"
                disabled={filterField === "all"}
              />
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company Name</TableHead>
                  <TableHead>Policy Number</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Inception Date</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Policy Limit</TableHead>
                  <TableHead>Attachment</TableHead>
                  <TableHead>Deductible</TableHead>
                  <TableHead>GWP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDetailedData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.companyName}</TableCell>
                    <TableCell>{item.policyNumber}</TableCell>
                    <TableCell>{formatCurrency(item.revenue)}</TableCell>
                    <TableCell>{item.currency}</TableCell>
                    <TableCell>{item.iso3Country}</TableCell>
                    <TableCell>{format(new Date(item.inceptionDate), "PP")}</TableCell>
                    <TableCell>{format(new Date(item.expiryDate), "PP")}</TableCell>
                    <TableCell>{formatCurrency(item.policyLimit)}</TableCell>
                    <TableCell>{formatCurrency(item.policyAttachment)}</TableCell>
                    <TableCell>{formatCurrency(item.policyDeductible)}</TableCell>
                    <TableCell>{formatCurrency(item.policyGWP)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>File Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div>
                <dt className="font-medium">Imported By</dt>
                <dd>{file.importedBy}</dd>
              </div>
              <div>
                <dt className="font-medium">Import Date</dt>
                <dd>{format(new Date(file.importedAt), "PPP pp")}</dd>
              </div>
              <div>
                <dt className="font-medium">Count</dt>
                <dd>{file.count}</dd>
              </div>
              <div>
                <dt className="font-medium">Total GWP</dt>
                <dd>{file.totalGWP}</dd>
              </div>
              <div>
                <dt className="font-medium">TSI Amount</dt>
                <dd>{file.tsiAmount}</dd>
              </div>
              <div>
                <dt className="font-medium">Companies Matched to Database</dt>
                <dd className="flex items-center">
                  <div className="text-lg font-semibold mr-2">
                    {Number(file.matchedCompaniesPercent).toFixed(1)}%
                  </div>
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary" 
                      style={{ 
                        width: `${file.matchedCompaniesPercent}%`,
                      }}
                    />
                  </div>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 20 Companies by Sum Insured</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company Name</TableHead>
                    <TableHead>Sum Insured</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topCompanies.map((company, index) => (
                    <TableRow key={index}>
                      <TableCell>{company.name}</TableCell>
                      <TableCell>{formatCurrency(company.sumInsured)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Currency Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formatChartData(currencyData)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#0ea5e9" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Exposure by Country</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formatChartData(countryData)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#0ea5e9" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Exposure by Industry</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formatChartData(industryData)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#0ea5e9" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}