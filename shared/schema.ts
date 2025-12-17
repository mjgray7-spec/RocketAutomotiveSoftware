import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, serial, timestamp, jsonb, decimal, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Customers table
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true, createdAt: true });
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;

// Vehicles table
export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  year: integer("year").notNull(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  vin: text("vin"),
  licensePlate: text("license_plate"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertVehicleSchema = createInsertSchema(vehicles).omit({ id: true, createdAt: true });
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Vehicle = typeof vehicles.$inferSelect;

// Repair Orders table
export const repairOrders = pgTable("repair_orders", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  vehicleId: integer("vehicle_id").notNull().references(() => vehicles.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("pending"),
  techName: text("tech_name").default("Unassigned"),
  service: text("service").notNull(),
  dueDate: timestamp("due_date"),
  bay: text("bay"),
  notes: text("notes"),
  dviStatus: text("dvi_status").default("pending"),
  timerRunning: boolean("timer_running").default(false),
  timerStartTime: timestamp("timer_start_time"),
  timerElapsed: integer("timer_elapsed").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertRepairOrderSchema = createInsertSchema(repairOrders).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export type InsertRepairOrder = z.infer<typeof insertRepairOrderSchema>;
export type RepairOrder = typeof repairOrders.$inferSelect;

// DVI Inspection Items table
export const inspectionItems = pgTable("inspection_items", {
  id: serial("id").primaryKey(),
  repairOrderId: integer("repair_order_id").notNull().references(() => repairOrders.id, { onDelete: "cascade" }),
  category: text("category").notNull(),
  status: text("status").notNull(),
  notes: text("notes"),
  photoUrl: text("photo_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertInspectionItemSchema = createInsertSchema(inspectionItems).omit({ 
  id: true, 
  createdAt: true 
});
export type InsertInspectionItem = z.infer<typeof insertInspectionItemSchema>;
export type InspectionItem = typeof inspectionItems.$inferSelect;

// Service Line Items table (for RO)
export const serviceLineItems = pgTable("service_line_items", {
  id: serial("id").primaryKey(),
  repairOrderId: integer("repair_order_id").notNull().references(() => repairOrders.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  type: text("type").notNull(),
  status: text("status").default("pending"),
  hours: decimal("hours", { precision: 10, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertServiceLineItemSchema = createInsertSchema(serviceLineItems).omit({ 
  id: true, 
  createdAt: true 
});
export type InsertServiceLineItem = z.infer<typeof insertServiceLineItemSchema>;
export type ServiceLineItem = typeof serviceLineItems.$inferSelect;

// Estimates table
export const estimates = pgTable("estimates", {
  id: serial("id").primaryKey(),
  repairOrderId: integer("repair_order_id").notNull().references(() => repairOrders.id, { onDelete: "cascade" }),
  status: text("status").default("draft"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertEstimateSchema = createInsertSchema(estimates).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export type InsertEstimate = z.infer<typeof insertEstimateSchema>;
export type Estimate = typeof estimates.$inferSelect;

// Estimate Jobs table
export const estimateJobs = pgTable("estimate_jobs", {
  id: serial("id").primaryKey(),
  estimateId: integer("estimate_id").notNull().references(() => estimates.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  vmrsCode: text("vmrs_code"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEstimateJobSchema = createInsertSchema(estimateJobs).omit({ 
  id: true, 
  createdAt: true 
});
export type InsertEstimateJob = z.infer<typeof insertEstimateJobSchema>;
export type EstimateJob = typeof estimateJobs.$inferSelect;

// Estimate Line Items table
export const estimateLineItems = pgTable("estimate_line_items", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").notNull().references(() => estimateJobs.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  description: text("description").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  rate: decimal("rate", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  source: text("source").default("Manual"),
  vmrsCode: text("vmrs_code"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEstimateLineItemSchema = createInsertSchema(estimateLineItems).omit({ 
  id: true, 
  createdAt: true 
});
export type InsertEstimateLineItem = z.infer<typeof insertEstimateLineItemSchema>;
export type EstimateLineItem = typeof estimateLineItems.$inferSelect;

// Relations
export const customersRelations = relations(customers, ({ many }) => ({
  vehicles: many(vehicles),
  repairOrders: many(repairOrders),
}));

export const vehiclesRelations = relations(vehicles, ({ one, many }) => ({
  customer: one(customers, {
    fields: [vehicles.customerId],
    references: [customers.id],
  }),
  repairOrders: many(repairOrders),
}));

export const repairOrdersRelations = relations(repairOrders, ({ one, many }) => ({
  customer: one(customers, {
    fields: [repairOrders.customerId],
    references: [customers.id],
  }),
  vehicle: one(vehicles, {
    fields: [repairOrders.vehicleId],
    references: [vehicles.id],
  }),
  inspectionItems: many(inspectionItems),
  serviceLineItems: many(serviceLineItems),
  estimates: many(estimates),
}));

export const inspectionItemsRelations = relations(inspectionItems, ({ one }) => ({
  repairOrder: one(repairOrders, {
    fields: [inspectionItems.repairOrderId],
    references: [repairOrders.id],
  }),
}));

export const serviceLineItemsRelations = relations(serviceLineItems, ({ one }) => ({
  repairOrder: one(repairOrders, {
    fields: [serviceLineItems.repairOrderId],
    references: [repairOrders.id],
  }),
}));

export const estimatesRelations = relations(estimates, ({ one, many }) => ({
  repairOrder: one(repairOrders, {
    fields: [estimates.repairOrderId],
    references: [repairOrders.id],
  }),
  jobs: many(estimateJobs),
}));

export const estimateJobsRelations = relations(estimateJobs, ({ one, many }) => ({
  estimate: one(estimates, {
    fields: [estimateJobs.estimateId],
    references: [estimates.id],
  }),
  lineItems: many(estimateLineItems),
}));

export const estimateLineItemsRelations = relations(estimateLineItems, ({ one }) => ({
  job: one(estimateJobs, {
    fields: [estimateLineItems.jobId],
    references: [estimateJobs.id],
  }),
}));

// Inventory / Parts table
export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  partNumber: text("part_number").notNull(),
  description: text("description").notNull(),
  brand: text("brand"),
  category: text("category"),
  cost: decimal("cost", { precision: 10, scale: 2 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  quantityOnHand: integer("quantity_on_hand").default(0),
  reorderLevel: integer("reorder_level").default(5),
  location: text("location"),
  vmrsCode: text("vmrs_code"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertInventorySchema = createInsertSchema(inventory).omit({ 
  id: true, 
  createdAt: true 
});
export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type InventoryItem = typeof inventory.$inferSelect;

// PM Services table - admin-managed list of preventive maintenance services
export const pmServices = pgTable("pm_services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  enabled: boolean("enabled").default(true).notNull(),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPmServiceSchema = createInsertSchema(pmServices).omit({ 
  id: true, 
  createdAt: true 
});
export type InsertPmService = z.infer<typeof insertPmServiceSchema>;
export type PmService = typeof pmServices.$inferSelect;
