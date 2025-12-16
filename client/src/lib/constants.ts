import { 
  LayoutDashboard, 
  Wrench, 
  Users, 
  Calendar, 
  Bot, 
  MessageSquare, 
  BarChart3, 
  Package, 
  CreditCard, 
  FileText, 
  Settings,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  Tablet
} from "lucide-react";

export const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Repair Orders", icon: Wrench, href: "/repair-orders" },
  { label: "Customers & Vehicles", icon: Users, href: "/customers" },
  { label: "Schedule", icon: Calendar, href: "/schedule" },
  { label: "AI Agent", icon: Bot, href: "/ai-agent", badge: "New" },
  { label: "CRM", icon: MessageSquare, href: "/crm" },
  { label: "Reports", icon: BarChart3, href: "/reports" },
  { label: "Inventory", icon: Package, href: "/inventory" },
  { label: "Financials", icon: CreditCard, href: "/financials" },
  { label: "Estimates", icon: FileText, href: "/estimates" },
  { label: "Tech View", icon: Tablet, href: "/technician", badge: "Mode" }, // Added for easy access
];

export const MOCK_METRICS = [
  { label: "Active ROs", value: "24", change: "+12%", trend: "up" },
  { label: "Daily Revenue", value: "$4,250", change: "+8%", trend: "up" },
  { label: "Appointments", value: "18", change: "-2%", trend: "down" },
  { label: "Bay Utilization", value: "85%", change: "+5%", trend: "up" },
];

export const WORKFLOW_STAGES = [
  { id: "pending", label: "Pending Assignment", count: 4, color: "bg-slate-100 text-slate-600 border-slate-200" },
  { id: "wip", label: "Work in Progress", count: 8, color: "bg-blue-50 text-blue-600 border-blue-200" },
  { id: "estimate", label: "Estimate Building", count: 3, color: "bg-yellow-50 text-yellow-600 border-yellow-200" },
  { id: "approval", label: "Pending Approval", count: 5, color: "bg-orange-50 text-orange-600 border-orange-200" },
  { id: "completed", label: "Completed", count: 4, color: "bg-green-50 text-green-600 border-green-200" },
];
