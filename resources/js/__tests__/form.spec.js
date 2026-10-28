import axios from 'axios'
import { describe, it, expect } from 'vitest'
import { useForm, isValidationError } from '~/lib/form.js'
import { mockAdapter, networkError } from './helpers.js'

function client (handler) {
  const instance = axios.create()
  const mock = mockAdapter(handler)
  instance.defaults.adapter = mock.adapter
  return { http: instance, calls: mock.calls }
}

describe('useForm', () => {
  it('rejects reserved field names', () => {
    expect(() => useForm({ errors: '' })).toThrow(/Reserved/)
    expect(() => useForm({ busy: false })).toThrow(/Reserved/)
  })

  it('submits only the declared fields and marks success', async () => {
    const { http, calls } = client(() => [200, { ok: true }])
    const form = useForm({ email: 'a@b.c', password: 'x' }, { http })
    const response = await form.post('/api/login')
    expect(response.data).toEqual({ ok: true })
    expect(calls[0].method).toBe('post')
    expect(JSON.parse(calls[0].data)).toEqual({ email: 'a@b.c', password: 'x' })
    expect(form.successful).toBe(true)
    expect(form.busy).toBe(false)
  })

  it('config.data overrides the payload (login sends remember)', async () => {
    const { http, calls } = client(() => [200, {}])
    const form = useForm({ email: 'e' }, { http })
    await form.post('/api/login', { data: { ...form.data(), remember: true } })
    expect(JSON.parse(calls[0].data)).toEqual({ email: 'e', remember: true })
  })

  it('patch/put/delete use the right verb', async () => {
    const { http, calls } = client(() => [200, {}])
    const form = useForm({ a: 1 }, { http })
    await form.patch('/x')
    await form.put('/x')
    await form.delete('/x')
    expect(calls.map(c => c.method)).toEqual(['patch', 'put', 'delete'])
  })

  it('fills errors and message from a 422 and rethrows', async () => {
    const { http } = client(() => [422, {
      message: 'The given data was invalid.',
      errors: { email: ['Email is required.', 'second'], password: ['Too short.'] }
    }])
    const form = useForm({ email: '', password: '' }, { http })
    const error = await form.post('/api/login').catch(e => e)
    expect(isValidationError(error)).toBe(true)
    expect(form.successful).toBe(false)
    expect(form.busy).toBe(false)
    expect(form.message).toBe('The given data was invalid.')
    expect(form.has('email')).toBe(true)
    expect(form.get('email')).toBe('Email is required.')
    expect(form.has('name')).toBe(false)
    expect(form.get('name')).toBeUndefined()
    expect(form.any()).toBe(true)
  })

  it('non-422 errors leave errors empty and still rethrow', async () => {
    const { http } = client(() => networkError())
    const form = useForm({ a: '' }, { http })
    const error = await form.post('/x').catch(e => e)
    expect(isValidationError(error)).toBe(false)
    expect(form.any()).toBe(false)
    expect(form.busy).toBe(false)
  })

  it('a new submit clears previous errors', async () => {
    let n = 0
    const { http } = client(() => (++n === 1 ? [422, { errors: { a: ['bad'] } }] : [200, {}]))
    const form = useForm({ a: '' }, { http })
    await form.post('/x').catch(() => {})
    expect(form.has('a')).toBe(true)
    await form.post('/x')
    expect(form.any()).toBe(false)
  })

  it('clear(field) removes only that field; clear() removes all', () => {
    const form = useForm({ a: '', b: '' })
    form.errors = { a: ['x'], b: ['y'] }
    form.clear('a')
    expect(form.has('a')).toBe(false)
    expect(form.has('b')).toBe(true)
    form.clear()
    expect(form.any()).toBe(false)
  })

  it('onKeydown clears the error of the typed field', () => {
    const form = useForm({ email: '' })
    form.errors = { email: ['x'] }
    form.onKeydown({ target: { name: 'email' } })
    expect(form.has('email')).toBe(false)
  })

  it('reset restores initial values; setInitial moves the baseline', () => {
    const form = useForm({ name: 'a', email: 'b' })
    form.name = 'changed'
    form.reset()
    expect(form.name).toBe('a')

    form.name = 'n2'
    form.setInitial()
    form.name = 'n3'
    form.reset()
    expect(form.name).toBe('n2')
  })

  it('fill copies known, non-null keys only', () => {
    const form = useForm({ name: '', email: '' })
    form.fill({ name: 'Ann', email: null, password: 'secret' })
    expect(form.data()).toEqual({ name: 'Ann', email: '' })
  })
})
