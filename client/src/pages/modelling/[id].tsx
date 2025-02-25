import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "recharts";
import { format } from "date-fns";

export default function ModellingRunDetailsPage() {
  const [, navigate] = useLocation();

  // Sample data - This would come from your API based on the run ID
  const runDetails = {
    id: "RUN-2024-001",
    startTime: "2024-02-25T10:30:00Z",
    endTime: "2024-02-25T11:45:00Z",
    initiatedBy: "John Smith",
    parameters: {
      regions: ["US", "EMEA", "ASIA"],
      contractType: "Large",
      uwy: "2024",
      modelType: "Landing",
      fxRateChangeDate: "2024-01-01",
      inforceDate: "2024-01-01"
    },
    status: "completed" as const
  };

  const modelingData = [
    { month: "Jan", baseline: 400, optimistic: 450, pessimistic: 350, actual: 420 },
    { month: "Feb", baseline: 420, optimistic: 480, pessimistic: 360, actual: 445 },
    { month: "Mar", baseline: 450, optimistic: 520, pessimistic: 380, actual: 460 },
    { month: "Apr", baseline: 470, optimistic: 550, pessimistic: 390, actual: 485 },
    { month: "May", baseline: 500, optimistic: 580, pessimistic: 420, actual: 510 },
    { month: "Jun", baseline: 520, optimistic: 600, pessimistic: 440, actual: 530 }
  ];

  const exposureData = [
    { category: "Property", baseline: 300, stress: 450 },
    { category: "Casualty", baseline: 250, stress: 380 },
    { category: "Marine", baseline: 180, stress: 270 },
    { category: "Aviation", baseline: 220, stress: 330 },
    { category: "Energy", baseline: 280, stress: 420 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modelling Run Details</h1>
          <p className="text-muted-foreground">
            Detailed view of modelling run results and parameters
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => navigate("/modelling/results")}
        >
          Back to Results List
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Run Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <dl className="space-y-4">
              <div>
                <dt className="font-medium">Run ID</dt>
                <dd className="text-2xl font-bold text-primary">{runDetails.id}</dd>
              </div>
              <div>
                <dt className="font-medium">Status</dt>
                <dd>
                  <div className={`
                    inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${
                      runDetails.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : runDetails.status === "running"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-red-100 text-red-800"
                    }
                  `}>
                    {runDetails.status}
                  </div>
                </dd>
              </div>
              <div>
                <dt className="font-medium">Started At</dt>
                <dd>{format(new Date(runDetails.startTime), "PPpp")}</dd>
              </div>
              <div>
                <dt className="font-medium">Completed At</dt>
                <dd>{runDetails.endTime ? format(new Date(runDetails.endTime), "PPpp") : "-"}</dd>
              </div>
              <div>
                <dt className="font-medium">Initiated By</dt>
                <dd>{runDetails.initiatedBy}</dd>
              </div>
            </dl>

            <div>
              <h3 className="font-semibold mb-4">Run Parameters</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="font-medium">Regions</dt>
                  <dd>{runDetails.parameters.regions.join(", ")}</dd>
                </div>
                <div>
                  <dt className="font-medium">Contract Type</dt>
                  <dd>{runDetails.parameters.contractType}</dd>
                </div>
                <div>
                  <dt className="font-medium">Underwriting Year</dt>
                  <dd>{runDetails.parameters.uwy}</dd>
                </div>
                <div>
                  <dt className="font-medium">Model Type</dt>
                  <dd>{runDetails.parameters.modelType}</dd>
                </div>
                <div>
                  <dt className="font-medium">FX Rate Change Date</dt>
                  <dd>{format(new Date(runDetails.parameters.fxRateChangeDate), "PP")}</dd>
                </div>
                <div>
                  <dt className="font-medium">Inforce Date</dt>
                  <dd>{format(new Date(runDetails.parameters.inforceDate), "PP")}</dd>
                </div>
              </dl>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Performance Trends</CardTitle>
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
                    name="Baseline"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="optimistic"
                    stroke="#82ca9d"
                    name="Optimistic"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="pessimistic"
                    stroke="#ff7300"
                    name="Pessimistic"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="#ff4d4f"
                    name="Actual"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Exposure Distribution by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={exposureData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="baseline" name="Baseline Scenario" fill="#8884d8" />
                  <Bar dataKey="stress" name="Stress Scenario" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
