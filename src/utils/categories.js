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
  [CATEGORIES.INCOME]:       { icon: 'TrendingUp',    color: '#43AA8B', bg: '#e2f5ef' },
  [CATEGORIES.HOUSING]:      { icon: 'Home',          color: '#277DA1', bg: '#dceef7' },
  [CATEGORIES.FOOD]:         { icon: 'Utensils',      color: '#F8961E', bg: '#fef2de' },
  [CATEGORIES.TRANSPORT]:    { icon: 'Car',           color: '#577590', bg: '#e2eaf0' },
  [CATEGORIES.SHOPPING]:     { icon: 'ShoppingCart',  color: '#F94144', bg: '#feecec' },
  [CATEGORIES.ENTERTAINMENT]:{ icon: 'Film',          color: '#F3722C', bg: '#feeee5' },
  [CATEGORIES.HEALTHCARE]:   { icon: 'Stethoscope',   color: '#4D908E', bg: '#e1f0ef' },
  [CATEGORIES.UTILITIES]:    { icon: 'Zap',           color: '#F9C74F', bg: '#fef6dd' },
  [CATEGORIES.TRANSFER]:     { icon: 'ArrowLeftRight',color: '#90BE6D', bg: '#edf6e4' },
  [CATEGORIES.UNCATEGORIZED]:{ icon: 'HelpCircle',    color: '#8faab8', bg: '#edede9' },
}

export const ICON_OPTIONS = [
  'TrendingUp','Home','Utensils','Car','ShoppingCart','Film',
  'Stethoscope','Zap','ArrowLeftRight','Briefcase','GraduationCap',
  'Plane','Gift','Music','Dumbbell','Coffee','Book','Wrench',
  'Star','Wallet','Phone','Globe','Camera','Gamepad2',
  'Bike','Train','Dog','Heart','Package','PiggyBank',
  'Building2','ShoppingBag','Tv','Headphones','Scissors','Baby',
]

export const COLOR_PALETTE = [
  { color: '#F94144', bg: '#feecec' },
  { color: '#F3722C', bg: '#feeee5' },
  { color: '#F8961E', bg: '#fef2de' },
  { color: '#F9844A', bg: '#fef0e6' },
  { color: '#F9C74F', bg: '#fef6dd' },
  { color: '#90BE6D', bg: '#edf6e4' },
  { color: '#43AA8B', bg: '#e2f5ef' },
  { color: '#4D908E', bg: '#e1f0ef' },
  { color: '#277DA1', bg: '#dceef7' },
  { color: '#577590', bg: '#e2eaf0' },
]

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
