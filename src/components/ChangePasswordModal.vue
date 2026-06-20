<template>
  <Teleport to="body">
    <Transition name="modal-anim" appear @after-leave="emit('close')">
      <div v-if="visible" class="overlay" @click.self="close">
        <div class="modal">

          <div class="modal-header">
            <div class="header-left">
              <KeyRound :size="18" class="header-icon" />
              <h2 class="modal-title">Change Password</h2>
            </div>
            <button class="btn-close" @click="close"><X :size="18" /></button>
          </div>

          <Transition name="fade" mode="out-in">
            <div v-if="success" key="success" class="success-state">
              <div class="success-icon"><Check :size="28" /></div>
              <p class="success-msg">Password updated successfully.</p>
            </div>

            <form v-else key="form" @submit.prevent="handleSubmit" novalidate>
              <div class="field">
                <label>New password</label>
                <div class="input-wrap">
                  <input
                    ref="firstInput"
                    v-model="password"
                    :type="showPw ? 'text' : 'password'"
                    placeholder="At least 6 characters"
                    autocomplete="new-password"
                    required
                    minlength="6"
                  />
                  <button type="button" class="pw-toggle" @click="showPw = !showPw">
                    <Eye v-if="!showPw" :size="14" />
                    <EyeOff v-else :size="14" />
                  </button>
                </div>
              </div>

              <div class="field">
                <label>Confirm new password</label>
                <input
                  v-model="confirm"
                  :type="showPw ? 'text' : 'password'"
                  placeholder="••••••••"
                  autocomplete="new-password"
                  required
                />
              </div>

              <p v-if="error" class="error-msg">{{ error }}</p>

              <div class="modal-actions">
                <button type="button" class="btn-cancel" @click="close">Cancel</button>
                <button type="submit" class="btn-submit" :disabled="loading">
                  <span v-if="loading" class="btn-spinner" />
                  <span v-else>Update Password</span>
                </button>
              </div>
            </form>
          </Transition>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { X, KeyRound, Eye, EyeOff, Check } from 'lucide-vue-next'
import { useAuth } from '../composables/useAuth.js'

const emit = defineEmits(['close'])
const { updatePassword } = useAuth()

const visible  = ref(false)
const password = ref('')
const confirm  = ref('')
const showPw   = ref(false)
const loading  = ref(false)
const error    = ref('')
const success  = ref(false)
const firstInput = ref(null)

onMounted(async () => {
  await nextTick()
  visible.value = true
  await nextTick()
  firstInput.value?.focus()
})

function close() { visible.value = false }

async function handleSubmit() {
  error.value = ''
  if (password.value.length < 6) { error.value = 'Password must be at least 6 characters.'; return }
  if (password.value !== confirm.value) { error.value = 'Passwords do not match.'; return }
  loading.value = true
  try {
    await updatePassword(password.value)
    success.value = true
    setTimeout(close, 1500)
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(30, 45, 61, .45);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 500;
  padding: 16px;
}

.modal {
  background: var(--surface);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(30, 45, 61, .2);
  width: 100%;
  max-width: 400px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.modal-header { display: flex; align-items: center; justify-content: space-between; }
.header-left  { display: flex; align-items: center; gap: 8px; }
.header-icon  { color: var(--accent); }
.modal-title  { font-size: 17px; font-weight: 700; color: var(--text); }

.btn-close {
  width: 32px; height: 32px;
  border-radius: 8px;
  background: none; border: none;
  color: var(--text-muted);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: background .15s;
}
.btn-close:hover { background: var(--bg); }

.field { display: flex; flex-direction: column; gap: 5px; margin-bottom: 12px; }
.field label { font-size: 13px; font-weight: 600; color: var(--text); }

.input-wrap { position: relative; display: flex; align-items: center; }
.input-wrap input { padding-right: 36px; }

.pw-toggle {
  position: absolute; right: 10px;
  background: none; border: none;
  color: var(--text-muted); cursor: pointer;
  display: flex; align-items: center; padding: 0;
  transition: color .15s;
}
.pw-toggle:hover { color: var(--text); }

.field input {
  width: 100%;
  padding: 9px 13px;
  border: 1.5px solid var(--border);
  border-radius: 9px;
  background: var(--bg);
  font-size: 14px;
  color: var(--text);
  font-family: inherit;
  outline: none;
  transition: border-color .15s;
  box-sizing: border-box;
}
.field input:focus { border-color: var(--accent); }

.error-msg {
  font-size: 13px;
  color: #e11d48;
  background: var(--red-light);
  padding: 9px 12px;
  border-radius: 8px;
  margin-bottom: 4px;
}

.modal-actions { display: flex; gap: 8px; justify-content: flex-end; }

.btn-cancel {
  padding: 9px 18px;
  border-radius: 9px;
  border: 1.5px solid var(--border);
  background: none;
  color: var(--text-muted);
  font-size: 14px; font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: background .15s;
}
.btn-cancel:hover { background: var(--surface-hover); }

.btn-submit {
  display: flex; align-items: center; justify-content: center;
  padding: 9px 20px;
  border-radius: 9px;
  border: none;
  background: var(--accent);
  color: white;
  font-size: 14px; font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  min-width: 140px;
  transition: background .15s;
}
.btn-submit:hover:not(:disabled) { background: var(--accent-hover); }
.btn-submit:disabled { opacity: .5; cursor: not-allowed; }

.btn-spinner {
  width: 15px; height: 15px;
  border: 2px solid rgba(255,255,255,.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin .7s linear infinite;
}

/* Success state */
.success-state {
  display: flex; flex-direction: column;
  align-items: center; gap: 10px;
  padding: 8px 0 4px;
  text-align: center;
}

.success-icon {
  width: 56px; height: 56px;
  background: var(--green-light);
  color: var(--green);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}

.success-msg { font-size: 14px; color: var(--text-muted); margin: 0; }

/* Fade transition between form and success */
.fade-enter-active { transition: opacity .2s ease; }
.fade-leave-active { transition: opacity .15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Modal animation */
.modal-anim-enter-active { transition: opacity .2s ease; }
.modal-anim-enter-from   { opacity: 0; }
.modal-anim-leave-active { transition: opacity .22s ease; }
.modal-anim-leave-to     { opacity: 0; }

.modal-anim-enter-active .modal { transition: transform .32s cubic-bezier(.34, 1.56, .64, 1), opacity .2s ease; }
.modal-anim-enter-from .modal   { transform: translateY(28px) scale(.95); opacity: 0; }
.modal-anim-leave-active .modal { transition: transform .2s ease, opacity .2s ease; }
.modal-anim-leave-to .modal     { transform: translateY(12px) scale(.97); opacity: 0; }

@keyframes spin { to { transform: rotate(360deg); } }
</style>
