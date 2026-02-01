// Pincode to State Code mapping utility for India Map analytics
// Uses pincode ranges to determine state code

// State code to name mapping (for UI display and map component)
export const STATE_NAMES: Record<string, string> = {
    'AN': 'Andaman and Nicobar',
    'AP': 'Andhra Pradesh',
    'AR': 'Arunachal Pradesh',
    'AS': 'Assam',
    'BR': 'Bihar',
    'CH': 'Chandigarh',
    'CT': 'Chhattisgarh',
    'DL': 'Delhi',
    'GA': 'Goa',
    'GJ': 'Gujarat',
    'HR': 'Haryana',
    'HP': 'Himachal Pradesh',
    'JK': 'Jammu and Kashmir',
    'JH': 'Jharkhand',
    'KA': 'Karnataka',
    'KL': 'Kerala',
    'LA': 'Ladakh',
    'LD': 'Lakshadweep',
    'MP': 'Madhya Pradesh',
    'MH': 'Maharashtra',
    'MN': 'Manipur',
    'ML': 'Meghalaya',
    'MZ': 'Mizoram',
    'NL': 'Nagaland',
    'OR': 'Odisha',
    'PB': 'Punjab',
    'PY': 'Puducherry',
    'RJ': 'Rajasthan',
    'SK': 'Sikkim',
    'TN': 'Tamil Nadu',
    'TG': 'Telangana',
    'TR': 'Tripura',
    'UP': 'Uttar Pradesh',
    'UK': 'Uttarakhand',
    'WB': 'West Bengal'
};

// Full state name to state code mapping
export const STATE_NAME_TO_CODE: Record<string, string> = {
    'Delhi': 'DL',
    'Haryana': 'HR',
    'Uttar Pradesh': 'UP',
    'Rajasthan': 'RJ',
    'Gujarat': 'GJ',
    'Maharashtra': 'MH',
    'Karnataka': 'KA',
    'Tamil Nadu': 'TN',
    'Kerala': 'KL',
    'West Bengal': 'WB',
    'Bihar': 'BR',
    'Jharkhand': 'JH',
    'Odisha': 'OR',
    'Madhya Pradesh': 'MP',
    'Chhattisgarh': 'CT',
    'Andhra Pradesh': 'AP',
    'Telangana': 'TG',
    'Punjab': 'PB',
    'Chandigarh': 'CH',
    'Himachal Pradesh': 'HP',
    'Uttarakhand': 'UK',
    'Jammu and Kashmir': 'JK',
    'Jammu And Kashmir': 'JK',
    'Ladakh': 'LA',
    'Goa': 'GA',
    'Assam': 'AS',
    'Meghalaya': 'ML',
    'Tripura': 'TR',
    'Mizoram': 'MZ',
    'Manipur': 'MN',
    'Nagaland': 'NL',
    'Arunachal Pradesh': 'AR',
    'Sikkim': 'SK',
    'Andaman and Nicobar': 'AN',
    'Andaman And Nicobar': 'AN',
    'Andaman & Nicobar': 'AN',
    'Lakshadweep': 'LD',
    'Puducherry': 'PY',
    'Pondicherry': 'PY'
};

