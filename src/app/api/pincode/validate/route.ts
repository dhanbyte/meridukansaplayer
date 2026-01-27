import { NextResponse } from 'next/server';

// Cache for validated pincodes to avoid repeated API calls
const pincodeCache = new Map<string, { valid: boolean; city?: string; state?: string }>();

export async function POST(request: Request) {
    try {
        const { pincodes } = await request.json();

        if (!pincodes || !Array.isArray(pincodes)) {
            return NextResponse.json({ error: 'Pincodes array is required' }, { status: 400 });
        }

        const results: Record<string, { valid: boolean; city?: string; state?: string }> = {};

        for (const pincode of pincodes) {
            const cleanPin = pincode?.toString().replace(/['"]/g, '').trim();

            if (!cleanPin || cleanPin.length !== 6 || !/^\d{6}$/.test(cleanPin)) {
                results[pincode] = { valid: false };
                continue;
            }

            // Check cache first
            if (pincodeCache.has(cleanPin)) {
                results[pincode] = pincodeCache.get(cleanPin)!;
                continue;
            }

            try {
                // Use India Post API to validate pincode
                const response = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`);
                const data = await response.json();

                if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
                    const postOffice = data[0].PostOffice[0];
                    const result = {
                        valid: true,
                        city: postOffice.District || postOffice.Name,
                        state: postOffice.State
                    };
                    pincodeCache.set(cleanPin, result);
                    results[pincode] = result;
                } else {
                    const result = { valid: false };
                    pincodeCache.set(cleanPin, result);
                    results[pincode] = result;
                }
            } catch (apiError) {
                console.error(`Error validating pincode ${cleanPin}:`, apiError);
                // On API error, assume valid to not block the flow
                results[pincode] = { valid: true };
            }
        }

        return NextResponse.json({ success: true, results });
    } catch (error) {
        console.error('Pincode validation error:', error);
        return NextResponse.json({ error: 'Validation failed' }, { status: 500 });
    }
}
