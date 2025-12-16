// Mock VMRS Data based on standard hierarchy: System (3) - Assembly (3) - Component (3)

export interface VMRSCode {
  code: string; // Format: 000-000-000
  system: string;
  assembly: string;
  component: string;
  description: string;
}

export const VMRS_DATA: VMRSCode[] = [
  // 001 - Air Conditioning, Heating & Ventilation
  {
    code: "001-001-002",
    system: "Air Conditioning, Heating & Ventilation",
    assembly: "Air Conditioning Assembly",
    component: "Compressor",
    description: "A/C Compressor"
  },
  // 013 - Brakes
  {
    code: "013-001-015",
    system: "Brakes",
    assembly: "Front Brakes",
    component: "Brake Pads/Shoes",
    description: "Front Brake Pads"
  },
  {
    code: "013-001-021",
    system: "Brakes",
    assembly: "Front Brakes",
    component: "Rotor/Drum",
    description: "Front Brake Rotor"
  },
  {
    code: "013-002-015",
    system: "Brakes",
    assembly: "Rear Brakes",
    component: "Brake Pads/Shoes",
    description: "Rear Brake Pads"
  },
  // 017 - Tires
  {
    code: "017-001-001",
    system: "Tires",
    assembly: "Tires, Steer",
    component: "Tire",
    description: "Steer Axle Tire"
  },
  // 002 - Cab & Sheet Metal
  {
    code: "002-021-001",
    system: "Cab & Sheet Metal",
    assembly: "Wiper System",
    component: "Blade",
    description: "Wiper Blade"
  },
  {
    code: "002-010-001",
    system: "Cab & Sheet Metal",
    assembly: "Door, Front",
    component: "Mirror Assembly",
    description: "Side View Mirror"
  },
  // 003 - Instruments & Gauges
  {
    code: "003-001-001",
    system: "Instruments & Gauges",
    assembly: "Dash",
    component: "Light/Bulb",
    description: "Check Engine Light Diagnosis"
  },
  // 045 - Power Plant (Engine)
  {
    code: "045-001-000",
    system: "Power Plant",
    assembly: "Power Plant",
    component: "Complete",
    description: "Engine Oil & Filter Service"
  },
  // 042 - Cooling System
  {
    code: "042-001-001",
    system: "Cooling System",
    assembly: "Radiator",
    component: "Radiator",
    description: "Radiator Assembly"
  }
];

// Helper to lookup VMRS by keyword/category
export function findVMRS(searchTerm: string): VMRSCode | undefined {
  if (!searchTerm) return undefined;
  
  const term = searchTerm.toLowerCase();
  
  // Try exact matches first
  const exactMatch = VMRS_DATA.find(item => 
    item.description.toLowerCase() === term || 
    item.component.toLowerCase() === term
  );
  if (exactMatch) return exactMatch;

  // Try partial matches on description, component, system, or assembly
  return VMRS_DATA.find(item => 
    item.description.toLowerCase().includes(term) || 
    item.component.toLowerCase().includes(term) ||
    item.assembly.toLowerCase().includes(term) ||
    item.system.toLowerCase().includes(term)
  );
}
