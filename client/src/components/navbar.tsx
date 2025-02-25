import { Link, useLocation } from "wouter";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Navbar() {
  const [location, navigate] = useLocation();

  const getCurrentTab = () => {
    if (location === "/modelling") return "modelling";
    if (location === "/exposure") return "exposure";
    if (location === "/treaty-report") return "treaty-report";
    return "contracts";
  };

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col gap-4">
          <div className="text-2xl font-bold text-primary">
            <Link href="/">Exposure Link Dashboard</Link>
          </div>

          <Tabs value={getCurrentTab()} onValueChange={(value) => {
            switch (value) {
              case "modelling":
                navigate("/modelling");
                break;
              case "exposure":
                navigate("/exposure");
                break;
              case "treaty-report":
                navigate("/treaty-report");
                break;
              default:
                navigate("/");
            }
          }}>
            <TabsList>
              <TabsTrigger value="contracts">Contract Links</TabsTrigger>
              <TabsTrigger value="modelling">Modelling</TabsTrigger>
              <TabsTrigger value="exposure">Exposure Files</TabsTrigger>
              <TabsTrigger value="treaty-report">Single Treaty Report</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
    </nav>
  );
}