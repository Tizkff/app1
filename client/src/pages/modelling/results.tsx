import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface ModellingRun {
  id: string;
  startTime: string;
  endTime: string | null;
  initiatedBy: string;
  parameters: {
    [key: string]: any;
  };
  status: "running" | "completed" | "failed";
}

export default function ModellingResultsPage() {
  // Sample data - This would come from your API
  const sampleRuns: ModellingRun[] = [
    {
      id: "RUN-2024-001",
      startTime: "2024-02-25T10:30:00Z",
      endTime: "2024-02-25T11:45:00Z",
      initiatedBy: "John Smith",
      parameters: {
        scenario: "baseline",
        riskFactor: 1.5,
        portfolioId: "PORT-001"
      },
      status: "completed"
    },
    {
      id: "RUN-2024-002",
      startTime: "2024-02-25T14:15:00Z",
      endTime: null,
      initiatedBy: "Emma Davis",
      parameters: {
        scenario: "stress-test",
        riskFactor: 2.0,
        portfolioId: "PORT-002"
      },
      status: "running"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modelling Results</h1>
          <p className="text-muted-foreground">
            View all accumulation modelling runs and their results
          </p>
        </div>
        <Link href="/modelling">
          <Button variant="outline">Back to Modelling</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Modelling Runs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Run ID</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead>Initiated By</TableHead>
                <TableHead>Parameters</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleRuns.map((run) => (
                <TableRow key={run.id}>
                  <TableCell className="font-medium">{run.id}</TableCell>
                  <TableCell>{format(new Date(run.startTime), "PPp")}</TableCell>
                  <TableCell>
                    {run.endTime ? format(new Date(run.endTime), "PPp") : "-"}
                  </TableCell>
                  <TableCell>{run.initiatedBy}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {Object.entries(run.parameters).map(([key, value]) => (
                        <div key={key} className="text-sm">
                          <span className="font-medium">{key}:</span> {value}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={`
                      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${
                        run.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : run.status === "running"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-red-100 text-red-800"
                      }
                    `}>
                      {run.status}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
