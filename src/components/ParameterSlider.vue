<script setup>
import { l } from '../i18n/index.js'
defineProps({
  modelValue: Number,
  min: Number,
  max: Number,
  step: { type: Number, default: 1 },
  label: String,
  unit: { type: String, default: '' },
  disabled: { type: Boolean, default: false }
})
defineEmits(['update:modelValue'])
</script>
<template>
  <label class="parameter"
    ><span
      >{{ label }} <output>{{ modelValue }}{{ unit }}</output></span
    ><input
      type="range"
      :min="min"
      :max="max"
      :step="step"
      :value="modelValue"
      :disabled="disabled"
      @input="$emit('update:modelValue', Number($event.target.value))"
  /></label>
</template>
