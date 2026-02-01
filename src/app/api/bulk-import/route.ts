import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { findBestMatch, validatePincodeFormat, validatePhoneFormat } from '@/lib/fuzzyMatch';
import * as XLSX from 'xlsx';
import pincodeData from '@/data/india_pincodes.json';

// Type for pincode data
interface PincodeInfo {
    state: string;
    city: string;
    zone: string;
    serviceable: boolean;
}

// India Pincode Database - loaded from comprehensive JSON file
const PINCODE_DB: Record<string, PincodeInfo> = pincodeData as Record<string, PincodeInfo>;

// Pincode zone map for fallback inference
const ZONE_MAP: Record<string, string> = {
    '11': 'Delhi',
    '12': 'Haryana',
    '13': 'Punjab',
    '14': 'Punjab',
    '15': 'Himachal Pradesh',
    '16': 'Punjab',
    '17': 'Himachal Pradesh',
    '18': 'Jammu & Kashmir',
    '19': 'Jammu & Kashmir',
    '20': 'Uttar Pradesh',
    '21': 'Uttar Pradesh',
    '22': 'Uttar Pradesh',
    '23': 'Uttar Pradesh',
    '24': 'Uttar Pradesh',
    '25': 'Uttar Pradesh',
    '26': 'Uttar Pradesh',
    '27': 'Uttar Pradesh',
    '28': 'Uttar Pradesh',
    '30': 'Rajasthan',
    '31': 'Rajasthan',
    '32': 'Rajasthan',
    '33': 'Rajasthan',
    '34': 'Rajasthan',
    '36': 'Gujarat',
    '37': 'Gujarat',
    '38': 'Gujarat',
    '39': 'Gujarat',
    '40': 'Maharashtra',
    '41': 'Maharashtra',
    '42': 'Maharashtra',
    '43': 'Maharashtra',
    '44': 'Maharashtra',
    '45': 'Madhya Pradesh',
    '46': 'Madhya Pradesh',
    '47': 'Madhya Pradesh',
    '48': 'Madhya Pradesh',
    '49': 'Chhattisgarh',
    '50': 'Telangana',
    '51': 'Telangana',
    '52': 'Andhra Pradesh',
    '53': 'Andhra Pradesh',
    '56': 'Karnataka',
    '57': 'Karnataka',
    '58': 'Karnataka',
    '59': 'Karnataka',
    '60': 'Tamil Nadu',
    '61': 'Tamil Nadu',
    '62': 'Tamil Nadu',
    '63': 'Tamil Nadu',
    '64': 'Tamil Nadu',
    '67': 'Kerala',
    '68': 'Kerala',
    '69': 'Kerala',
    '70': 'West Bengal',
    '71': 'West Bengal',
    '72': 'West Bengal',
    '73': 'West Bengal',
    '74': 'West Bengal',
    '75': 'Odisha',
    '76': 'Odisha',
    '77': 'Odisha',
    '78': 'Assam',
    '79': 'Northeast States',
    '80': 'Bihar',
    '81': 'Bihar',
    '82': 'Bihar',
    '83': 'Bihar',
    '84': 'Bihar',
    '85': 'Jharkhand',
};

// Get pincode info with serviceability check
function getPincodeInfo(pincode: string): {
    state: string;
    city: string;
    serviceable: boolean;
    zone?: string;
} | null {
    // First check comprehensive DB
    if (PINCODE_DB[pincode]) {
        const info = PINCODE_DB[pincode];
        return {
            state: info.state,
            city: info.city,
            serviceable: info.serviceable,
            zone: info.zone
        };
    }

    // Fallback: Infer state from first 2 digits
    const prefix = parseInt(pincode.substring(0, 2));
    const prefixStr = prefix.toString().padStart(2, '0');
    const state = ZONE_MAP[prefixStr];

    if (state) {
        // Unknown pincodes in Northeast are not serviceable by default
        const isNortheast = ['78', '79'].includes(prefixStr);
        return {
            state,
            city: 'Unknown',
            serviceable: !isNortheast,
            zone: isNortheast ? 'Northeast' : undefined
        };
    }

    return null;
}

interface ImportRow {
    rowNumber: number;
    productName: string;
    quantity: number;
    customerName: string;
    customerPhone: string;
    address: string;
    pincode: string;
    city?: string;
    state?: string;
    sellingPrice?: number;
    // Validation results
    matchedProduct?: any;
    matchScore?: number;
    matchStatus?: 'auto' | 'suggest' | 'not_found';
    pincodeValid?: boolean;
    phoneValid?: boolean;
    inferredState?: string;
    inferredCity?: string;
    errors: string[];
    warnings: string[];
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Read Excel file
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(sheet);

        if (rawData.length === 0) {
            return NextResponse.json({ error: 'Empty file or invalid format' }, { status: 400 });
        }

        // Fetch all products for fuzzy matching
        let products: any[] = [];
        if (supabase) {
            const { data } = await supabase
                .from('products')
                .select('id, name, price, image_url, stock, packing_cost_per_unit')
                .eq('is_active', true);
            products = data || [];
        }

