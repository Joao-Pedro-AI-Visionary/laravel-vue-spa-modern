<template>
  <div class="mb-3 row">
    <label :for="inputId" class="col-md-3 col-form-label text-md-end">{{ label }}</label>
    <div class="col-md-7">
      <input
        :id="inputId"
        v-model="model"
        :name="name"
        :type="type"
        :autocomplete="autocomplete"
        :readonly="readonly"
        :required="required"
        :class="{ 'is-invalid': !!error }"
        :aria-invalid="error ? 'true' : 'false'"
        :aria-describedby="error ? errorId : undefined"
        class="form-control"
      >
      <div v-if="error" :id="errorId" class="invalid-feedback d-block" role="alert">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, useId } from 'vue'

const props = defineProps({
  name: { type: String, required: true },
  label: { type: String, required: true },
  type: { type: String, default: 'text' },
  error: { type: String, default: '' },
  autocomplete: { type: String, default: undefined },
  readonly: { type: Boolean, default: false },
  required: { type: Boolean, default: false }
})

const model = defineModel({ type: String, default: '' })
const uid = useId()
const inputId = computed(() => `${props.name}-${uid}`)
const errorId = computed(() => `${props.name}-error-${uid}`)
</script>
