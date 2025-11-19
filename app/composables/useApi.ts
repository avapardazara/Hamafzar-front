import { $fetch } from 'ofetch'
import { useRuntimeConfig } from 'nuxt/app'

export function useApi() {
  const config = useRuntimeConfig()
  const baseURL = `${config.public.API_BASE}${config.public.API_PREFIX}`

  function authHeaders() {
    const token = (typeof localStorage !== 'undefined') ? localStorage.getItem('ha_token') : null
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  const request = <T>(url: string, opts: any = {}) =>
    $fetch<T>(url, { baseURL, ...opts, headers: { ...(opts.headers||{}), ...authHeaders() } })

  return {
    get: <T>(u: string, o?: any) => request<T>(u, { ...o, method: 'GET' }),
    post: <T>(u: string, b?: any, o?: any) => request<T>(u, { ...o, method: 'POST', body: b }),
    put:  <T>(u: string, b?: any, o?: any) => request<T>(u, { ...o, method: 'PUT',  body: b }),
    del:  <T>(u: string, o?: any) => request<T>(u, { ...o, method: 'DELETE' }),
    baseURL
  }
}
