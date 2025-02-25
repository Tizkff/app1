import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { Contract, ExposureFile, ContractExposureLink } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function ContractDetailPage() {
  const { id } = useParams();
  const { toast } = useToast();

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
            Link or unlink exposure files for this contract
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
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
        </CardContent>
      </Card>
    </div>
  );
}
