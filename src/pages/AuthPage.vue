<template>
  <div class="auth-bg">
    <div class="auth-card">

      <div class="auth-brand">
        <BarChart3 :size="26" class="brand-icon" />
        <span class="brand-name">Cash Flow</span>
      </div>

      <Transition name="form-slide" mode="out-in">

        <!-- ── Login ───────────────────────────────────────────────── -->
        <form v-if="mode === 'login'" key="login" class="auth-form" @submit.prevent="handleSignIn" novalidate>
          <div class="form-head">
            <h1 class="form-title">Welcome back</h1>
            <p class="form-sub">Sign in to your account</p>
          </div>

          <div class="field">
            <label>Email</label>
            <input v-model="email" type="email" placeholder="you@example.com" autocomplete="email" required />
          </div>

          <div class="field">
            <div class="field-row">
              <label>Password</label>
              <button type="button" class="link-btn" @click="switchMode('forgot')">Forgot password?</button>
            </div>
            <div class="input-wrap">
              <input v-model="password" :type="showPw ? 'text' : 'password'" placeholder="••••••••" autocomplete="current-password" required />
              <button type="button" class="pw-toggle" @click="showPw = !showPw" :title="showPw ? 'Hide' : 'Show'">
                <Eye v-if="!showPw" :size="15" />
                <EyeOff v-else :size="15" />
              </button>
            </div>
          </div>

          <p v-if="error" class="error-msg">{{ error }}</p>

          <button type="submit" class="btn-primary" :disabled="loading">
            <span v-if="loading" class="btn-spinner" />
            <span v-else>Sign In</span>
          </button>

          <p class="form-footer">
            Don't have an account?
            <button type="button" class="link-btn" @click="switchMode('signup')">Create one</button>
          </p>
        </form>

        <!-- ── Sign up ─────────────────────────────────────────────── -->
        <form v-else-if="mode === 'signup'" key="signup" class="auth-form" @submit.prevent="handleSignUp" novalidate>
          <div class="form-head">
            <h1 class="form-title">Create account</h1>
            <p class="form-sub">Start tracking your finances</p>
          </div>

          <div class="field">
            <label>Email</label>
            <input v-model="email" type="email" placeholder="you@example.com" autocomplete="email" required />
          </div>

          <div class="field">
            <label>Password</label>
            <div class="input-wrap">
              <input v-model="password" :type="showPw ? 'text' : 'password'" placeholder="At least 6 characters" autocomplete="new-password" required minlength="6" />
              <button type="button" class="pw-toggle" @click="showPw = !showPw">
                <Eye v-if="!showPw" :size="15" />
                <EyeOff v-else :size="15" />
              </button>
            </div>
          </div>

          <div class="field">
            <label>Confirm password</label>
            <input v-model="confirmPassword" :type="showPw ? 'text' : 'password'" placeholder="••••••••" autocomplete="new-password" required />
          </div>

          <p v-if="error" class="error-msg">{{ error }}</p>

          <button type="submit" class="btn-primary" :disabled="loading">
            <span v-if="loading" class="btn-spinner" />
            <span v-else>Create Account</span>
          </button>

          <p class="form-footer">
            Already have an account?
            <button type="button" class="link-btn" @click="switchMode('login')">Sign in</button>
          </p>
        </form>

        <!-- ── Forgot password ─────────────────────────────────────── -->
        <form v-else-if="mode === 'forgot'" key="forgot" class="auth-form" @submit.prevent="handleForgot" novalidate>
          <div class="form-head">
            <h1 class="form-title">Reset password</h1>
            <p class="form-sub">We'll send you a link to reset it</p>
          </div>

          <div class="field">
            <label>Email</label>
            <input v-model="email" type="email" placeholder="you@example.com" autocomplete="email" required />
          </div>

          <p v-if="error" class="error-msg">{{ error }}</p>

          <button type="submit" class="btn-primary" :disabled="loading">
            <span v-if="loading" class="btn-spinner" />
            <span v-else>Send Reset Link</span>
          </button>

          <p class="form-footer">
            <button type="button" class="link-btn" @click="switchMode('login')">← Back to sign in</button>
          </p>
        </form>

        <!-- ── Email sent ──────────────────────────────────────────── -->
        <div v-else-if="mode === 'sent'" key="sent" class="auth-form sent-state">
          <div class="sent-icon">
            <Mail :size="40" class="sent-icon-svg" />
          </div>
          <h1 class="form-title">Check your email</h1>
          <p class="sent-msg">{{ sentMessage }}</p>
          <button class="link-btn" @click="switchMode('login')">← Back to sign in</button>
        </div>

        <!-- ── Set new password (from reset email) ────────────────── -->
        <form v-else-if="mode === 'reset'" key="reset" class="auth-form" @submit.prevent="handleReset" novalidate>
          <div class="form-head">
            <h1 class="form-title">Set new password</h1>
            <p class="form-sub">Choose a strong password</p>
          </div>

          <div class="field">
            <label>New password</label>
            <div class="input-wrap">
              <input v-model="password" :type="showPw ? 'text' : 'password'" placeholder="At least 6 characters" autocomplete="new-password" required minlength="6" />
              <button type="button" class="pw-toggle" @click="showPw = !showPw">
                <Eye v-if="!showPw" :size="15" />
                <EyeOff v-else :size="15" />
              </button>
            </div>
          </div>

          <div class="field">
            <label>Confirm new password</label>
            <input v-model="confirmPassword" :type="showPw ? 'text' : 'password'" placeholder="••••••••" autocomplete="new-password" required />
          </div>

          <p v-if="error" class="error-msg">{{ error }}</p>

          <button type="submit" class="btn-primary" :disabled="loading">
            <span v-if="loading" class="btn-spinner" />
            <span v-else>Update Password</span>
          </button>
        </form>

      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { BarChart3, Eye, EyeOff, Mail } from 'lucide-vue-next'
