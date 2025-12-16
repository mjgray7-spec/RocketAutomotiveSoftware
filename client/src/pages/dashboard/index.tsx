import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MOCK_METRICS, WORKFLOW_STAGES } from "@/lib/constants";
import { EditRODialog } from "@/components/modals/EditRODialog";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  MoreHorizontal,
  Bot,
  User
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Mock Chart Data
const workloadData = [
  { name: 'Mon', active: 12, completed: 8 },
  { name: 'Tue', active: 15, completed: 10 },
  { name: 'Wed', active: 18, completed: 12 },
  { name: 'Thu', active: 14, completed: 15 },
  { name: 'Fri', active: 20, completed: 18 },
  { name: 'Sat', active: 10, completed: 6 },
];

const revenueData = [
  { name: 'Labor', value: 4500 },
  { name: 'Parts', value: 3200 },
  { name: 'Sublet', value: 800 },
  { name: 'Fees', value: 300 },
];
const COLORS = ['#FF0000', '#333333', '#666666', '#999999'];

// Mock RO Data for Dashboard List
const INITIAL_RECENT_ROS = [
  { id: "1024", customer: "John Smith", vehicle: "2018 Ford F-150", status: "wip", tech: "Mike T.", service: "Brake Job + Oil Change", due: "Today, 4:00 PM" },
  { id: "1025", customer: "Sarah Connor", vehicle: "2021 Tesla Model 3", status: "pending", tech: "Unassigned", service: "Tire Rotation", due: "Tomorrow, 10:00 AM" },
  { id: "1026", customer: "Bruce Wayne", vehicle: "2019 Lamborghini Urus", status: "estimate", tech: "Batman", service: "Engine Diagnostics", due: "Today, 5:00 PM" },
  { id: "1027", customer: "Clark Kent", vehicle: "2015 Honda Civic", status: "approval", tech: "Superman", service: "Transmission Fluid", due: "Yesterday", urgent: true },
  { id: "1028", customer: "Diana Prince", vehicle: "2020 Jeep Wrangler", status: "completed", tech: "Wonder Woman", service: "Alignment", due: "Done" },
];

export default function Dashboard() {
  const [recentROs, setRecentROs] = useState(INITIAL_RECENT_ROS);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedRO, setSelectedRO] = useState<any>(null);

  const handleJobClick = (ro: any) => {
    setSelectedRO(ro);
    setEditOpen(true);
  };

  const handleSaveRO = (updatedRO: any) => {
    setRecentROs(recentROs.map(ro => ro.id === updatedRO.id ? updatedRO : ro));
  };

  return (
    <Layout>
      <EditRODialog 
        open={editOpen} 
        onOpenChange={setEditOpen}
        roData={selectedRO}
        onSave={handleSaveRO}
      />
      
      <div className="flex flex-col gap-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, Shop Manager.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">Today</Button>
            <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" /> New RO
            </Button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {MOCK_METRICS.map((metric, i) => (
            <Card key={i} className="hover-elevate transition-all border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.label}
                </CardTitle>
                {metric.trend === 'up' ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-display font-bold">{metric.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className={metric.trend === 'up' ? "text-green-500" : "text-red-500"}>
                    {metric.change}
                  </span>{" "}
                  from yesterday
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Workflow & Active Jobs */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Workflow Pipeline */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Workflow Overview</CardTitle>
                <CardDescription>Current status of all active repair orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {WORKFLOW_STAGES.map((stage) => (
                    <div 
                      key={stage.id} 
                      className={`p-3 rounded-lg border flex flex-col items-center justify-center text-center gap-2 transition-colors hover:bg-opacity-80 cursor-pointer ${stage.color}`}
                    >
                      <span className="text-2xl font-bold font-display">{stage.count}</span>
                      <span className="text-xs font-medium leading-tight">{stage.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent ROs List */}
            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Repair Orders</CardTitle>
                  <CardDescription>Latest activity requiring attention</CardDescription>
                </div>
                <Button variant="ghost" size="sm">View All</Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {recentROs.map((ro) => (
                    <div 
                      key={ro.id} 
                      className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => handleJobClick(ro)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center font-bold text-muted-foreground">
                          #{ro.id}
                        </div>
                        <div>
                          <p className="font-medium">{ro.vehicle}</p>
                          <p className="text-sm text-muted-foreground">{ro.customer} • {ro.service}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground mr-2">
                           <User className="h-3 w-3" />
                           {ro.tech}
                        </div>
                        <Badge variant="outline" className={
                           ro.status === "wip" ? "bg-blue-50 text-blue-700 border-blue-200" :
                           ro.status === "pending" ? "bg-slate-50 text-slate-700 border-slate-200" :
                           ro.status === "completed" ? "bg-green-50 text-green-700 border-green-200" :
                           "bg-yellow-50 text-yellow-700 border-yellow-200"
                        }>
                          {ro.status === "wip" ? "Work in Progress" : 
                           ro.status === "pending" ? "Pending" :
                           ro.status === "completed" ? "Completed" : ro.status}
                        </Badge>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tech Workload Chart */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Technician Workload</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={workloadData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="name" 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(value) => `${value}`} 
                    />
                    <Tooltip 
                      cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    />
                    <Bar dataKey="active" name="Active Jobs" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="completed" name="Completed" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Alerts & AI */}
          <div className="space-y-6">
            
            {/* AI Insights */}
            <Card className="bg-gradient-to-br from-gray-900 to-black text-white border-none shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-20">
                <Bot className="h-24 w-24 text-primary" />
              </div>
              <CardHeader>
                <div className="flex items-center gap-2 text-primary mb-2">
                  <Bot className="h-5 w-5" />
                  <span className="text-sm font-bold uppercase tracking-wider">AI Insight</span>
                </div>
                <CardTitle className="text-xl">Inventory Low Stock Alert</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4 text-sm leading-relaxed">
                  Based on upcoming appointments for next week, you are likely to run out of <strong>5W-30 Synthetic Oil</strong> and <strong>Brake Pads (F-150)</strong>.
                </p>
                <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-white border-none">
                  Auto-Order Replacements
                </Button>
              </CardContent>
            </Card>

            {/* Alerts Panel */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  Action Required
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { title: "Parts Delay", desc: "Order #4421 delayed by 2 days", time: "2h ago", urgent: true },
                  { title: "Customer Approval", desc: "Smith RO #1024 approved estimate", time: "15m ago", urgent: false },
                  { title: "Tech Idle", desc: "Bay 3 has been idle for 45 mins", time: "Now", urgent: true },
                ].map((alert, i) => (
                  <div key={i} className="flex gap-3 items-start pb-3 border-b border-border last:border-0 last:pb-0">
                    <div className={`h-2 w-2 mt-2 rounded-full shrink-0 ${alert.urgent ? 'bg-red-500 animate-pulse' : 'bg-blue-500'}`} />
                    <div>
                      <p className="text-sm font-medium">{alert.title}</p>
                      <p className="text-xs text-muted-foreground">{alert.desc}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{alert.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Revenue Breakdown */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Daily Revenue</CardTitle>
              </CardHeader>
              <CardContent className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={revenueData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {revenueData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 text-xs mt-2">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-primary" /> Labor
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-gray-800" /> Parts
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </Layout>
  );
}
