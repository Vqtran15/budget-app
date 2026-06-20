const STORAGE_KEY = 'budget-merchant-memory'

function normalize(description) {
  return String(description).toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 50)
}

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') }
  catch { return {} }
}

export function useMerchantMemory() {
  function learn(description, category) {
    const memory = load()
    memory[normalize(description)] = category
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memory))
  }

  function lookup(description) {
    return load()[normalize(description)] ?? null
  }

  return { learn, lookup }
}
