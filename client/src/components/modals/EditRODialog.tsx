import { useState, useEffect } from "react";
import { useLocation } from "wouter";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Wrench, 
  Calendar, 
  Clock, 
  MapPin, 
  Trash2, 
  Plus, 
  Save, 
  XCircle,
  AlertTriangle,
  CheckCircle2,
  Package,
  FileText,
  Image as ImageIcon
} from "lucide-react";
import { InspectionItem } from "@/lib/DataContext";

// Updated Interface to Match Global Context
interface ServiceItem {
  id: string;
  description: string;
  type: "Labor" | "Part" | "Sublet";
  status: "pending" | "completed";
  hours?: number;
  notes?: string;
}

interface ROData {
  id: string;
  customer: string;
  vehicle: string;
  status: string;
  tech: string;
  service: string;
  due: string;
  notes?: string;
  bay?: string;
  dviStatus?: string;
  dviItems?: InspectionItem[];
  lineItems?: ServiceItem[];
}

interface EditRODialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roData: ROData | null;
  onSave: (updatedRO: ROData) => void;
}

const TECHNICIANS = [
  { id: "Unassigned", name: "Unassigned", status: "Available" },
  { id: "Mike T.", name: "Mike T.", status: "Available" },
  { id: "Sarah C.", name: "Sarah C.", status: "Busy" },
  { id: "Batman", name: "Batman", status: "Available" },
  { id: "Superman", name: "Superman", status: "Available" },
  { id: "Wonder Woman", name: "Wonder Woman", status: "Busy" },
];

const STATUSES = [
  { id: "pending", label: "Pending Assignment" },
  { id: "wip", label: "Work in Progress" },
  { id: "estimate", label: "Estimate Building" },
  { id: "approval", label: "Pending Approval" },
  { id: "completed", label: "Completed" },
];

const BAYS = ["Bay 1", "Bay 2", "Bay 3", "Bay 4", "Alignment Rack", "Quick Lube", "Waiting Lot"];

