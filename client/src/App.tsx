import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DataProvider } from "@/lib/DataContext"; // Import Provider
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard/index";
import RepairOrders from "@/pages/repair-orders/index";
import Schedule from "@/pages/schedule/index";
import Customers from "@/pages/customers/index";
import AIAgent from "@/pages/ai-agent/index";
import CRM from "@/pages/crm/index";
import Reports from "@/pages/reports/index";
import Inventory from "@/pages/inventory/index";
import Financials from "@/pages/financials/index";
import Estimates from "@/pages/estimates/index";
import TechnicianDashboard from "@/pages/technician/index";
import DVI from "@/pages/technician/dvi";
import JobExecution from "@/pages/technician/job"; // Import New Job Page

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/repair-orders" component={RepairOrders} />
      <Route path="/schedule" component={Schedule} />
      <Route path="/customers" component={Customers} />
      <Route path="/ai-agent" component={AIAgent} />
      <Route path="/crm" component={CRM} />
      <Route path="/reports" component={Reports} />
      <Route path="/inventory" component={Inventory} />
      <Route path="/financials" component={Financials} />
      <Route path="/estimates" component={Estimates} />
      <Route path="/technician" component={TechnicianDashboard} />
      <Route path="/technician/dvi/:id" component={DVI} />
      <Route path="/technician/job/:id" component={JobExecution} /> {/* New Route */}
      {/* Add more routes as we build them */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DataProvider> {/* Wrap App in DataProvider */}
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </DataProvider>
    </QueryClientProvider>
  );
}

export default App;
