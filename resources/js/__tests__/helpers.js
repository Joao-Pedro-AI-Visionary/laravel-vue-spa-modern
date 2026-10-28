import { AxiosError, AxiosHeaders } from 'axios'

/**
 * Build an axios adapter from a handler `(config, n) => [status, body] | Error`.
 * No network: responses are produced in-process.
 */
export function mockAdapter (handler) {
  const calls = []
  const adapter = async config => {
    calls.push({
      method: config.method,
      url: config.url,
      headers: AxiosHeaders.from(config.headers).toJSON(),
      data: config.data
    })
    const result = await handler(config, calls.length)
    if (result instanceof Error) {
      if (!result.config) result.config = config
      throw result
    }
    const [status, data] = result
    const response = { data, status, statusText: String(status), headers: {}, config, request: {} }
    if (status >= 200 && status < 300) return response
    throw new AxiosError(
      `Request failed with status code ${status}`,
      status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST,
      config,
      {},
      response
    )
  }
  return { adapter, calls }
}

export function networkError () {
  return new AxiosError('Network Error', AxiosError.ERR_NETWORK)
}

export function canceledError () {
  return new AxiosError('canceled', AxiosError.ERR_CANCELED)
}

export function timeoutError () {
  return new AxiosError('timeout of 1ms exceeded', AxiosError.ECONNABORTED)
}

export function httpError (status, data = {}) {
  return new AxiosError('x', AxiosError.ERR_BAD_REQUEST, {}, {}, { status, data })
}
