import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { CalendarIcon, Check } from "lucide-react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import type { Contract } from "@shared/schema";
import { cn } from "@/lib/utils";

const regions = [
  "US",
  "EMEA",
  "ASIA",
  "OCEANIA",
  "South America",
  "UK",
] as const;

const modellingFormSchema = z.object({
  regions: z.array(z.string()).min(1, "Select at least one region"),
  selectedContracts: z.array(z.number()).optional(),
  contractType: z.enum(["Large", "SME", "Micro"], {
    required_error: "Please select a contract type",
  }),
  uwy: z.string().regex(/^\d{4}$/, "Must be a valid year"),
  fxRateChangeDate: z.date({
    required_error: "FX rate change date is required",
  }),
  modelType: z.enum(["Landing", "Forecast"], {
    required_error: "Please select a model type",
  }),
  inforceDate: z.date({
    required_error: "Inforce date is required",
  }),
});

type ModellingFormValues = z.infer<typeof modellingFormSchema>;

export default function ModellingPage() {
  const form = useForm<ModellingFormValues>({
    resolver: zodResolver(modellingFormSchema),
    defaultValues: {
      regions: regions as unknown as string[],
      selectedContracts: [],
      contractType: "Large",
      modelType: "Landing",
    },
  });

  const { data: contracts } = useQuery<Contract[]>({
    queryKey: ["/api/contracts"],
  });

  function onSubmit(data: ModellingFormValues) {
    console.log(data);
    // TODO: Handle form submission
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Modelling</h1>
        <p className="text-muted-foreground">
          Select contract criteria for modelling
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="regions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Regions</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value?.length > 0
                            ? `${field.value.length} regions selected`
                            : "Select regions"}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search regions..." />
                        <CommandEmpty>No region found.</CommandEmpty>
                        <CommandGroup>
                          {regions.map((region) => (
                            <CommandItem
                              value={region}
                              key={region}
                              onSelect={() => {
                                const current = new Set(field.value);
                                if (current.has(region)) {
                                  current.delete(region);
                                } else {
                                  current.add(region);
                                }
                                field.onChange(Array.from(current));
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value?.includes(region)
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {region}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {field.value?.map((region) => (
                      <Badge
                        key={region}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => {
                          field.onChange(
                            field.value.filter((r) => r !== region)
                          );
                        }}
                      >
                        {region} ×
                      </Badge>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="selectedContracts"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contracts (Optional)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value?.length && "text-muted-foreground"
                          )}
                        >
                          {field.value?.length
                            ? `${field.value.length} contracts selected`
                            : "Select contracts"}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search contracts..." />
                        <CommandEmpty>No contract found.</CommandEmpty>
                        <CommandGroup>
                          {contracts?.map((contract) => (
                            <CommandItem
                              value={contract.name}
                              key={contract.id}
                              onSelect={() => {
                                const current = new Set(field.value || []);
                                if (current.has(contract.id)) {
                                  current.delete(contract.id);
                                } else {
                                  current.add(contract.id);
                                }
                                field.onChange(Array.from(current));
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value?.includes(contract.id)
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {contract.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {field.value?.map((contractId) => {
                      const contract = contracts?.find((c) => c.id === contractId);
                      return contract ? (
                        <Badge
                          key={contractId}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => {
                            field.onChange(
                              field.value?.filter((id) => id !== contractId)
                            );
                          }}
                        >
                          {contract.name} ×
                        </Badge>
                      ) : null;
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contractType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contract Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select contract type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Large">Large</SelectItem>
                      <SelectItem value="SME">SME</SelectItem>
                      <SelectItem value="Micro">Micro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="uwy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Underwriting Year</FormLabel>
                  <FormControl>
                    <Input placeholder="YYYY" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="modelType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select model type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Landing">Landing</SelectItem>
                      <SelectItem value="Forecast">Forecast</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fxRateChangeDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>FX Rate Change Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className="w-full pl-3 text-left font-normal"
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="inforceDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Inforce Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className="w-full pl-3 text-left font-normal"
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" className="w-full md:w-auto">
            Launch Modelling
          </Button>
        </form>
      </Form>
    </div>
  );
}