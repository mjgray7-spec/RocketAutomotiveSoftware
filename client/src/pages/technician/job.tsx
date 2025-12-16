import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useData, ServiceItem } from "@/lib/DataContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  ChevronLeft, 
  Clock, 
  Package, 
  CheckCircle2, 
  Plus, 
  Search,
  Mic,
  Languages,
  Loader2
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Mock Inventory Data for Search
const MOCK_INVENTORY = [
  { id: "p1", name: "Brake Pad Set (Front)", sku: "BP-F150-01", stock: 4, price: 45.99 },
  { id: "p2", name: "Brake Pad Set (Rear)", sku: "BP-F150-02", stock: 2, price: 42.99 },
  { id: "p3", name: "Oil Filter (PF-123)", sku: "OF-123", stock: 12, price: 8.99 },
  { id: "p4", name: "5W-30 Synthetic Oil (1qt)", sku: "OIL-5W30", stock: 45, price: 9.99 },
  { id: "p5", name: "Air Filter", sku: "AF-882", stock: 6, price: 18.50 },
  { id: "p6", name: "Wiper Blade (22\")", sku: "WB-22", stock: 8, price: 14.99 },
];

export default function JobExecution({ params }: { params: { id: string } }) {
  const { repairOrders, updateRepairOrder } = useData();
  const ro = repairOrders.find(r => r.id === params.id);
  const [, setLocation] = useLocation();

  // State for interactions
  const [addPartOpen, setAddPartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeVoiceNote, setActiveVoiceNote] = useState<string | null>(null); // ID of item being recorded
  const [voiceText, setVoiceText] = useState("");

  if (!ro) return <div>Job not found</div>;

  // Group line items: Labor first, then Parts associated with that labor (mock association logic)
  const laborItems = ro.lineItems?.filter(i => i.type === "Labor") || [];
  const partItems = ro.lineItems?.filter(i => i.type === "Part") || [];

  const handleCompleteItem = (itemId: string, checked: boolean) => {
    const updatedItems = ro.lineItems?.map(item => 
      item.id === itemId ? { ...item, status: checked ? "completed" : "pending" } : item
    ) as ServiceItem[];
    updateRepairOrder({ ...ro, lineItems: updatedItems });
  };

  const handleCompleteJob = () => {
    updateRepairOrder({ ...ro, status: "completed" });
    toast({ title: "Job Completed", description: "Repair Order marked as complete." });
    setLocation("/technician");
  };

  const handleAddPart = (part: typeof MOCK_INVENTORY[0]) => {
    const newPart: ServiceItem = {
      id: `new-${Date.now()}`,
      description: part.name,
      type: "Part",
      status: "pending",
      notes: `SKU: ${part.sku} - Qty: 1`
    };
    
    updateRepairOrder({
      ...ro,
      lineItems: [...(ro.lineItems || []), newPart]
    });
    
    setAddPartOpen(false);
    toast({ title: "Part Added", description: `${part.name} added to job.` });
  };

  const handleVoiceNote = (id: string) => {
    if (activeVoiceNote === id) {
      // Stop Recording & "Translate"
      setActiveVoiceNote(null);
      toast({ 
        title: "Processing Audio...", 
        description: <div className="flex items-center gap-2"><Loader2 className="h-3 w-3 animate-spin"/> Translating Spanish to English</div> 
      });
      
      setTimeout(() => {
        const mockTranslation = "Customer states noise coming from front right wheel when braking.";
        setVoiceText(mockTranslation); // specific to final notes for this demo, usually would update specific item note
        toast({ title: "Translation Complete", description: "Audio transcribed and translated." });
      }, 2000);

    } else {
      setActiveVoiceNote(id);
    }
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
        
        {/* Service Tasks (Grouped) */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Service Tasks</h2>
            <Button variant="outline" size="sm" onClick={() => setAddPartOpen(true)}>
              <Plus className="h-3 w-3 mr-1" /> Add Part
            </Button>
          </div>

          <div className="space-y-4">
            {laborItems.length === 0 && partItems.length === 0 ? (
               <Card className="border-dashed bg-muted/20">
                 <CardContent className="p-8 text-center text-muted-foreground">
                   No tasks assigned.
                 </CardContent>
               </Card>
            ) : (
              // Map Labor Items
              laborItems.map((labor) => (
                <Card key={labor.id} className={`transition-all ${labor.status === 'completed' ? 'opacity-60 bg-muted/20' : 'border-l-4 border-l-blue-500'}`}>
                  <CardContent className="p-4 flex items-start gap-4">
                    <Checkbox 
                      id={`item-${labor.id}`} 
                      className="mt-1 h-5 w-5"
                      checked={labor.status === "completed"}
                      onCheckedChange={(c) => handleCompleteItem(labor.id, c as boolean)}
                    />
                    <div className="flex-1 space-y-3">
                      {/* Labor Header */}
                      <div className="flex justify-between">
                        <label 
                          htmlFor={`item-${labor.id}`}
                          className={`font-medium cursor-pointer text-lg ${labor.status === 'completed' ? 'line-through' : ''}`}
                        >
                          {labor.description}
                        </label>
                        <Badge variant="secondary">Labor</Badge>
                      </div>
                      
                      {/* Labor Hours */}
                      <div className="flex items-center gap-3 text-sm bg-muted/30 p-2 rounded w-fit">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground font-mono">Quoted: {labor.hours}h</span>
                        <div className="w-px h-4 bg-border mx-1" />
                        <span className="text-muted-foreground">Actual:</span>
                        <Input className="h-6 w-16 text-center text-xs" placeholder="0.0" />
                      </div>

                      {/* Related Parts (Mocked association: just putting all parts under first labor item or splitting them) */}
                      {/* For this mock, we'll just list parts separately if they don't have a parent ID, but here we list ALL parts under the first labor item for demo purposes, or we can list generic parts section */}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}

            {/* Separate Parts Section */}
            {partItems.length > 0 && (
              <div className="mt-4 pl-4 border-l-2 border-dashed border-border ml-2 space-y-3">
                 <h3 className="text-xs font-bold text-muted-foreground uppercase mb-2">Parts Required</h3>
                 {partItems.map(part => (
                    <Card key={part.id} className={`bg-muted/10 ${part.status === 'completed' ? 'opacity-50' : ''}`}>
                      <CardContent className="p-3 flex items-center gap-3">
                         <Checkbox 
                            id={`part-${part.id}`}
                            checked={part.status === "completed"}
                            onCheckedChange={(c) => handleCompleteItem(part.id, c as boolean)}
                          />
                         <div className="flex-1 flex justify-between items-center">
                            <div>
                              <div className="font-medium text-sm">{part.description}</div>
                              <div className="text-xs text-muted-foreground">Part #PF-123 • Bin A4</div>
                            </div>
                            <Badge variant="outline" className="bg-background">Qty: 1</Badge>
                         </div>
                      </CardContent>
                    </Card>
                 ))}
              </div>
            )}
          </div>
        </section>

        {/* Final Notes with Voice */}
        <section>
           <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Technician Notes</h2>
           <Card>
             <CardContent className="p-3">
               <div className="relative">
                 <Textarea 
                   placeholder="Enter job notes..." 
                   className="min-h-[100px] pr-12 resize-none" 
                   value={voiceText}
                   onChange={(e) => setVoiceText(e.target.value)}
                 />
                 <Button 
                   size="icon"
                   variant={activeVoiceNote === "final" ? "destructive" : "secondary"}
                   className={`absolute bottom-2 right-2 rounded-full h-8 w-8 transition-all ${activeVoiceNote === "final" ? "animate-pulse scale-110" : ""}`}
                   onClick={() => handleVoiceNote("final")}
                 >
                   <Mic className="h-4 w-4" />
                 </Button>
               </div>
               {activeVoiceNote === "final" && (
                 <div className="flex items-center gap-2 text-xs text-red-500 font-bold mt-2 animate-pulse">
                   <div className="h-2 w-2 bg-red-500 rounded-full" />
                   Recording... (Speak in any language)
                 </div>
               )}
             </CardContent>
           </Card>
        </section>

      </main>

      {/* Add Part Dialog */}
      <Dialog open={addPartOpen} onOpenChange={setAddPartOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Part to RO</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name or SKU..." 
                className="pl-9" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="h-[200px] overflow-y-auto border rounded-md p-2 space-y-1">
               {MOCK_INVENTORY.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase())).map(part => (
                 <div 
                   key={part.id} 
                   className="p-2 hover:bg-muted rounded cursor-pointer flex justify-between items-center group"
                   onClick={() => handleAddPart(part)}
                 >
                   <div>
                     <div className="font-medium text-sm">{part.name}</div>
                     <div className="text-xs text-muted-foreground">SKU: {part.sku}</div>
                   </div>
                   <div className="text-right">
                     <div className="font-bold text-sm">${part.price}</div>
                     <div className={`text-[10px] ${part.stock < 5 ? 'text-red-500' : 'text-green-500'}`}>
                       {part.stock} in stock
                     </div>
                   </div>
                 </div>
               ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
