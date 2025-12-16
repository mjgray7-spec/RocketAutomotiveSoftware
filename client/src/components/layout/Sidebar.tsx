import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { LogOut, Settings, ChevronLeft, ChevronRight } from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const [location] = useLocation();

  return (
    <aside 
      className={cn(
        "bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col transition-all duration-300 ease-in-out h-screen sticky top-0 z-40",
        collapsed ? "w-[80px]" : "w-[280px]"
      )}
    >
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center shrink-0">
            <span className="font-display font-bold text-white text-lg">R</span>
          </div>
          <span 
            className={cn(
              "font-display font-bold text-xl tracking-tight whitespace-nowrap transition-opacity duration-300",
              collapsed ? "opacity-0 w-0" : "opacity-100"
            )}
          >
            ROcket
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto overflow-x-hidden">
        {NAV_ITEMS.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.href} href={item.href} className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group relative cursor-pointer",
              isActive 
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
            title={collapsed ? item.label : undefined}>
              <Icon className={cn("h-5 w-5 shrink-0", isActive ? "text-white" : "text-sidebar-foreground/70 group-hover:text-white")} />
              
              <span className={cn(
                "whitespace-nowrap transition-all duration-300",
                collapsed ? "opacity-0 w-0 hidden" : "opacity-100"
              )}>
                {item.label}
              </span>

              {item.badge && !collapsed && (
                <span className="ml-auto bg-primary/20 text-primary text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
              
              {collapsed && item.badge && (
                <span className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        <Button 
          variant="ghost" 
          className={cn(
            "w-full justify-start text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            collapsed && "justify-center px-0"
          )}
        >
          <Settings className="h-5 w-5 shrink-0" />
          {!collapsed && <span className="ml-3">Settings</span>}
        </Button>
        <Button 
          variant="ghost" 
          className={cn(
            "w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive",
            collapsed && "justify-center px-0"
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span className="ml-3">Logout</span>}
        </Button>
      </div>

      {/* Collapse Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-20 h-6 w-6 rounded-full bg-sidebar border border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent hover:text-white z-50 shadow-md hidden lg:flex"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </Button>
    </aside>
  );
}
