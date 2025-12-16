// Motors API Integration for Labor Time Lookups
// Uses MOTOR's Developer Test API (Sandbox)

const MOTOR_API_BASE = "https://api.motor.com/v1";

interface MotorLaborTimeResponse {
  hours: number;
  source: string;
  operation?: string;
  difficulty?: string;
}

export async function lookupLaborTime(vmrsCode: string): Promise<MotorLaborTimeResponse | null> {
  const publicKey = process.env.MOTOR_PUBLIC_KEY;
  const privateKey = process.env.MOTOR_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    console.warn("Motors API keys not configured");
    return getFallbackLaborTime(vmrsCode);
  }

  try {
    // Create Basic Auth header
    const authString = Buffer.from(`${publicKey}:${privateKey}`).toString('base64');
    
    // The Motors API uses VMRS codes to lookup operations
    // For sandbox testing, we'll try to get estimated work times
    const response = await fetch(`${MOTOR_API_BASE}/estimatedworktimes/operations?vmrsCode=${encodeURIComponent(vmrsCode)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      
      // Parse the response to extract labor time
      if (data && data.estimatedWorkTimes && data.estimatedWorkTimes.length > 0) {
        const ewt = data.estimatedWorkTimes[0];
        return {
          hours: ewt.laborTime || ewt.time || 1.0,
          source: "Motors API",
          operation: ewt.operationName || ewt.description,
          difficulty: ewt.difficulty,
        };
      }
    } else if (response.status === 401) {
      console.warn("Motors API: Authentication failed - using fallback");
      return getFallbackLaborTime(vmrsCode);
    } else if (response.status === 404) {
      console.warn("Motors API: No labor time found for VMRS code - using fallback");
      return getFallbackLaborTime(vmrsCode);
    }

    // If API doesn't return data, use intelligent fallback
    return getFallbackLaborTime(vmrsCode);
  } catch (error) {
    console.error("Motors API Error:", error);
    return getFallbackLaborTime(vmrsCode);
  }
}

// Fallback labor times based on VMRS system codes
// These are reasonable estimates when API is unavailable
function getFallbackLaborTime(vmrsCode: string): MotorLaborTimeResponse {
  const systemCode = vmrsCode.split('-')[0];
  
  const laborTimesBySystem: Record<string, { hours: number; difficulty: string }> = {
    // Brakes
    '013': { hours: 1.5, difficulty: 'Moderate' },
    // Engine/Power Plant
    '045': { hours: 2.0, difficulty: 'Complex' },
    // Electrical
    '032': { hours: 1.2, difficulty: 'Moderate' },
    // Cooling System
    '042': { hours: 1.5, difficulty: 'Moderate' },
    // Transmission
    '034': { hours: 3.0, difficulty: 'Complex' },
    // Suspension
    '011': { hours: 1.5, difficulty: 'Moderate' },
    // Steering
    '010': { hours: 1.2, difficulty: 'Moderate' },
    // Tires
    '017': { hours: 0.5, difficulty: 'Simple' },
    // A/C & Heating
    '001': { hours: 1.5, difficulty: 'Moderate' },
    // Exhaust
    '044': { hours: 1.0, difficulty: 'Moderate' },
    // Fuel System
    '043': { hours: 1.5, difficulty: 'Moderate' },
    // Starting/Charging
    '033': { hours: 1.0, difficulty: 'Simple' },
  };

  const match = laborTimesBySystem[systemCode];
  
  if (match) {
    return {
      hours: match.hours,
      source: "Standard Rate Table",
      difficulty: match.difficulty,
    };
  }

  // Default fallback
  return {
    hours: 1.0,
    source: "Default Estimate",
    difficulty: "Moderate",
  };
}
