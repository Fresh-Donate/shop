import type { UseFetchOptions } from 'nuxt/app'

export function useApi<T>(url: string, options?: UseFetchOptions<T>) {
  const config = useRuntimeConfig()

  return useFetch<T>(url, {
    baseURL: config.public.apiBase as string,
    ...options
  })
}
