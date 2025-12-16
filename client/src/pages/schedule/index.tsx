import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  MoreHorizontal,
  Plus,
  User,
  Wrench,
  Filter
} from "lucide-react";
import { addDays, format, startOfWeek } from "date-fns";

// Mock Appointments
const APPOINTMENTS = [
  { id: 1, customer: "John Smith", vehicle: "2018 Ford F-150", service: "Brake Job", time: "08:00 AM", duration: 2, tech: "Mike T.", color: "bg-blue-500/10 border-blue-200 text-blue-700" },
  { id: 2, customer: "Sarah Connor", vehicle: "2021 Tesla Model 3", service: "Tire Rotation", time: "09:30 AM", duration: 1, tech: "Unassigned", color: "bg-orange-500/10 border-orange-200 text-orange-700" },
  { id: 3, customer: "Bruce Wayne", vehicle: "Lamborghini Urus", service: "Engine Diagnostics", time: "11:00 AM", duration: 3, tech: "Batman", color: "bg-purple-500/10 border-purple-200 text-purple-700" },
  { id: 4, customer: "Clark Kent", vehicle: "Honda Civic", service: "Oil Change", time: "02:00 PM", duration: 1, tech: "Superman", color: "bg-green-500/10 border-green-200 text-green-700" },
];

const BAYS = ["Bay 1", "Bay 2", "Bay 3", "Bay 4", "Alignment Rack", "Quick Lube"];

const HOURS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

export default function Schedule() {
  const today = new Date();

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-8rem)] gap-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Schedule</h1>
            <p className="text-muted-foreground">Manage appointments and bay utilization.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-card border border-border rounded-lg p-1">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="px-4 font-medium text-sm">
                {format(today, "MMMM d, yyyy")}
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" /> Filter
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" /> New Appointment
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <Card className="flex-1 border-border/50 overflow-hidden flex flex-col">
          {/* Header Row (Bays) */}
          <div className="flex border-b border-border">
            <div className="w-20 shrink-0 border-r border-border bg-muted/30 p-3 font-medium text-xs text-muted-foreground flex items-center justify-center">
              TIME
            </div>
            {BAYS.map((bay) => (
              <div key={bay} className="flex-1 p-3 text-center font-bold text-sm border-r border-border last:border-0 bg-muted/10">
                {bay}
              </div>
            ))}
          </div>

          {/* Time Slots */}
          <div className="flex-1 overflow-y-auto">
            {HOURS.map((hour) => (
              <div key={hour} className="flex border-b border-border/50 min-h-[100px] relative group">
                {/* Time Label */}
                <div className="w-20 shrink-0 border-r border-border bg-muted/10 p-2 text-xs text-muted-foreground text-center pt-4">
                  {hour}
                </div>

                {/* Bay Slots */}
                {BAYS.map((bay, index) => {
                  // Mock putting appointments in random slots for visual demo
                  // In a real app, this would be calculated based on start time and bay assignment
                  const appointment = APPOINTMENTS.find(app => {
                    const appHour = parseInt(app.time.split(':')[0]);
                    const isPM = app.time.includes('PM') && appHour !== 12;
                    const hour24 = isPM ? appHour + 12 : appHour;
                    const slotHour = parseInt(hour.split(':')[0]);
                    return hour24 === slotHour && (index % 3 === app.id % 3); // simplistic distribution
                  });

                  return (
                    <div key={`${hour}-${bay}`} className="flex-1 border-r border-border/50 last:border-0 p-1 relative hover:bg-muted/5 transition-colors">
                      {appointment && (
                        <div className={`absolute top-1 left-1 right-1 bottom-1 rounded-md p-2 border ${appointment.color} shadow-sm hover:shadow-md transition-all cursor-pointer z-10 flex flex-col justify-between`}>
                          <div>
                            <div className="flex justify-between items-start">
                              <span className="font-bold text-xs truncate">{appointment.customer}</span>
                              <MoreHorizontal className="h-3 w-3 opacity-50" />
                            </div>
                            <div className="text-[10px] opacity-80 truncate">{appointment.vehicle}</div>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] font-medium">
                            <Wrench className="h-3 w-3" />
                            {appointment.service}
                          </div>
                        </div>
                      )}
                      
                      {/* Empty Slot Placeholder (Hover) */}
                      {!appointment && (
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center pointer-events-none">
                          <Plus className="h-4 w-4 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Layout>
  );
}
