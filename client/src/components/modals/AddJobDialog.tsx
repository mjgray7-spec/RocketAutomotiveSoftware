import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Check, X, Filter } from "lucide-react";
import { fuzzySearchVMRS, VMRS_SYSTEMS, VMRS_ASSEMBLIES_BY_SYSTEM, VMRSCode } from "@/lib/vmrs-data";

interface AddJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddJob: (vmrs: VMRSCode) => void;
}

export function AddJobDialog({ open, onOpenChange, onAddJob }: AddJobDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVmrs, setSelectedVmrs] = useState<VMRSCode | null>(null);
  const [systemFilter, setSystemFilter] = useState<string>("");
  const [assemblyFilter, setAssemblyFilter] = useState<string>("");

  const availableAssemblies = useMemo(() => {
    if (!systemFilter) return [];
    return VMRS_ASSEMBLIES_BY_SYSTEM[systemFilter] || [];
  }, [systemFilter]);

  const filteredVMRS = useMemo(() => {
    return fuzzySearchVMRS(
      searchTerm, 
      systemFilter || undefined, 
      assemblyFilter || undefined
    );
  }, [searchTerm, systemFilter, assemblyFilter]);

  const handleConfirm = () => {
    if (selectedVmrs) {
      onAddJob(selectedVmrs);
      handleClose();
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setSearchTerm("");
    setSelectedVmrs(null);
    setSystemFilter("");
    setAssemblyFilter("");
  };

  const handleSystemChange = (value: string) => {
    setSystemFilter(value === "all" ? "" : value);
    setAssemblyFilter("");
  };

  const handleAssemblyChange = (value: string) => {
    setAssemblyFilter(value === "all" ? "" : value);
  };

  const clearFilters = () => {
    setSystemFilter("");
    setAssemblyFilter("");
  };

  const hasFilters = systemFilter || assemblyFilter;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add New Service Job</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          <p className="text-sm text-muted-foreground">
            Search by VMRS code, system, assembly, or component. Use filters to narrow down results.
          </p>
          
          {/* Search and Filters */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="e.g., starter, brake, 032-001, alternator..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-vmrs-search"
              />
            </div>

            <div className="flex gap-2 items-center">
              <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
              
              <Select value={systemFilter || "all"} onValueChange={handleSystemChange}>
                <SelectTrigger className="flex-1" data-testid="select-system-filter">
                  <SelectValue placeholder="Filter by System" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Systems</SelectItem>
                  {VMRS_SYSTEMS.map(system => (
                    <SelectItem key={system} value={system} className="text-xs">
                      {system}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select 
                value={assemblyFilter || "all"} 
                onValueChange={handleAssemblyChange}
                disabled={!systemFilter}
              >
                <SelectTrigger className="flex-1" data-testid="select-assembly-filter">
                  <SelectValue placeholder={systemFilter ? "Filter by Assembly" : "Select System first"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assemblies</SelectItem>
                  {availableAssemblies.map(assembly => (
                    <SelectItem key={assembly} value={assembly} className="text-xs">
                      {assembly}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {hasFilters && (
                <Button variant="ghost" size="icon" onClick={clearFilters} className="shrink-0">
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="text-xs text-muted-foreground flex items-center justify-between">
            <span>
              {filteredVMRS.length >= 100 
                ? `Showing first 100 of many results` 
                : `Found ${filteredVMRS.length} result${filteredVMRS.length !== 1 ? 's' : ''}`}
            </span>
            {!searchTerm && !hasFilters && (
              <span className="text-primary">Type to search 27,000+ VMRS codes</span>
            )}
          </div>

          <div className="border rounded-md flex-1 overflow-hidden">
             <ScrollArea className="h-[300px]">
               <div className="divide-y divide-border">
                 {filteredVMRS.length > 0 ? (
                   filteredVMRS.map((vmrs) => (
                     <div 
                       key={vmrs.code} 
                       data-testid={`vmrs-option-${vmrs.code}`}
                       className={`p-3 cursor-pointer hover:bg-muted/50 transition-colors flex items-center justify-between ${selectedVmrs?.code === vmrs.code ? "bg-primary/5 border-l-4 border-l-primary" : ""}`}
                       onClick={() => setSelectedVmrs(vmrs)}
                     >
                       <div className="min-w-0 flex-1">
                         <div className="flex items-center gap-2 flex-wrap">
                           <span className="font-mono text-xs font-bold bg-muted px-1.5 py-0.5 rounded shrink-0">{vmrs.code}</span>
                           <span className="font-medium text-sm truncate">{vmrs.component}</span>
                         </div>
                         <div className="text-xs text-muted-foreground mt-1 pl-1 truncate">
                           {vmrs.system} &gt; {vmrs.assembly}
                         </div>
                       </div>
                       {selectedVmrs?.code === vmrs.code && (
                         <Check className="h-4 w-4 text-primary shrink-0 ml-2" />
                       )}
                     </div>
                   ))
                 ) : (
                   <div className="p-8 text-center text-muted-foreground text-sm">
                     No VMRS codes found matching your search and filters
                   </div>
                 )}
               </div>
             </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={!selectedVmrs} data-testid="button-add-job-confirm">Add Job</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
