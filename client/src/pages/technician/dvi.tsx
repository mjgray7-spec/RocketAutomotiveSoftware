import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useData, InspectionItem } from "@/lib/DataContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { 
  ChevronLeft, 
  Camera, 
  Mic, 
  Check, 
  AlertTriangle, 
  XOctagon,
  ImagePlus,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Upload
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const INSPECTION_ITEMS: InspectionItem[] = [
  { id: 1, category: "Wiper Blades", status: "good" },
  { id: 2, category: "Exterior Lights", status: "good" },
  { id: 3, category: "Horn Operation", status: "good" },
  { id: 4, category: "Air Filter", status: "caution", notes: "Showing signs of debris", photo: true },
  { id: 5, category: "Cabin Filter", status: "fail", notes: "Completely clogged", photo: true },
  { id: 6, category: "Brake Fluid", status: "good" },
  { id: 7, category: "Front Brakes", status: "fail", notes: "2mm remaining - Metal on metal soon", photo: true },
  { id: 8, category: "Rear Brakes", status: "good" },
  { id: 9, category: "Tires (Front)", status: "caution", notes: "4/32 tread depth" },
  { id: 10, category: "Tires (Rear)", status: "good" },
];

export default function DVI({ params }: { params: { id: string } }) {
  const { repairOrders, updateRepairOrder } = useData();
  const ro = repairOrders.find(r => r.id === params.id);
  const [items, setItems] = useState<InspectionItem[]>(INSPECTION_ITEMS);
  const [submitting, setSubmitting] = useState(false);
  const [, setLocation] = useLocation();

  // Dialog States
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [activeItemId, setActiveItemId] = useState<number | null>(null);

  // Mock Photo/Voice States
  const [recording, setRecording] = useState<number | null>(null); // item ID
  const [uploading, setUploading] = useState(false);

  const setStatus = (id: number, status: string) => {
    setItems(items.map(item => item.id === id ? { ...item, status } : item));
  };

  const initiatePhotoUpload = (id: number) => {
    setActiveItemId(id);
    setPhotoDialogOpen(true);
  };

  const confirmPhotoUpload = () => {
    if (activeItemId === null) return;
    
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setItems(items.map(item => item.id === activeItemId ? { ...item, photo: true } : item));
      setPhotoDialogOpen(false);
      setActiveItemId(null);
      toast({ title: "Photo Attached", description: "Image successfully added to inspection report." });
    }, 1000);
  };

  const handleVoice = (id: number) => {
    if (recording === id) {
      setRecording(null);
      // Simulate transcription
      setTimeout(() => {
         toast({ title: "Voice Note Transcribed", description: "Audio converted to text: 'Technician noted excessive wear...'" });
      }, 500);
    } else {
      setRecording(id);
    }
  };

  const handleSubmit = () => {
    if (!ro) return;
    setSubmitting(true);
    
    setTimeout(() => {
      updateRepairOrder({ ...ro, dviStatus: "submitted", dviItems: items });
      setSubmitting(false);
      toast({ title: "DVI Submitted", description: "Inspection report sent to advisor." });
      setLocation("/technician");
    }, 1500);
  };

  const progress = Math.round((items.filter(i => i.status).length / items.length) * 100);

  if (!ro) return <div>Job not found</div>;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col">
      {/* DVI Header */}
      <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/technician"><ChevronLeft className="h-6 w-6" /></Link>
          </Button>
          <div>
            <h1 className="font-bold text-lg leading-none">Inspection (DVI)</h1>
            <span className="text-xs text-muted-foreground">{ro.vehicle} • RO #{ro.id}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs text-muted-foreground">Overall Health</div>
            <div className="text-sm font-bold text-orange-500">Attention Needed</div>
          </div>
          <Button 
            className="bg-primary hover:bg-primary/90 text-white min-w-[100px]"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (
              <>
                Submit
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="h-1 bg-muted w-full">
        <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <main className="flex-1 p-4 max-w-3xl mx-auto w-full space-y-6 pb-24">
        
        {/* Inspection List */}
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id} className={`border-l-4 transition-all ${
              item.status === 'good' ? 'border-l-green-500' :
              item.status === 'caution' ? 'border-l-yellow-500' :
              item.status === 'fail' ? 'border-l-red-500' : 'border-l-gray-300'
            }`}>
              <CardContent className="p-4">
                <div className="flex flex-col gap-4">
                  {/* Item Header */}
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg">{item.category}</h3>
                    
                    {/* Status Toggles */}
                    <div className="flex bg-muted/50 rounded-lg p-1 gap-1">
                      <button 
                        onClick={() => setStatus(item.id, 'good')}
                        className={`p-2 rounded-md transition-all ${item.status === 'good' ? 'bg-green-500 text-white shadow-sm' : 'hover:bg-background text-muted-foreground'}`}
                      >
                        <Check className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => setStatus(item.id, 'caution')}
                        className={`p-2 rounded-md transition-all ${item.status === 'caution' ? 'bg-yellow-500 text-white shadow-sm' : 'hover:bg-background text-muted-foreground'}`}
                      >
                        <AlertTriangle className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => setStatus(item.id, 'fail')}
                        className={`p-2 rounded-md transition-all ${item.status === 'fail' ? 'bg-red-500 text-white shadow-sm' : 'hover:bg-background text-muted-foreground'}`}
                      >
                        <XOctagon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Contextual Inputs (Only if status is not default) */}
                  {(item.status === 'caution' || item.status === 'fail') && (
                    <div className="animate-in fade-in slide-in-from-top-2 space-y-3 bg-muted/20 p-3 rounded-lg">
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          className="flex-1 gap-2 h-10 border-dashed"
                          onClick={() => initiatePhotoUpload(item.id)}
                        >
                          <Camera className="h-4 w-4" />
                          Add Photo
                        </Button>
                        
                        <Button 
                          variant={recording === item.id ? "destructive" : "outline"}
                          className={`flex-1 gap-2 h-10 border-dashed ${recording === item.id ? "animate-pulse" : ""}`}
                          onClick={() => handleVoice(item.id)}
                        >
                          <Mic className="h-4 w-4" /> 
                          {recording === item.id ? "Stop Recording" : "Voice Note"}
                        </Button>
                      </div>
                      
                      <div className="relative">
                        <Textarea 
                          placeholder={`Describe the ${item.category} issue...`} 
                          className="min-h-[60px] resize-none bg-background pr-10"
                          defaultValue={item.notes}
                        />
                        {recording === item.id && (
                          <div className="absolute right-2 bottom-2 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                        )}
                      </div>
                      
                      {/* Mock Photos */}
                      {item.photo && (
                        <div className="flex gap-2 overflow-x-auto pb-1">
                          <div className="h-20 w-20 bg-gray-800 rounded-md flex items-center justify-center relative shrink-0 group cursor-pointer overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=200&h=200" alt="Part" className="object-cover w-full h-full opacity-60 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute top-1 right-1 h-4 w-4 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                              <Check className="h-2 w-2 text-white" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {/* Mock Photo Upload Dialog */}
      <Dialog open={photoDialogOpen} onOpenChange={setPhotoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Inspection Photo</DialogTitle>
            <DialogDescription>Select an image from your device or take a new photo.</DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 py-4">
             <div className="border-2 border-dashed border-border rounded-lg h-32 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors" onClick={confirmPhotoUpload}>
                <Camera className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm font-medium">Take Photo</span>
             </div>
             <div className="border-2 border-dashed border-border rounded-lg h-32 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors" onClick={confirmPhotoUpload}>
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm font-medium">Upload File</span>
             </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPhotoDialogOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
