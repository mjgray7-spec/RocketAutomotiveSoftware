import { useState, useEffect } from "react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  Phone, 
  Mail, 
  Car,
  History,
  MessageSquare,
  Loader2
} from "lucide-react";
import type { Customer, Vehicle } from "@shared/schema";

interface CustomerWithVehicles {
  customer: Customer;
  vehicles: Vehicle[];
}

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerVehicles, setCustomerVehicles] = useState<Record<number, Vehicle[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all customers
        const customersRes = await fetch("/api/customers");
        const customersData: Customer[] = await customersRes.json();
        setCustomers(customersData);

        // Fetch vehicles for each customer
        const vehiclesMap: Record<number, Vehicle[]> = {};
        await Promise.all(
          customersData.map(async (customer) => {
            const vehiclesRes = await fetch(`/api/vehicles/${customer.id}`);
            const vehiclesData: Vehicle[] = await vehiclesRes.json();
            vehiclesMap[customer.id] = vehiclesData;
          })
        );
        setCustomerVehicles(vehiclesMap);
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter customers based on search term
  const filteredCustomers = customers.filter((customer) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const vehicles = customerVehicles[customer.id] || [];
    
    return (
      customer.name.toLowerCase().includes(term) ||
      customer.phone?.toLowerCase().includes(term) ||
      customer.email?.toLowerCase().includes(term) ||
      vehicles.some(v => 
        v.vin?.toLowerCase().includes(term) ||
        v.licensePlate?.toLowerCase().includes(term) ||
        `${v.year} ${v.make} ${v.model}`.toLowerCase().includes(term)
      )
    );
  });

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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="input-search-customers"
          />
        </div>

        {/* Customer Table */}
        <div className="border border-border/50 rounded-xl overflow-hidden bg-card shadow-sm">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[300px]">Customer</TableHead>
                <TableHead>Vehicles</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mt-2">Loading customers...</p>
                  </TableCell>
                </TableRow>
              ) : filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    {searchTerm ? "No customers found matching your search" : "No customers found"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer) => {
                  const vehicles = customerVehicles[customer.id] || [];
                  return (
                    <TableRow key={customer.id} className="hover:bg-muted/30 group cursor-pointer transition-colors" data-testid={`row-customer-${customer.id}`}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-border">
                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                              {customer.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-bold" data-testid={`text-customer-name-${customer.id}`}>{customer.name}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                              {customer.phone && (
                                <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {customer.phone}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {vehicles.length > 0 ? (
                            vehicles.map((v) => (
                              <div key={v.id} className="flex items-center gap-1 text-sm" data-testid={`text-vehicle-${v.id}`}>
                                <Car className="h-3 w-3 text-muted-foreground" />
                                {v.year} {v.make} {v.model}
                              </div>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground">No vehicles</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {customer.email ? (
                          <div className="text-sm flex items-center gap-1">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {customer.email}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
                          Active
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
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
}
