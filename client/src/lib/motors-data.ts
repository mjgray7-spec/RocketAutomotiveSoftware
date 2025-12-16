// Mock Motors Labor Time Data
// Maps VMRS Code to Standard Repair Times (SRT)

export interface LaborTime {
  vmrsCode: string;
  hours: number;
  difficulty: "Easy" | "Moderate" | "Hard";
}

export const MOTORS_DATA: Record<string, LaborTime> = {
  "001-001-002": { vmrsCode: "001-001-002", hours: 2.5, difficulty: "Moderate" }, // A/C Compressor
  "013-001-015": { vmrsCode: "013-001-015", hours: 1.2, difficulty: "Easy" },     // Front Brake Pads
  "013-001-021": { vmrsCode: "013-001-021", hours: 1.5, difficulty: "Moderate" }, // Front Rotors
  "013-002-015": { vmrsCode: "013-002-015", hours: 1.2, difficulty: "Easy" },     // Rear Brake Pads
  "017-001-001": { vmrsCode: "017-001-001", hours: 0.5, difficulty: "Easy" },     // Tire
  "002-021-001": { vmrsCode: "002-021-001", hours: 0.1, difficulty: "Easy" },     // Wiper Blade
  "003-001-001": { vmrsCode: "003-001-001", hours: 1.0, difficulty: "Moderate" }, // Diagnostics
  "045-001-000": { vmrsCode: "045-001-000", hours: 0.5, difficulty: "Easy" },     // Oil Change
  "042-001-001": { vmrsCode: "042-001-001", hours: 3.0, difficulty: "Hard" },     // Radiator
};

export function getLaborTime(vmrsCode: string): LaborTime {
  return MOTORS_DATA[vmrsCode] || { vmrsCode, hours: 1.0, difficulty: "Moderate" }; // Default 1.0h
}
