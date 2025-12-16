import React, { createContext, useContext, useState, useEffect } from "react";

// Initial Mock Data (moved from individual files)
const INITIAL_ROS = [
  { id: "1024", customer: "John Smith", vehicle: "2018 Ford F-150", status: "wip", tech: "Mike T.", service: "Brake Job + Oil Change", due: "Today, 4:00 PM", bay: "Bay 1" },
  { id: "1025", customer: "Sarah Connor", vehicle: "2021 Tesla Model 3", status: "pending", tech: "Unassigned", service: "Tire Rotation", due: "Tomorrow, 10:00 AM", bay: "Bay 2" },
  { id: "1026", customer: "Bruce Wayne", vehicle: "2019 Lamborghini Urus", status: "estimate", tech: "Batman", service: "Engine Diagnostics", due: "Today, 5:00 PM", bay: "Bay 3" },
  { id: "1027", customer: "Clark Kent", vehicle: "2015 Honda Civic", status: "approval", tech: "Superman", service: "Transmission Fluid", due: "Yesterday", urgent: true, bay: "Bay 4" },
  { id: "1028", customer: "Diana Prince", vehicle: "2020 Jeep Wrangler", status: "completed", tech: "Wonder Woman", service: "Alignment", due: "Done", bay: "Alignment Rack" },
  { id: "1029", customer: "Tony Stark", vehicle: "2022 Audi R8", status: "wip", tech: "Jarvis", service: "Electrical System", due: "Today, 2:00 PM", bay: "Bay 1" },
];

// Context Definition
interface RepairOrder {
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
}

interface DataContextType {
  repairOrders: RepairOrder[];
  updateRepairOrder: (updatedRO: RepairOrder) => void;
  resetData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [repairOrders, setRepairOrders] = useState<RepairOrder[]>(() => {
    // Load from local storage on initial render
    const saved = localStorage.getItem("rocket_ros");
    return saved ? JSON.parse(saved) : INITIAL_ROS;
  });

  // Save to local storage whenever data changes
  useEffect(() => {
    localStorage.setItem("rocket_ros", JSON.stringify(repairOrders));
  }, [repairOrders]);

  const updateRepairOrder = (updatedRO: RepairOrder) => {
    setRepairOrders((prev) => 
      prev.map((ro) => {
        if (ro.id === updatedRO.id) {
          // Logic: Auto-move to WIP if tech is assigned and status was pending
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

  const resetData = () => {
    setRepairOrders(INITIAL_ROS);
    localStorage.removeItem("rocket_ros");
  };

  return (
    <DataContext.Provider value={{ repairOrders, updateRepairOrder, resetData }}>
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
