const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']
const MONTH_SHORT = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec']
const MONTH_PAD   = ['01','02','03','04','05','06','07','08','09','10','11','12']

// Returns "YYYY-MM-DD" for comparison, or null if unparseable
export function toISODate(dateStr) {
  if (!dateStr) return null
  const s = String(dateStr).trim()

  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10)

  // MM/DD/YYYY or M/D/YYYY
  let m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (m) return `${m[3]}-${m[1].padStart(2,'0')}-${m[2].padStart(2,'0')}`

  // MM/DD/YY
  m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})$/)
  if (m) return `20${m[3]}-${m[1].padStart(2,'0')}-${m[2].padStart(2,'0')}`

  // MM/DD (no year — assume current year)
  m = s.match(/^(\d{1,2})\/(\d{1,2})$/)
  if (m) return `${new Date().getFullYear()}-${m[1].padStart(2,'0')}-${m[2].padStart(2,'0')}`

  // "Dec 05, 2024" or "December 5, 2024"
  m = s.match(/^([A-Za-z]+)\s+(\d+),?\s+(\d{4})/)
  if (m) {
    const idx = MONTH_SHORT.indexOf(m[1].toLowerCase().slice(0,3))
    if (idx !== -1) return `${m[3]}-${MONTH_PAD[idx]}-${m[2].padStart(2,'0')}`
  }

  // "Dec 05" (no year)
  m = s.match(/^([A-Za-z]+)\s+(\d+)$/)
  if (m) {
    const idx = MONTH_SHORT.indexOf(m[1].toLowerCase().slice(0,3))
    if (idx !== -1) return `${new Date().getFullYear()}-${MONTH_PAD[idx]}-${m[2].padStart(2,'0')}`
  }

  return null
}

// Returns { year, month (1-12), key: "YYYY-MM", label: "January 2024" } or null
export function parseMonthYear(dateStr) {
  const iso = toISODate(dateStr)
  if (!iso) return null
  const year  = parseInt(iso.slice(0,4))
  const month = parseInt(iso.slice(5,7))
  return {
    year, month,
    key: iso.slice(0,7),
    label: `${MONTH_NAMES[month-1]} ${year}`,
  }
}
