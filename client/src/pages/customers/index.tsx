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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  Phone, 
  Mail, 
  Car,
  History,
  MessageSquare
} from "lucide-react";

// Mock Customer Data
const CUSTOMERS = [
  { id: 1, name: "John Smith", email: "john.smith@example.com", phone: "(555) 123-4567", vehicles: ["2018 Ford F-150", "2020 Honda Accord"], lastVisit: "2023-10-15", totalSpend: "$2,450", status: "Active" },
  { id: 2, name: "Sarah Connor", email: "sarah.c@skynet.net", phone: "(555) 987-6543", vehicles: ["2021 Tesla Model 3"], lastVisit: "2023-11-02", totalSpend: "$850", status: "Active" },
  { id: 3, name: "Bruce Wayne", email: "bruce@wayneent.com", phone: "(555) BAT-MAN1", vehicles: ["2019 Lamborghini Urus", "1960 Batmobile"], lastVisit: "2023-09-20", totalSpend: "$15,200", status: "VIP" },
  { id: 4, name: "Clark Kent", email: "ckent@dailyplanet.com", phone: "(555) SUPER-01", vehicles: ["2015 Honda Civic"], lastVisit: "2023-11-10", totalSpend: "$350", status: "Active" },
  { id: 5, name: "Diana Prince", email: "diana@themyscira.gov", phone: "(555) WONDER-1", vehicles: ["2020 Jeep Wrangler"], lastVisit: "2023-08-15", totalSpend: "$1,200", status: "Active" },
  { id: 6, name: "Tony Stark", email: "tony@starkindustries.com", phone: "(555) IRON-MAN", vehicles: ["2022 Audi R8", "1967 Shelby Cobra"], lastVisit: "2023-11-12", totalSpend: "$25,400", status: "VIP" },
  { id: 7, name: "Peter Parker", email: "spidey@queens.ny", phone: "(555) WEB-SLNG", vehicles: ["2010 Toyota Prius"], lastVisit: "2023-05-01", totalSpend: "$150", status: "Inactive" },
];

export default function Customers() {
  return (
    <Layout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Customers & Vehicles</h1>
            <p className="text-muted-foreground">Manage customer profiles, vehicle history, and communications.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" /> Filter
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" /> Add Customer
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name, phone, email, VIN, or license plate..." 
            className="pl-9 bg-card border-border/50 h-12 text-lg"
          />
        </div>

        {/* Customer Table */}
        <div className="border border-border/50 rounded-xl overflow-hidden bg-card shadow-sm">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[300px]">Customer</TableHead>
                <TableHead>Vehicles</TableHead>
                <TableHead>Last Visit</TableHead>
                <TableHead>Total Spend</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {CUSTOMERS.map((customer) => (
                <TableRow key={customer.id} className="hover:bg-muted/30 group cursor-pointer transition-colors">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-border">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {customer.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-bold">{customer.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {customer.phone}</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {customer.vehicles.map((v, i) => (
                        <div key={i} className="flex items-center gap-1 text-sm">
                          <Car className="h-3 w-3 text-muted-foreground" />
                          {v}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{customer.lastVisit}</div>
                    <div className="text-xs text-muted-foreground">30 days ago</div>
                  </TableCell>
                  <TableCell className="font-mono font-medium">
                    {customer.totalSpend}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      customer.status === "VIP" ? "bg-purple-500/10 text-purple-600 border-purple-200" :
                      customer.status === "Inactive" ? "bg-slate-500/10 text-slate-600 border-slate-200" :
                      "bg-green-500/10 text-green-600 border-green-200"
                    }>
                      {customer.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" title="Call">
                        <Phone className="h-4 w-4 text-muted-foreground hover:text-primary" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Message">
                        <MessageSquare className="h-4 w-4 text-muted-foreground hover:text-primary" />
                      </Button>
                      <Button variant="ghost" size="icon" title="History">
                        <History className="h-4 w-4 text-muted-foreground hover:text-primary" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
}
