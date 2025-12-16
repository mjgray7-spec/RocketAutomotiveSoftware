import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useData } from "@/lib/DataContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  Clock, 
  Package, 
  CheckCircle2, 
  Plus, 
  Wrench
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function JobExecution({ params }: { params: { id: string } }) {
  const { repairOrders, updateRepairOrder } = useData();
  const ro = repairOrders.find(r => r.id === params.id);
  const [, setLocation] = useLocation();

  if (!ro) return <div>Job not found</div>;

  const handleCompleteItem = (itemId: string, checked: boolean) => {
    const updatedItems = ro.lineItems?.map(item => 
      item.id === itemId ? { ...item, status: checked ? "completed" : "pending" } : item
    ) as any;
    updateRepairOrder({ ...ro, lineItems: updatedItems });
  };

  const handleCompleteJob = () => {
    updateRepairOrder({ ...ro, status: "completed" });
    toast({ title: "Job Completed", description: "Repair Order marked as complete." });
    setLocation("/technician");
  };

  const allComplete = ro.lineItems?.every(item => item.status === "completed");

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col">
      <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/technician"><ChevronLeft className="h-6 w-6" /></Link>
          </Button>
          <div>
            <h1 className="font-bold text-lg leading-none">Execute Job</h1>
            <span className="text-xs text-muted-foreground">{ro.vehicle} • RO #{ro.id}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            className="bg-green-500 hover:bg-green-600 text-white"
            onClick={handleCompleteJob}
            disabled={!allComplete}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Complete Job
          </Button>
        </div>
      </header>

      <main className="flex-1 p-4 max-w-3xl mx-auto w-full space-y-6 pb-24">
        
        {/* Service Lines */}
        <section>
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Service Tasks</h2>
          <div className="space-y-3">
            {ro.lineItems?.length === 0 ? (
               <Card className="border-dashed bg-muted/20">
                 <CardContent className="p-8 text-center text-muted-foreground">
                   No specific line items assigned. Check manager notes.
                 </CardContent>
               </Card>
            ) : (
              ro.lineItems?.map((item) => (
                <Card key={item.id} className={`transition-all ${item.status === 'completed' ? 'opacity-60 bg-muted/20' : 'border-l-4 border-l-blue-500'}`}>
                  <CardContent className="p-4 flex items-start gap-4">
                    <Checkbox 
                      id={`item-${item.id}`} 
                      className="mt-1 h-5 w-5"
                      checked={item.status === "completed"}
                      onCheckedChange={(c) => handleCompleteItem(item.id, c as boolean)}
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between">
                        <label 
                          htmlFor={`item-${item.id}`}
                          className={`font-medium cursor-pointer ${item.status === 'completed' ? 'line-through' : ''}`}
                        >
                          {item.description}
                        </label>
                        <Badge variant="outline">{item.type}</Badge>
                      </div>
                      
                      {item.type === "Labor" && (
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Billed: {item.hours}h</span>
                          <Input className="h-7 w-20 text-xs" placeholder="Actual" />
                        </div>
                      )}
                      
                      <Textarea placeholder="Add technician notes..." className="min-h-[60px] text-xs resize-none bg-muted/10" />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>

        {/* Parts Usage */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Parts Used</h2>
            <Button variant="ghost" size="sm" className="h-8 text-primary">
              <Plus className="h-3 w-3 mr-1" /> Add Part
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                <div className="p-3 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span>5W-30 Synthetic Oil</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input className="h-7 w-16 text-center" defaultValue="6" />
                    <span className="text-xs text-muted-foreground">qts</span>
                  </div>
                </div>
                <div className="p-3 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span>Oil Filter (PF-123)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input className="h-7 w-16 text-center" defaultValue="1" />
                    <span className="text-xs text-muted-foreground">unit</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
           <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Final Notes</h2>
           <Textarea placeholder="Enter final job notes, recommendations, or issues found..." className="min-h-[100px]" />
        </section>

      </main>
    </div>
  );
}
