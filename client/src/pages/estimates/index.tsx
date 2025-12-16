import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Bot, 
  Sparkles, 
  Plus, 
  Trash2, 
  Send,
  Printer,
  Wrench,
  Search,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { useData } from "@/lib/DataContext";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

import { InspectionItem } from "@/lib/DataContext";

const INITIAL_LINE_ITEMS = [
  { id: 1, type: "Labor", description: "Remove and Replace Brake Pads (Front)", quantity: 1.5, rate: "$145.00", total: "$217.50", source: "Motors" },
  { id: 2, type: "Part", description: "Ceramic Brake Pads - Front Set", quantity: 1, rate: "$89.99", total: "$89.99", source: "Inventory" },
  { id: 3, type: "Part", description: "Brake Rotor - Front", quantity: 2, rate: "$125.00", total: "$250.00", source: "Vendor" },
  { id: 4, type: "Labor", description: "Brake System Bleed", quantity: 0.8, rate: "$145.00", total: "$116.00", source: "Motors" },
  { id: 5, type: "Fee", description: "Shop Supplies & Disposal", quantity: 1, rate: "$25.00", total: "$25.00", source: "Fixed" },
];

import { findVMRS } from "@/lib/vmrs-data";
import { getLaborTime } from "@/lib/motors-data";

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
  lineItems: LineItem[];
}

const INITIAL_JOBS: EstimateJob[] = [
  {
    id: 1,
    title: "Job 1: Brake Service - Front Axle",
    lineItems: [
      { id: 1, type: "Labor", description: "Remove and Replace Brake Pads (Front)", quantity: 1.5, rate: "$145.00", total: "$217.50", source: "Motors" },
      { id: 2, type: "Part", description: "Ceramic Brake Pads - Front Set", quantity: 1, rate: "$89.99", total: "$89.99", source: "Inventory" },
      { id: 3, type: "Part", description: "Brake Rotor - Front", quantity: 2, rate: "$125.00", total: "$250.00", source: "Vendor" },
      { id: 4, type: "Labor", description: "Brake System Bleed", quantity: 0.8, rate: "$145.00", total: "$116.00", source: "Motors" },
      { id: 5, type: "Fee", description: "Shop Supplies & Disposal", quantity: 1, rate: "$25.00", total: "$25.00", source: "Fixed" },
    ]
  }
];

import { AddJobDialog } from "@/components/modals/AddJobDialog";
import { VMRSCode } from "@/lib/vmrs-data";

