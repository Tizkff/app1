import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import ContractsPage from "@/pages/contracts";
import ContractDetailPage from "@/pages/contracts/[id]";
import ModellingPage from "@/pages/modelling";
import ExposureOverviewPage from "@/pages/exposure/[id]";
import ExposureListPage from "@/pages/exposure/list";
import TreatyReportPage from "@/pages/treaty-report";
import Navbar from "@/components/navbar";
import { TooltipProvider } from "@/components/ui/tooltip";

function Router() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto py-6 px-4">
        <Switch>
          <Route path="/" component={ContractsPage} />
          <Route path="/contracts/:id" component={ContractDetailPage} />
          <Route path="/modelling" component={ModellingPage} />
          <Route path="/exposure" component={ExposureListPage} />
          <Route path="/exposure/:id" component={ExposureOverviewPage} />
          <Route path="/treaty-report" component={TreatyReportPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;