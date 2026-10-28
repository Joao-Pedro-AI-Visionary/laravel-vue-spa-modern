import Card from './Card.vue'
import Child from './Child.vue'
import VButton from './Button.vue'
import Checkbox from './Checkbox.vue'
import FieldError from './FieldError.vue'
import FormRow from './FormRow.vue'
import AlertSuccess from './AlertSuccess.vue'

// Globally registered components (same set the Vue 2 app registered).
export function registerComponents (app) {
  app.component('Card', Card)
  app.component('Child', Child)
  app.component('VButton', VButton)
  app.component('Checkbox', Checkbox)
  app.component('FieldError', FieldError)
  app.component('FormRow', FormRow)
  app.component('AlertSuccess', AlertSuccess)
}
