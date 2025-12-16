import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertCustomerSchema, 
  insertVehicleSchema, 
  insertRepairOrderSchema,
  insertInspectionItemSchema,
  insertServiceLineItemSchema,
  insertEstimateSchema,
  insertEstimateJobSchema,
  insertEstimateLineItemSchema,
} from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
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

  return httpServer;
}