// Pincode prefix to state code mapping
// Based on Indian Postal Code system
const PINCODE_PREFIX_TO_STATE: Record<string, string> = {
    // Delhi & NCR
    '110': 'DL',
    '120': 'HR', // Gurugram
    '121': 'HR', // Faridabad
    '122': 'HR', // Gurugram
    '123': 'HR',
    '124': 'HR',
    '125': 'HR',
    '126': 'HR',
    '127': 'HR',
    '131': 'HR',
    '132': 'HR', // Panipat
    '133': 'HR',
    '134': 'HR', // Panchkula
    '135': 'HR',
    '136': 'HR',

    // Uttar Pradesh
    '201': 'UP', // Noida, Ghaziabad
    '202': 'UP',
    '203': 'UP',
    '204': 'UP',
    '205': 'UP',
    '206': 'UP',
    '207': 'UP',
    '208': 'UP', // Kanpur
    '209': 'UP',
    '210': 'UP',
    '211': 'UP', // Allahabad
    '212': 'UP',
    '221': 'UP', // Varanasi
    '222': 'UP',
    '223': 'UP',
    '224': 'UP',
    '225': 'UP',
    '226': 'UP', // Lucknow
    '227': 'UP',
    '228': 'UP',
    '229': 'UP',
    '230': 'UP',
    '231': 'UP',
    '232': 'UP',
    '233': 'UP',
    '241': 'UP',
    '242': 'UP',
    '243': 'UP',
    '244': 'UP',
    '245': 'UP', // Ghaziabad
    '246': 'UP',
    '247': 'UP',
    '248': 'UK', // Dehradun
    '249': 'UK', // Uttarakhand
    '250': 'UP', // Meerut
    '251': 'UP',
    '261': 'UP',
    '262': 'UP',
    '263': 'UK',
    '271': 'UP',
    '272': 'UP',
    '273': 'UP',
    '274': 'UP',
    '275': 'UP',
    '276': 'UP',
    '281': 'UP',
    '282': 'UP', // Agra
    '283': 'UP',
    '284': 'UP',
    '285': 'UP',

    // Rajasthan
    '301': 'RJ',
    '302': 'RJ', // Jaipur
    '303': 'RJ',
    '304': 'RJ',
    '305': 'RJ', // Ajmer
    '306': 'RJ',
    '307': 'RJ',
    '311': 'RJ', // Bhilwara
    '312': 'RJ',
    '313': 'RJ', // Udaipur
    '314': 'RJ',
    '321': 'RJ',
    '322': 'RJ',
    '323': 'RJ',
    '324': 'RJ', // Kota
    '325': 'RJ',
    '326': 'RJ',
    '327': 'RJ',
    '328': 'RJ',
    '331': 'RJ',
    '332': 'RJ',
    '333': 'RJ',
    '334': 'RJ',
    '335': 'RJ',
    '341': 'RJ',
    '342': 'RJ', // Jodhpur
    '343': 'RJ',
    '344': 'RJ',
    '345': 'RJ',

    // Gujarat
    '360': 'GJ', // Rajkot
    '361': 'GJ',
    '362': 'GJ',
    '363': 'GJ',
    '364': 'GJ',
    '365': 'GJ',
    '370': 'GJ',
    '380': 'GJ', // Ahmedabad
    '381': 'GJ',
    '382': 'GJ', // Gandhinagar
    '383': 'GJ',
    '384': 'GJ',
    '385': 'GJ',
    '387': 'GJ',
    '388': 'GJ',
    '389': 'GJ',
    '390': 'GJ', // Vadodara
    '391': 'GJ',
    '392': 'GJ',
    '393': 'GJ',
    '394': 'GJ',
    '395': 'GJ', // Surat
    '396': 'GJ',

    // Maharashtra
    '400': 'MH', // Mumbai
    '401': 'MH',
    '402': 'MH',
    '403': 'GA', // Goa
    '410': 'MH',
    '411': 'MH', // Pune
    '412': 'MH',
    '413': 'MH',
    '414': 'MH',
    '415': 'MH',
    '416': 'MH',
    '421': 'MH',
    '422': 'MH',
    '423': 'MH',
    '424': 'MH',
    '425': 'MH',
    '431': 'MH', // Aurangabad
    '440': 'MH', // Nagpur
    '441': 'MH',
    '442': 'MH',
    '443': 'MH',
    '444': 'MH',
    '445': 'MH',

    // Madhya Pradesh
    '450': 'MP',
    '451': 'MP',
    '452': 'MP', // Indore
    '453': 'MP',
    '454': 'MP',
    '455': 'MP',
    '456': 'MP',
    '457': 'MP',
    '458': 'MP',
    '460': 'MP',
    '461': 'MP',
    '462': 'MP', // Bhopal
    '463': 'MP',
    '464': 'MP',
    '465': 'MP',
    '466': 'MP',
    '470': 'MP',
    '471': 'MP',
    '472': 'MP',
    '473': 'MP',
    '474': 'MP', // Gwalior
    '475': 'MP',
    '476': 'MP',
    '477': 'MP',
    '480': 'MP',
    '481': 'MP',
    '482': 'MP',
    '483': 'MP', // Jabalpur
    '484': 'MP',
    '485': 'MP',
    '486': 'MP',
    '487': 'MP',
    '488': 'MP',

    // Chhattisgarh
    '490': 'CT',
    '491': 'CT', // Raipur
    '492': 'CT',
    '493': 'CT',
    '494': 'CT',
    '495': 'CT',
    '496': 'CT',
    '497': 'CT',

    // Andhra Pradesh & Telangana
    '500': 'TG', // Hyderabad
    '501': 'TG',
    '502': 'TG',
    '503': 'TG',
    '504': 'TG',
    '505': 'TG',
    '506': 'TG',
    '507': 'TG',
    '508': 'TG',
    '509': 'TG',
    '510': 'AP',
    '515': 'AP',
    '516': 'AP',
    '517': 'AP',
    '518': 'AP',
    '520': 'AP', // Vijayawada
    '521': 'AP',
    '522': 'AP',
    '523': 'AP',
    '524': 'AP',
    '530': 'AP', // Visakhapatnam
    '531': 'AP',
    '532': 'AP',
    '533': 'AP',
    '534': 'AP',
    '535': 'AP',

    // Karnataka
    '560': 'KA', // Bangalore
    '561': 'KA',
    '562': 'KA',
    '563': 'KA',
    '570': 'KA', // Mysore
    '571': 'KA',
    '572': 'KA',
    '573': 'KA',
    '574': 'KA', // Mangalore
    '575': 'KA',
    '576': 'KA',
    '577': 'KA',
    '580': 'KA', // Hubli
    '581': 'KA',
    '582': 'KA',
    '583': 'KA',
    '584': 'KA',
    '585': 'KA',
    '586': 'KA',
    '587': 'KA',
    '590': 'KA',
    '591': 'KA',

    // Tamil Nadu
    '600': 'TN', // Chennai
    '601': 'TN',
    '602': 'TN',
    '603': 'TN',
    '604': 'TN',
    '605': 'PY', // Puducherry
    '606': 'TN',
    '607': 'TN',
    '608': 'TN',
    '609': 'TN',
    '610': 'TN',
    '611': 'TN',
    '612': 'TN',
    '613': 'TN',
    '614': 'TN',
    '620': 'TN', // Trichy
    '621': 'TN',
    '622': 'TN',
    '623': 'TN',
    '624': 'TN',
    '625': 'TN', // Madurai
    '626': 'TN',
    '627': 'TN',
    '628': 'TN',
    '629': 'TN',
    '630': 'TN',
    '631': 'TN',
    '632': 'TN',
    '635': 'TN',
    '636': 'TN',
    '637': 'TN',
    '638': 'TN',
    '639': 'TN',
    '640': 'TN', // Coimbatore
    '641': 'TN',
    '642': 'TN',
    '643': 'TN',

    // Kerala
    '670': 'KL', // Kannur
    '671': 'KL',
    '673': 'KL', // Kozhikode
    '674': 'KL',
    '675': 'KL',
    '676': 'KL',
    '677': 'KL',
    '678': 'KL',
    '679': 'KL',
    '680': 'KL', // Thrissur
    '681': 'KL',
    '682': 'KL', // Kochi
    '683': 'KL',
    '684': 'KL',
    '685': 'KL',
    '686': 'KL',
    '688': 'KL',
    '689': 'KL',
    '690': 'KL',
    '691': 'KL',
    '695': 'KL', // Trivandrum
    '696': 'KL',
    '697': 'KL',

    // West Bengal
    '700': 'WB', // Kolkata
    '701': 'WB',
    '711': 'WB',
    '712': 'WB',
    '713': 'WB',
    '721': 'WB',
    '722': 'WB',
    '731': 'WB',
    '732': 'WB',
    '733': 'WB',
    '734': 'WB',
    '735': 'WB',
    '736': 'WB',
    '737': 'SK', // Sikkim

    // Odisha
    '751': 'OR', // Bhubaneswar
    '752': 'OR',
    '753': 'OR',
    '754': 'OR',
    '755': 'OR',
    '756': 'OR',
    '757': 'OR',
    '758': 'OR',
    '759': 'OR',
    '760': 'OR',
    '761': 'OR',
    '762': 'OR',
    '763': 'OR',
    '764': 'OR',
    '765': 'OR',
    '766': 'OR',
    '767': 'OR',
    '768': 'OR',
    '769': 'OR',
    '770': 'OR',

    // Jharkhand
    '814': 'JH',
    '815': 'JH',
    '816': 'JH',
    '825': 'JH',
    '826': 'JH',
    '827': 'JH',
    '828': 'JH',
    '829': 'JH',
    '830': 'JH',
    '831': 'JH',
    '832': 'JH',
    '833': 'JH',
    '834': 'JH', // Ranchi
    '835': 'JH',

    // Bihar
    '800': 'BR', // Patna
    '801': 'BR',
    '802': 'BR',
    '803': 'BR',
    '804': 'BR',
    '805': 'BR',
    '811': 'BR',
    '812': 'BR',
    '813': 'BR',
    '841': 'BR',
    '842': 'BR',
    '843': 'BR',
    '844': 'BR',
    '845': 'BR',
    '846': 'BR',
    '847': 'BR',
    '848': 'BR',
    '851': 'BR',
    '852': 'BR',
    '853': 'BR',
    '854': 'BR',
    '855': 'BR',

    // Assam & NE States
    '781': 'AS', // Guwahati
    '782': 'AS',
    '783': 'AS',
    '784': 'AS',
    '785': 'AS',
    '786': 'AR',
    '787': 'AR',
    '788': 'AS',
    '790': 'AR', // Arunachal Pradesh
    '791': 'AR',
    '792': 'AR',
    '793': 'ML', // Meghalaya
    '794': 'ML',
    '795': 'MN', // Manipur
    '796': 'MZ', // Mizoram
    '797': 'NL', // Nagaland
    '798': 'NL',
    '799': 'TR', // Tripura

    // Punjab
    '140': 'PB',
    '141': 'PB', // Ludhiana
    '142': 'PB',
    '143': 'PB',
    '144': 'PB',
    '145': 'PB',
    '146': 'PB',
    '147': 'PB',
    '148': 'PB',
    '151': 'PB',
    '152': 'PB',
    '160': 'CH', // Chandigarh

    // Himachal Pradesh
    '171': 'HP', // Shimla
    '172': 'HP',
    '173': 'HP',
    '174': 'HP',
    '175': 'HP',
    '176': 'HP',
    '177': 'HP',

    // Jammu & Kashmir
    '180': 'JK', // Jammu
    '181': 'JK',
    '182': 'JK',
    '184': 'JK',
    '185': 'JK',
    '190': 'JK', // Srinagar
    '191': 'JK',
    '192': 'JK',
    '193': 'JK',
    '194': 'LA', // Ladakh

    // Islands
    '744': 'AN', // Andaman & Nicobar
    // Note: Lakshadweep uses 682xxx but that's also Kochi, so we keep 682 as KL
};

