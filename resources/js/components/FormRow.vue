<template>
  <div class="form-field">
    <div class="form-field__top">
      <label :for="inputId" class="form-label">{{ label }}</label>
      <slot name="aside" />
    </div>
    <div :class="{ 'input-reveal': isPassword }">
      <input
        :id="inputId"
        v-model="model"
        :name="name"
        :type="isPassword && revealed ? 'text' : type"
        :autocomplete="autocomplete"
        :readonly="readonly"
        :required="required"
        :class="{ 'is-invalid': !!error }"
        :aria-invalid="error ? 'true' : 'false'"
        :aria-describedby="describedBy"
        class="form-control"
      >
      <button
        v-if="isPassword"
        type="button"
        class="input-reveal__btn"
        :aria-label="revealed ? $t('hide_password') : $t('show_password')"
        :aria-pressed="revealed ? 'true' : 'false'"
        :aria-controls="inputId"
        @click="revealed = !revealed"
      >
        <Fa :icon="revealed ? 'eye-slash' : 'eye'" fixed-width aria-hidden="true" />
      </button>
    </div>
    <div v-if="error" :id="errorId" class="field-error" role="alert">
      <Fa icon="circle-exclamation" class="mt-1" aria-hidden="true" />
      <span>{{ error }}</span>
    </div>
    <div v-else-if="hint" :id="hintId" class="form-hint">
      {{ hint }}
    </div>
  </div>
</template>

<script setup>
import { computed, ref, useId } from 'vue'

const props = defineProps({
  name: { type: String, required: true },
  label: { type: String, required: true },
  type: { type: String, default: 'text' },
  error: { type: String, default: '' },
  hint: { type: String, default: '' },
  autocomplete: { type: String, default: undefined },
  readonly: { type: Boolean, default: false },
  required: { type: Boolean, default: false }
})

const model = defineModel({ type: String, default: '' })
const uid = useId()
const revealed = ref(false)
const isPassword = computed(() => props.type === 'password')
const inputId = computed(() => `${props.name}-${uid}`)
const errorId = computed(() => `${props.name}-error-${uid}`)
const hintId = computed(() => `${props.name}-hint-${uid}`)
const describedBy = computed(() => {
  if (props.error) return errorId.value
  if (props.hint) return hintId.value
  return undefined
})
</script>
