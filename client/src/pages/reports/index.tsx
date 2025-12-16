import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { Download, Calendar, Filter } from "lucide-react";

const REVENUE_DATA = [
  { name: 'Jan', revenue: 45000, labor: 25000, parts: 20000 },
  { name: 'Feb', revenue: 52000, labor: 28000, parts: 24000 },
  { name: 'Mar', revenue: 48000, labor: 26000, parts: 22000 },
  { name: 'Apr', revenue: 61000, labor: 35000, parts: 26000 },
  { name: 'May', revenue: 55000, labor: 30000, parts: 25000 },
  { name: 'Jun', revenue: 67000, labor: 38000, parts: 29000 },
];

const TECH_EFFICIENCY = [
  { name: 'Mike T.', efficiency: 110, billable: 42 },
  { name: 'Sarah C.', efficiency: 95, billable: 38 },
  { name: 'Bruce W.', efficiency: 125, billable: 45 },
  { name: 'Clark K.', efficiency: 88, billable: 35 },
];

export default function Reports() {
  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Reports & Analytics</h1>
            <p className="text-muted-foreground">Financial performance, technician efficiency, and operational metrics.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" /> This Month
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
          </div>
        </div>

        {/* Revenue Chart */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Gross Revenue (6 Months)</CardTitle>
            <CardDescription>Breakdown of Labor vs. Parts revenue</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_DATA}>
                <defs>
                  <linearGradient id="colorLabor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorParts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#333" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#333" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="labor" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorLabor)" strokeWidth={2} />
                <Area type="monotone" dataKey="parts" stroke="#333" fillOpacity={1} fill="url(#colorParts)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Secondary Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Technician Efficiency (%)</CardTitle>
              <CardDescription>Billable hours vs. actual hours worked</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={TECH_EFFICIENCY} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} domain={[0, 150]} />
                  <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} width={100} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
                  <Bar dataKey="efficiency" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-border/50">
             <CardHeader>
              <CardTitle>Key Performance Indicators</CardTitle>
              <CardDescription>Month-over-month comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  { label: "Effective Labor Rate", value: "$145.00", change: "+$5.00", up: true },
                  { label: "Parts Profit Margin", value: "38%", change: "+2%", up: true },
                  { label: "Car Count", value: "142", change: "-8", up: false },
                  { label: "Average RO Value", value: "$582.00", change: "+$45.00", up: true },
                ].map((kpi, i) => (
                  <div key={i} className="flex items-center justify-between pb-4 border-b border-border last:border-0 last:pb-0">
                    <span className="text-sm font-medium text-muted-foreground">{kpi.label}</span>
                    <div className="text-right">
                      <div className="font-bold text-lg">{kpi.value}</div>
                      <div className={`text-xs ${kpi.up ? "text-green-500" : "text-red-500"}`}>{kpi.change}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
