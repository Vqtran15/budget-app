import { ref } from 'vue'
import { supabase } from '../lib/supabase.js'

const user      = ref(null)
const userId    = ref(null)
const authReady = ref(false)
const authEvent = ref(null) // 'PASSWORD_RECOVERY'

export function useAuth() {
  async function initAuth() {
    const { data: { session } } = await supabase.auth.getSession()
    user.value   = session?.user   ?? null
    userId.value = session?.user?.id ?? null

    supabase.auth.onAuthStateChange((event, session) => {
      user.value   = session?.user   ?? null
      userId.value = session?.user?.id ?? null
      if (event === 'PASSWORD_RECOVERY') authEvent.value = 'PASSWORD_RECOVERY'
      if (event === 'SIGNED_OUT')        authEvent.value = null
    })

    authReady.value = true
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  async function signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    return data
  }

  async function signOut() {
    await supabase.auth.signOut()
    localStorage.clear()
    window.location.reload()
  }

  async function sendPasswordReset(email) {
    const redirectTo = window.location.href.split('#')[0]
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
    if (error) throw error
  }

  async function updatePassword(password) {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw error
    authEvent.value = null
  }

  return {
    user, userId, authReady, authEvent,
    initAuth, signIn, signUp, signOut, sendPasswordReset, updatePassword,
  }
}
