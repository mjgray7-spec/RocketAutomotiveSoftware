// API client functions for backend communication

const API_BASE = "/api";

export interface RepairOrderDTO {
  id: number;
  customerId: number;
  vehicleId: number;
  status: string;
  techName: string | null;
  service: string;
  dueDate: string | null;
  bay: string | null;
  notes: string | null;
  dviStatus: string | null;
  timerRunning: boolean | null;
  timerStartTime: string | null;
  timerElapsed: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface InspectionItemDTO {
  id: number;
  repairOrderId: number;
  category: string;
  status: string;
  notes: string | null;
  photoUrl: string | null;
  createdAt: string;
}

export interface ServiceLineItemDTO {
  id: number;
  repairOrderId: number;
  description: string;
  type: string;
  status: string | null;
  hours: string | null;
  notes: string | null;
  createdAt: string;
}

export interface CustomerDTO {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
}

export interface VehicleDTO {
  id: number;
  customerId: number;
  year: number;
  make: string;
  model: string;
  vin: string | null;
  licensePlate: string | null;
}

// Repair Orders
export async function getRepairOrders(): Promise<RepairOrderDTO[]> {
  const response = await fetch(`${API_BASE}/repair-orders`);
  if (!response.ok) throw new Error("Failed to fetch repair orders");
  return response.json();
}

export async function getRepairOrder(id: number): Promise<RepairOrderDTO> {
  const response = await fetch(`${API_BASE}/repair-orders/${id}`);
  if (!response.ok) throw new Error("Failed to fetch repair order");
  return response.json();
}

export async function updateRepairOrder(id: number, data: Partial<RepairOrderDTO>): Promise<RepairOrderDTO> {
  const response = await fetch(`${API_BASE}/repair-orders/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update repair order");
  return response.json();
}

// Inspection Items
export async function getInspectionItems(roId: number): Promise<InspectionItemDTO[]> {
  const response = await fetch(`${API_BASE}/repair-orders/${roId}/inspections`);
  if (!response.ok) throw new Error("Failed to fetch inspection items");
  return response.json();
}

export async function createInspectionItem(item: Omit<InspectionItemDTO, "id" | "createdAt">): Promise<InspectionItemDTO> {
  const response = await fetch(`${API_BASE}/inspection-items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  });
  if (!response.ok) throw new Error("Failed to create inspection item");
  return response.json();
}

// Service Line Items
export async function getServiceLineItems(roId: number): Promise<ServiceLineItemDTO[]> {
  const response = await fetch(`${API_BASE}/repair-orders/${roId}/service-items`);
  if (!response.ok) throw new Error("Failed to fetch service items");
  return response.json();
}

export async function updateServiceLineItem(id: number, data: Partial<ServiceLineItemDTO>): Promise<ServiceLineItemDTO> {
  const response = await fetch(`${API_BASE}/service-items/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update service item");
  return response.json();
}

// Customers
export async function getCustomers(): Promise<CustomerDTO[]> {
  const response = await fetch(`${API_BASE}/customers`);
  if (!response.ok) throw new Error("Failed to fetch customers");
  return response.json();
}

// Vehicles
export async function getVehiclesByCustomer(customerId: number): Promise<VehicleDTO[]> {
  const response = await fetch(`${API_BASE}/vehicles/${customerId}`);
  if (!response.ok) throw new Error("Failed to fetch vehicles");
  return response.json();
}
