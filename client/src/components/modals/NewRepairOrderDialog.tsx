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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  User, 
  Car, 
  Phone, 
  Mail, 
  Plus, 
  Check, 
  Calendar,
  Clock,
  Loader2,
  UserPlus,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import type { Customer, Vehicle, PmService } from "@shared/schema";
import { useLocation } from "wouter";
import { useData } from "@/lib/DataContext";
import { Checkbox } from "@/components/ui/checkbox";

const COMMON_MAKES = [
  "Acura", "Audi", "BMW", "Buick", "Cadillac", "Chevrolet", "Chrysler", 
  "Dodge", "Ford", "GMC", "Honda", "Hyundai", "Infiniti", "Jeep", "Kia", 
  "Lexus", "Lincoln", "Mazda", "Mercedes-Benz", "Nissan", "Ram", "Subaru", 
  "Tesla", "Toyota", "Volkswagen", "Volvo", "Other"
];

const COMMON_MODELS: Record<string, string[]> = {
  "Acura": ["MDX", "RDX", "TLX", "ILX", "NSX", "Other"],
  "Audi": ["A4", "A6", "Q5", "Q7", "Q3", "e-tron", "Other"],
  "BMW": ["3 Series", "5 Series", "X3", "X5", "X1", "7 Series", "Other"],
  "Buick": ["Enclave", "Encore", "Envision", "LaCrosse", "Other"],
  "Cadillac": ["Escalade", "XT5", "XT4", "CT5", "CT4", "Other"],
  "Chevrolet": ["Silverado", "Equinox", "Tahoe", "Malibu", "Traverse", "Camaro", "Corvette", "Colorado", "Suburban", "Other"],
  "Chrysler": ["300", "Pacifica", "Voyager", "Other"],
  "Dodge": ["Ram", "Charger", "Challenger", "Durango", "Grand Caravan", "Other"],
  "Ford": ["F-150", "Explorer", "Escape", "Mustang", "Edge", "Bronco", "Ranger", "Expedition", "Fusion", "Other"],
  "GMC": ["Sierra", "Yukon", "Terrain", "Acadia", "Canyon", "Other"],
  "Honda": ["Civic", "Accord", "CR-V", "Pilot", "Odyssey", "HR-V", "Ridgeline", "Other"],
  "Hyundai": ["Elantra", "Sonata", "Tucson", "Santa Fe", "Palisade", "Kona", "Other"],
  "Infiniti": ["Q50", "QX60", "QX80", "Q60", "Other"],
  "Jeep": ["Wrangler", "Grand Cherokee", "Cherokee", "Compass", "Gladiator", "Renegade", "Other"],
  "Kia": ["Sorento", "Sportage", "Telluride", "Forte", "K5", "Soul", "Other"],
  "Lexus": ["RX", "ES", "NX", "GX", "IS", "LX", "Other"],
  "Lincoln": ["Navigator", "Aviator", "Corsair", "Nautilus", "Other"],
  "Mazda": ["CX-5", "CX-9", "Mazda3", "Mazda6", "CX-30", "MX-5", "Other"],
  "Mercedes-Benz": ["C-Class", "E-Class", "GLE", "GLC", "S-Class", "A-Class", "Other"],
  "Nissan": ["Altima", "Rogue", "Sentra", "Pathfinder", "Murano", "Frontier", "Titan", "Other"],
  "Ram": ["1500", "2500", "3500", "ProMaster", "Other"],
  "Subaru": ["Outback", "Forester", "Crosstrek", "Impreza", "Ascent", "WRX", "Other"],
  "Tesla": ["Model 3", "Model Y", "Model S", "Model X", "Cybertruck", "Other"],
  "Toyota": ["Camry", "Corolla", "RAV4", "Highlander", "Tacoma", "Tundra", "4Runner", "Prius", "Sienna", "Other"],
  "Volkswagen": ["Jetta", "Tiguan", "Atlas", "Passat", "Golf", "ID.4", "Other"],
  "Volvo": ["XC90", "XC60", "XC40", "S60", "V60", "Other"],
  "Other": ["Other"]
};

interface CustomerWithVehicles {
  customer: Customer;
  vehicles: Vehicle[];
}

