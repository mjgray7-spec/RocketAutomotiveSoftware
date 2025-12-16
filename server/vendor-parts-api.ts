// Vendor Parts API - External Parts Supplier Integration
// This module handles searching external parts vendors for availability, pricing, and ETAs
// Currently uses simulated data - can be connected to real vendor APIs (O'Reilly, NAPA, Worldpac, etc.)

export interface VendorPart {
  id: string;
  vendorName: string;
  partNumber: string;
  description: string;
  brand: string;
  price: number;
  cost: number;
  quantityAvailable: number;
  warehouseLocation: string;
  distanceMiles: number;
  etaHours: number;
  etaDisplay: string;
  coreCharge?: number;
  notes?: string;
}

export interface VendorSearchResult {
  query: string;
  resultCount: number;
  vendors: string[];
  parts: VendorPart[];
  searchTime: number;
}

// Simulated vendor database - represents combined inventory from multiple suppliers
const VENDOR_PARTS_DATABASE: Omit<VendorPart, 'id'>[] = [
  // O'Reilly Parts
  { vendorName: "O'Reilly Auto Parts", partNumber: "BXT-65", description: "Battery - Group 65 AGM", brand: "Super Start Extreme", price: 229.99, cost: 165.00, quantityAvailable: 8, warehouseLocation: "Local Store #1247", distanceMiles: 2.3, etaHours: 1, etaDisplay: "Same Day - 1 hour" },
  { vendorName: "O'Reilly Auto Parts", partNumber: "TXL65", description: "Battery - Group 65 Premium", brand: "Duralast Gold", price: 189.99, cost: 135.00, quantityAvailable: 12, warehouseLocation: "Local Store #1247", distanceMiles: 2.3, etaHours: 1, etaDisplay: "Same Day - 1 hour" },
  { vendorName: "O'Reilly Auto Parts", partNumber: "MKD1084", description: "Brake Pads - Premium Ceramic Front", brand: "Wagner ThermoQuiet", price: 89.99, cost: 52.00, quantityAvailable: 6, warehouseLocation: "Local Store #1247", distanceMiles: 2.3, etaHours: 1, etaDisplay: "Same Day - 1 hour" },
  { vendorName: "O'Reilly Auto Parts", partNumber: "53-87045", description: "Brake Rotor - Front Premium", brand: "Raybestos", price: 68.99, cost: 42.00, quantityAvailable: 4, warehouseLocation: "Distribution Center", distanceMiles: 45, etaHours: 24, etaDisplay: "Next Day Delivery" },
  { vendorName: "O'Reilly Auto Parts", partNumber: "15209", description: "Starter Motor - Remanufactured", brand: "Ultima", price: 189.99, cost: 115.00, quantityAvailable: 2, warehouseLocation: "Distribution Center", distanceMiles: 45, etaHours: 24, etaDisplay: "Next Day Delivery" },
  
  // NAPA Auto Parts
  { vendorName: "NAPA Auto Parts", partNumber: "BAT 7565", description: "Battery - Group 65 Legend Premium", brand: "NAPA Legend", price: 215.99, cost: 155.00, quantityAvailable: 5, warehouseLocation: "NAPA Store #2891", distanceMiles: 4.1, etaHours: 2, etaDisplay: "Same Day - 2 hours" },
  { vendorName: "NAPA Auto Parts", partNumber: "SS-7941", description: "Starter Motor - New OE", brand: "NAPA Power Premium+", price: 285.99, cost: 195.00, quantityAvailable: 1, warehouseLocation: "NAPA Store #2891", distanceMiles: 4.1, etaHours: 2, etaDisplay: "Same Day - 2 hours" },
  { vendorName: "NAPA Auto Parts", partNumber: "UP 37849", description: "Brake Pads - Ultra Premium Ceramic", brand: "NAPA Ultra Premium", price: 94.99, cost: 58.00, quantityAvailable: 8, warehouseLocation: "NAPA Store #2891", distanceMiles: 4.1, etaHours: 2, etaDisplay: "Same Day - 2 hours" },
  { vendorName: "NAPA Auto Parts", partNumber: "AL 9318", description: "Alternator - Remanufactured 150A", brand: "NAPA Reman", price: 225.99, cost: 145.00, quantityAvailable: 3, warehouseLocation: "NAPA DC Memphis", distanceMiles: 180, etaHours: 48, etaDisplay: "2 Business Days" },
  { vendorName: "NAPA Auto Parts", partNumber: "FIL 21348", description: "Oil Filter - Premium Gold", brand: "NAPA Gold", price: 12.99, cost: 5.50, quantityAvailable: 50, warehouseLocation: "NAPA Store #2891", distanceMiles: 4.1, etaHours: 2, etaDisplay: "Same Day - 2 hours" },
  
  // AutoZone
  { vendorName: "AutoZone", partNumber: "35-DLG", description: "Battery - Duralast Gold Group 35", brand: "Duralast Gold", price: 179.99, cost: 125.00, quantityAvailable: 10, warehouseLocation: "AutoZone #3421", distanceMiles: 1.8, etaHours: 1, etaDisplay: "Same Day - 1 hour" },
  { vendorName: "AutoZone", partNumber: "RFR-S35", description: "Brake Rotor - Front Drilled/Slotted", brand: "Power Stop", price: 89.99, cost: 55.00, quantityAvailable: 2, warehouseLocation: "AutoZone #3421", distanceMiles: 1.8, etaHours: 1, etaDisplay: "Same Day - 1 hour" },
  { vendorName: "AutoZone", partNumber: "Z26-1084", description: "Brake Pads - Carbon-Fiber Ceramic", brand: "Power Stop Z26", price: 119.99, cost: 72.00, quantityAvailable: 4, warehouseLocation: "Hub Store", distanceMiles: 12, etaHours: 4, etaDisplay: "Same Day - 4 hours" },
  { vendorName: "AutoZone", partNumber: "DL-7941", description: "Starter Motor - Duralast", brand: "Duralast", price: 175.99, cost: 105.00, quantityAvailable: 3, warehouseLocation: "AutoZone #3421", distanceMiles: 1.8, etaHours: 1, etaDisplay: "Same Day - 1 hour" },
  { vendorName: "AutoZone", partNumber: "DL-ALT-150", description: "Alternator - 150 Amp New", brand: "Duralast Gold", price: 265.99, cost: 175.00, quantityAvailable: 2, warehouseLocation: "Hub Store", distanceMiles: 12, etaHours: 4, etaDisplay: "Same Day - 4 hours" },
  
  // Worldpac (Professional/Dealer)
  { vendorName: "Worldpac", partNumber: "BOD0948-OE", description: "Brake Pads - OE Replacement Front", brand: "Bosch QuietCast", price: 75.99, cost: 48.00, quantityAvailable: 20, warehouseLocation: "Worldpac DC #14", distanceMiles: 65, etaHours: 24, etaDisplay: "Next Business Day" },
  { vendorName: "Worldpac", partNumber: "MOT-3291-S", description: "Starter Motor - OEM New", brand: "Motorcraft", price: 320.00, cost: 225.00, quantityAvailable: 4, warehouseLocation: "Worldpac DC #14", distanceMiles: 65, etaHours: 24, etaDisplay: "Next Business Day" },
  { vendorName: "Worldpac", partNumber: "DEN-421-0403", description: "Alternator - OEM Remanufactured", brand: "Denso", price: 245.00, cost: 165.00, quantityAvailable: 6, warehouseLocation: "Worldpac DC #14", distanceMiles: 65, etaHours: 24, etaDisplay: "Next Business Day" },
  { vendorName: "Worldpac", partNumber: "ACK-G78", description: "Battery - Professional AGM", brand: "ACDelco", price: 199.99, cost: 140.00, quantityAvailable: 15, warehouseLocation: "Worldpac DC #14", distanceMiles: 65, etaHours: 24, etaDisplay: "Next Business Day" },
  { vendorName: "Worldpac", partNumber: "BRE-54111", description: "Brake Rotor - OE Premium Front", brand: "Brembo", price: 125.00, cost: 82.00, quantityAvailable: 8, warehouseLocation: "Worldpac DC #14", distanceMiles: 65, etaHours: 24, etaDisplay: "Next Business Day" },
  
  // Advance Auto Parts
  { vendorName: "Advance Auto Parts", partNumber: "CRK-17001", description: "Serpentine Belt Kit - Complete", brand: "Gates", price: 89.99, cost: 55.00, quantityAvailable: 5, warehouseLocation: "Advance #4521", distanceMiles: 3.5, etaHours: 2, etaDisplay: "Same Day - 2 hours" },
  { vendorName: "Advance Auto Parts", partNumber: "WP-38045", description: "Water Pump - New", brand: "Gates", price: 78.99, cost: 48.00, quantityAvailable: 3, warehouseLocation: "Advance #4521", distanceMiles: 3.5, etaHours: 2, etaDisplay: "Same Day - 2 hours" },
  { vendorName: "Advance Auto Parts", partNumber: "THM-49110", description: "Thermostat - OE Replacement", brand: "Stant", price: 24.99, cost: 12.00, quantityAvailable: 12, warehouseLocation: "Advance #4521", distanceMiles: 3.5, etaHours: 2, etaDisplay: "Same Day - 2 hours" },
  { vendorName: "Advance Auto Parts", partNumber: "SPK-41162", description: "Spark Plug Set (4) - Iridium", brand: "NGK Iridium IX", price: 52.99, cost: 32.00, quantityAvailable: 20, warehouseLocation: "Advance #4521", distanceMiles: 3.5, etaHours: 2, etaDisplay: "Same Day - 2 hours" },
  { vendorName: "Advance Auto Parts", partNumber: "CAB-18230", description: "Cabin Air Filter - Premium", brand: "Fram Fresh Breeze", price: 28.99, cost: 14.00, quantityAvailable: 15, warehouseLocation: "Advance #4521", distanceMiles: 3.5, etaHours: 2, etaDisplay: "Same Day - 2 hours" },
];

