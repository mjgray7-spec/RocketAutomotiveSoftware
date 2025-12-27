import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Plus, 
  Trash2, 
  Send,
  Printer,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Car,
  User,
  Loader2
} from "lucide-react";
import { useData } from "@/lib/DataContext";
import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AddJobDialog } from "@/components/modals/AddJobDialog";
import { AddLineItemDialog } from "@/components/modals/AddLineItemDialog";
import type { VMRSCode } from "@/lib/vmrs-data";
import type { Customer, Vehicle } from "@shared/schema";

const LABOR_RATE = 145;

interface LineItem {
  id: number;
  type: string;
  description: string;
  quantity: number;
  rate: string;
  total: string;
  source: string;
}

interface EstimateJob {
  id: number;
  title: string;
  vmrsCode?: string;
  lineItems: LineItem[];
}

interface EstimateData {
  id: number;
  repairOrderId: number;
  status: string;
  jobs: EstimateJob[];
}

export default function RepairOrderEstimate() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { repairOrders } = useData();
  
  const [estimate, setEstimate] = useState<EstimateData | null>(null);
  const [jobs, setJobs] = useState<EstimateJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addJobOpen, setAddJobOpen] = useState(false);
  const [addLineItemOpen, setAddLineItemOpen] = useState(false);
  const [activeJobId, setActiveJobId] = useState<number | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);

  const repairOrderId = parseInt(id || "0");
  const repairOrder = repairOrders.find(ro => Number(ro.id) === repairOrderId);

  useEffect(() => {
    const fetchData = async () => {
      if (!repairOrderId) return;
      
      try {
        // Fetch RO details from API to get customerId and vehicleId
        const roResponse = await fetch(`/api/repair-orders`);
        if (roResponse.ok) {
          const allROs = await roResponse.json();
          const ro = allROs.find((r: any) => r.id === repairOrderId);
          
          if (ro) {
            // Fetch customer
            const customersRes = await fetch("/api/customers");
            if (customersRes.ok) {
              const customers = await customersRes.json();
              const cust = customers.find((c: Customer) => c.id === ro.customerId);
              setCustomer(cust || null);
            }
            
            // Fetch vehicle
            const vehiclesRes = await fetch(`/api/vehicles/${ro.customerId}`);
            if (vehiclesRes.ok) {
              const vehicles = await vehiclesRes.json();
              const veh = vehicles.find((v: Vehicle) => v.id === ro.vehicleId);
              setVehicle(veh || null);
            }
          }
        }
        
        // Fetch estimate
        const response = await fetch(`/api/repair-orders/${repairOrderId}/estimate`);
        if (response.ok) {
          const data = await response.json();
          setEstimate(data);
          
          // Transform jobs data for the UI
          const transformedJobs: EstimateJob[] = (data.jobs || []).map((job: any) => ({
            id: job.id,
            title: job.title,
            vmrsCode: job.vmrsCode,
            lineItems: (job.lineItems || []).map((item: any) => ({
              id: item.id,
              type: item.type,
              description: item.description,
              quantity: parseFloat(item.quantity),
              rate: `$${parseFloat(item.rate).toFixed(2)}`,
              total: `$${parseFloat(item.total).toFixed(2)}`,
              source: item.source || "Manual",
            })),
          }));
          setJobs(transformedJobs);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [repairOrderId]);

  const handleDeleteLineItem = async (jobId: number, itemId: number) => {
    try {
      await fetch(`/api/estimate-line-items/${itemId}`, { method: "DELETE" });
      setJobs(prev => prev.map(job => {
        if (job.id === jobId) {
          return { ...job, lineItems: job.lineItems.filter(item => item.id !== itemId) };
        }
        return job;
      }));
    } catch (error) {
      console.error("Error deleting line item:", error);
    }
  };

  const handleDeleteJob = async (jobId: number) => {
    try {
      await fetch(`/api/estimate-jobs/${jobId}`, { method: "DELETE" });
      setJobs(prev => prev.filter(job => job.id !== jobId));
    } catch (error) {
      console.error("Error deleting job:", error);
    }
  };

  const handleAddJob = async (vmrs: VMRSCode) => {
    if (!estimate) return;
    
    try {
      const response = await fetch("/api/estimate-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estimateId: estimate.id,
          title: `${vmrs.component} (${vmrs.code})`,
          vmrsCode: vmrs.code,
          sortOrder: jobs.length,
        }),
      });
      
      if (response.ok) {
        const newJob = await response.json();
        setJobs(prev => [...prev, {
          id: newJob.id,
          title: newJob.title,
          vmrsCode: newJob.vmrsCode,
          lineItems: []
        }]);
      }
    } catch (error) {
      console.error("Error adding job:", error);
    }
  };

  const handleOpenAddLineItem = (jobId: number) => {
    setActiveJobId(jobId);
    setAddLineItemOpen(true);
  };

  const handleAddLineItemToJob = async (lineItem: Omit<LineItem, "id">) => {
    if (activeJobId === null) return;
    
    const quantity = lineItem.quantity;
    const rate = parseFloat(lineItem.rate.replace("$", ""));
    const total = quantity * rate;
    
    try {
      const response = await fetch("/api/estimate-line-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: activeJobId,
          type: lineItem.type,
          description: lineItem.description,
          quantity: String(quantity),
          rate: String(rate),
          total: String(total),
          source: lineItem.source,
        }),
      });
      
      if (response.ok) {
        const newItem = await response.json();
        setJobs(prev => prev.map(job => {
          if (job.id === activeJobId) {
            return {
              ...job,
              lineItems: [...job.lineItems, {
                id: newItem.id,
                type: newItem.type,
                description: newItem.description,
                quantity: parseFloat(newItem.quantity),
                rate: `$${parseFloat(newItem.rate).toFixed(2)}`,
                total: `$${parseFloat(newItem.total).toFixed(2)}`,
                source: newItem.source || "Manual",
              }]
            };
          }
          return job;
        }));
      }
    } catch (error) {
      console.error("Error adding line item:", error);
    }
  };

  // Calculate totals
  const calculateTotals = () => {
    let labor = 0;
    let parts = 0;
    let fees = 0;

    jobs.forEach(job => {
      job.lineItems.forEach(item => {
        const total = parseFloat(item.total.replace("$", ""));
        if (item.type === "Labor") labor += total;
        else if (item.type === "Part") parts += total;
        else fees += total;
      });
    });

    return { labor, parts, fees, subtotal: labor + parts + fees };
  };

  const totals = calculateTotals();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/repair-orders")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-display font-bold flex items-center gap-2">
                <FileText className="h-6 w-6" />
                Estimate - RO #{repairOrderId}
              </h1>
              <p className="text-muted-foreground text-sm">
                {customer?.name} • {vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : "Vehicle not found"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" /> Print
            </Button>
            <Button size="sm" className="bg-primary">
              <Send className="h-4 w-4 mr-2" /> Send to Customer
            </Button>
          </div>
        </div>

        {/* Customer & Vehicle Info */}
        <Card className="bg-muted/30">
          <CardContent className="py-3">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{customer?.name || "Unknown"}</span>
                {customer?.phone && <span className="text-muted-foreground">• {customer.phone}</span>}
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4 text-muted-foreground" />
                <span>{vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : "No vehicle"}</span>
                {vehicle?.vin && <span className="text-muted-foreground font-mono text-xs">• {vehicle.vin}</span>}
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div>
                <span className="text-muted-foreground">Complaint: </span>
                <span>{repairOrder?.service || "Not specified"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Jobs Section */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Estimate Jobs</h2>
              <Button size="sm" variant="outline" onClick={() => setAddJobOpen(true)}>
                <Plus className="h-4 w-4 mr-2" /> Add Job
              </Button>
            </div>

            {jobs.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No jobs yet. Add a job to start building the estimate.</p>
                  <Button className="mt-4" onClick={() => setAddJobOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Add First Job
                  </Button>
                </CardContent>
              </Card>
            ) : (
              jobs.map((job) => (
                <Collapsible key={job.id} defaultOpen>
                  <Card>
                    <CardHeader className="py-3">
                      <div className="flex items-center justify-between">
                        <CollapsibleTrigger className="flex items-center gap-2 hover:text-primary transition-colors">
                          <ChevronDown className="h-4 w-4" />
                          <CardTitle className="text-base">{job.title}</CardTitle>
                          {job.vmrsCode && (
                            <Badge variant="outline" className="ml-2 font-mono text-xs">
                              {job.vmrsCode}
                            </Badge>
                          )}
                        </CollapsibleTrigger>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleOpenAddLineItem(job.id)}
                          >
                            <Plus className="h-4 w-4 mr-1" /> Line Item
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteJob(job.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        {job.lineItems.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No line items. Click "Line Item" to add labor, parts, or fees.
                          </p>
                        ) : (
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b text-muted-foreground">
                                <th className="text-left py-2 font-medium">Type</th>
                                <th className="text-left py-2 font-medium">Description</th>
                                <th className="text-right py-2 font-medium">Qty</th>
                                <th className="text-right py-2 font-medium">Rate</th>
                                <th className="text-right py-2 font-medium">Total</th>
                                <th className="w-8"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {job.lineItems.map((item) => (
                                <tr key={item.id} className="border-b border-border/50 hover:bg-muted/30">
                                  <td className="py-2">
                                    <Badge variant="outline" className={
                                      item.type === "Labor" ? "bg-blue-500/10 text-blue-600" :
                                      item.type === "Part" ? "bg-green-500/10 text-green-600" :
                                      "bg-yellow-500/10 text-yellow-600"
                                    }>
                                      {item.type}
                                    </Badge>
                                  </td>
                                  <td className="py-2">{item.description}</td>
                                  <td className="py-2 text-right font-mono">{item.quantity}</td>
                                  <td className="py-2 text-right font-mono">{item.rate}</td>
                                  <td className="py-2 text-right font-mono font-medium">{item.total}</td>
                                  <td className="py-2">
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                      onClick={() => handleDeleteLineItem(job.id, item.id)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              ))
            )}
          </div>

          {/* Totals Section */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg">Estimate Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Labor</span>
                    <span className="font-mono">${totals.labor.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Parts</span>
                    <span className="font-mono">${totals.parts.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fees</span>
                    <span className="font-mono">${totals.fees.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Subtotal</span>
                    <span className="font-mono">${totals.subtotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <Button className="w-full bg-primary">
                    <Send className="h-4 w-4 mr-2" /> Send Estimate
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Printer className="h-4 w-4 mr-2" /> Print Estimate
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AddJobDialog 
        open={addJobOpen} 
        onOpenChange={setAddJobOpen}
        onAddJob={handleAddJob}
      />
      
      <AddLineItemDialog
        open={addLineItemOpen}
        onOpenChange={setAddLineItemOpen}
        onAddLineItem={handleAddLineItemToJob}
      />
    </Layout>
  );
}
