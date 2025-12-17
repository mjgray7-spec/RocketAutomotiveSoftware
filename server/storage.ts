import { 
  users, 
  customers,
  vehicles,
  repairOrders,
  inspectionItems,
  serviceLineItems,
  estimates,
  estimateJobs,
  estimateLineItems,
  inventory,
  type User, 
  type InsertUser,
  type Customer,
  type InsertCustomer,
  type Vehicle,
  type InsertVehicle,
  type RepairOrder,
  type InsertRepairOrder,
  type InspectionItem,
  type InsertInspectionItem,
  type ServiceLineItem,
  type InsertServiceLineItem,
  type Estimate,
  type InsertEstimate,
  type EstimateJob,
  type InsertEstimateJob,
  type EstimateLineItem,
  type InsertEstimateLineItem,
  type InventoryItem,
  type InsertInventory,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, ilike, or, inArray } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Customers
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  searchCustomersWithVehicles(searchTerm: string): Promise<Array<{ customer: Customer; vehicles: Vehicle[] }>>;

  // Vehicles
  getVehiclesByCustomer(customerId: number): Promise<Vehicle[]>;
  getAllVehicles(): Promise<Vehicle[]>;
  getVehicle(id: number): Promise<Vehicle | undefined>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;

  // Repair Orders
  getRepairOrders(): Promise<RepairOrder[]>;
  getRepairOrder(id: number): Promise<RepairOrder | undefined>;
  createRepairOrder(ro: InsertRepairOrder): Promise<RepairOrder>;
  updateRepairOrder(id: number, ro: Partial<InsertRepairOrder>): Promise<RepairOrder | undefined>;

  // Inspection Items
  getInspectionItemsByRO(repairOrderId: number): Promise<InspectionItem[]>;
  createInspectionItem(item: InsertInspectionItem): Promise<InspectionItem>;
  deleteInspectionItem(id: number): Promise<void>;

  // Service Line Items
  getServiceLineItemsByRO(repairOrderId: number): Promise<ServiceLineItem[]>;
  createServiceLineItem(item: InsertServiceLineItem): Promise<ServiceLineItem>;
  updateServiceLineItem(id: number, item: Partial<InsertServiceLineItem>): Promise<ServiceLineItem | undefined>;

  // Estimates
  getEstimateByRO(repairOrderId: number): Promise<Estimate | undefined>;
  createEstimate(estimate: InsertEstimate): Promise<Estimate>;
  
  // Estimate Jobs
  getJobsByEstimate(estimateId: number): Promise<EstimateJob[]>;
  createEstimateJob(job: InsertEstimateJob): Promise<EstimateJob>;
  deleteEstimateJob(id: number): Promise<void>;

  // Estimate Line Items
  getLineItemsByJob(jobId: number): Promise<EstimateLineItem[]>;
  createEstimateLineItem(item: InsertEstimateLineItem): Promise<EstimateLineItem>;
  deleteEstimateLineItem(id: number): Promise<void>;

  // Inventory
  getInventory(): Promise<InventoryItem[]>;
  searchInventory(searchTerm: string): Promise<InventoryItem[]>;
  getInventoryItem(id: number): Promise<InventoryItem | undefined>;
  createInventoryItem(item: InsertInventory): Promise<InventoryItem>;
  updateInventoryItem(id: number, item: Partial<InsertInventory>): Promise<InventoryItem | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Customers
  async getCustomers(): Promise<Customer[]> {
    return await db.select().from(customers);
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer || undefined;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [newCustomer] = await db.insert(customers).values(customer).returning();
    return newCustomer;
  }

  async updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const [updated] = await db.update(customers).set(customer).where(eq(customers.id, id)).returning();
    return updated || undefined;
  }

  async searchCustomersWithVehicles(searchTerm: string): Promise<Array<{ customer: Customer; vehicles: Vehicle[] }>> {
    if (!searchTerm || searchTerm.trim().length < 2) {
      return [];
    }
    const term = `%${searchTerm.trim()}%`;
    
    // Search customers by name, phone, or email
    const matchedCustomers = await db.select().from(customers).where(
      or(
        ilike(customers.name, term),
        ilike(customers.phone, term),
        ilike(customers.email, term)
      )
    );
    
    // Search vehicles by VIN
    const matchedVehicles = await db.select().from(vehicles).where(
      ilike(vehicles.vin, term)
    );
    
    // Get customer IDs from matched vehicles
    const customerIdsFromVehicles = matchedVehicles.map(v => v.customerId);
    
    // Get customers for those vehicles using proper inArray
    let vehicleCustomers: Customer[] = [];
    if (customerIdsFromVehicles.length > 0) {
      vehicleCustomers = await db.select().from(customers).where(
        inArray(customers.id, customerIdsFromVehicles)
      );
    }
    
    // Merge and deduplicate customers
    const allCustomerIds = new Set<number>();
    const allCustomers: Customer[] = [];
    
    for (const c of [...matchedCustomers, ...vehicleCustomers]) {
      if (!allCustomerIds.has(c.id)) {
        allCustomerIds.add(c.id);
        allCustomers.push(c);
      }
    }
    
    // Get vehicles for each customer
    const results: Array<{ customer: Customer; vehicles: Vehicle[] }> = [];
    for (const customer of allCustomers) {
      const customerVehicles = await db.select().from(vehicles).where(eq(vehicles.customerId, customer.id));
      results.push({ customer, vehicles: customerVehicles });
    }
    
    return results;
  }

  // Vehicles
  async getVehiclesByCustomer(customerId: number): Promise<Vehicle[]> {
    return await db.select().from(vehicles).where(eq(vehicles.customerId, customerId));
  }

  async getAllVehicles(): Promise<Vehicle[]> {
    return await db.select().from(vehicles);
  }

  async getVehicle(id: number): Promise<Vehicle | undefined> {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id));
    return vehicle || undefined;
  }

  async createVehicle(vehicle: InsertVehicle): Promise<Vehicle> {
    const [newVehicle] = await db.insert(vehicles).values(vehicle).returning();
    return newVehicle;
  }

  // Repair Orders
  async getRepairOrders(): Promise<RepairOrder[]> {
    return await db.select().from(repairOrders).orderBy(desc(repairOrders.createdAt));
  }

  async getRepairOrder(id: number): Promise<RepairOrder | undefined> {
    const [ro] = await db.select().from(repairOrders).where(eq(repairOrders.id, id));
    return ro || undefined;
  }

  async createRepairOrder(ro: InsertRepairOrder): Promise<RepairOrder> {
    const [newRO] = await db.insert(repairOrders).values(ro).returning();
    return newRO;
  }

  async updateRepairOrder(id: number, ro: Partial<InsertRepairOrder>): Promise<RepairOrder | undefined> {
    const [updated] = await db
      .update(repairOrders)
      .set({ ...ro, updatedAt: new Date() })
      .where(eq(repairOrders.id, id))
      .returning();
    return updated || undefined;
  }

  // Inspection Items
  async getInspectionItemsByRO(repairOrderId: number): Promise<InspectionItem[]> {
    return await db.select().from(inspectionItems).where(eq(inspectionItems.repairOrderId, repairOrderId));
  }

  async createInspectionItem(item: InsertInspectionItem): Promise<InspectionItem> {
    const [newItem] = await db.insert(inspectionItems).values(item).returning();
    return newItem;
  }

  async deleteInspectionItem(id: number): Promise<void> {
    await db.delete(inspectionItems).where(eq(inspectionItems.id, id));
  }

  // Service Line Items
  async getServiceLineItemsByRO(repairOrderId: number): Promise<ServiceLineItem[]> {
    return await db.select().from(serviceLineItems).where(eq(serviceLineItems.repairOrderId, repairOrderId));
  }

  async createServiceLineItem(item: InsertServiceLineItem): Promise<ServiceLineItem> {
    const [newItem] = await db.insert(serviceLineItems).values(item).returning();
    return newItem;
  }

  async updateServiceLineItem(id: number, item: Partial<InsertServiceLineItem>): Promise<ServiceLineItem | undefined> {
    const [updated] = await db.update(serviceLineItems).set(item).where(eq(serviceLineItems.id, id)).returning();
    return updated || undefined;
  }

  // Estimates
  async getEstimateByRO(repairOrderId: number): Promise<Estimate | undefined> {
    const [estimate] = await db.select().from(estimates).where(eq(estimates.repairOrderId, repairOrderId));
    return estimate || undefined;
  }

  async createEstimate(estimate: InsertEstimate): Promise<Estimate> {
    const [newEstimate] = await db.insert(estimates).values(estimate).returning();
    return newEstimate;
  }

  // Estimate Jobs
  async getJobsByEstimate(estimateId: number): Promise<EstimateJob[]> {
    return await db.select().from(estimateJobs).where(eq(estimateJobs.estimateId, estimateId));
  }

  async createEstimateJob(job: InsertEstimateJob): Promise<EstimateJob> {
    const [newJob] = await db.insert(estimateJobs).values(job).returning();
    return newJob;
  }

  async deleteEstimateJob(id: number): Promise<void> {
    await db.delete(estimateJobs).where(eq(estimateJobs.id, id));
  }

  // Estimate Line Items
  async getLineItemsByJob(jobId: number): Promise<EstimateLineItem[]> {
    return await db.select().from(estimateLineItems).where(eq(estimateLineItems.jobId, jobId));
  }

  async createEstimateLineItem(item: InsertEstimateLineItem): Promise<EstimateLineItem> {
    const [newItem] = await db.insert(estimateLineItems).values(item).returning();
    return newItem;
  }

  async deleteEstimateLineItem(id: number): Promise<void> {
    await db.delete(estimateLineItems).where(eq(estimateLineItems.id, id));
  }

  // Inventory
  async getInventory(): Promise<InventoryItem[]> {
    return await db.select().from(inventory).orderBy(inventory.description);
  }

  async searchInventory(searchTerm: string): Promise<InventoryItem[]> {
    if (!searchTerm || searchTerm.length < 2) {
      return await db.select().from(inventory).orderBy(inventory.description).limit(50);
    }
    const pattern = `%${searchTerm}%`;
    return await db
      .select()
      .from(inventory)
      .where(
        or(
          ilike(inventory.partNumber, pattern),
          ilike(inventory.description, pattern),
          ilike(inventory.brand, pattern),
          ilike(inventory.category, pattern)
        )
      )
      .orderBy(inventory.description)
      .limit(100);
  }

  async getInventoryItem(id: number): Promise<InventoryItem | undefined> {
    const [item] = await db.select().from(inventory).where(eq(inventory.id, id));
    return item || undefined;
  }

  async createInventoryItem(item: InsertInventory): Promise<InventoryItem> {
    const [newItem] = await db.insert(inventory).values(item).returning();
    return newItem;
  }

  async updateInventoryItem(id: number, item: Partial<InsertInventory>): Promise<InventoryItem | undefined> {
    const [updated] = await db.update(inventory).set(item).where(eq(inventory.id, id)).returning();
    return updated || undefined;
  }
}

export const storage = new DatabaseStorage();
