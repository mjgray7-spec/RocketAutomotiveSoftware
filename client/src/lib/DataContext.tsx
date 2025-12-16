import React, { createContext, useContext, useState, useEffect } from "react";
import * as api from "./api";

// Types
export interface InspectionItem {
  id: number;
  category: string;
  status: string;
  notes?: string;
  photo?: boolean;
}

export interface ServiceItem {
  id: string;
  description: string;
  type: "Labor" | "Part" | "Sublet";
  status: "pending" | "completed";
  hours?: number;
  notes?: string;
}

export interface RepairOrder {
  id: string;
  customer: string;
  vehicle: string;
  status: string;
  tech: string;
  service: string;
  due: string;
  urgent?: boolean;
  bay?: string;
  notes?: string;
  
  // New Fields for Tech Execution
  dviStatus?: "pending" | "in_progress" | "submitted";
  timer?: {
    running: boolean;
    startTime: number | null;
    elapsed: number; // in seconds
  };
  lineItems?: ServiceItem[];
  dviItems?: InspectionItem[]; // New Field for DVI Data
}

interface DataContextType {
  repairOrders: RepairOrder[];
  updateRepairOrder: (updatedRO: RepairOrder) => void;
  resetData: () => void;
  toggleTimer: (id: string) => void;
  updateTimer: (id: string, elapsed: number) => void;
  refreshData: () => Promise<void>;
  loading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [repairOrders, setRepairOrders] = useState<RepairOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Map<number, api.CustomerDTO>>(new Map());
  const [vehicles, setVehicles] = useState<Map<number, api.VehicleDTO>>(new Map());

  // Fetch all data from API
  const refreshData = async () => {
    try {
      setLoading(true);
      
      // Fetch all base data
      const [rosData, customersData] = await Promise.all([
        api.getRepairOrders(),
        api.getCustomers(),
      ]);

      // Build customer map
      const customerMap = new Map<number, api.CustomerDTO>();
      customersData.forEach(c => customerMap.set(c.id, c));
      setCustomers(customerMap);

      // Fetch vehicles for all customers
      const vehiclesData = await Promise.all(
        customersData.map(c => api.getVehiclesByCustomer(c.id))
      );
      const vehicleMap = new Map<number, api.VehicleDTO>();
      vehiclesData.flat().forEach(v => vehicleMap.set(v.id, v));
      setVehicles(vehicleMap);

      // Fetch inspection and service items for each RO
      const enrichedROs = await Promise.all(
        rosData.map(async (ro) => {
          const [inspectionItems, serviceItems] = await Promise.all([
            api.getInspectionItems(ro.id),
            api.getServiceLineItems(ro.id),
          ]);

          const customer = customerMap.get(ro.customerId);
          const vehicle = vehicleMap.get(ro.vehicleId);

          // Format due date
          let dueDisplay = "No due date";
          if (ro.dueDate) {
            const dueDate = new Date(ro.dueDate);
            const now = new Date();
            const isToday = dueDate.toDateString() === now.toDateString();
            const isTomorrow = dueDate.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();
            const isPast = dueDate < now;

            if (isPast && ro.status !== "completed") {
              dueDisplay = "Yesterday";
            } else if (isToday) {
              dueDisplay = `Today, ${dueDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
            } else if (isTomorrow) {
              dueDisplay = `Tomorrow, ${dueDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
            } else if (ro.status === "completed") {
              dueDisplay = "Done";
            } else {
              dueDisplay = dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }
          }

          return {
            id: String(ro.id),
            customer: customer?.name || "Unknown",
            vehicle: vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : "Unknown",
            status: ro.status,
            tech: ro.techName || "Unassigned",
            service: ro.service,
            due: dueDisplay,
            urgent: ro.dueDate ? new Date(ro.dueDate) < new Date() && ro.status !== "completed" : false,
            bay: ro.bay || undefined,
            notes: ro.notes || undefined,
            dviStatus: (ro.dviStatus as "pending" | "in_progress" | "submitted") || "pending",
            timer: {
              running: ro.timerRunning || false,
              startTime: ro.timerStartTime ? new Date(ro.timerStartTime).getTime() : null,
              elapsed: ro.timerElapsed || 0,
            },
            lineItems: serviceItems.map(item => ({
              id: String(item.id),
              description: item.description,
              type: item.type as "Labor" | "Part" | "Sublet",
              status: (item.status as "pending" | "completed") || "pending",
              hours: item.hours ? parseFloat(item.hours) : undefined,
              notes: item.notes || undefined,
            })),
            dviItems: inspectionItems.map(item => ({
              id: item.id,
              category: item.category,
              status: item.status,
              notes: item.notes || undefined,
              photo: !!item.photoUrl,
            })),
          };
        })
      );

      setRepairOrders(enrichedROs);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const updateRepairOrder = async (updatedRO: RepairOrder) => {
    try {
      const roId = parseInt(updatedRO.id);
      
      // Determine new status (auto-move to WIP logic)
      let newStatus = updatedRO.status;
      const currentRO = repairOrders.find(ro => ro.id === updatedRO.id);
      if (
        currentRO?.status === "pending" && 
        updatedRO.tech !== "Unassigned" && 
        updatedRO.status === "pending"
      ) {
        newStatus = "wip";
      }

      // Update in database
      await api.updateRepairOrder(roId, {
        status: newStatus,
        techName: updatedRO.tech,
        bay: updatedRO.bay || null,
        notes: updatedRO.notes || null,
        dviStatus: updatedRO.dviStatus || null,
        timerRunning: updatedRO.timer?.running || false,
        timerStartTime: updatedRO.timer?.startTime ? new Date(updatedRO.timer.startTime).toISOString() : null,
        timerElapsed: updatedRO.timer?.elapsed || 0,
      });

      // Optimistically update local state
      setRepairOrders((prev) => 
        prev.map((ro) => ro.id === updatedRO.id ? { ...updatedRO, status: newStatus } : ro)
      );
    } catch (error) {
      console.error("Failed to update repair order:", error);
      // Refresh to get accurate state
      refreshData();
    }
  };

  const toggleTimer = async (id: string) => {
    const ro = repairOrders.find(r => r.id === id);
    if (!ro) return;

    const timer = ro.timer || { running: false, startTime: null, elapsed: 0 };
    const newTimer = timer.running
      ? { ...timer, running: false, startTime: null }
      : { ...timer, running: true, startTime: Date.now() };

    // Optimistic update
    setRepairOrders(prev => prev.map(r => 
      r.id === id ? { ...r, timer: newTimer } : r
    ));

    // Update in database
    try {
      await api.updateRepairOrder(parseInt(id), {
        timerRunning: newTimer.running,
        timerStartTime: newTimer.startTime ? new Date(newTimer.startTime).toISOString() : null,
        timerElapsed: newTimer.elapsed,
      });
    } catch (error) {
      console.error("Failed to toggle timer:", error);
      refreshData();
    }
  };

  const updateTimer = async (id: string, elapsed: number) => {
    // Optimistic update
    setRepairOrders(prev => prev.map(ro => {
      if (ro.id === id) {
        return {
          ...ro,
          timer: { ...ro.timer!, elapsed }
        };
      }
      return ro;
    }));

    // Debounced database update (only update every 30 seconds to reduce DB calls)
    // In production, you might want to only save when timer is stopped
  };

  const resetData = async () => {
    await refreshData();
  };

  return (
    <DataContext.Provider value={{ 
      repairOrders, 
      updateRepairOrder, 
      resetData, 
      toggleTimer, 
      updateTimer,
      refreshData,
      loading,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
