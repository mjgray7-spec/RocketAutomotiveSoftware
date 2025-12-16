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
import { 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  Package, 
  AlertTriangle,
  RefreshCcw,
  ShoppingCart
} from "lucide-react";

const INVENTORY = [
  { id: "PF-123", name: "Oil Filter (Ford/Mazda)", sku: "OF-9982", brand: "Motorcraft", stock: 12, min: 5, price: "$8.50", status: "In Stock" },
  { id: "BP-456", name: "Ceramic Brake Pads (Front)", sku: "BP-2211", brand: "Akebono", stock: 2, min: 4, price: "$45.00", status: "Low Stock" },
  { id: "AF-789", name: "Cabin Air Filter", sku: "CAF-1100", brand: "Wix", stock: 8, min: 3, price: "$12.00", status: "In Stock" },
  { id: "SP-001", name: "Spark Plug (Iridium)", sku: "SP-NGK-1", brand: "NGK", stock: 24, min: 16, price: "$14.00", status: "In Stock" },
  { id: "OL-530", name: "5W-30 Synthetic Oil (Qt)", sku: "OIL-530", brand: "Mobil 1", stock: 0, min: 20, price: "$9.00", status: "Out of Stock" },
];

export default function Inventory() {
  return (
    <Layout>
       <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Parts & Inventory</h1>
            <p className="text-muted-foreground">Track stock levels, manage vendors, and automate ordering.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <ShoppingCart className="mr-2 h-4 w-4" /> Cart (3)
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" /> Add Part
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-border/50 bg-card flex items-center gap-4 hover-elevate">
            <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold font-display">1,240</div>
              <div className="text-xs text-muted-foreground">Total Parts in Stock</div>
            </div>
          </div>
          <div className="p-4 rounded-xl border border-border/50 bg-card flex items-center gap-4 hover-elevate">
            <div className="h-12 w-12 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold font-display">12</div>
              <div className="text-xs text-muted-foreground">Low Stock Alerts</div>
            </div>
          </div>
          <div className="p-4 rounded-xl border border-border/50 bg-card flex items-center gap-4 hover-elevate">
             <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
              <RefreshCcw className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold font-display">$42k</div>
              <div className="text-xs text-muted-foreground">Inventory Value</div>
            </div>
          </div>
        </div>

        {/* Inventory List */}
        <div className="border border-border/50 rounded-xl overflow-hidden bg-card shadow-sm">
          <div className="p-4 border-b border-border/50 bg-muted/20 flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search parts by name, SKU, or brand..." className="pl-9 bg-background" />
            </div>
            <Button variant="ghost" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Part Name</TableHead>
                <TableHead>SKU / Brand</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Stock Level</TableHead>
                <TableHead>Unit Cost</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {INVENTORY.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">
                    {item.name}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-xs font-mono">{item.sku}</span>
                      <span className="text-xs text-muted-foreground">{item.brand}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      item.status === "Low Stock" ? "text-orange-500 border-orange-200 bg-orange-50" :
                      item.status === "Out of Stock" ? "text-red-500 border-red-200 bg-red-50" :
                      "text-green-500 border-green-200 bg-green-50"
                    }>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                       <span className={`font-bold ${item.stock <= item.min ? "text-red-500" : ""}`}>{item.stock}</span>
                       <span className="text-xs text-muted-foreground">/ Min: {item.min}</span>
                    </div>
                  </TableCell>
                  <TableCell>{item.price}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
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
