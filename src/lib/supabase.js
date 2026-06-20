import { createClient } from '@supabase/supabase-js'
import { ref } from 'vue'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// Global sync status — read by NavBar
export const syncStatus = ref('idle') // 'idle' | 'syncing' | 'synced' | 'error'

export function setSyncing() { syncStatus.value = 'syncing' }
export function setSynced()  { syncStatus.value = 'synced';  setTimeout(() => { if (syncStatus.value === 'synced') syncStatus.value = 'idle' }, 2000) }
export function setSyncError(){ syncStatus.value = 'error' }
