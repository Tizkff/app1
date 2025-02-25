import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import type { ExposureFile } from "@shared/schema";
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

export default function ExposureOverviewPage() {
  const { id } = useParams();
  
  const { data: file, isLoading } = useQuery<ExposureFile>({
    queryKey: [`/api/exposure-files/${id}`],
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!file) {
    return <div>Exposure file not found</div>;
  }

  const countryData = JSON.parse(file.exposureByCountry);
  const industryData = JSON.parse(file.exposureByIndustry);
  const currencyData = JSON.parse(file.currencyDistribution);

  const formatChartData = (data: Record<string, number>) =>
    Object.entries(data).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/">
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