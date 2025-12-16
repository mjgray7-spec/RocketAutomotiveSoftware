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
import { Search, Check } from "lucide-react";
import { fuzzySearchVMRS, VMRSCode } from "@/lib/vmrs-data";

interface AddJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddJob: (vmrs: VMRSCode) => void;
}

export function AddJobDialog({ open, onOpenChange, onAddJob }: AddJobDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVmrs, setSelectedVmrs] = useState<VMRSCode | null>(null);

  const filteredVMRS = useMemo(() => {
    return fuzzySearchVMRS(searchTerm);
  }, [searchTerm]);

  const handleConfirm = () => {
    if (selectedVmrs) {
      onAddJob(selectedVmrs);
      onOpenChange(false);
      setSearchTerm("");
      setSelectedVmrs(null);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setSearchTerm("");
    setSelectedVmrs(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add New Service Job</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          <p className="text-sm text-muted-foreground">
            Search by VMRS code, system, assembly, or component name. Type at least 2 characters to search the full database.
          </p>
          
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

          <div className="text-xs text-muted-foreground">
            {searchTerm.length >= 2 
              ? `Found ${filteredVMRS.length}${filteredVMRS.length >= 100 ? '+' : ''} results` 
              : 'Showing first 50 codes. Type to search all 27,000+ VMRS codes.'}
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
                     No VMRS codes found matching "{searchTerm}"
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
