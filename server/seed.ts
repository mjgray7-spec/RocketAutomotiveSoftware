import { storage } from "./storage";

async function seed() {
  console.log("🌱 Seeding database...");

  // Create customers
  const johnSmith = await storage.createCustomer({
    name: "John Smith",
    phone: "(555) 123-4567",
    email: "john.smith@email.com",
  });

  const sarahConnor = await storage.createCustomer({
    name: "Sarah Connor",
    phone: "(555) 234-5678",
    email: "sarah.connor@email.com",
  });

  const bruceWayne = await storage.createCustomer({
    name: "Bruce Wayne",
    phone: "(555) 345-6789",
    email: "bruce.wayne@email.com",
  });

  const clarkKent = await storage.createCustomer({
    name: "Clark Kent",
    phone: "(555) 456-7890",
    email: "clark.kent@email.com",
  });

  const dianaPrince = await storage.createCustomer({
    name: "Diana Prince",
    phone: "(555) 567-8901",
    email: "diana.prince@email.com",
  });

  const tonyStark = await storage.createCustomer({
    name: "Tony Stark",
    phone: "(555) 678-9012",
    email: "tony.stark@email.com",
  });

  // Create vehicles
  const fordF150 = await storage.createVehicle({
    customerId: johnSmith.id,
    year: 2018,
    make: "Ford",
    model: "F-150",
    vin: "1FTFW1ET5JFA12345",
    licensePlate: "ABC-1234",
  });

  const teslaModel3 = await storage.createVehicle({
    customerId: sarahConnor.id,
    year: 2021,
    make: "Tesla",
    model: "Model 3",
    vin: "5YJ3E1EA8MF123456",
    licensePlate: "XYZ-5678",
  });

  const lamboUrus = await storage.createVehicle({
    customerId: bruceWayne.id,
    year: 2019,
    make: "Lamborghini",
    model: "Urus",
    vin: "ZPBUA1ZL9KLA12345",
    licensePlate: "BAT-0001",
  });

  const hondaCivic = await storage.createVehicle({
    customerId: clarkKent.id,
    year: 2015,
    make: "Honda",
    model: "Civic",
    vin: "2HGFG3B59FH123456",
    licensePlate: "SUP-1938",
  });

  const jeepWrangler = await storage.createVehicle({
    customerId: dianaPrince.id,
    year: 2020,
    make: "Jeep",
    model: "Wrangler",
    vin: "1C4HJXDG6LW123456",
    licensePlate: "WON-1941",
  });

  const audiR8 = await storage.createVehicle({
    customerId: tonyStark.id,
    year: 2022,
    make: "Audi",
    model: "R8",
    vin: "WUABAAFX4N7123456",
    licensePlate: "STARK-1",
  });

  // Create repair orders
  const ro1024 = await storage.createRepairOrder({
    customerId: johnSmith.id,
    vehicleId: fordF150.id,
    status: "wip",
    techName: "Mike T.",
    service: "Brake Job + Oil Change",
    dueDate: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
    bay: "Bay 1",
    dviStatus: "pending",
    timerRunning: false,
    timerElapsed: 0,
  });

  const ro1025 = await storage.createRepairOrder({
    customerId: sarahConnor.id,
    vehicleId: teslaModel3.id,
    status: "pending",
    techName: "Unassigned",
    service: "Tire Rotation",
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    bay: "Bay 2",
    dviStatus: "pending",
    timerRunning: false,
    timerElapsed: 0,
  });

  await storage.createRepairOrder({
    customerId: bruceWayne.id,
    vehicleId: lamboUrus.id,
    status: "estimate",
    techName: "Batman",
    service: "Engine Diagnostics",
    dueDate: new Date(Date.now() + 5 * 60 * 60 * 1000),
    bay: "Bay 3",
    dviStatus: "pending",
    timerRunning: false,
    timerElapsed: 0,
  });

  await storage.createRepairOrder({
    customerId: clarkKent.id,
    vehicleId: hondaCivic.id,
    status: "approval",
    techName: "Superman",
    service: "Transmission Fluid",
    dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    bay: "Bay 4",
    dviStatus: "pending",
    timerRunning: false,
    timerElapsed: 0,
  });

  await storage.createRepairOrder({
    customerId: dianaPrince.id,
    vehicleId: jeepWrangler.id,
    status: "completed",
    techName: "Wonder Woman",
    service: "Alignment",
    dueDate: new Date(),
    bay: "Alignment Rack",
    dviStatus: "submitted",
    timerRunning: false,
    timerElapsed: 4500,
  });

  await storage.createRepairOrder({
    customerId: tonyStark.id,
    vehicleId: audiR8.id,
    status: "wip",
    techName: "Jarvis",
    service: "Electrical System",
    dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000),
    bay: "Bay 1",
    dviStatus: "pending",
    timerRunning: false,
    timerElapsed: 0,
  });

  // Add service line items for RO 1024
  await storage.createServiceLineItem({
    repairOrderId: ro1024.id,
    description: "Replace Front Brake Pads",
    type: "Labor",
    status: "pending",
    hours: "1.5",
  });

  await storage.createServiceLineItem({
    repairOrderId: ro1024.id,
    description: "Resurface Rotors",
    type: "Labor",
    status: "pending",
    hours: "1.0",
  });

  await storage.createServiceLineItem({
    repairOrderId: ro1024.id,
    description: "Oil Change (Synthetic)",
    type: "Labor",
    status: "pending",
    hours: "0.5",
  });

  await storage.createServiceLineItem({
    repairOrderId: ro1024.id,
    description: "Oil Filter (PF-123)",
    type: "Part",
    status: "pending",
  });

  await storage.createServiceLineItem({
    repairOrderId: ro1024.id,
    description: "5W-30 Oil (6qts)",
    type: "Part",
    status: "pending",
  });

  // Add DVI items for RO 1025
  await storage.createInspectionItem({
    repairOrderId: ro1025.id,
    category: "Brakes",
    status: "fail",
    notes: "Front brake pads worn to 2mm. Immediate replacement required.",
    photoUrl: "/placeholder-brake.jpg",
  });

  await storage.createInspectionItem({
    repairOrderId: ro1025.id,
    category: "Tires",
    status: "caution",
    notes: "Front left tire tread at 4/32. Monitor closely.",
  });

  await storage.createInspectionItem({
    repairOrderId: ro1025.id,
    category: "Wiper Blades",
    status: "caution",
    notes: "Wiper blades showing wear. Recommend replacement.",
  });

  console.log("✅ Database seeded successfully!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