interface NewRepairOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function NewRepairOrderDialog({ open, onOpenChange }: NewRepairOrderDialogProps) {
  const [, setLocation] = useLocation();
  const { refreshData } = useData();
  
  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<CustomerWithVehicles[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Selection state
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [customerVehicles, setCustomerVehicles] = useState<Vehicle[]>([]);
  
  // New customer/vehicle state
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [newCustomerEmail, setNewCustomerEmail] = useState("");
  const [showNewVehicleForm, setShowNewVehicleForm] = useState(false);
  const [newVehicleYear, setNewVehicleYear] = useState("");
  const [newVehicleMake, setNewVehicleMake] = useState("");
  const [newVehicleModel, setNewVehicleModel] = useState("");
  const [customMake, setCustomMake] = useState("");
  const [customModel, setCustomModel] = useState("");
  const [newVehicleVin, setNewVehicleVin] = useState("");
  const [newVehiclePlate, setNewVehiclePlate] = useState("");
  
  // RO Details state
  const [complaint, setComplaint] = useState("");
  const [includeRepair, setIncludeRepair] = useState(false);
  const [includePm, setIncludePm] = useState(false);
  const [selectedPmServices, setSelectedPmServices] = useState<number[]>([]);
  const [availablePmServices, setAvailablePmServices] = useState<PmService[]>([]);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [bay, setBay] = useState("");
  
  // Labor rate constant
  const LABOR_RATE = 145;
  
  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<"customer" | "vehicle" | "details">("customer");
  const [error, setError] = useState<string | null>(null);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchTerm("");
      setSearchResults([]);
      setSelectedCustomer(null);
      setSelectedVehicle(null);
      setCustomerVehicles([]);
      setShowNewCustomerForm(false);
      setShowNewVehicleForm(false);
      setNewCustomerName("");
      setNewCustomerPhone("");
      setNewCustomerEmail("");
      setNewVehicleYear("");
      setNewVehicleMake("");
      setNewVehicleModel("");
      setCustomMake("");
      setCustomModel("");
      setNewVehicleVin("");
      setNewVehiclePlate("");
      setComplaint("");
      setIncludeRepair(false);
      setIncludePm(false);
      setSelectedPmServices([]);
      setScheduledDate("");
      setScheduledTime("");
      setBay("");
      setCurrentStep("customer");
      setError(null);
    }
  }, [open]);

  // Fetch available PM services when dialog opens
  useEffect(() => {
    if (open) {
      fetch("/api/pm-services/enabled")
        .then(res => res.json())
        .then(data => setAvailablePmServices(data))
        .catch(console.error);
    }
  }, [open]);

  // Search customers
  useEffect(() => {
    if (searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }
    
    const debounce = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`/api/customers/search?q=${encodeURIComponent(searchTerm)}`);
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    
    return () => clearTimeout(debounce);
  }, [searchTerm]);

  const handleSelectCustomer = (result: CustomerWithVehicles) => {
    setSelectedCustomer(result.customer);
    setCustomerVehicles(result.vehicles);
    setSelectedVehicle(null);
    setShowNewCustomerForm(false);
    
    if (result.vehicles.length === 1) {
      setSelectedVehicle(result.vehicles[0]);
      setCurrentStep("details");
    } else {
      setCurrentStep("vehicle");
    }
  };

  const handleSelectVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setShowNewVehicleForm(false);
    setCurrentStep("details");
  };

  const handleCreateNewCustomer = async () => {
    if (!newCustomerName.trim()) return;
    
    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCustomerName.trim(),
          phone: newCustomerPhone.trim() || null,
          email: newCustomerEmail.trim() || null,
        }),
      });
      
      if (response.ok) {
        const customer = await response.json();
        setSelectedCustomer(customer);
        setCustomerVehicles([]);
        setShowNewCustomerForm(false);
        setShowNewVehicleForm(true);
        setCurrentStep("vehicle");
      }
    } catch (error) {
      console.error("Error creating customer:", error);
    }
  };

  // Compute effective make/model (use custom values when "Other" is selected)
  const effectiveMake = newVehicleMake === "Other" ? customMake.trim() : newVehicleMake;
  const effectiveModel = newVehicleModel === "Other" ? customModel.trim() : newVehicleModel;

  const handleCreateNewVehicle = async () => {
    if (!selectedCustomer || !newVehicleYear || !effectiveMake || !effectiveModel) return;
    
    try {
      const response = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selectedCustomer.id,
          year: parseInt(newVehicleYear),
          make: effectiveMake,
          model: effectiveModel,
          vin: newVehicleVin.trim() || null,
          licensePlate: newVehiclePlate.trim() || null,
        }),
      });
      
      if (response.ok) {
        const vehicle = await response.json();
        setSelectedVehicle(vehicle);
        setCustomerVehicles([...customerVehicles, vehicle]);
        setShowNewVehicleForm(false);
        setCurrentStep("details");
      }
    } catch (error) {
      console.error("Error creating vehicle:", error);
    }
  };

  const handleSubmit = async () => {
    if (!selectedCustomer || !selectedVehicle || !complaint.trim()) {
      setError("Please complete all required fields");
      return;
    }
    
    if (!includeRepair && !includePm) {
      setError("Please select at least one service type (Repair or PM)");
      return;
    }
    
    if (includePm && selectedPmServices.length === 0) {
      setError("Please select at least one PM service");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      let dueDate = null;
      if (scheduledDate) {
        dueDate = scheduledTime 
          ? new Date(`${scheduledDate}T${scheduledTime}`)
          : new Date(scheduledDate);
      }

      const response = await fetch("/api/repair-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selectedCustomer.id,
          vehicleId: selectedVehicle.id,
          service: complaint.trim(),
          status: "pending",
          dueDate: dueDate?.toISOString() || null,
          bay: bay.trim() || null,
        }),
      });
      
      if (response.ok) {
        const newRO = await response.json();
        
        // Create service line items based on selected toggles
        try {
          // Create Diagnostic line item if Repair is toggled
          if (includeRepair) {
            const lineResponse = await fetch("/api/service-items", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                repairOrderId: newRO.id,
                description: `Diagnostic: ${complaint.trim()}`,
                type: "labor",
                status: "pending",
                hours: "1.00",
              }),
            });
            if (!lineResponse.ok) {
              console.error("Failed to create diagnostic service line");
            }
          }
          
          // Create PM service line items if PM is toggled
          if (includePm) {
            for (const pmServiceId of selectedPmServices) {
              const pmService = availablePmServices.find(s => s.id === pmServiceId);
              if (pmService) {
                const lineResponse = await fetch("/api/service-items", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    repairOrderId: newRO.id,
                    description: pmService.name,
                    type: "labor",
                    status: "pending",
                  }),
                });
                if (!lineResponse.ok) {
                  console.error(`Failed to create PM service line: ${pmService.name}`);
                }
              }
            }
          }
        } catch (lineError) {
          console.error("Error creating service lines:", lineError);
        }
        
        await refreshData();
        onOpenChange(false);
        setLocation("/repair-orders");
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || "Failed to create repair order");
      }
    } catch (error) {
      console.error("Error creating repair order:", error);
      setError("An error occurred while creating the repair order");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validation: at least one service type, and if PM is selected, at least one PM service must be chosen
  const hasValidServiceSelection = (includeRepair || includePm) && 
    (!includePm || selectedPmServices.length > 0);
  
  const canSubmit = selectedCustomer && selectedVehicle && complaint.trim() && hasValidServiceSelection;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            New Repair Order
          </DialogTitle>
        </DialogHeader>
        
        {/* Progress Steps */}
        <div className="flex items-center gap-2 py-2 border-b">
          <Badge 
            variant={currentStep === "customer" ? "default" : "secondary"}
            className={selectedCustomer ? "bg-green-600" : ""}
          >
            1. Customer
          </Badge>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <Badge 
            variant={currentStep === "vehicle" ? "default" : "secondary"}
            className={selectedVehicle ? "bg-green-600" : ""}
          >
            2. Vehicle
          </Badge>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <Badge variant={currentStep === "details" ? "default" : "secondary"}>
            3. Details
          </Badge>
        </div>

        <div className="flex-1 overflow-y-auto pr-2" style={{ maxHeight: 'calc(90vh - 220px)' }}>
          {/* Step 1: Customer Selection */}
          {currentStep === "customer" && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Search Customer</Label>
                <p className="text-xs text-muted-foreground">Search by name, phone number, or VIN</p>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Enter name, phone, or VIN..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    data-testid="input-customer-search"
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />
                  )}
                </div>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="border rounded-md max-h-[200px] overflow-y-auto">
                  <div className="divide-y">
                    {searchResults.map((result) => (
                      <div 
                        key={result.customer.id}
                        className="p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleSelectCustomer(result)}
                        data-testid={`customer-result-${result.customer.id}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{result.customer.name}</span>
                          </div>
                          <Badge variant="outline">{result.vehicles.length} vehicle(s)</Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          {result.customer.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {result.customer.phone}
                            </span>
                          )}
                          {result.customer.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {result.customer.email}
                            </span>
                          )}
                        </div>
                        {result.vehicles.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {result.vehicles.map((v) => (
                              <Badge key={v.id} variant="secondary" className="text-xs">
                                {v.year} {v.make} {v.model}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {searchTerm.length >= 2 && searchResults.length === 0 && !isSearching && (
                <div className="text-center py-4 text-muted-foreground">
                  No customers found
                </div>
              )}

              {/* Add New Customer Button */}
              <div className="flex justify-center pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedCustomer(null);
                    setSelectedVehicle(null);
                    setCustomerVehicles([]);
                    setShowNewCustomerForm(true);
                  }}
                  className="gap-2"
                  data-testid="button-add-new-customer"
                >
                  <UserPlus className="h-4 w-4" />
                  Add New Customer
                </Button>
              </div>

              {/* New Customer Form */}
              {showNewCustomerForm && (
                <div className="border rounded-md p-4 bg-muted/30 space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    New Customer
                  </h4>
                  <div className="grid gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="new-customer-name">Name *</Label>
                      <Input 
                        id="new-customer-name"
                        placeholder="Customer name"
                        value={newCustomerName}
                        onChange={(e) => setNewCustomerName(e.target.value)}
                        data-testid="input-new-customer-name"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="new-customer-phone">Phone</Label>
                        <Input 
                          id="new-customer-phone"
                          placeholder="(555) 555-5555"
                          value={newCustomerPhone}
                          onChange={(e) => setNewCustomerPhone(e.target.value)}
                          data-testid="input-new-customer-phone"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="new-customer-email">Email</Label>
                        <Input 
                          id="new-customer-email"
                          type="email"
                          placeholder="email@example.com"
                          value={newCustomerEmail}
                          onChange={(e) => setNewCustomerEmail(e.target.value)}
                          data-testid="input-new-customer-email"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="ghost" size="sm" onClick={() => setShowNewCustomerForm(false)}>
                      Cancel
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handleCreateNewCustomer}
                      disabled={!newCustomerName.trim()}
                      data-testid="button-save-new-customer"
                    >
                      Save & Continue
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Vehicle Selection */}
          {currentStep === "vehicle" && selectedCustomer && (
            <div className="space-y-4 py-4">
              <div className="bg-muted/30 p-3 rounded-md flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="font-medium">{selectedCustomer.name}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setCurrentStep("customer")}>
                  Change
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Select Vehicle</Label>
                {customerVehicles.length > 0 ? (
                  <div className="border rounded-md divide-y">
                    {customerVehicles.map((vehicle) => (
                      <div 
                        key={vehicle.id}
                        className={`p-3 cursor-pointer hover:bg-muted/50 transition-colors flex items-center justify-between ${selectedVehicle?.id === vehicle.id ? "bg-primary/5 border-l-4 border-l-primary" : ""}`}
                        onClick={() => handleSelectVehicle(vehicle)}
                        data-testid={`vehicle-option-${vehicle.id}`}
                      >
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <span className="font-medium">{vehicle.year} {vehicle.make} {vehicle.model}</span>
                            {vehicle.vin && (
                              <p className="text-xs text-muted-foreground font-mono">{vehicle.vin}</p>
                            )}
                          </div>
                        </div>
                        {selectedVehicle?.id === vehicle.id && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground border rounded-md">
                    No vehicles on file
                  </div>
                )}
              </div>

              {/* Add New Vehicle Button */}
              <div className="flex justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => setShowNewVehicleForm(true)}
                  className="gap-2"
                  data-testid="button-add-new-vehicle"
                >
                  <Plus className="h-4 w-4" />
                  Add New Vehicle
                </Button>
              </div>

              {/* New Vehicle Form */}
              {showNewVehicleForm && (
                <div className="border rounded-md p-4 bg-muted/30 space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Car className="h-4 w-4" />
                    New Vehicle
                  </h4>
                  <div className="grid gap-3">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="new-vehicle-year">Year *</Label>
                        <Select value={newVehicleYear} onValueChange={setNewVehicleYear}>
                          <SelectTrigger data-testid="select-new-vehicle-year">
                            <SelectValue placeholder="Year" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px] overflow-y-auto">
                            {Array.from({ length: 80 }, (_, i) => new Date().getFullYear() + 1 - i).map((year) => (
                              <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="new-vehicle-make">Make *</Label>
                        <Select 
                          value={newVehicleMake} 
                          onValueChange={(value) => {
                            setNewVehicleMake(value);
                            setNewVehicleModel("");
                            setCustomMake("");
                            setCustomModel("");
                          }}
                        >
                          <SelectTrigger data-testid="select-new-vehicle-make">
                            <SelectValue placeholder="Select make" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px] overflow-y-auto">
                            {COMMON_MAKES.map((make) => (
                              <SelectItem key={make} value={make}>{make}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="new-vehicle-model">Model *</Label>
                        <Select 
                          value={newVehicleModel} 
                          onValueChange={(value) => {
                            setNewVehicleModel(value);
                            setCustomModel("");
                          }}
                          disabled={!newVehicleMake}
                        >
                          <SelectTrigger data-testid="select-new-vehicle-model">
                            <SelectValue placeholder={newVehicleMake ? "Select model" : "Select make first"} />
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px] overflow-y-auto">
                            {(COMMON_MODELS[newVehicleMake] || ["Other"]).map((model) => (
                              <SelectItem key={model} value={model}>{model}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {/* Custom Make/Model inputs when "Other" is selected */}
                    {(newVehicleMake === "Other" || newVehicleModel === "Other") && (
                      <div className="grid grid-cols-2 gap-3">
                        {newVehicleMake === "Other" && (
                          <div className="space-y-1">
                            <Label htmlFor="custom-make">Enter Make *</Label>
                            <Input 
                              id="custom-make"
                              placeholder="e.g., Rivian, Lucid"
                              value={customMake}
                              onChange={(e) => setCustomMake(e.target.value)}
                              data-testid="input-custom-make"
                            />
                          </div>
                        )}
                        {newVehicleModel === "Other" && (
                          <div className="space-y-1">
                            <Label htmlFor="custom-model">Enter Model *</Label>
                            <Input 
                              id="custom-model"
                              placeholder="e.g., R1T, Air"
                              value={customModel}
                              onChange={(e) => setCustomModel(e.target.value)}
                              data-testid="input-custom-model"
                            />
                          </div>
                        )}
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="new-vehicle-vin">VIN</Label>
                        <Input 
                          id="new-vehicle-vin"
                          placeholder="1HGBH41JXMN109186"
                          className="font-mono"
                          value={newVehicleVin}
                          onChange={(e) => setNewVehicleVin(e.target.value.toUpperCase())}
                          data-testid="input-new-vehicle-vin"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="new-vehicle-plate">License Plate</Label>
                        <Input 
                          id="new-vehicle-plate"
                          placeholder="ABC-1234"
                          value={newVehiclePlate}
                          onChange={(e) => setNewVehiclePlate(e.target.value.toUpperCase())}
                          data-testid="input-new-vehicle-plate"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="ghost" size="sm" onClick={() => setShowNewVehicleForm(false)}>
                      Cancel
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handleCreateNewVehicle}
                      disabled={!newVehicleYear || !effectiveMake || !effectiveModel}
                      data-testid="button-save-new-vehicle"
                    >
                      Save & Continue
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: RO Details */}
          {currentStep === "details" && selectedCustomer && selectedVehicle && (
            <div className="space-y-4 py-4">
              {/* Customer & Vehicle Summary */}
              <div className="bg-muted/30 p-3 rounded-md space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="font-medium">{selectedCustomer.name}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setCurrentStep("customer")}>
                    Change
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Car className="h-4 w-4" />
                  <span>{selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}</span>
                  {selectedVehicle.vin && (
                    <span className="font-mono text-xs">({selectedVehicle.vin})</span>
                  )}
                </div>
              </div>

              {/* Complaint / Service Request */}
              <div className="space-y-2">
                <Label htmlFor="complaint">Customer Complaint / Service Request *</Label>
                <Textarea 
                  id="complaint"
                  placeholder="Describe the customer's complaint or requested service..."
                  className="min-h-[80px]"
                  value={complaint}
                  onChange={(e) => setComplaint(e.target.value)}
                  data-testid="input-complaint"
                />
              </div>

              {/* Service Type Toggles */}
              <div className="space-y-3">
                <Label>Service Type * (select one or both)</Label>
                
                {/* Repair Toggle */}
                <div className="border rounded-md p-3">
                  <div className="flex items-center gap-3">
                    <Checkbox 
                      id="include-repair"
                      checked={includeRepair}
                      onCheckedChange={(checked) => setIncludeRepair(!!checked)}
                      data-testid="checkbox-include-repair"
                    />
                    <label 
                      htmlFor="include-repair"
                      className="flex-1 cursor-pointer"
                    >
                      <div className="font-medium">Repair</div>
                      <p className="text-xs text-muted-foreground">
                        Creates a diagnostic service line (1 hour @ ${LABOR_RATE}/hr)
                      </p>
                    </label>
                  </div>
                </div>
                
                {/* PM Toggle */}
                <div className={`border rounded-md p-3 ${includePm ? 'border-primary' : ''}`}>
                  <div className="flex items-center gap-3">
                    <Checkbox 
                      id="include-pm"
                      checked={includePm}
                      onCheckedChange={(checked) => {
                        setIncludePm(!!checked);
                        if (!checked) setSelectedPmServices([]);
                      }}
                      data-testid="checkbox-include-pm"
                    />
                    <label 
                      htmlFor="include-pm"
                      className="flex-1 cursor-pointer"
                    >
                      <div className="font-medium">Preventive Maintenance (PM)</div>
                      <p className="text-xs text-muted-foreground">
                        Select from available PM services
                      </p>
                    </label>
                  </div>
                  
                  {/* PM Services Multi-Select (shown when PM is toggled on) */}
                  {includePm && (
                    <div className="mt-3 border-t pt-3 space-y-2">
                      <Label className="text-sm">Select PM Services *</Label>
                      <div className="border rounded-md p-3 max-h-[200px] overflow-y-auto space-y-2 bg-background">
                        {availablePmServices.map((service) => (
                          <div 
                            key={service.id} 
                            className="flex items-center gap-2"
                          >
                            <Checkbox 
                              id={`pm-service-${service.id}`}
                              checked={selectedPmServices.includes(service.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedPmServices([...selectedPmServices, service.id]);
                                } else {
                                  setSelectedPmServices(selectedPmServices.filter(id => id !== service.id));
                                }
                              }}
                              data-testid={`checkbox-pm-service-${service.id}`}
                            />
                            <label 
                              htmlFor={`pm-service-${service.id}`}
                              className="text-sm cursor-pointer"
                            >
                              {service.name}
                            </label>
                          </div>
                        ))}
                      </div>
                      {selectedPmServices.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {selectedPmServices.length} service(s) selected
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Scheduling */}
              <div className="space-y-2">
                <Label>Scheduling (Optional)</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="scheduled-date" className="text-xs text-muted-foreground">Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="scheduled-date"
                        type="date"
                        className="pl-9"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        data-testid="input-scheduled-date"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="scheduled-time" className="text-xs text-muted-foreground">Time</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="scheduled-time"
                        type="time"
                        className="pl-9"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        data-testid="input-scheduled-time"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bay Assignment */}
              <div className="space-y-2">
                <Label htmlFor="bay">Bay Assignment (Optional)</Label>
                <Input 
                  id="bay"
                  placeholder="e.g., Bay 1, Bay 2"
                  value={bay}
                  onChange={(e) => setBay(e.target.value)}
                  data-testid="input-bay"
                />
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-md text-destructive text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <DialogFooter className="shrink-0 border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel-new-ro">
            Cancel
          </Button>
          {currentStep === "details" && (
            <Button 
              onClick={handleSubmit} 
              disabled={!canSubmit || isSubmitting}
              data-testid="button-create-ro"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                "Create Repair Order"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
