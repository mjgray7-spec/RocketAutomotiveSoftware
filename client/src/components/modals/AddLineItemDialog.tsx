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
import { Badge } from "@/components/ui/badge";
import { Wrench, Package, Clock, DollarSign, Loader2, Search, Check, Truck, Store, ExternalLink, MapPin } from "lucide-react";
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
  vendorInfo?: {
    vendorName: string;
    partNumber: string;
    eta: string;
  };
}

interface VendorPart {
  id: string;
  vendorName: string;
  partNumber: string;
  description: string;
  brand: string;
  price: number;
  cost: number;
  quantityAvailable: number;
  warehouseLocation: string;
  distanceMiles: number;
  etaHours: number;
  etaDisplay: string;
}

interface VendorSearchResult {
  query: string;
  resultCount: number;
  vendors: string[];
  parts: VendorPart[];
  searchTime: number;
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
  
  // Part search state - Inventory
  const [partSearch, setPartSearch] = useState("");
  const [searchResults, setSearchResults] = useState<InventoryItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPart, setSelectedPart] = useState<InventoryItem | null>(null);

  // Vendor search state
  const [vendorResults, setVendorResults] = useState<VendorPart[]>([]);
  const [isSearchingVendors, setIsSearchingVendors] = useState(false);
  const [selectedVendorPart, setSelectedVendorPart] = useState<VendorPart | null>(null);
  const [showVendorSearch, setShowVendorSearch] = useState(false);

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
      setVendorResults([]);
      setSelectedVendorPart(null);
      setShowVendorSearch(false);
    }
  }, [open]);

  // Search inventory when typing
  useEffect(() => {
    const searchInventory = async () => {
      if (partSearch.length < 2) {
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

  // Search vendor parts API
  const searchVendorParts = async () => {
    if (!partSearch || partSearch.length < 2) return;
    
    setIsSearchingVendors(true);
    setShowVendorSearch(true);
    try {
      const response = await fetch(`/api/vendor-parts/search?q=${encodeURIComponent(partSearch)}`);
      if (response.ok) {
        const data: VendorSearchResult = await response.json();
        setVendorResults(data.parts);
      }
    } catch (error) {
      console.error("Failed to search vendor parts:", error);
    } finally {
      setIsSearchingVendors(false);
    }
  };

  // Lookup labor time from Motors API
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
    let vendorInfo: LineItem['vendorInfo'] = undefined;

    if (itemType === "Labor" && laborLookupResult) {
      source = laborLookupResult.source;
    } else if (itemType === "Part") {
      if (selectedVendorPart) {
        source = `Vendor: ${selectedVendorPart.vendorName}`;
        vendorInfo = {
          vendorName: selectedVendorPart.vendorName,
          partNumber: selectedVendorPart.partNumber,
          eta: selectedVendorPart.etaDisplay,
        };
      } else if (selectedPart) {
        source = "Inventory";
      }
    }
    
    onAddLineItem({
      type: itemType,
      description: description || `${itemType} Item`,
      quantity: parseFloat(quantity) || 1,
      rate: `$${parseFloat(rate).toFixed(2)}`,
      total: `$${total}`,
      source,
      vmrsCode: jobVmrsCode,
      vendorInfo,
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
    setSelectedVendorPart(null);
    setDescription("");
    setQuantity("1");
    setShowVendorSearch(false);
    setVendorResults([]);
  };

  const handleSelectPart = (part: InventoryItem) => {
    setSelectedPart(part);
    setSelectedVendorPart(null);
    setDescription(`${part.partNumber} - ${part.description}`);
    setRate(part.price);
    setQuantity("1");
  };

  const handleSelectVendorPart = (part: VendorPart) => {
    setSelectedVendorPart(part);
    setSelectedPart(null);
    setDescription(`${part.partNumber} - ${part.description} (${part.brand})`);
    setRate(part.price.toFixed(2));
    setQuantity("1");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Line Item</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto pr-2" style={{ maxHeight: 'calc(90vh - 200px)' }}>
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
              {/* Part Search */}
              <div className="space-y-2">
                <Label>Search Parts</Label>
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

              {/* Inventory Results */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Store className="h-4 w-4" />
                    In-Stock Inventory
                  </Label>
                  <span className="text-xs text-muted-foreground">{searchResults.length} items</span>
                </div>
                <div className="border rounded-md max-h-[120px] overflow-y-auto">
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
                        <div className="p-3 text-center text-muted-foreground text-sm">
                          {partSearch ? "No parts found in inventory" : "No parts in inventory yet"}
                        </div>
                      )}
                    </div>
                </div>
              </div>

              {/* Search External Vendors Button */}
              {partSearch.length >= 2 && (
                <div className="flex items-center justify-center">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={searchVendorParts}
                    disabled={isSearchingVendors}
                    className="gap-2"
                    data-testid="button-search-vendors"
                  >
                    {isSearchingVendors ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Truck className="h-4 w-4" />
                    )}
                    Search External Vendors
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              )}

              {/* Vendor Results */}
              {showVendorSearch && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      Available from Vendors
                    </Label>
                    <span className="text-xs text-muted-foreground">{vendorResults.length} results</span>
                  </div>
                  <div className="border rounded-md border-blue-200 bg-blue-50/30 max-h-[220px] overflow-y-auto">
                    {vendorResults.length > 0 ? (
                      <div className="divide-y divide-blue-200">
                        {vendorResults.map((part) => (
                          <div 
                            key={part.id}
                            data-testid={`vendor-part-option-${part.id}`}
                            className={`p-3 cursor-pointer hover:bg-blue-100/50 transition-colors ${selectedVendorPart?.id === part.id ? "bg-blue-100 border-l-4 border-l-blue-600" : ""}`}
                            onClick={() => handleSelectVendorPart(part)}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge className="text-xs bg-blue-600 text-white">{part.vendorName}</Badge>
                                  <span className="font-mono text-xs font-bold bg-white px-1.5 py-0.5 rounded">{part.partNumber}</span>
                                </div>
                                <p className="text-sm font-medium">{part.description}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{part.brand}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-lg font-bold text-green-600">${part.price.toFixed(2)}</p>
                                <p className="text-xs text-blue-600 font-medium">{part.quantityAvailable} in stock</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-blue-200/50">
                              <div className="flex items-center gap-1 text-xs">
                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                <span className="text-muted-foreground">{part.warehouseLocation}</span>
                                <span className="text-muted-foreground">({part.distanceMiles} miles)</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs font-medium text-orange-600">
                                <Clock className="h-3 w-3" />
                                <span>{part.etaDisplay}</span>
                              </div>
                            </div>
                            {selectedVendorPart?.id === part.id && (
                              <div className="mt-2 flex items-center gap-1 text-xs text-blue-600 font-medium">
                                <Check className="h-4 w-4" />
                                Selected
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : isSearchingVendors ? (
                      <div className="p-6 text-center">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-500" />
                        <p className="text-sm text-muted-foreground mt-2">Searching O'Reilly, NAPA, AutoZone, and more...</p>
                      </div>
                    ) : (
                      <div className="p-6 text-center">
                        <Truck className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                        <p className="text-sm text-muted-foreground">No parts found from external vendors</p>
                        <p className="text-xs text-muted-foreground mt-1">Try a different search term</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Selected Part Info */}
              {(selectedPart || selectedVendorPart) && (
                <div className={`p-3 rounded-md ${selectedVendorPart ? 'bg-blue-50 border border-blue-200' : 'bg-muted/50'}`}>
                  {selectedVendorPart ? (
                    <div className="text-xs">
                      <p className="font-medium text-blue-700">Selected from: {selectedVendorPart.vendorName}</p>
                      <p className="text-muted-foreground mt-1">
                        Part: {selectedVendorPart.partNumber} • ETA: {selectedVendorPart.etaDisplay}
                      </p>
                    </div>
                  ) : selectedPart && (
                    <p className="text-xs text-muted-foreground">
                      Selected from inventory: <span className="font-medium text-foreground">{selectedPart.partNumber}</span>
                    </p>
                  )}
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
                    setSelectedVendorPart(null);
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
          </div>
        </div>

        {/* Total Preview - Pinned at bottom */}
        <div className="bg-primary/5 p-4 rounded-md flex justify-between items-center mt-4 shrink-0">
          <span className="font-medium">Line Total:</span>
          <span className="text-xl font-bold text-primary" data-testid="text-line-total">${calculateTotal()}</span>
        </div>

        <DialogFooter className="shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel-line-item">Cancel</Button>
          <Button onClick={handleSubmit} data-testid="button-add-line-item">Add Item</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
