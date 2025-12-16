import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-[280px] border-r-0 bg-sidebar text-sidebar-foreground">
          <Sidebar collapsed={false} setCollapsed={() => {}} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <Header onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
