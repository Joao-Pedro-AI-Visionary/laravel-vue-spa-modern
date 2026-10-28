import { reactive } from 'vue'
import { http as defaultHttp } from './http.js'

const RESERVED = ['busy', 'successful', 'errors', 'message']

/**
 * Minimal replacement for vform (Vue 2 only).
 *
 * const form = useForm({ email: '', password: '' })
 * await form.post('/api/login')   // throws on error; 422 fills form.errors
 * form.has('email'); form.get('email')
 */
export function useForm (fields, { http = defaultHttp } = {}) {
  for (const key of Object.keys(fields)) {
    if (RESERVED.includes(key)) throw new Error(`Reserved form field name: ${key}`)
  }

  let initial = { ...fields }

  const form = reactive({
    ...fields,
    busy: false,
    successful: false,
    message: '',
    errors: {},

    keys () {
      return Object.keys(initial)
    },

    data () {
      return Object.fromEntries(this.keys().map(k => [k, this[k]]))
    },

    fill (values = {}) {
      for (const key of this.keys()) {
        if (values[key] !== undefined && values[key] !== null) this[key] = values[key]
      }
    },

    dismissSuccess () {
      this.successful = false
    },

    reset () {
      for (const key of this.keys()) this[key] = initial[key]
    },

    setInitial () {
      initial = this.data()
    },

    has (field) {
      return Object.prototype.hasOwnProperty.call(this.errors, field)
    },

    get (field) {
      const value = this.errors[field]
      return Array.isArray(value) ? value[0] : value
    },

    any () {
      return Object.keys(this.errors).length > 0
    },

    clear (field) {
      if (field) {
        const rest = { ...this.errors }
        delete rest[field]
        this.errors = rest
      } else {
        this.errors = {}
      }
      this.successful = false
    },

    onKeydown (event) {
      const name = event && event.target && event.target.name
      if (name) this.clear(name)
    },

    async submit (method, url, config = {}) {
      this.busy = true
      this.successful = false
      this.message = ''
      this.errors = {}

      try {
        const response = await http.request({ method, url, data: this.data(), ...config })
        this.successful = true
        return response
      } catch (error) {
        const response = error && error.response
        if (response && response.status === 422 && response.data) {
          this.errors = response.data.errors || {}
          this.message = response.data.message || ''
        }
        throw error
      } finally {
        this.busy = false
      }
    },

    post (url, config) { return this.submit('post', url, config) },
    patch (url, config) { return this.submit('patch', url, config) },
    put (url, config) { return this.submit('put', url, config) },
    delete (url, config) { return this.submit('delete', url, config) }
  })

  return form
}

export function isValidationError (error) {
  return Boolean(error && error.response && error.response.status === 422)
}
