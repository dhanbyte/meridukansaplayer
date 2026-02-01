/**
 * Fuzzy String Matching Utilities
 * Uses Levenshtein Distance for product name matching
 */

/**
 * Calculate Levenshtein Distance between two strings
 * Returns the minimum number of single-character edits needed
 */
export function levenshteinDistance(s1: string, s2: string): number {
    const costs: number[] = [];

    for (let j = 0; j <= s2.length; j++) {
        costs[j] = j;
    }

    for (let i = 1; i <= s1.length; i++) {
        costs[0] = i;
        let nw = i - 1;

        for (let j = 1; j <= s2.length; j++) {
            const cj = Math.min(
                1 + Math.min(costs[j], costs[j - 1]),
                s1[i - 1] === s2[j - 1] ? nw : nw + 1
            );
            nw = costs[j];
            costs[j] = cj;
        }
    }

    return costs[s2.length];
}

/**
 * Calculate similarity score between two strings (0-1)
 * 1 = exact match, 0 = completely different
 */
export function calculateSimilarity(s1: string, s2: string): number {
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    const longerLength = longer.length;

    if (longerLength === 0) return 1.0;

    const editDistance = levenshteinDistance(
        longer.toLowerCase(),
        shorter.toLowerCase()
    );

    return (longerLength - editDistance) / longerLength;
}

export interface MatchResult {
    product: any;
    score: number;
    status: 'auto' | 'suggest' | 'not_found';
}

/**
 * Find best matching product from database
 * @param query - Vendor's product title from Excel
 * @param products - Products from database
 * @returns Best match with score and status
 */
export function findBestMatch(query: string, products: any[]): MatchResult | null {
    if (!query || !products.length) {
        return null;
    }

    let bestMatch: any = null;
    let highestScore = 0;

    for (const product of products) {
        const productName = product.name || product.title || '';
        const score = calculateSimilarity(query.toLowerCase(), productName.toLowerCase());

        if (score > highestScore) {
            highestScore = score;
            bestMatch = product;
        }
    }

    if (!bestMatch) {
        return null;
    }

    // Determine status based on score thresholds
    let status: 'auto' | 'suggest' | 'not_found';

    if (highestScore >= 0.8) {
        status = 'auto'; // >80% match = Auto-approve
    } else if (highestScore >= 0.5) {
        status = 'suggest'; // 50-80% match = Suggest to user
    } else {
        status = 'not_found'; // <50% match = Rejected
    }

    return {
        product: bestMatch,
        score: Math.round(highestScore * 100), // Return as percentage
        status
    };
}

/**
 * Validate Indian Pincode format
 * @param pincode - Pincode to validate
 * @returns true if valid format (6 digits, starts with non-zero)
 */
export function validatePincodeFormat(pincode: string): boolean {
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    return pincodeRegex.test(pincode.trim());
}

/**
 * Validate phone number format (Indian)
 * @param phone - Phone number to validate
 * @returns true if valid format
 */
export function validatePhoneFormat(phone: string): boolean {
    // Remove spaces, dashes, and country code
    const cleaned = phone.replace(/[\s-]/g, '').replace(/^\+91/, '');
    const phoneRegex = /^[6-9][0-9]{9}$/;
    return phoneRegex.test(cleaned);
}

/**
 * Normalize product name for better matching
 * Removes common variations and normalizes case
 */
export function normalizeProductName(name: string): string {
    return name
        .toLowerCase()
        .replace(/['']/g, "'")
        .replace(/[""]/g, '"')
        .replace(/\s+/g, ' ')
        .replace(/\bgen\b/gi, 'generation')
        .replace(/\bpro\b/gi, 'pro')
        .trim();
}
