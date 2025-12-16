import { Layout } from "@/components/layout/Layout";
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
  LogOut
} from "lucide-react";
import { Link } from "wouter";

const MY_JOBS = [
  { id: "1024", vehicle: "2018 Ford F-150", service: "Brake Job + Oil Change", status: "In Progress", promised: "4:00 PM", priority: "High", progress: 45 },
  { id: "1029", vehicle: "2022 Audi R8", service: "Electrical Diag", status: "Pending", promised: "Tomorrow", priority: "Normal", progress: 0 },
];

export default function TechnicianDashboard() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Tech Header - Simplified for Tablet */}
      <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center font-bold text-white font-display">
            MT
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Mike Technician</h1>
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Clocked In (07:58 AM)
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:block text-right">
            <div className="text-xs text-muted-foreground">Efficiency</div>
            <div className="font-bold text-green-500">112%</div>
          </div>
          <Button variant="outline" size="sm" asChild>
             <Link href="/">Exit Tech Mode</Link>
          </Button>
        </div>
      </header>

      <main className="p-4 max-w-4xl mx-auto space-y-6">
        
        {/* Active Job Card */}
        <section>
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Current Job</h2>
          <Card className="border-primary/50 shadow-lg shadow-primary/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="space-y-4 flex-1">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <Badge variant="outline" className="bg-background">RO #1024</Badge>
                      <Badge className="bg-blue-500 hover:bg-blue-600">In Progress</Badge>
                    </div>
                    <h3 className="text-3xl font-display font-bold">2018 Ford F-150</h3>
                    <p className="text-lg text-muted-foreground">Brake Job (Front) • Synthetic Oil Change</p>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Promised: <strong>4:00 PM</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>Bay: <strong>3</strong></span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span>Job Progress</span>
                      <span>45%</span>
                    </div>
                    <Progress value={45} className="h-3" />
                  </div>
                </div>

                <div className="flex flex-col gap-3 justify-center min-w-[200px]">
                  <Button size="lg" className="h-14 text-lg bg-red-500 hover:bg-red-600 text-white gap-2">
                    <Pause className="h-6 w-6 fill-current" /> Stop Timer
                  </Button>
                  <Button size="lg" variant="secondary" className="h-14 text-lg gap-2" asChild>
                    <Link href="/technician/dvi/1024">
                       <Camera className="h-6 w-6" /> Resume DVI
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Up Next */}
        <section>
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Up Next</h2>
          <div className="space-y-3">
            {MY_JOBS.slice(1).map((job) => (
              <Card key={job.id} className="border-border/50 bg-muted/20 hover:bg-card transition-colors">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center font-bold text-muted-foreground">
                      {job.id.slice(-2)}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{job.vehicle}</h4>
                      <p className="text-sm text-muted-foreground">{job.service}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <ChevronRight className="h-6 w-6 text-muted-foreground" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="h-24 flex flex-col gap-2 border-dashed">
            <AlertCircle className="h-8 w-8 text-orange-500" />
            <span>Report Issue</span>
          </Button>
           <Button variant="outline" className="h-24 flex flex-col gap-2 border-dashed">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
            <span>Mark All Complete</span>
          </Button>
        </section>
      </main>
    </div>
  );
}