/**
 * Get state code from pincode
 * @param pincode - 6 digit Indian pincode
 * @returns 2 letter state code or 'Unknown'
 */
export function getStateCodeFromPincode(pincode: string | null | undefined): string {
    if (!pincode) return 'Unknown';

    const cleanPin = pincode.toString().replace(/\D/g, '').trim();
    if (cleanPin.length !== 6) return 'Unknown';

    // Try 3-digit prefix first
    const prefix3 = cleanPin.substring(0, 3);
    if (PINCODE_PREFIX_TO_STATE[prefix3]) {
        return PINCODE_PREFIX_TO_STATE[prefix3];
    }

    return 'Unknown';
}

/**
 * Get state code from state name (full name to code)
 * @param stateName - Full state name (e.g., "Maharashtra")
 * @returns 2 letter state code or the input if already a code
 */
export function getStateCode(stateName: string | null | undefined): string {
    if (!stateName) return 'Unknown';

    const trimmed = stateName.trim();

    // If already a 2 letter code, return it
    if (trimmed.length === 2 && STATE_NAMES[trimmed.toUpperCase()]) {
        return trimmed.toUpperCase();
    }

    // Look up the name
    const code = STATE_NAME_TO_CODE[trimmed];
    if (code) return code;

    // Try case-insensitive lookup
    const lowerName = trimmed.toLowerCase();
    for (const [name, code] of Object.entries(STATE_NAME_TO_CODE)) {
        if (name.toLowerCase() === lowerName) {
            return code;
        }
    }

    return trimmed; // Return as-is if not found
}

/**
 * Get state code from order data (checks pincode first, then state field)
 * @param pincode - Order pincode
 * @param state - Order state field (could be name or code)
 * @returns 2 letter state code
 */
export function getStateCodeFromOrder(pincode: string | null | undefined, state: string | null | undefined): string {
    // First try to get from pincode (most reliable)
    const fromPincode = getStateCodeFromPincode(pincode);
    if (fromPincode !== 'Unknown') {
        return fromPincode;
    }

    // Fallback to state field
    return getStateCode(state);
}