export async function searchVendorParts(searchTerm: string): Promise<VendorSearchResult> {
  const startTime = Date.now();
  
  if (!searchTerm || searchTerm.length < 2) {
    return {
      query: searchTerm,
      resultCount: 0,
      vendors: [],
      parts: [],
      searchTime: Date.now() - startTime,
    };
  }

  const terms = searchTerm.toLowerCase().split(/\s+/);
  
  const matchedParts = VENDOR_PARTS_DATABASE.filter(part => {
    const searchableText = [
      part.partNumber,
      part.description,
      part.brand,
      part.vendorName,
    ].join(' ').toLowerCase();
    
    return terms.every(term => searchableText.includes(term));
  }).map((part, index) => ({
    ...part,
    id: `${part.vendorName.replace(/\s+/g, '-').toLowerCase()}-${part.partNumber}`,
  }));

  // Sort by ETA (fastest first), then by price
  matchedParts.sort((a, b) => {
    if (a.etaHours !== b.etaHours) return a.etaHours - b.etaHours;
    return a.price - b.price;
  });

  const uniqueVendors = Array.from(new Set(matchedParts.map(p => p.vendorName)));

  return {
    query: searchTerm,
    resultCount: matchedParts.length,
    vendors: uniqueVendors,
    parts: matchedParts.slice(0, 50), // Limit results
    searchTime: Date.now() - startTime,
  };
}

// In the future, this can be extended to support real vendor APIs:
// - O'Reilly Professional Parts API
// - NAPA PROLink API
// - Worldpac SpeedDial API
// - AutoZone Pro API
// - Advance Auto Parts Commercial API