export function EditRODialog({ open, onOpenChange, roData, onSave }: EditRODialogProps) {
  const [formData, setFormData] = useState<ROData | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (roData) {
      setFormData({ ...roData });
    }
  }, [roData]);

  if (!formData) return null;

  const handleSave = () => {
    if (formData) {
      onSave(formData);
      onOpenChange(false);
    }
  };

  const handleDeleteLineItem = (id: string) => {
    if (formData && formData.lineItems) {
      const updatedLineItems = formData.lineItems.filter(item => item.id !== id);
      setFormData({ ...formData, lineItems: updatedLineItems });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/10 text-green-500 border-green-200';
      case 'wip': return 'bg-blue-500/10 text-blue-500 border-blue-200';
      case 'pending': return 'bg-slate-500/10 text-slate-500 border-slate-200';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0">
          
          {/* Header */}
          <div className="p-6 border-b border-border flex justify-between items-start bg-muted/10">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <DialogTitle className="text-2xl font-display font-bold">RO #{formData.id}</DialogTitle>
                <Badge variant="outline" className="bg-background">{formData.vehicle}</Badge>
                {formData.dviStatus === 'submitted' && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> DVI Completed
                  </Badge>
                )}
              </div>
              <DialogDescription className="flex items-center gap-2">
                <User className="h-3 w-3" /> {formData.customer}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select 
                value={formData.status} 
                onValueChange={(val) => setFormData({...formData, status: val})}
              >
                <SelectTrigger className="w-[180px] bg-background">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            <Tabs defaultValue="services" className="w-full">
              <div className="px-6 pt-4 border-b border-border">
                <TabsList className="bg-transparent h-10 p-0 space-x-6">
                  <TabsTrigger value="details" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-2">Details & Assignment</TabsTrigger>
                  <TabsTrigger value="services" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-2">Services & Tasks</TabsTrigger>
                  <TabsTrigger value="inspection" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-2">Inspection (DVI)</TabsTrigger>
                  <TabsTrigger value="history" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-2">History & Notes</TabsTrigger>
                </TabsList>
              </div>

              <div className="p-6">
                <TabsContent value="details" className="mt-0 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left: Scheduling */}
                    <div className="space-y-4">
                      <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4" /> Scheduling
                      </h3>
                      <div className="grid gap-4 p-4 border rounded-xl bg-card">
                        <div className="grid gap-2">
                          <Label>Technician</Label>
                          <Select 
                            value={formData.tech} 
                            onValueChange={(val) => setFormData({...formData, tech: val})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Assign Tech" />
                            </SelectTrigger>
                            <SelectContent>
                              {TECHNICIANS.map((tech) => (
                                <SelectItem key={tech.id} value={tech.id}>
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-5 w-5">
                                      <AvatarFallback className="text-[9px] bg-primary/10 text-primary">
                                        {tech.name.substring(0, 1)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span>{tech.name}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div className="grid gap-2">
                            <Label>Bay Assignment</Label>
                            <Select 
                              value={formData.bay || "Bay 1"} 
                              onValueChange={(val) => setFormData({...formData, bay: val})}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {BAYS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label>Due Time</Label>
                            <div className="relative">
                              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input 
                                value={formData.due} 
                                onChange={(e) => setFormData({...formData, due: e.target.value})}
                                className="pl-9" 
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Vehicle & Customer */}
                    <div className="space-y-4">
                      <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <Wrench className="h-4 w-4" /> Vehicle Info
                      </h3>
                      <div className="p-4 border rounded-xl bg-card space-y-3">
                        <div className="grid gap-1">
                          <Label className="text-xs text-muted-foreground">Vehicle</Label>
                          <Input value={formData.vehicle} onChange={(e) => setFormData({...formData, vehicle: e.target.value})} />
                        </div>
                        <div className="grid gap-1">
                          <Label className="text-xs text-muted-foreground">Odometer</Label>
                          <Input defaultValue="45,230 miles" />
                        </div>
                        <div className="grid gap-1">
                          <Label className="text-xs text-muted-foreground">VIN</Label>
                          <Input defaultValue="1FTEW1E45KFA89231" className="font-mono text-xs" disabled />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="services" className="mt-0">
                  <div className="border rounded-xl overflow-hidden">
                    <div className="bg-muted/30 p-3 flex justify-between items-center border-b">
                       <span className="font-bold text-sm">Service Line Items</span>
                       <Button variant="ghost" size="sm" className="h-8"><Plus className="h-3 w-3 mr-1" /> Add Service</Button>
                    </div>
                    <div className="p-0 divide-y divide-border">
                      {/* Render Dynamic Line Items if available */}
                      {formData.lineItems && formData.lineItems.length > 0 ? (
                        formData.lineItems.map((item, index) => (
                          <div key={item.id} className="flex items-start p-4 gap-4 hover:bg-muted/5 transition-colors">
                            <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${item.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                               {item.status === 'completed' ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                            </div>
                            
                            <div className="flex-1 space-y-1">
                               <div className="flex items-center gap-2">
                                 <span className={`font-medium ${item.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>{item.description}</span>
                                 <Badge variant="outline" className="text-[10px] h-5">{item.type}</Badge>
                               </div>
                               {item.notes && (
                                 <p className="text-xs text-muted-foreground flex items-center gap-1">
                                   <FileText className="h-3 w-3" /> {item.notes}
                                 </p>
                               )}
                            </div>

                            <div className="text-right space-y-1">
                               {item.type === 'Labor' && item.hours && (
                                 <div className="text-sm font-mono text-muted-foreground">{item.hours}h</div>
                               )}
                               {item.type === 'Part' && (
                                 <Badge variant="secondary" className="text-[10px]">Qty: 1</Badge>
                               )}
                            </div>
                            
                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive h-8 w-8" onClick={() => handleDeleteLineItem(item.id)}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        ))
                      ) : (
                        // Fallback for Legacy Data
                        <div className="flex items-center p-4 gap-4">
                          <div className="h-8 w-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">1</div>
                          <div className="flex-1">
                            <Input 
                              value={formData.service} 
                              onChange={(e) => setFormData({...formData, service: e.target.value})}
                              className="font-medium border-transparent hover:border-border px-0 h-auto py-1"
                            />
                            <p className="text-xs text-muted-foreground">Legacy Service Description</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                 <TabsContent value="inspection" className="mt-0">
                   {formData.dviItems && formData.dviItems.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="space-y-4">
                            <h3 className="font-bold text-sm uppercase tracking-wider text-red-500">Attention Needed</h3>
                            {formData.dviItems.filter(i => i.status === 'fail' || i.status === 'caution').map(item => (
                               <div key={item.id} className="border border-l-4 border-l-red-500 rounded-lg p-3 bg-red-500/5">
                                  <div className="flex justify-between items-start mb-2">
                                     <span className="font-bold">{item.category}</span>
                                     <Badge variant={item.status === 'fail' ? "destructive" : "outline"} className={item.status === 'caution' ? "text-yellow-600 border-yellow-400 bg-yellow-100" : ""}>
                                       {item.status.toUpperCase()}
                                     </Badge>
                                  </div>
                                  {item.notes && <p className="text-sm text-muted-foreground mb-2">{item.notes}</p>}
                                  {item.photo && (
                                     <div 
                                      className="flex items-center gap-2 text-xs text-blue-500 font-medium cursor-pointer hover:underline"
                                      onClick={() => setSelectedPhoto("https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&q=80&w=1000")}
                                     >
                                        <ImageIcon className="h-3 w-3" /> View Photo
                                     </div>
                                  )}
                               </div>
                            ))}
                            {formData.dviItems.filter(i => i.status === 'fail' || i.status === 'caution').length === 0 && (
                              <p className="text-sm text-muted-foreground italic">No issues found.</p>
                            )}
                         </div>
                         
                         <div className="space-y-4">
                            <h3 className="font-bold text-sm uppercase tracking-wider text-green-500">Passed Inspection</h3>
                            <div className="grid grid-cols-1 gap-2">
                               {formData.dviItems.filter(i => i.status === 'good').map(item => (
                                  <div key={item.id} className="flex items-center justify-between p-2 border rounded-lg bg-green-500/5 border-green-200">
                                     <span className="text-sm font-medium">{item.category}</span>
                                     <CheckCircle2 className="h-4 w-4 text-green-500" />
                                  </div>
                               ))}
                            </div>
                         </div>
                      </div>
                   ) : (
                      <div className="text-center py-12 text-muted-foreground">
                         <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-20" />
                         <p>No inspection data available yet.</p>
                      </div>
                   )}
                 </TabsContent>

                 <TabsContent value="history" className="mt-0">
                    <div className="space-y-4">
                      <div className="grid gap-2">
                         <Label>Internal Notes</Label>
                         <Textarea 
                           placeholder="Add notes for the team..." 
                           className="min-h-[100px]"
                           value={formData.notes || ""}
                           onChange={(e) => setFormData({...formData, notes: e.target.value})}
                          />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-muted-foreground uppercase">Activity Log</h4>
                        <div className="text-sm border-l-2 border-muted pl-4 space-y-4">
                          {/* Dynamic Log Entries based on status */}
                          {formData.status === 'completed' && (
                             <div className="relative">
                               <div className="absolute -left-[23px] top-1 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                               <p><strong>Job Completed</strong> by {formData.tech}</p>
                               <p className="text-xs text-muted-foreground">Just now</p>
                             </div>
                          )}
                          
                          {formData.dviStatus === 'submitted' && (
                             <div className="relative">
                               <div className="absolute -left-[23px] top-1 h-3 w-3 rounded-full bg-blue-500 border-2 border-background" />
                               <p><strong>DVI Submitted</strong> by {formData.tech}</p>
                               <p className="text-xs text-muted-foreground">10 mins ago</p>
                             </div>
                          )}

                          <div className="relative">
                             <div className="absolute -left-[23px] top-1 h-3 w-3 rounded-full bg-primary border-2 border-background" />
                             <p><strong>RO Created</strong> by John Manager</p>
                             <p className="text-xs text-muted-foreground">Today, 8:00 AM</p>
                          </div>
                        </div>
                      </div>
                    </div>
                 </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border bg-background flex justify-between items-center">
             <Button variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
               <XCircle className="h-4 w-4 mr-2" /> Cancel Job
             </Button>
             <div className="flex gap-2">
               <Button 
                 variant="outline" 
                 className="mr-2"
                 onClick={() => {
                    onOpenChange(false);
                    setLocation("/estimates");
                 }}
               >
                 Create or Modify Estimate
               </Button>
               <Button variant="outline" onClick={() => onOpenChange(false)}>Discard Changes</Button>
               <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
                 <Save className="h-4 w-4 mr-2" /> Save & Update
               </Button>
             </div>
          </div>

        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedPhoto} onOpenChange={(open) => !open && setSelectedPhoto(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-black/90 border-none">
           <div className="relative w-full h-full flex items-center justify-center">
             <img 
               src={selectedPhoto || ""} 
               alt="Inspection Finding" 
               className="max-w-full max-h-[80vh] object-contain"
             />
           </div>
           <div className="absolute top-4 right-4">
             <Button 
               size="icon" 
               variant="ghost" 
               className="text-white hover:bg-white/20 rounded-full"
               onClick={() => setSelectedPhoto(null)}
             >
               <XCircle className="h-6 w-6" />
             </Button>
           </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