        // Process each row
        const processedRows: ImportRow[] = [];
        let totalAutoMatched = 0;
        let totalSuggested = 0;
        let totalNotFound = 0;
        let totalPincodeErrors = 0;
        let totalPhoneErrors = 0;

        for (let i = 0; i < rawData.length; i++) {
            const row = rawData[i] as any;
            const rowNumber = i + 2; // Excel row number (1-indexed + header)

            // Extract fields (handle various column name formats)
            const productName = row['Product Name'] || row['product_name'] || row['ProductName'] || row['Item'] || '';
            const quantity = parseInt(row['Quantity'] || row['qty'] || row['Qty'] || '1') || 1;
            const customerName = row['Customer Name'] || row['customer_name'] || row['Name'] || '';
            const customerPhone = String(row['Phone'] || row['phone'] || row['Mobile'] || row['mobile'] || '');
            const address = row['Address'] || row['address'] || row['Shipping Address'] || '';
            const pincode = String(row['Pincode'] || row['pincode'] || row['PIN'] || row['pin'] || '');
            const city = row['City'] || row['city'] || '';
            const state = row['State'] || row['state'] || '';
            const sellingPrice = parseFloat(row['Selling Price'] || row['selling_price'] || row['SellingPrice'] || row['Price'] || row['price'] || '0') || 0;

            const errors: string[] = [];
            const warnings: string[] = [];

            // 1. Fuzzy Product Matching
            let matchedProduct = null;
            let matchScore = 0;
            let matchStatus: 'auto' | 'suggest' | 'not_found' = 'not_found';

            if (productName) {
                const matchResult = findBestMatch(productName, products);
                if (matchResult) {
                    matchedProduct = matchResult.product;
                    matchScore = matchResult.score;
                    matchStatus = matchResult.status;

                    if (matchStatus === 'auto') {
                        totalAutoMatched++;
                    } else if (matchStatus === 'suggest') {
                        totalSuggested++;
                        warnings.push(`Product "${productName}" might be "${matchResult.product.name}" (${matchScore}% match)`);
                    } else {
                        totalNotFound++;
                        errors.push(`Product "${productName}" not found in catalog`);
                    }
                } else {
                    totalNotFound++;
                    errors.push(`Product "${productName}" not found`);
                }
            } else {
                errors.push('Missing product name');
            }

            // 2. Pincode Validation
            let pincodeValid = false;
            let inferredState = state;
            let inferredCity = city;
            let isServiceable = true;

            if (pincode) {
                pincodeValid = validatePincodeFormat(pincode);
                if (!pincodeValid) {
                    totalPincodeErrors++;
                    errors.push(`Invalid pincode format: ${pincode}`);
                } else {
                    // Get state/city from pincode with serviceability check
                    const pincodeInfo = getPincodeInfo(pincode);
                    if (pincodeInfo) {
                        inferredState = inferredState || pincodeInfo.state;
                        inferredCity = inferredCity || pincodeInfo.city;
                        isServiceable = pincodeInfo.serviceable;

                        // Warn if pincode is not serviceable
                        if (!isServiceable) {
                            warnings.push(`Delivery not available for pincode ${pincode} (${pincodeInfo.city}, ${pincodeInfo.state})`);
                        }
                    }
                }
            } else {
                errors.push('Missing pincode');
                totalPincodeErrors++;
            }

            // 3. Phone Validation
            let phoneValid = false;
            if (customerPhone) {
                phoneValid = validatePhoneFormat(customerPhone);
                if (!phoneValid) {
                    totalPhoneErrors++;
                    errors.push(`Invalid phone number: ${customerPhone}`);
                }
            } else {
                errors.push('Missing phone number');
                totalPhoneErrors++;
            }

            // 4. Other validations
            if (!customerName) {
                errors.push('Missing customer name');
            }
            if (!address) {
                errors.push('Missing address');
            }
            if (quantity < 1) {
                errors.push('Invalid quantity');
            }

            processedRows.push({
                rowNumber,
                productName,
                quantity,
                customerName,
                customerPhone,
                address,
                pincode,
                city,
                state,
                sellingPrice,
                matchedProduct,
                matchScore,
                matchStatus,
                pincodeValid,
                phoneValid,
                inferredState,
                inferredCity,
                errors,
                warnings
            });
        }

        // Prepare summary
        const validRows = processedRows.filter(r => r.errors.length === 0);
        const invalidRows = processedRows.filter(r => r.errors.length > 0);

        return NextResponse.json({
            success: true,
            summary: {
                totalRows: processedRows.length,
                validRows: validRows.length,
                invalidRows: invalidRows.length,
                autoMatched: totalAutoMatched,
                suggested: totalSuggested,
                notFound: totalNotFound,
                pincodeErrors: totalPincodeErrors,
                phoneErrors: totalPhoneErrors
            },
            rows: processedRows
        });

    } catch (error) {
        console.error('Bulk import error:', error);
        return NextResponse.json({
            error: 'Failed to process file',
            details: String(error)
        }, { status: 500 });
    }
}
