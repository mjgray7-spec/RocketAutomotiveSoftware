import React, { createContext, useContext, useState, useEffect } from "react";

// Types
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
}

// Initial Mock Data
const INITIAL_ROS: RepairOrder[] = [
  { 
    id: "1024", 
    customer: "John Smith", 
    vehicle: "2018 Ford F-150", 
    status: "wip", 
    tech: "Mike T.", 
    service: "Brake Job + Oil Change", 
    due: "Today, 4:00 PM", 
    bay: "Bay 1",
    dviStatus: "pending",
    timer: { running: false, startTime: null, elapsed: 0 },
    lineItems: [
      { id: "1", description: "Replace Front Brake Pads", type: "Labor", status: "pending", hours: 1.5 },
      { id: "2", description: "Resurface Rotors", type: "Labor", status: "pending", hours: 1.0 },
      { id: "3", description: "Oil Change (Synthetic)", type: "Labor", status: "pending", hours: 0.5 },
      { id: "4", description: "Oil Filter (PF-123)", type: "Part", status: "pending" },
      { id: "5", description: "5W-30 Oil (6qts)", type: "Part", status: "pending" },
    ]
  },
  { id: "1025", customer: "Sarah Connor", vehicle: "2021 Tesla Model 3", status: "pending", tech: "Unassigned", service: "Tire Rotation", due: "Tomorrow, 10:00 AM", bay: "Bay 2", dviStatus: "pending", timer: { running: false, startTime: null, elapsed: 0 }, lineItems: [] },
  { id: "1026", customer: "Bruce Wayne", vehicle: "2019 Lamborghini Urus", status: "estimate", tech: "Batman", service: "Engine Diagnostics", due: "Today, 5:00 PM", bay: "Bay 3", dviStatus: "pending", timer: { running: false, startTime: null, elapsed: 0 }, lineItems: [] },
  { id: "1027", customer: "Clark Kent", vehicle: "2015 Honda Civic", status: "approval", tech: "Superman", service: "Transmission Fluid", due: "Yesterday", urgent: true, bay: "Bay 4", dviStatus: "pending", timer: { running: false, startTime: null, elapsed: 0 }, lineItems: [] },
  { id: "1028", customer: "Diana Prince", vehicle: "2020 Jeep Wrangler", status: "completed", tech: "Wonder Woman", service: "Alignment", due: "Done", bay: "Alignment Rack", dviStatus: "submitted", timer: { running: false, startTime: null, elapsed: 4500 }, lineItems: [] },
  { id: "1029", customer: "Tony Stark", vehicle: "2022 Audi R8", status: "wip", tech: "Jarvis", service: "Electrical System", due: "Today, 2:00 PM", bay: "Bay 1", dviStatus: "pending", timer: { running: false, startTime: null, elapsed: 0 }, lineItems: [] },
];

interface DataContextType {
  repairOrders: RepairOrder[];
  updateRepairOrder: (updatedRO: RepairOrder) => void;
  resetData: () => void;
  toggleTimer: (id: string) => void;
  updateTimer: (id: string, elapsed: number) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [repairOrders, setRepairOrders] = useState<RepairOrder[]>(() => {
    const saved = localStorage.getItem("rocket_ros_v2"); // New key for updated schema
    return saved ? JSON.parse(saved) : INITIAL_ROS;
  });

  useEffect(() => {
    localStorage.setItem("rocket_ros_v2", JSON.stringify(repairOrders));
  }, [repairOrders]);

  const updateRepairOrder = (updatedRO: RepairOrder) => {
    setRepairOrders((prev) => 
      prev.map((ro) => {
        if (ro.id === updatedRO.id) {
          // Auto-move to WIP logic
          let newStatus = updatedRO.status;
          if (
            ro.status === "pending" && 
            updatedRO.tech !== "Unassigned" && 
            updatedRO.status === "pending"
          ) {
            newStatus = "wip";
          }
          return { ...updatedRO, status: newStatus };
        }
        return ro;
      })
    );
  };

  const toggleTimer = (id: string) => {
    setRepairOrders(prev => prev.map(ro => {
      if (ro.id === id) {
        const timer = ro.timer || { running: false, startTime: null, elapsed: 0 };
        if (timer.running) {
          // Stop Timer
          return {
            ...ro,
            timer: { ...timer, running: false, startTime: null }
          };
        } else {
          // Start Timer
          return {
            ...ro,
            timer: { ...timer, running: true, startTime: Date.now() }
          };
        }
      }
      return ro;
    }));
  };

  // Helper to sync timer ticks without re-saving to disk constantly (optional optimization, but keeping it simple for now)
  const updateTimer = (id: string, elapsed: number) => {
    setRepairOrders(prev => prev.map(ro => {
        if (ro.id === id) {
            return {
                ...ro,
                timer: { ...ro.timer!, elapsed }
            }
        }
        return ro;
    }))
  }

  const resetData = () => {
    setRepairOrders(INITIAL_ROS);
    localStorage.removeItem("rocket_ros_v2");
  };

  return (
    <DataContext.Provider value={{ repairOrders, updateRepairOrder, resetData, toggleTimer, updateTimer }}>
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
