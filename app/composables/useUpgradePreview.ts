/**
 * Reactive wrapper around `POST /payments/preview` — debounces nickname
 * changes so the buyer can type freely without spamming the backend, and
 * exposes the resolved upgrade-pricing evaluation for the modal to render.
 *
 * Returns:
 *  - `preview` — latest evaluation, or null when nickname is too short to
 *    bother asking the server.
 *  - `loading` — true while a request is in flight (UI shows a subtle
 *    spinner).
 *  - `error` — non-null when the request itself failed (network, 5xx). A
 *    legitimate "blocked" answer is NOT an error; it's a successful
 *    evaluation with `blocked: true`.
 */
export interface UpgradePreview {
  unitPrice: number
  finalUnitPrice: number
  upgradeDiscount: number
  currency: string
  blocked: boolean
  blockedReason?: 'already_owned_or_cheaper'
  reference?: {
    productId: string
    productName: string
    referencePrice: number
  }
}

const NICKNAME_MIN = 3
const NICKNAME_RE = /^[a-zA-Z0-9_]{3,16}$/

export function useUpgradePreview(productId: MaybeRefOrGetter<string>, nickname: MaybeRefOrGetter<string>) {
  const config = useRuntimeConfig()

  const preview = ref<UpgradePreview | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  let abort: AbortController | null = null
  let timer: ReturnType<typeof setTimeout> | null = null

  async function run() {
    const pid = toValue(productId)
    const nick = (toValue(nickname) || '').trim()

    // Don't bother the backend until the buyer has typed something
    // resembling a real Minecraft nickname — anything shorter is
    // guaranteed to come back with no upgrade context, so a noop render is
    // fine and saves a round-trip per keystroke.
    if (!pid || nick.length < NICKNAME_MIN || !NICKNAME_RE.test(nick)) {
      preview.value = null
      error.value = null
      loading.value = false
      return
    }

    if (abort) abort.abort()
    abort = new AbortController()
    loading.value = true
    error.value = null

    try {
      preview.value = await $fetch<UpgradePreview>('/payments/preview', {
        baseURL: config.public.apiBase as string,
        method: 'POST',
        body: { productId: pid, nickname: nick },
        signal: abort.signal
      })
    } catch (e: any) {
      if (e?.name === 'AbortError') return
      error.value = e?.data?.message || e?.message || 'preview failed'
      preview.value = null
    } finally {
      loading.value = false
    }
  }

  function schedule() {
    if (timer) clearTimeout(timer)
    timer = setTimeout(run, 400)
  }

  watch(
    [() => toValue(productId), () => toValue(nickname)],
    schedule,
    { immediate: true }
  )

  onScopeDispose(() => {
    if (timer) clearTimeout(timer)
    if (abort) abort.abort()
  })

  return { preview, loading, error }
}
