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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Search, Check, X, Filter, ChevronsUpDown } from "lucide-react";
import { fuzzySearchVMRS, VMRS_SYSTEMS, VMRS_ASSEMBLIES_BY_SYSTEM, VMRSCode } from "@/lib/vmrs-data";
import { cn } from "@/lib/utils";

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
  const [systemOpen, setSystemOpen] = useState(false);
  const [assemblyOpen, setAssemblyOpen] = useState(false);

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
    setSystemFilter(value);
    setAssemblyFilter("");
    setSystemOpen(false);
  };

  const handleAssemblyChange = (value: string) => {
    setAssemblyFilter(value);
    setAssemblyOpen(false);
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
              
              {/* System Filter Combobox */}
              <Popover open={systemOpen} onOpenChange={setSystemOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={systemOpen}
                    className="flex-1 justify-between text-left font-normal"
                    data-testid="select-system-filter"
                  >
                    <span className="truncate">
                      {systemFilter || "Filter by System"}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search systems..." />
                    <CommandList>
                      <CommandEmpty>No system found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value=""
                          onSelect={() => handleSystemChange("")}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              !systemFilter ? "opacity-100" : "opacity-0"
                            )}
                          />
                          All Systems
                        </CommandItem>
                        {VMRS_SYSTEMS.map((system) => (
                          <CommandItem
                            key={system}
                            value={system}
                            onSelect={() => handleSystemChange(system)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                systemFilter === system ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <span className="text-xs">{system}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {/* Assembly Filter Combobox */}
              <Popover open={assemblyOpen} onOpenChange={setAssemblyOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={assemblyOpen}
                    className="flex-1 justify-between text-left font-normal"
                    disabled={!systemFilter}
                    data-testid="select-assembly-filter"
                  >
                    <span className="truncate">
                      {assemblyFilter || (systemFilter ? "Filter by Assembly" : "Select System first")}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search assemblies..." />
                    <CommandList>
                      <CommandEmpty>No assembly found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value=""
                          onSelect={() => handleAssemblyChange("")}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              !assemblyFilter ? "opacity-100" : "opacity-0"
                            )}
                          />
                          All Assemblies
                        </CommandItem>
                        {availableAssemblies.map((assembly) => (
                          <CommandItem
                            key={assembly}
                            value={assembly}
                            onSelect={() => handleAssemblyChange(assembly)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                assemblyFilter === assembly ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <span className="text-xs">{assembly}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {hasFilters && (
                <Button variant="ghost" size="icon" onClick={clearFilters} className="shrink-0" data-testid="button-clear-filters">
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
          <Button variant="outline" onClick={handleClose} data-testid="button-cancel-job">Cancel</Button>
          <Button onClick={handleConfirm} disabled={!selectedVmrs} data-testid="button-add-job-confirm">Add Job</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
