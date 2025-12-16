import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EditRODialog } from "@/components/modals/EditRODialog";
import { 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Calendar, 
  User, 
  Car,
  Clock,
  AlertTriangle
} from "lucide-react";

// Kanban Columns
const COLUMNS = [
  { id: "pending", title: "Pending Assignment", color: "bg-slate-500/10 border-slate-200" },
  { id: "wip", title: "Work in Progress", color: "bg-blue-500/10 border-blue-200" },
  { id: "estimate", title: "Estimate Building", color: "bg-yellow-500/10 border-yellow-200" },
  { id: "approval", title: "Pending Approval", color: "bg-orange-500/10 border-orange-200" },
  { id: "completed", title: "Completed", color: "bg-green-500/10 border-green-200" },
];

// Initial Mock Data
const INITIAL_RO_DATA = [
  { id: "1024", customer: "John Smith", vehicle: "2018 Ford F-150", status: "wip", tech: "Mike T.", service: "Brake Job + Oil Change", due: "Today, 4:00 PM" },
  { id: "1025", customer: "Sarah Connor", vehicle: "2021 Tesla Model 3", status: "pending", tech: "Unassigned", service: "Tire Rotation", due: "Tomorrow, 10:00 AM" },
  { id: "1026", customer: "Bruce Wayne", vehicle: "2019 Lamborghini Urus", status: "estimate", tech: "Batman", service: "Engine Diagnostics", due: "Today, 5:00 PM" },
  { id: "1027", customer: "Clark Kent", vehicle: "2015 Honda Civic", status: "approval", tech: "Superman", service: "Transmission Fluid", due: "Yesterday", urgent: true },
  { id: "1028", customer: "Diana Prince", vehicle: "2020 Jeep Wrangler", status: "completed", tech: "Wonder Woman", service: "Alignment", due: "Done" },
  { id: "1029", customer: "Tony Stark", vehicle: "2022 Audi R8", status: "wip", tech: "Jarvis", service: "Electrical System", due: "Today, 2:00 PM" },
];

export default function RepairOrders() {
  const [roList, setRoList] = useState(INITIAL_RO_DATA);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedRO, setSelectedRO] = useState<any>(null);

  const handleJobClick = (ro: any) => {
    setSelectedRO(ro);
    setEditOpen(true);
  };

  const handleSaveRO = (updatedRO: any) => {
    setRoList(roList.map(ro => ro.id === updatedRO.id ? updatedRO : ro));
  };

  return (
    <Layout>
      <EditRODialog 
        open={editOpen} 
        onOpenChange={setEditOpen}
        roData={selectedRO}
        onSave={handleSaveRO}
      />

      <div className="flex flex-col h-[calc(100vh-8rem)] gap-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Repair Orders</h1>
            <p className="text-muted-foreground">Manage workflow, assignments, and status.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search ROs..." className="pl-9" />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" /> New RO
            </Button>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex-1 overflow-x-auto pb-4">
          <div className="flex gap-4 h-full min-w-[1200px]">
            {COLUMNS.map((col) => (
              <div key={col.id} className="flex-1 flex flex-col min-w-[280px] bg-muted/30 rounded-xl border border-border/50">
                {/* Column Header */}
                <div className={`p-3 border-b border-border/50 flex items-center justify-between ${col.color} bg-opacity-20 rounded-t-xl`}>
                  <h3 className="font-semibold text-sm uppercase tracking-wide">{col.title}</h3>
                  <Badge variant="secondary" className="bg-background/50 backdrop-blur">
                    {roList.filter(ro => ro.status === col.id).length}
                  </Badge>
                </div>

                {/* Column Content */}
                <ScrollArea className="flex-1 p-3">
                  <div className="space-y-3">
                    {roList.filter(ro => ro.status === col.id).map((ro) => (
                      <Card 
                        key={ro.id} 
                        className="hover-elevate cursor-pointer border-border/60 shadow-sm hover:shadow-md transition-all group"
                        onClick={() => handleJobClick(ro)}
                      >
                        <CardContent className="p-3 space-y-3">
                          <div className="flex justify-between items-start">
                            <Badge variant="outline" className="font-mono text-xs">#{ro.id}</Badge>
                            {ro.urgent && <AlertTriangle className="h-4 w-4 text-destructive animate-pulse" />}
                          </div>
                          
                          <div>
                            <h4 className="font-bold text-sm truncate">{ro.vehicle}</h4>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <User className="h-3 w-3" />
                              {ro.customer}
                            </div>
                          </div>

                          <div className="text-xs bg-muted/50 p-2 rounded text-muted-foreground">
                            {ro.service}
                          </div>

                          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/30">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {ro.tech}
                            </div>
                            <div className={`flex items-center gap-1 ${ro.urgent ? 'text-destructive font-bold' : ''}`}>
                              <Clock className="h-3 w-3" />
                              {ro.due}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {/* Add Button Placeholder */}
                    <Button variant="ghost" className="w-full border border-dashed border-border/50 text-muted-foreground h-10 hover:bg-muted/50">
                      <Plus className="h-4 w-4 mr-2" /> Add Task
                    </Button>
                  </div>
                </ScrollArea>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
