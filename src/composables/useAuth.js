import { ref } from 'vue'
import { supabase } from '../lib/supabase.js'

const userId   = ref(null)
const authReady = ref(false)

export function useAuth() {
  async function initAuth() {
    // Reuse existing session if any
    const { data: { session } } = await supabase.auth.getSession()

    if (session?.user) {
      userId.value = session.user.id
    } else {
      const { data, error } = await supabase.auth.signInAnonymously()
      if (data?.user) userId.value = data.user.id
      if (error) console.error('[auth] sign-in error:', error.message)
    }

    // Keep userId in sync with any future auth changes
    supabase.auth.onAuthStateChange((_event, session) => {
      userId.value = session?.user?.id ?? null
    })

    authReady.value = true
  }

  return { userId, authReady, initAuth }
}
