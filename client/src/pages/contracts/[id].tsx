import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { Contract, ExposureFile, ContractExposureLink } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface YearlyRates {
  year: string;
  rate: string;
  exposureGWP: string;
  egpi: string;
}

interface OverrideValues {
  value: string;
  comment: string;
}

export default function ContractDetailPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const [calculatedGrossUpFactor, setCalculatedGrossUpFactor] = useState<string>("1.2");
  const [overrideValues, setOverrideValues] = useState<OverrideValues | null>(null);
  const [tempOverride, setTempOverride] = useState<OverrideValues>({ value: "", comment: "" });
  const [yearlyRates, setYearlyRates] = useState<YearlyRates[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const years = ["2026", "2025", "2024", "2023", "2022 and prior"];
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

      setCalculatedGrossUpFactor((sum / validRates.length).toFixed(2));
    }
  };

  const handleOverrideSubmit = () => {
    if (!tempOverride.value || !tempOverride.comment) {
      toast({
        title: "Error",
        description: "Both value and comment are required",
        variant: "destructive",
      });
      return;
    }

    setOverrideValues(tempOverride);
    setIsDialogOpen(false);
    toast({
      title: "Success",
      description: "Gross up factor overridden successfully",
    });
  };

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
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link href={`/exposure/${file.id}`}>
                          <Button
                            variant="link"
                            className="p-0 h-auto font-medium"
                          >
                            Exposure File {file.fileId}
                          </Button>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>
                        <ExposureFileTooltip file={file} />
                      </TooltipContent>
                    </Tooltip>
                  </div>
                );
              })}
            </div>

            <div className="h-px bg-border my-6" />

            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <div>
                  <Label>Calculated Gross Up Factor</Label>
                  <div className="text-lg font-medium mt-1.5">{calculatedGrossUpFactor}</div>
                </div>

                {overrideValues && (
                  <div>
                    <Label>Override Value</Label>
                    <div className="text-lg font-medium mt-1.5 text-primary">
                      {overrideValues.value}
                      <span className="ml-2 text-sm text-muted-foreground">
                        ({overrideValues.comment})
                      </span>
                    </div>
                  </div>
                )}

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="ml-auto">
                      Override Value
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Override Gross Up Factor</DialogTitle>
                      <DialogDescription>
                        Enter a new value and provide a comment explaining the change.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>New Value</Label>
                        <Input
                          type="text"
                          value={tempOverride.value}
                          onChange={(e) => {
                            if (e.target.value === "" || /^\d*\.?\d*$/.test(e.target.value)) {
                              setTempOverride({ ...tempOverride, value: e.target.value });
                            }
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Comment</Label>
                        <Textarea
                          value={tempOverride.comment}
                          onChange={(e) => setTempOverride({ ...tempOverride, comment: e.target.value })}
                          placeholder="Explain why you're overriding the calculated value..."
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleOverrideSubmit}>
                        Apply Override
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}