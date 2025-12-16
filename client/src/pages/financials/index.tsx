import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Search, 
  Filter, 
  Download,
  CreditCard,
  Wallet,
  ArrowUpRight,
  MoreHorizontal
} from "lucide-react";

const INVOICES = [
  { id: "INV-2024-001", customer: "John Smith", date: "Oct 24, 2023", amount: "$450.00", status: "Paid", method: "Credit Card" },
  { id: "INV-2024-002", customer: "Sarah Connor", date: "Oct 24, 2023", amount: "$125.00", status: "Paid", method: "Cash" },
  { id: "INV-2024-003", customer: "Bruce Wayne", date: "Oct 23, 2023", amount: "$2,450.00", status: "Pending", method: "Fleet Account" },
  { id: "INV-2024-004", customer: "Clark Kent", date: "Oct 23, 2023", amount: "$85.00", status: "Paid", method: "Debit Card" },
  { id: "INV-2024-005", customer: "Diana Prince", date: "Oct 22, 2023", amount: "$1,200.00", status: "Overdue", method: "Credit Card" },
];

export default function Financials() {
  return (
    <Layout>
       <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Financials</h1>
            <p className="text-muted-foreground">Invoicing, payments, and accounting integrations.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" /> Export Report
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
              <CreditCard className="mr-2 h-4 w-4" /> Process Payment
            </Button>
          </div>
        </div>

        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover-elevate transition-all border-border/50 bg-gradient-to-br from-card to-muted/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue (MTD)</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-display">$42,500.00</div>
              <p className="text-xs text-green-500 flex items-center mt-1">
                <ArrowUpRight className="h-3 w-3 mr-1" /> +12% from last month
              </p>
            </CardContent>
          </Card>
          <Card className="hover-elevate transition-all border-border/50 bg-gradient-to-br from-card to-muted/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Outstanding Invoices</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-display text-orange-500">$3,250.00</div>
              <p className="text-xs text-muted-foreground mt-1">
                5 invoices pending payment
              </p>
            </CardContent>
          </Card>
           <Card className="hover-elevate transition-all border-border/50 bg-gradient-to-br from-card to-muted/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Net Profit (Est.)</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-display text-green-500">$18,400.00</div>
              <p className="text-xs text-muted-foreground mt-1">
                43% margin
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Integration Status */}
        <div className="bg-muted/20 border border-border/50 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="h-10 w-10 bg-green-500/10 rounded-lg flex items-center justify-center font-bold text-green-600">QB</div>
             <div>
               <h3 className="font-bold text-sm">QuickBooks Online</h3>
               <p className="text-xs text-muted-foreground">Sync Status: Connected • Last sync 5 mins ago</p>
             </div>
          </div>
          <Button variant="outline" size="sm">Manage Sync</Button>
        </div>

        {/* Invoices Table */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
            <CardDescription>All billing activity for the current period</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search invoices..." className="pl-9" />
              </div>
              <Button variant="ghost" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {INVOICES.map((inv) => (
                  <TableRow key={inv.id} className="hover:bg-muted/30">
                    <TableCell className="font-mono font-medium text-xs">{inv.id}</TableCell>
                    <TableCell className="font-medium">{inv.customer}</TableCell>
                    <TableCell>{inv.date}</TableCell>
                    <TableCell>{inv.method}</TableCell>
                    <TableCell className="font-bold">{inv.amount}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        inv.status === "Paid" ? "bg-green-500/10 text-green-600 border-green-200" :
                        inv.status === "Pending" ? "bg-orange-500/10 text-orange-600 border-orange-200" :
                        "bg-red-500/10 text-red-600 border-red-200"
                      }>
                        {inv.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
