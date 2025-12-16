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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Wrench, Package, Clock, DollarSign, Loader2, Search, Check } from "lucide-react";
import type { InventoryItem } from "@shared/schema";

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
  
  // Part search state
  const [partSearch, setPartSearch] = useState("");
  const [searchResults, setSearchResults] = useState<InventoryItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPart, setSelectedPart] = useState<InventoryItem | null>(null);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setItemType("Labor");
      setDescription("");
      setQuantity("1");
      setRate(LABOR_RATE.toFixed(2));
      setLaborLookupResult(null);
      setPartSearch("");
      setSearchResults([]);
      setSelectedPart(null);
    }
  }, [open]);

  // Search inventory when typing
  useEffect(() => {
    const searchInventory = async () => {
      if (partSearch.length < 2) {
        // Show initial results when no search
        try {
          const response = await fetch(`/api/inventory/search?q=`);
          if (response.ok) {
            const data = await response.json();
            setSearchResults(data);
          }
        } catch (error) {
          console.error("Failed to load inventory:", error);
        }
        return;
      }
      
      setIsSearching(true);
      try {
        const response = await fetch(`/api/inventory/search?q=${encodeURIComponent(partSearch)}`);
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data);
        }
      } catch (error) {
        console.error("Failed to search inventory:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchInventory, 300);
    return () => clearTimeout(debounce);
  }, [partSearch]);

  // Load initial inventory when Part tab is selected
  useEffect(() => {
    if (itemType === "Part" && searchResults.length === 0) {
      const loadInitialInventory = async () => {
        try {
          const response = await fetch(`/api/inventory/search?q=`);
          if (response.ok) {
            const data = await response.json();
            setSearchResults(data);
          }
        } catch (error) {
          console.error("Failed to load inventory:", error);
        }
      };
      loadInitialInventory();
    }
  }, [itemType]);

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
    let source = "Manual";
    if (itemType === "Labor" && laborLookupResult) {
      source = laborLookupResult.source;
    } else if (itemType === "Part" && selectedPart) {
      source = "Inventory";
    }
    
    onAddLineItem({
      type: itemType,
      description: description || `${itemType} Item`,
      quantity: parseFloat(quantity) || 1,
      rate: `$${parseFloat(rate).toFixed(2)}`,
      total: `$${total}`,
      source,
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
    setSelectedPart(null);
    setDescription("");
    setQuantity("1");
  };

  const handleSelectPart = (part: InventoryItem) => {
    setSelectedPart(part);
    setDescription(`${part.partNumber} - ${part.description}`);
    setRate(part.price);
    setQuantity("1");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Line Item</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
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

            <TabsContent value="Part" className="space-y-4 mt-4 flex-1 overflow-hidden flex flex-col">
              {/* Part Search */}
              <div className="space-y-2">
                <Label>Search Inventory</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search by part number, description, brand..."
                    className="pl-9"
                    value={partSearch}
                    onChange={(e) => setPartSearch(e.target.value)}
                    data-testid="input-part-search"
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Search Results */}
              <div className="border rounded-md flex-1 min-h-[150px]">
                <ScrollArea className="h-[150px]">
                  <div className="divide-y divide-border">
                    {searchResults.length > 0 ? (
                      searchResults.map((part) => (
                        <div 
                          key={part.id}
                          data-testid={`part-option-${part.id}`}
                          className={`p-2 cursor-pointer hover:bg-muted/50 transition-colors flex items-center justify-between ${selectedPart?.id === part.id ? "bg-primary/5 border-l-4 border-l-primary" : ""}`}
                          onClick={() => handleSelectPart(part)}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold bg-muted px-1.5 py-0.5 rounded">{part.partNumber}</span>
                              <span className="text-sm truncate">{part.description}</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {part.brand && <span>{part.brand} • </span>}
                              <span className="text-green-600 font-medium">${part.price}</span>
                              {part.quantityOnHand !== null && (
                                <span className="ml-2">({part.quantityOnHand} in stock)</span>
                              )}
                            </div>
                          </div>
                          {selectedPart?.id === part.id && (
                            <Check className="h-4 w-4 text-primary shrink-0 ml-2" />
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-muted-foreground text-sm">
                        {partSearch ? "No parts found matching your search" : "No parts in inventory yet"}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Selected Part Info */}
              {selectedPart && (
                <div className="bg-muted/50 p-3 rounded-md">
                  <p className="text-xs text-muted-foreground">Selected: <span className="font-medium text-foreground">{selectedPart.partNumber}</span></p>
                </div>
              )}

              {/* Manual Entry Option */}
              <div className="space-y-2">
                <Label htmlFor="part-description">Or Enter Part Manually</Label>
                <Input 
                  id="part-description"
                  placeholder="e.g., Brake Pads - Front Set"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setSelectedPart(null);
                  }}
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
            <span className="text-xl font-bold text-primary" data-testid="text-line-total">${calculateTotal()}</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel-line-item">Cancel</Button>
          <Button onClick={handleSubmit} data-testid="button-add-line-item">Add Item</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
