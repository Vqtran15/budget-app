export const CATEGORIES = {
  INCOME: 'Income',
  HOUSING: 'Housing & Rent',
  FOOD: 'Food & Dining',
  TRANSPORT: 'Transportation',
  SHOPPING: 'Shopping',
  ENTERTAINMENT: 'Entertainment',
  HEALTHCARE: 'Healthcare',
  UTILITIES: 'Utilities & Bills',
  TRANSFER: 'Transfers',
  UNCATEGORIZED: 'Uncategorized',
}

export const CATEGORY_META = {
  [CATEGORIES.INCOME]:       { icon: '💰', color: '#10b981', bg: '#d1fae5' },
  [CATEGORIES.HOUSING]:      { icon: '🏠', color: '#3b82f6', bg: '#dbeafe' },
  [CATEGORIES.FOOD]:         { icon: '🍔', color: '#f59e0b', bg: '#fef3c7' },
  [CATEGORIES.TRANSPORT]:    { icon: '🚗', color: '#8b5cf6', bg: '#ede9fe' },
  [CATEGORIES.SHOPPING]:     { icon: '🛒', color: '#ec4899', bg: '#fce7f3' },
  [CATEGORIES.ENTERTAINMENT]:{ icon: '🎬', color: '#ef4444', bg: '#fee2e2' },
  [CATEGORIES.HEALTHCARE]:   { icon: '💊', color: '#14b8a6', bg: '#ccfbf1' },
  [CATEGORIES.UTILITIES]:    { icon: '💡', color: '#eab308', bg: '#fef9c3' },
  [CATEGORIES.TRANSFER]:     { icon: '↔️', color: '#64748b', bg: '#f1f5f9' },
  [CATEGORIES.UNCATEGORIZED]:{ icon: '❓', color: '#94a3b8', bg: '#f1f5f9' },
}

export const CATEGORY_KEYWORDS = {
  [CATEGORIES.INCOME]: [
    'payroll', 'direct dep', 'direct deposit', 'salary', 'wages', 'paycheck',
    'ach credit', 'tax refund', 'irs', 'interest payment', 'dividend',
    'venmo cashout', 'cashback', 'rewards credit', 'bonus',
  ],
  [CATEGORIES.HOUSING]: [
    'rent', 'mortgage', 'hoa', 'property management', 'lease', 'apartment',
    'zillow', 'real estate',
  ],
  [CATEGORIES.FOOD]: [
    'mcdonald', 'starbucks', 'chipotle', 'pizza', 'doordash', 'ubereats',
    'grubhub', 'whole foods', 'trader joe', 'safeway', 'kroger', 'grocery',
    'diner', 'cafe', 'coffee', 'sushi', 'taco', 'burger', 'subway', "wendy's",
    'chick-fil-a', 'kfc', 'domino', 'panera', "dunkin'", 'dunkin donuts',
    'food', 'kitchen', 'grill', 'bistro', 'bakery', 'instacart', 'fresh market',
    'deli', 'supermarket', 'aldi', 'publix', 'target grocery', 'walmart grocery',
    'five guys', 'in-n-out', 'shake shack', 'panda express', 'popeyes',
    'cheesecake factory', 'olive garden', 'applebee', 'red lobster',
  ],
  [CATEGORIES.TRANSPORT]: [
    'uber trip', 'lyft', 'gas station', 'shell', 'chevron', 'exxon', 'bp oil',
    'parking', 'metro', 'bart', 'transit', 'mta', 'caltrain', 'amtrak',
    'delta air', 'united air', 'southwest air', 'american air', 'jetblue',
    'toll', 'zipcar', 'enterprise rent', 'hertz', 'avis', 'speedway',
    'sunoco', 'valero', 'circle k', 'wawa', 'autozone', 'jiffy lube', 'dmv',
  ],
  [CATEGORIES.SHOPPING]: [
    'amazon', 'target', 'walmart', 'costco', 'best buy', 'apple store',
    'etsy', 'ebay', "macy's", 'nordstrom', 'gap', 'h&m', 'zara', 'nike',
    'adidas', 'tj maxx', 'marshalls', 'ross dress', 'home depot', "lowe's",
    'ikea', 'wayfair', 'chewy', 'petco', 'petsmart', 'sephora', 'ulta',
    'bath body works', 'victoria secret', 'old navy', 'uniqlo', 'shein',
    'dollar tree', 'dollar general', 'five below', 'hobby lobby', 'michaels',
  ],
  [CATEGORIES.ENTERTAINMENT]: [
    'netflix', 'spotify', 'hulu', 'disney+', 'disney plus', 'youtube premium',
    'ticketmaster', 'stubhub', 'steam', 'xbox', 'playstation', 'twitch',
    'apple music', 'pandora', 'hbo max', 'showtime', 'peacock', 'paramount+',
    'amc theater', 'regal cinema', 'cinemark', 'movie', 'concert', 'amazon prime',
    'nintendo', 'epic games', 'crunchyroll', 'sling tv', 'fubo',
  ],
  [CATEGORIES.HEALTHCARE]: [
    'cvs pharmacy', 'walgreens', 'rite aid', 'pharmacy', 'hospital', 'doctor',
    'dental', 'vision', 'medical', 'health', 'urgent care', 'clinic',
    'optometrist', 'therapist', 'insurance', 'copay', 'prescri', 'lab corp',
  ],
  [CATEGORIES.UTILITIES]: [
    'electric', 'pg&e', 'con ed', 'duke energy', 'water bill', 'comcast',
    'xfinity', 'at&t', 'verizon', 't-mobile', 'sprint', 'internet',
    'phone bill', 'utility', 'national grid', 'spectrum', 'centurylink',
    'cox communi', 'charter communi', 'google fi', 'mint mobile',
  ],
  [CATEGORIES.TRANSFER]: [
    'zelle', 'venmo', 'paypal', 'cash app', 'wire transfer', 'transfer to',
    'transfer from', 'ach debit', 'bank transfer', 'account transfer',
  ],
}

export const ALL_CATEGORIES = Object.values(CATEGORIES)
