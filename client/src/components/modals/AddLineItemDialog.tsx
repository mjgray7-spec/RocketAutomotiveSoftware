import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wrench, Package, Clock, DollarSign, Loader2 } from "lucide-react";

interface LineItem {
  id: number;
  type: string;
  description: string;
  quantity: number;
  rate: string;
  total: string;
  source: string;
  vmrsCode?: string;
}

interface AddLineItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddLineItem: (item: Omit<LineItem, "id">) => void;
  jobVmrsCode?: string;
}

const LABOR_RATE = 145.00;

export function AddLineItemDialog({ open, onOpenChange, onAddLineItem, jobVmrsCode }: AddLineItemDialogProps) {
  const [itemType, setItemType] = useState<"Labor" | "Part" | "Fee">("Labor");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [rate, setRate] = useState(LABOR_RATE.toFixed(2));
  const [isLookingUpLabor, setIsLookingUpLabor] = useState(false);
  const [laborLookupResult, setLaborLookupResult] = useState<{ hours: number; source: string } | null>(null);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setItemType("Labor");
      setDescription("");
      setQuantity("1");
      setRate(LABOR_RATE.toFixed(2));
      setLaborLookupResult(null);
    }
  }, [open]);

  // Lookup labor time from Motors API when VMRS code is available
  const lookupLaborTime = async () => {
    if (!jobVmrsCode) return;
    
    setIsLookingUpLabor(true);
    try {
      const response = await fetch(`/api/motors/labor-time?vmrsCode=${encodeURIComponent(jobVmrsCode)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.hours) {
          setQuantity(data.hours.toFixed(2));
          setLaborLookupResult({ 
            hours: data.hours, 
            source: data.source || "Motors API" 
          });
        }
      }
    } catch (error) {
      console.error("Failed to lookup labor time:", error);
    } finally {
      setIsLookingUpLabor(false);
    }
  };

  const calculateTotal = () => {
    const qty = parseFloat(quantity) || 0;
    const r = parseFloat(rate) || 0;
    return (qty * r).toFixed(2);
  };

  const handleSubmit = () => {
    const total = calculateTotal();
    onAddLineItem({
      type: itemType,
      description: description || `${itemType} Item`,
      quantity: parseFloat(quantity) || 1,
      rate: `$${parseFloat(rate).toFixed(2)}`,
      total: `$${total}`,
      source: laborLookupResult ? laborLookupResult.source : "Manual",
      vmrsCode: jobVmrsCode,
    });
    onOpenChange(false);
  };

  const handleTypeChange = (type: "Labor" | "Part" | "Fee") => {
    setItemType(type);
    if (type === "Labor") {
      setRate(LABOR_RATE.toFixed(2));
    } else {
      setRate("0.00");
    }
    setLaborLookupResult(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Line Item</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Item Type Tabs */}
          <Tabs value={itemType} onValueChange={(v) => handleTypeChange(v as "Labor" | "Part" | "Fee")} data-testid="tabs-line-item-type">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="Labor" className="flex items-center gap-2" data-testid="tab-labor">
                <Wrench className="h-4 w-4" />
                Labor
              </TabsTrigger>
              <TabsTrigger value="Part" className="flex items-center gap-2" data-testid="tab-part">
                <Package className="h-4 w-4" />
                Part
              </TabsTrigger>
              <TabsTrigger value="Fee" className="flex items-center gap-2" data-testid="tab-fee">
                <DollarSign className="h-4 w-4" />
                Fee
              </TabsTrigger>
            </TabsList>

            <TabsContent value="Labor" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="labor-description">Description</Label>
                <Input 
                  id="labor-description"
                  placeholder="e.g., Replace Starter Motor"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  data-testid="input-labor-description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="labor-hours">Hours</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="labor-hours"
                      type="number"
                      step="0.1"
                      min="0"
                      className="pl-9"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      data-testid="input-labor-hours"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="labor-rate">Rate ($/hr)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="labor-rate"
                      type="number"
                      step="0.01"
                      min="0"
                      className="pl-9"
                      value={rate}
                      onChange={(e) => setRate(e.target.value)}
                      data-testid="input-labor-rate"
                    />
                  </div>
                </div>
              </div>

              {jobVmrsCode && (
                <div className="bg-muted/50 p-3 rounded-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">VMRS Code: <span className="font-mono font-bold">{jobVmrsCode}</span></p>
                      {laborLookupResult && (
                        <p className="text-xs text-green-600 mt-1">
                          Labor time loaded from {laborLookupResult.source}
                        </p>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={lookupLaborTime}
                      disabled={isLookingUpLabor}
                      data-testid="button-lookup-labor"
                    >
                      {isLookingUpLabor ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Clock className="h-4 w-4 mr-1" />
                          Lookup Time
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="Part" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="part-description">Part Description</Label>
                <Input 
                  id="part-description"
                  placeholder="e.g., Brake Pads - Front Set"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  data-testid="input-part-description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="part-qty">Quantity</Label>
                  <Input 
                    id="part-qty"
                    type="number"
                    step="1"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    data-testid="input-part-qty"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="part-price">Unit Price ($)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="part-price"
                      type="number"
                      step="0.01"
                      min="0"
                      className="pl-9"
                      value={rate}
                      onChange={(e) => setRate(e.target.value)}
                      data-testid="input-part-price"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="Fee" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="fee-description">Fee Description</Label>
                <Input 
                  id="fee-description"
                  placeholder="e.g., Shop Supplies, Disposal Fee"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  data-testid="input-fee-description"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fee-amount">Amount ($)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="fee-amount"
                    type="number"
                    step="0.01"
                    min="0"
                    className="pl-9"
                    value={rate}
                    onChange={(e) => {
                      setRate(e.target.value);
                      setQuantity("1");
                    }}
                    data-testid="input-fee-amount"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Total Preview */}
          <div className="bg-primary/5 p-4 rounded-md flex justify-between items-center">
            <span className="font-medium">Line Total:</span>
            <span className="text-xl font-bold text-primary">${calculateTotal()}</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} data-testid="button-add-line-item">Add Item</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
