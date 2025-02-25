import { Link, useLocation } from "wouter";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Navbar() {
  const [location, navigate] = useLocation();

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col gap-4">
          <div className="text-2xl font-bold text-primary">
            <Link href="/">Exposure Link Dashboard</Link>
          </div>

          <Tabs value={location === "/modelling" ? "modelling" : "contracts"} onValueChange={(value) => {
            navigate(value === "modelling" ? "/modelling" : "/");
          }}>
            <TabsList>
              <TabsTrigger value="contracts">Contract Links</TabsTrigger>
              <TabsTrigger value="modelling">Modelling</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
    </nav>
  );
}