import { useAuth } from '../composables/useAuth.js'

const { authEvent, signIn, signUp, sendPasswordReset, updatePassword } = useAuth()

const mode            = ref(authEvent.value === 'PASSWORD_RECOVERY' ? 'reset' : 'login')
const email           = ref('')
const password        = ref('')
const confirmPassword = ref('')
const showPw          = ref(false)
const loading         = ref(false)
const error           = ref('')
const sentMessage     = ref('')

watch(authEvent, val => {
  if (val === 'PASSWORD_RECOVERY') mode.value = 'reset'
})

function switchMode(next) {
  mode.value    = next
  error.value   = ''
  loading.value = false
  showPw.value  = false
}

async function handleSignIn() {
  error.value = ''
  if (!email.value || !password.value) { error.value = 'Please fill in all fields.'; return }
  loading.value = true
  try {
    await signIn(email.value.trim(), password.value)
    // App.vue re-renders automatically when userId is set
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function handleSignUp() {
  error.value = ''
  if (!email.value || !password.value) { error.value = 'Please fill in all fields.'; return }
  if (password.value !== confirmPassword.value) { error.value = 'Passwords do not match.'; return }
  loading.value = true
  try {
    const { session } = await signUp(email.value.trim(), password.value)
    if (!session) {
      // Supabase requires email confirmation
      sentMessage.value = `We sent a confirmation link to ${email.value.trim()}. Click it to activate your account.`
      mode.value = 'sent'
    }
    // If session exists, App.vue re-renders automatically
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function handleForgot() {
  error.value = ''
  if (!email.value) { error.value = 'Please enter your email.'; return }
  loading.value = true
  try {
    await sendPasswordReset(email.value.trim())
    sentMessage.value = `We sent a reset link to ${email.value.trim()}. Check your inbox.`
    mode.value = 'sent'
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function handleReset() {
  error.value = ''
  if (password.value !== confirmPassword.value) { error.value = 'Passwords do not match.'; return }
  loading.value = true
  try {
    await updatePassword(password.value)
    // authEvent is cleared → App.vue shows main app
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-bg {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
  padding: 24px;
}

.auth-card {
  width: 100%;
  max-width: 420px;
  background: var(--surface);
  border-radius: 20px;
  border: 1px solid var(--border);
  box-shadow: 0 8px 40px rgba(30, 45, 61, .10);
  padding: 40px 40px 36px;
}

.auth-brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  margin-bottom: 36px;
}
.brand-icon { color: var(--accent); }
.brand-name { font-size: 20px; font-weight: 800; letter-spacing: -.02em; color: var(--text); }

/* ── Form ─────────────────────────────────────────────────────── */
.auth-form { display: flex; flex-direction: column; }

.form-head { margin-bottom: 24px; }
.form-title { font-size: 22px; font-weight: 700; color: var(--text); margin: 0 0 4px; }
.form-sub   { font-size: 14px; color: var(--text-muted); margin: 0; }

.field { display: flex; flex-direction: column; gap: 5px; margin-bottom: 14px; }

.field label { font-size: 13px; font-weight: 600; color: var(--text); }

.field-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.field-row .link-btn { font-size: 12px; }

.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrap input { padding-right: 38px; }

.pw-toggle {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0;
  transition: color .15s;
}
.pw-toggle:hover { color: var(--text); }

.field input {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid var(--border);
  border-radius: 10px;
  background: var(--bg);
  font-size: 14px;
  color: var(--text);
  font-family: inherit;
  outline: none;
  transition: border-color .15s;
  box-sizing: border-box;
}
.field input:focus { border-color: var(--accent); }
.field input::placeholder { color: var(--text-xs); }

.error-msg {
  font-size: 13px;
  color: #e11d48;
  background: var(--red-light);
  padding: 9px 12px;
  border-radius: 8px;
  margin-bottom: 12px;
  line-height: 1.4;
}

.btn-primary {
  width: 100%;
  padding: 11px;
  border-radius: 10px;
  border: none;
  background: var(--accent);
  color: white;
  font-size: 15px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background .15s;
  margin-top: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
}
.btn-primary:hover:not(:disabled) { background: var(--accent-hover); }
.btn-primary:disabled { opacity: .55; cursor: not-allowed; }

.btn-spinner {
  width: 17px;
  height: 17px;
  border: 2px solid rgba(255, 255, 255, .4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin .7s linear infinite;
}

.link-btn {
  background: none;
  border: none;
  color: var(--accent);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  font-family: inherit;
  transition: opacity .15s;
}
.link-btn:hover { opacity: .75; }

.form-footer {
  text-align: center;
  font-size: 14px;
  color: var(--text-muted);
  margin-top: 20px;
  margin-bottom: 0;
}

/* ── Sent state ───────────────────────────────────────────────── */
.sent-state {
  text-align: center;
  align-items: center;
  padding: 8px 0 4px;
}

.sent-icon {
  width: 72px;
  height: 72px;
  background: var(--accent-light);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}
.sent-icon-svg { color: var(--accent); }

.sent-msg {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.6;
  margin: 10px 0 24px;
  max-width: 300px;
}

/* ── Transitions ──────────────────────────────────────────────── */
.form-slide-enter-active { transition: opacity .2s ease, transform .2s ease; }
.form-slide-leave-active { transition: opacity .15s ease, transform .15s ease; }
.form-slide-enter-from   { opacity: 0; transform: translateY(10px); }
.form-slide-leave-to     { opacity: 0; transform: translateY(-6px); }

@keyframes spin { to { transform: rotate(360deg); } }
</style>
