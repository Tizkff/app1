import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { Contract, ExposureFile, ContractExposureLink } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";

interface YearlyRates {
  year: number;
  rate: string;
  exposureGWP: string;
  egpi: string;
}

export default function ContractDetailPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const [grossUpFactor, setGrossUpFactor] = useState<string>("");
  const [yearlyRates, setYearlyRates] = useState<YearlyRates[]>([]);
  const [isGrossUpFactorOverridden, setIsGrossUpFactorOverridden] = useState(false);

  // Initialize yearly rates
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 7 }, (_, i) => 2020 + i);
    setYearlyRates(
      years.map((year) => ({
        year,
        rate: "",
        exposureGWP: "",
        egpi: "",
      }))
    );
  }, []);

  const { data: contract, isLoading: loadingContract } = useQuery<Contract>({
    queryKey: [`/api/contracts/${id}`],
  });

  const { data: exposureFiles, isLoading: loadingFiles } = useQuery<ExposureFile[]>({
    queryKey: ["/api/exposure-files"],
  });

  const { data: links, isLoading: loadingLinks } = useQuery<ContractExposureLink[]>({
    queryKey: [`/api/contracts/${id}/links`],
  });

  const linkMutation = useMutation({
    mutationFn: async ({
      exposureFileId,
      checked,
    }: {
      exposureFileId: number;
      checked: boolean;
    }) => {
      if (checked) {
        return apiRequest("POST", `/api/contracts/${id}/links`, {
          exposureFileId,
        });
      } else {
        return apiRequest(
          "DELETE",
          `/api/contracts/${id}/links/${exposureFileId}`
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/contracts/${id}/links`] });
      toast({
        title: "Success",
        description: "Links updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update links",
        variant: "destructive",
      });
    },
  });

  const handleGrossUpFactorChange = (value: string) => {
    if (value === "" || /^-?\d*\.?\d*$/.test(value)) {
      setGrossUpFactor(value);
      setIsGrossUpFactorOverridden(true);
    }
  };

  const handleRateChange = (index: number, value: string) => {
    if (value === "" || /^-?\d*\.?\d*$/.test(value)) {
      const newRates = [...yearlyRates];
      newRates[index].rate = value;
      setYearlyRates(newRates);
      calculateGrossUpFactor(newRates);
    }
  };

  const handleExposureGWPChange = (index: number, value: string) => {
    if (value === "" || /^-?\d*\.?\d*$/.test(value)) {
      const newRates = [...yearlyRates];
      newRates[index].exposureGWP = value;
      setYearlyRates(newRates);
      calculateGrossUpFactor(newRates);
    }
  };

  const handleEGPIChange = (index: number, value: string) => {
    if (value === "" || /^-?\d*\.?\d*$/.test(value)) {
      const newRates = [...yearlyRates];
      newRates[index].egpi = value;
      setYearlyRates(newRates);
      calculateGrossUpFactor(newRates);
    }
  };

  const calculateGrossUpFactor = (rates: YearlyRates[]) => {
    if (isGrossUpFactorOverridden) return;

    // Simple average calculation for demonstration
    // You may want to implement a more sophisticated calculation based on your business logic
    const validRates = rates.filter(
      (rate) => rate.rate !== "" && rate.exposureGWP !== "" && rate.egpi !== ""
    );

    if (validRates.length > 0) {
      const sum = validRates.reduce((acc, curr) => {
        const rate = parseFloat(curr.rate) || 0;
        const exposureGWP = parseFloat(curr.exposureGWP) || 0;
        const egpi = parseFloat(curr.egpi) || 0;
        return acc + (rate * exposureGWP * egpi);
      }, 0);

      setGrossUpFactor((sum / validRates.length).toFixed(2));
    }
  };

  if (loadingContract || loadingFiles || loadingLinks) {
    return <div>Loading...</div>;
  }

  if (!contract) {
    return <div>Contract not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{contract.name}</h1>
          <p className="text-muted-foreground">
            Manage contract rates and exposure file links
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div>
              <Label htmlFor="grossUpFactor">Gross Up Factor (Auto-calculated)</Label>
              <Input
                id="grossUpFactor"
                type="text"
                placeholder="Enter gross up factor"
                value={grossUpFactor}
                onChange={(e) => handleGrossUpFactorChange(e.target.value)}
                className="mt-1.5"
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Rate Changes</h3>
              <div className="grid grid-cols-1 gap-4">
                {yearlyRates.map((yearRate, index) => (
                  <div key={yearRate.year} className="grid grid-cols-4 gap-4">
                    <div>
                      <Label>Year {yearRate.year}</Label>
                      <Input
                        type="text"
                        placeholder="Rate %"
                        value={yearRate.rate}
                        onChange={(e) => handleRateChange(index, e.target.value)}
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label>Exposure GWP</Label>
                      <Input
                        type="text"
                        placeholder="Exposure GWP"
                        value={yearRate.exposureGWP}
                        onChange={(e) => handleExposureGWPChange(index, e.target.value)}
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label>EGPI</Label>
                      <Input
                        type="text"
                        placeholder="EGPI"
                        value={yearRate.egpi}
                        onChange={(e) => handleEGPIChange(index, e.target.value)}
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-px bg-border my-6" />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Exposure File Links</h3>
              {exposureFiles?.map((file) => {
                const isLinked = links?.some(
                  (link) => link.exposureFileId === file.id
                );

                return (
                  <div
                    key={file.id}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`file-${file.id}`}
                      checked={isLinked}
                      disabled={linkMutation.isPending}
                      onCheckedChange={(checked) =>
                        linkMutation.mutate({
                          exposureFileId: file.id,
                          checked: checked as boolean,
                        })
                      }
                    />
                    <label
                      htmlFor={`file-${file.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Exposure File {file.fileId}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}