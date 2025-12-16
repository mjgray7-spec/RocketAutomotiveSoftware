import { useState, useMemo, useEffect } from "react";
import { useData } from "@/lib/DataContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  Camera, 
  Play, 
  Pause,
  ChevronRight,
  LogOut,
  Wrench
} from "lucide-react";
import { Link } from "wouter";

// Helper to format seconds to HH:MM:SS
const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export default function TechnicianDashboard() {
  const { repairOrders, toggleTimer, updateTimer } = useData();
  
  const myJobs = useMemo(() => {
    return repairOrders
      .filter(ro => ro.tech === "Mike T." && ro.status !== "completed")
      .sort((a, b) => (a.due || "").localeCompare(b.due || ""));
  }, [repairOrders]);

  const [activeJobId, setActiveJobId] = useState<string | null>(
    myJobs.length > 0 ? myJobs[0].id : null
  );

  // Sync active job if list changes
  useEffect(() => {
    if (!activeJobId && myJobs.length > 0) setActiveJobId(myJobs[0].id);
  }, [myJobs]);

  const activeJob = myJobs.find(j => j.id === activeJobId) || myJobs[0];
  const upNextJobs = myJobs.filter(j => j.id !== activeJob?.id);

  // Timer Tick Effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeJob?.timer?.running) {
      interval = setInterval(() => {
        // Just increment for visual effect in mockup, in real app sync with server time
        updateTimer(activeJob.id, (activeJob.timer?.elapsed || 0) + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeJob?.timer?.running, activeJob?.id]);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center font-bold text-white font-display">
            MT
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Mike Technician</h1>
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${activeJob?.timer?.running ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
              {activeJob?.timer?.running ? "Clocked In" : "Idle"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
             <Link href="/">Exit Tech Mode</Link>
          </Button>
        </div>
      </header>

      <main className="p-4 max-w-4xl mx-auto space-y-6">
        
        {/* Active Job Card */}
        <section>
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Current Job</h2>
          
          {activeJob ? (
            <Card className={`border-primary/50 shadow-lg shadow-primary/10 relative overflow-hidden transition-all ${activeJob.timer?.running ? "ring-2 ring-green-500/50" : ""}`}>
              {activeJob.timer?.running && (
                 <div className="absolute top-0 left-0 w-full h-1 bg-green-500 animate-pulse" />
              )}
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="space-y-4 flex-1">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <Badge variant="outline" className="bg-background">RO #{activeJob.id}</Badge>
                        <Badge className="bg-blue-500 hover:bg-blue-600">
                          {activeJob.status === 'wip' ? 'In Progress' : activeJob.status}
                        </Badge>
                        {activeJob.urgent && <Badge variant="destructive">Urgent</Badge>}
                      </div>
                      <h3 className="text-3xl font-display font-bold">{activeJob.vehicle}</h3>
                      <p className="text-lg text-muted-foreground">{activeJob.service}</p>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Promised: <strong>{activeJob.due}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>Bay: <strong>{activeJob.bay || "Unassigned"}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 bg-muted/30 p-3 rounded-lg border border-border/50">
                       <div className="text-2xl font-mono font-bold w-32">
                         {formatTime(activeJob.timer?.elapsed || 0)}
                       </div>
                       <div className="text-xs text-muted-foreground">
                         Billable Time
                       </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 justify-center min-w-[200px]">
                    <Button 
                      size="lg" 
                      className={`h-14 text-lg gap-2 ${activeJob.timer?.running ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"} text-white`}
                      onClick={() => toggleTimer(activeJob.id)}
                    >
                      {activeJob.timer?.running ? (
                        <> <Pause className="h-6 w-6 fill-current" /> Stop Timer </>
                      ) : (
                        <> <Play className="h-6 w-6 fill-current" /> Start Timer </>
                      )}
                    </Button>
                    
                    <div className="grid grid-cols-2 gap-2">
                        <Button size="lg" variant="secondary" className="h-12 text-sm gap-2" asChild>
                        <Link href={`/technician/dvi/${activeJob.id}`}>
                            <Camera className="h-4 w-4" /> DVI
                        </Link>
                        </Button>
                        <Button size="lg" variant="secondary" className="h-12 text-sm gap-2 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20" asChild>
                        <Link href={`/technician/job/${activeJob.id}`}>
                            <Wrench className="h-4 w-4" /> Job
                        </Link>
                        </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border/50 bg-muted/10 border-dashed">
              <CardContent className="p-12 flex flex-col items-center justify-center text-center text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mb-4 opacity-20" />
                <h3 className="text-lg font-bold">All Caught Up!</h3>
                <p>No active jobs assigned to you.</p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Up Next */}
        {upNextJobs.length > 0 && (
          <section>
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Up Next</h2>
            <div className="space-y-3">
              {upNextJobs.map((job) => (
                <Card 
                  key={job.id} 
                  className="border-border/50 bg-muted/20 hover:bg-card transition-colors cursor-pointer group hover:border-primary/20"
                  onClick={() => setActiveJobId(job.id)}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center font-bold text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        {job.id.slice(-2)}
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">{job.vehicle}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{job.service}</span>
                          <span className="text-xs px-1.5 py-0.5 rounded bg-background border border-border">Due: {job.due}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="group-hover:translate-x-1 transition-transform">
                      <Play className="h-5 w-5 text-muted-foreground group-hover:text-primary fill-current" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
