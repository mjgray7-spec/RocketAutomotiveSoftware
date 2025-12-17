import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { lookupLaborTime } from "./motors-api";
import { searchVendorParts } from "./vendor-parts-api";
import { 
  insertCustomerSchema, 
  insertVehicleSchema, 
  insertRepairOrderSchema,
  insertInspectionItemSchema,
  insertServiceLineItemSchema,
  insertEstimateSchema,
  insertEstimateJobSchema,
  insertEstimateLineItemSchema,
  insertInventorySchema,
  insertPmServiceSchema,
} from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // ============ VENDOR PARTS API ============
  app.get("/api/vendor-parts/search", async (req, res) => {
    try {
      const searchTerm = (req.query.q as string) || "";
      const results = await searchVendorParts(searchTerm);
      res.json(results);
    } catch (error) {
      console.error("Vendor parts search error:", error);
      res.status(500).json({ error: "Failed to search vendor parts" });
    }
  });

  // ============ MOTORS API ============
  app.get("/api/motors/labor-time", async (req, res) => {
    try {
      const vmrsCode = req.query.vmrsCode as string;
      if (!vmrsCode) {
        return res.status(400).json({ error: "VMRS code is required" });
      }
      
      const laborTime = await lookupLaborTime(vmrsCode);
      if (laborTime) {
        res.json(laborTime);
      } else {
        res.status(404).json({ error: "No labor time found for this code" });
      }
    } catch (error) {
      console.error("Motors API error:", error);
      res.status(500).json({ error: "Failed to lookup labor time" });
    }
  });
  
  // ============ CUSTOMERS ============
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customers" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const validated = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(validated);
      res.status(201).json(customer);
    } catch (error) {
      res.status(400).json({ error: "Invalid customer data" });
    }
  });

  app.get("/api/customers/search", async (req, res) => {
    try {
      const searchTerm = req.query.q as string;
      if (!searchTerm || searchTerm.length < 2) {
        return res.json([]);
      }
      const results = await storage.searchCustomersWithVehicles(searchTerm);
      res.json(results);
    } catch (error) {
      console.error("Customer search error:", error);
      res.status(500).json({ error: "Failed to search customers" });
    }
  });

  // ============ VEHICLES ============
  app.get("/api/vehicles/:customerId", async (req, res) => {
    try {
      const customerId = parseInt(req.params.customerId);
      const vehicles = await storage.getVehiclesByCustomer(customerId);
      res.json(vehicles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vehicles" });
    }
  });

  app.post("/api/vehicles", async (req, res) => {
    try {
      const validated = insertVehicleSchema.parse(req.body);
      const vehicle = await storage.createVehicle(validated);
      res.status(201).json(vehicle);
    } catch (error) {
      res.status(400).json({ error: "Invalid vehicle data" });
    }
  });

  // ============ REPAIR ORDERS ============
  app.get("/api/repair-orders", async (req, res) => {
    try {
      const orders = await storage.getRepairOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch repair orders" });
    }
  });

  app.get("/api/repair-orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getRepairOrder(id);
      if (!order) {
        return res.status(404).json({ error: "Repair order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch repair order" });
    }
  });

  app.post("/api/repair-orders", async (req, res) => {
    try {
      const validated = insertRepairOrderSchema.parse(req.body);
      const order = await storage.createRepairOrder(validated);
      res.status(201).json(order);
    } catch (error) {
      res.status(400).json({ error: "Invalid repair order data" });
    }
  });

  app.patch("/api/repair-orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.updateRepairOrder(id, req.body);
      if (!order) {
        return res.status(404).json({ error: "Repair order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(400).json({ error: "Failed to update repair order" });
    }
  });

  // ============ INSPECTION ITEMS ============
  app.get("/api/repair-orders/:roId/inspections", async (req, res) => {
    try {
      const roId = parseInt(req.params.roId);
      const items = await storage.getInspectionItemsByRO(roId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch inspection items" });
    }
  });

  app.post("/api/inspection-items", async (req, res) => {
    try {
      const validated = insertInspectionItemSchema.parse(req.body);
      const item = await storage.createInspectionItem(validated);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ error: "Invalid inspection item data" });
    }
  });

  app.delete("/api/inspection-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteInspectionItem(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete inspection item" });
    }
  });

  // ============ SERVICE LINE ITEMS ============
  app.get("/api/repair-orders/:roId/service-items", async (req, res) => {
    try {
      const roId = parseInt(req.params.roId);
      const items = await storage.getServiceLineItemsByRO(roId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch service items" });
    }
  });

  app.post("/api/service-items", async (req, res) => {
    try {
      const validated = insertServiceLineItemSchema.parse(req.body);
      const item = await storage.createServiceLineItem(validated);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ error: "Invalid service item data" });
    }
  });

  app.patch("/api/service-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const item = await storage.updateServiceLineItem(id, req.body);
      if (!item) {
        return res.status(404).json({ error: "Service item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(400).json({ error: "Failed to update service item" });
    }
  });

  // ============ ESTIMATES ============
  app.get("/api/repair-orders/:roId/estimate", async (req, res) => {
    try {
      const roId = parseInt(req.params.roId);
      const estimate = await storage.getEstimateByRO(roId);
      
      if (!estimate) {
        return res.status(404).json({ error: "Estimate not found" });
      }

      // Get all jobs for this estimate
      const jobs = await storage.getJobsByEstimate(estimate.id);
      
      // Get line items for each job
      const jobsWithItems = await Promise.all(
        jobs.map(async (job) => {
          const lineItems = await storage.getLineItemsByJob(job.id);
          return { ...job, lineItems };
        })
      );

      res.json({ ...estimate, jobs: jobsWithItems });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch estimate" });
    }
  });

  app.post("/api/estimates", async (req, res) => {
    try {
      const validated = insertEstimateSchema.parse(req.body);
      const estimate = await storage.createEstimate(validated);
      res.status(201).json(estimate);
    } catch (error) {
      res.status(400).json({ error: "Invalid estimate data" });
    }
  });

  // ============ ESTIMATE JOBS ============
  app.post("/api/estimate-jobs", async (req, res) => {
    try {
      const validated = insertEstimateJobSchema.parse(req.body);
      const job = await storage.createEstimateJob(validated);
      res.status(201).json(job);
    } catch (error) {
      res.status(400).json({ error: "Invalid job data" });
    }
  });

  app.delete("/api/estimate-jobs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteEstimateJob(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete job" });
    }
  });

  // ============ ESTIMATE LINE ITEMS ============
  app.post("/api/estimate-line-items", async (req, res) => {
    try {
      const validated = insertEstimateLineItemSchema.parse(req.body);
      const item = await storage.createEstimateLineItem(validated);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ error: "Invalid line item data" });
    }
  });

  app.delete("/api/estimate-line-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteEstimateLineItem(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete line item" });
    }
  });

  // ============ INVENTORY ============
  app.get("/api/inventory", async (req, res) => {
    try {
      const items = await storage.getInventory();
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch inventory" });
    }
  });

  app.get("/api/inventory/search", async (req, res) => {
    try {
      const searchTerm = (req.query.q as string) || "";
      const items = await storage.searchInventory(searchTerm);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to search inventory" });
    }
  });

  app.get("/api/inventory/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const item = await storage.getInventoryItem(id);
      if (!item) {
        return res.status(404).json({ error: "Inventory item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch inventory item" });
    }
  });

  app.post("/api/inventory", async (req, res) => {
    try {
      const validated = insertInventorySchema.parse(req.body);
      const item = await storage.createInventoryItem(validated);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ error: "Invalid inventory data" });
    }
  });

  app.patch("/api/inventory/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const item = await storage.updateInventoryItem(id, req.body);
      if (!item) {
        return res.status(404).json({ error: "Inventory item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(400).json({ error: "Failed to update inventory item" });
    }
  });

  // ============ PM SERVICES ============
  app.get("/api/pm-services", async (req, res) => {
    try {
      const services = await storage.getPmServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch PM services" });
    }
  });

  app.get("/api/pm-services/enabled", async (req, res) => {
    try {
      const services = await storage.getEnabledPmServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch enabled PM services" });
    }
  });

  app.post("/api/pm-services", async (req, res) => {
    try {
      const validated = insertPmServiceSchema.parse(req.body);
      const service = await storage.createPmService(validated);
      res.status(201).json(service);
    } catch (error) {
      res.status(400).json({ error: "Invalid PM service data" });
    }
  });

  app.patch("/api/pm-services/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const service = await storage.updatePmService(id, req.body);
      if (!service) {
        return res.status(404).json({ error: "PM service not found" });
      }
      res.json(service);
    } catch (error) {
      res.status(400).json({ error: "Failed to update PM service" });
    }
  });

  // Seed default PM services if table is empty
  app.post("/api/pm-services/seed", async (req, res) => {
    try {
      const existing = await storage.getPmServices();
      if (existing.length > 0) {
        return res.json({ message: "PM services already seeded", count: existing.length });
      }
      
      const defaultServices = [
        "Synthetic Oil Change",
        "Semi-Synthetic Oil Change",
        "Conventional Oil Change",
        "Diesel Oil Change",
        "Tire Rotation",
        "Coolant Flush",
        "Brake Fluid Flush",
        "Transmission Flush",
        "Transmission Filter",
        "Air Filter",
        "Cabin Air Filter",
        "Differential D/F",
        "Power Steering Flush",
        "Fuel Filter",
        "DEF Filter",
        "Spark Plugs",
      ];
      
      for (let i = 0; i < defaultServices.length; i++) {
        await storage.createPmService({ name: defaultServices[i], enabled: true, sortOrder: i });
      }
      
      res.json({ message: "PM services seeded", count: defaultServices.length });
    } catch (error) {
      res.status(500).json({ error: "Failed to seed PM services" });
    }
  });

  return httpServer;
}
