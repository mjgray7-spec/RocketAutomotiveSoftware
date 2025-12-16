import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Wrench, Calendar, Clock } from "lucide-react";

interface JobAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobTitle?: string;
  jobId?: string;
  currentTech?: string;
}

const TECHNICIANS = [
  { id: "mike", name: "Mike T.", status: "Available", specialty: "Brakes & Suspension" },
  { id: "sarah", name: "Sarah C.", status: "Busy", specialty: "Diagnostics" },
  { id: "batman", name: "Batman", status: "Available", specialty: "Everything" },
  { id: "superman", name: "Superman", status: "Available", specialty: "Heavy Lifting" },
  { id: "wonderwoman", name: "Wonder Woman", status: "Busy", specialty: "Alignments" },
];

export function JobAssignmentDialog({ open, onOpenChange, jobTitle, jobId, currentTech }: JobAssignmentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Technician</DialogTitle>
          <DialogDescription>
            Assign a technician to <strong>{jobTitle || "Job"}</strong> (#{jobId || "---"}).
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Job Details</Label>
            <div className="flex flex-col gap-2 p-3 border rounded-md bg-muted/20 text-sm">
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-muted-foreground" />
                <span>Brake Job + Oil Change</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Due Today, 4:00 PM</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Est. Time: 2.5 hrs</span>
              </div>
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="tech">Select Technician</Label>
            <Select defaultValue={currentTech?.toLowerCase().replace(" ", "") || ""}>
              <SelectTrigger>
                <SelectValue placeholder="Select a technician" />
              </SelectTrigger>
              <SelectContent>
                {TECHNICIANS.map((tech) => (
                  <SelectItem key={tech.id} value={tech.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                          {tech.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>{tech.name}</span>
                      <span className="text-xs text-muted-foreground ml-auto">({tech.status})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => onOpenChange(false)} className="bg-primary hover:bg-primary/90 text-white">Save Assignment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
