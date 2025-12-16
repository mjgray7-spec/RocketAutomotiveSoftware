import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  Camera, 
  Mic, 
  Check, 
  AlertTriangle, 
  XOctagon,
  ImagePlus,
  ArrowRight
} from "lucide-react";

const INSPECTION_ITEMS = [
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

export default function DVI() {
  const [items, setItems] = useState(INSPECTION_ITEMS);
  const [activeItem, setActiveItem] = useState<number | null>(null);

  const setStatus = (id: number, status: string) => {
    setItems(items.map(item => item.id === id ? { ...item, status } : item));
  };

  const progress = Math.round((items.filter(i => i.status).length / items.length) * 100);

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
            <span className="text-xs text-muted-foreground">2018 Ford F-150 • RO #1024</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs text-muted-foreground">Overall Health</div>
            <div className="text-sm font-bold text-orange-500">Attention Needed</div>
          </div>
          <Button className="bg-primary hover:bg-primary/90 text-white">
            Submit
            <ArrowRight className="ml-2 h-4 w-4" />
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
                        <Button variant="outline" className="flex-1 gap-2 h-10 border-dashed">
                          <Camera className="h-4 w-4" /> Add Photo
                        </Button>
                        <Button variant="outline" className="flex-1 gap-2 h-10 border-dashed">
                          <Mic className="h-4 w-4" /> Voice Note
                        </Button>
                      </div>
                      <Textarea 
                        placeholder={`Describe the ${item.category} issue...`} 
                        className="min-h-[60px] resize-none bg-background"
                        defaultValue={item.notes}
                      />
                      
                      {/* Mock Photos */}
                      {item.photo && (
                        <div className="flex gap-2 overflow-x-auto pb-1">
                          <div className="h-20 w-20 bg-gray-800 rounded-md flex items-center justify-center relative shrink-0">
                            <ImagePlus className="h-6 w-6 text-gray-500" />
                            <div className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
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

      {/* Floating Action Button (Mobile) */}
      <div className="fixed bottom-6 right-6 md:hidden">
         <Button size="icon" className="h-14 w-14 rounded-full shadow-xl bg-primary text-white">
           <Mic className="h-6 w-6" />
         </Button>
      </div>
    </div>
  );
}