export default function Estimates() {
  const { repairOrders } = useData();
  const [dviOpen, setDviOpen] = useState(true);
  const [jobs, setJobs] = useState<EstimateJob[]>(INITIAL_JOBS);
  const [addJobOpen, setAddJobOpen] = useState(false);
  
  // Find RO 1025 for this mockup view
  const currentRO = repairOrders.find(ro => ro.id === "1025");
  const dviItems = currentRO?.dviItems || [];
  const attentionItems = dviItems.filter(i => i.status === 'fail' || i.status === 'caution');

  const handleDeleteLineItem = (jobId: number, itemId: number) => {
    setJobs(prev => prev.map(job => {
      if (job.id === jobId) {
        return { ...job, lineItems: job.lineItems.filter(item => item.id !== itemId) };
      }
      return job;
    }));
  };

  const handleDeleteJob = (jobId: number) => {
    setJobs(prev => prev.filter(job => job.id !== jobId));
  };

  const handleAddJob = (vmrs: VMRSCode) => {
    const newJobId = Math.max(0, ...jobs.map(j => j.id)) + 1;
    setJobs(prev => [...prev, {
      id: newJobId,
      title: `Job ${newJobId}: ${vmrs.description} (${vmrs.code})`,
      lineItems: []
    }]);
  };

  const handleAddLineItemToJob = (jobId: number) => {
     setJobs(prev => prev.map(job => {
      if (job.id === jobId) {
        const newItemId = Math.max(0, ...job.lineItems.map(i => i.id)) + 1;
        return {
          ...job,
          lineItems: [...job.lineItems, {
             id: newItemId,
             type: "Labor",
             description: "New Service Item",
             quantity: 1,
             rate: "$145.00",
             total: "$145.00",
             source: "Manual"
          }]
        };
      }
      return job;
    }));
  };

  const handleAddToEstimate = (item: InspectionItem) => {
    // 1. Lookup VMRS Code
    const vmrs = findVMRS(item.category) || findVMRS(item.notes || "");
    
    // 2. Lookup Labor Time
    const laborTime = vmrs ? getLaborTime(vmrs.code) : { hours: 1.0, difficulty: "Moderate" };
    
    // 3. Create Line Item
    const laborRate = 145.00;
    const totalCost = laborTime.hours * laborRate;

    const description = vmrs 
      ? `${vmrs.description} (VMRS: ${vmrs.code})`
      : `Fix: ${item.category}`;
      
    const notes = item.notes ? ` - ${item.notes}` : "";

    const newLineItem = {
      id: 1,
      type: "Labor",
      description: description + notes,
      quantity: laborTime.hours,
      rate: `$${laborRate.toFixed(2)}`,
      total: `$${totalCost.toFixed(2)}`,
      source: vmrs ? "Motors" : "Manual"
    };

    // Create a NEW Job for this finding
    const newJobId = Math.max(0, ...jobs.map(j => j.id)) + 1;
    const newJob: EstimateJob = {
      id: newJobId,
      title: vmrs 
        ? `Job ${newJobId}: ${vmrs.description} (VMRS: ${vmrs.code})` 
        : `Job ${newJobId}: ${item.category} Repair`,
      lineItems: [newLineItem]
    };

    setJobs(prev => [...prev, newJob]);
  };

  const calculateTotal = () => {
    let parts = 0;
    let labor = 0;
    let fees = 0;

    jobs.forEach(job => {
      job.lineItems.forEach(item => {
        const amount = parseFloat(item.total.replace('$', '').replace(',', ''));
        if (item.type === 'Part') parts += amount;
        else if (item.type === 'Labor') labor += amount;
        else if (item.type === 'Fee') fees += amount;
      });
    });

    return { parts, labor, fees, total: parts + labor + fees };
  };

  const totals = calculateTotal();

  return (
    <Layout>
       <div className="flex h-[calc(100vh-6rem)] gap-6">
        {/* Left Pane - List & AI */}
        <div className="w-1/3 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-display font-bold">Estimates</h1>
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
              <Plus className="h-4 w-4" /> New
            </Button>
          </div>

          <Card className="flex-1 border-border/50 flex flex-col overflow-hidden">
             <div className="p-3 border-b border-border/50">
               <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search estimates..." className="pl-9 h-9" />
               </div>
             </div>
             
             <ScrollArea className="flex-1">
               <div className="divide-y divide-border/50">
                 {[1, 2, 3].map((item) => (
                   <div key={item} className={`p-4 hover:bg-muted/30 cursor-pointer transition-colors ${item === 1 ? "bg-muted/20 border-l-4 border-l-primary" : ""}`}>
                     <div className="flex justify-between items-start mb-1">
                       <span className="font-bold text-sm">#{1024 + item} • {item === 2 ? "2021 Tesla Model 3" : "2018 Ford F-150"}</span>
                       <Badge variant="outline" className="text-[10px] scale-90">Open</Badge>
                     </div>
                     <p className="text-xs text-muted-foreground">{item === 2 ? "Sarah Connor" : "John Smith"} • {item === 2 ? "Tire Rotation" : "Brake Job"}</p>
                     <p className="text-xs font-bold mt-2">{item === 2 ? "$0.00" : "$698.49"}</p>
                   </div>
                 ))}
               </div>
             </ScrollArea>
          </Card>

          {/* AI Estimate Builder Widget */}
          <Card className="bg-gradient-to-br from-gray-900 to-black text-white border-none shrink-0">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-primary">
                <Bot className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">AI Builder</span>
              </div>
              <CardTitle className="text-lg">Auto-Build Estimate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-300 mb-3">
                Paste technician notes or DVI findings to generate line items automatically.
              </p>
              <Button size="sm" variant="secondary" className="w-full text-xs">
                <Sparkles className="mr-2 h-3 w-3" /> Generate from Notes
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Pane - Estimate Editor */}
        <Card className="flex-1 border-border/50 flex flex-col shadow-lg overflow-hidden h-full">
          {/* Editor Header */}
          <div className="p-6 border-b border-border/50 flex justify-between items-start bg-muted/10 shrink-0">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold font-display">Estimate #1025</h2>
                <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-200">Draft</Badge>
              </div>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <span>Customer: <strong>John Smith</strong></span>
                <span>Vehicle: <strong>2018 Ford F-150</strong></span>
                <span>Advisor: <strong>Mike T.</strong></span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Printer className="mr-2 h-4 w-4" /> Print
              </Button>
              <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
                <Send className="mr-2 h-4 w-4" /> Send for Approval
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1 bg-card">
            <div className="p-6 space-y-6">
              
              {/* DVI Integration Section */}
              {dviItems.length > 0 && (
                <Collapsible open={dviOpen} onOpenChange={setDviOpen} className="border rounded-lg bg-slate-50 overflow-hidden">
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-600" />
                      <span className="font-bold text-sm">Inspection Findings (DVI)</span>
                      <Badge variant="secondary" className="ml-2">{attentionItems.length} Issues Found</Badge>
                    </div>
                    {dviOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <div className="p-4 pt-0 grid grid-cols-1 gap-2">
                      <Separator className="mb-2" />
                      {attentionItems.length > 0 ? (
                        attentionItems.map(item => (
                          <div key={item.id} className="flex items-start gap-3 p-3 bg-white border border-l-4 border-l-red-500 rounded shadow-sm">
                            <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <span className="font-bold text-sm text-red-700">{item.category}</span>
                                <Badge variant="outline" className="text-[10px] border-red-200 text-red-700 bg-red-50">{item.status.toUpperCase()}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{item.notes}</p>
                              <div className="mt-2 flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-7 text-xs border-dashed border-primary/50 text-primary bg-primary/5 hover:bg-primary/10"
                                  onClick={() => handleAddToEstimate(item)}
                                >
                                  <Plus className="h-3 w-3 mr-1" /> Add to Estimate
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground p-2">No attention items found in inspection.</p>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}

              {/* Jobs List */}
              {jobs.map((job) => (
                <div key={job.id} className="space-y-4 mb-8">
                  {/* Job Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-primary" />
                      <h3 className="font-bold text-sm uppercase tracking-wide">{job.title}</h3>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteJob(job.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Items Table Header */}
                   <div className="grid grid-cols-12 gap-4 px-2 py-2 text-xs font-medium text-muted-foreground bg-muted/30 rounded-md">
                     <div className="col-span-1">Type</div>
                     <div className="col-span-5">Description</div>
                     <div className="col-span-1 text-center">Qty</div>
                     <div className="col-span-2 text-right">Rate</div>
                     <div className="col-span-2 text-right">Total</div>
                     <div className="col-span-1"></div>
                   </div>

                  {/* Items */}
                  <div className="space-y-2">
                    {job.lineItems.map((item) => (
                      <div key={item.id} className="grid grid-cols-12 gap-4 px-2 py-3 items-center text-sm border-b border-border/30 last:border-0 hover:bg-muted/20 rounded-md transition-colors group">
                        <div className="col-span-1">
                          <Badge variant="outline" className="text-[10px] h-5">{item.type}</Badge>
                        </div>
                        <div className="col-span-5 font-medium">
                          {item.description}
                          <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                             {item.source === "Motors" && <Badge variant="secondary" className="h-4 px-1 text-[9px]">Motors Data</Badge>}
                             {item.source === "Inventory" && <Badge variant="secondary" className="h-4 px-1 text-[9px] bg-green-500/10 text-green-600">In Stock</Badge>}
                          </div>
                        </div>
                        <div className="col-span-1 text-center">{item.quantity}</div>
                        <div className="col-span-2 text-right text-muted-foreground">{item.rate}</div>
                        <div className="col-span-2 text-right font-bold">{item.total}</div>
                        <div className="col-span-1 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteLineItem(job.id, item.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Item Button */}
                  <Button 
                    variant="ghost" 
                    className="w-full border border-dashed border-border/50 text-muted-foreground h-10 hover:bg-muted/50 mt-4"
                    onClick={() => handleAddLineItemToJob(job.id)}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Line Item
                  </Button>
                </div>
              ))}

              {/* Add New Job Button */}
              <div className="pt-4 border-t border-border/50">
                <Button variant="outline" className="w-full h-12 border-dashed" onClick={() => setAddJobOpen(true)}>
                  <Plus className="h-5 w-5 mr-2" /> Add Service Job
                </Button>
              </div>
            </div>
          </ScrollArea>

          {/* Footer Totals */}
          <div className="p-6 border-t border-border bg-muted/10 shrink-0">
            <div className="flex flex-col items-end gap-2 max-w-xs ml-auto">
              <div className="flex justify-between w-full text-sm">
                <span className="text-muted-foreground">Parts Total:</span>
                <span className="font-medium">${totals.parts.toFixed(2)}</span>
              </div>
              <div className="flex justify-between w-full text-sm">
                <span className="text-muted-foreground">Labor Total:</span>
                <span className="font-medium">${totals.labor.toFixed(2)}</span>
              </div>
               <div className="flex justify-between w-full text-sm">
                <span className="text-muted-foreground">Fees & Tax:</span>
                <span className="font-medium">${totals.fees.toFixed(2)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between w-full text-xl font-bold font-display">
                <span>Total:</span>
                <span className="text-primary">${totals.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <AddJobDialog 
        open={addJobOpen} 
        onOpenChange={setAddJobOpen} 
        onAddJob={handleAddJob}
      />
    </Layout>
  );
}
