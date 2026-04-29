/**
 * Shared bindings for the public legal pages (оферта / соглашение / политика).
 *
 * Reads admin-configured owner identity from the shop-settings store and
 * exposes ready-to-render Russian labels. Empty fields fall back to
 * "не указано" so legal pages stay readable on fresh installs where the
 * admin hasn't filled the юр-инфо section yet.
 */
export function useLegalInfo() {
  const settings = useShopSettingsStore()

  const NOT_SPECIFIED = 'не указано'

  const ownerTypeLabel = computed(() => {
    switch (settings.ownerType) {
      case 'individual': return 'Физическое лицо'
      case 'self_employed': return 'Самозанятый (плательщик НПД)'
      case 'sole_proprietor': return 'Индивидуальный предприниматель'
      case 'legal_entity': return 'Юридическое лицо'
      default: return ''
    }
  })

  const ownerName = computed(() => settings.ownerName || NOT_SPECIFIED)
  const ownerType = computed(() => ownerTypeLabel.value || NOT_SPECIFIED)
  const ownerInn = computed(() => settings.ownerInn || NOT_SPECIFIED)
  const contactEmail = computed(() => settings.contactEmail || NOT_SPECIFIED)
  const hasContactEmail = computed(() => !!settings.contactEmail)

  const shopName = computed(() => settings.name)
  const serverIp = computed(() => settings.ip || NOT_SPECIFIED)

  const requestUrl = useRequestURL()
  const shopUrl = computed(() =>
    (settings.shopUrl || requestUrl.origin).replace(/\/+$/, '')
  )

  // Snapshot the date the user opens the page — these documents don't have
  // a stored "last edited" timestamp yet, so we surface today's date as the
  // effective date. Good enough until we wire a real changelog.
  const effectiveDate = computed(() => {
    const d = new Date()
    return d.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  })

  return {
    settings,
    shopName,
    shopUrl,
    serverIp,
    ownerName,
    ownerType,
    ownerInn,
    contactEmail,
    hasContactEmail,
    effectiveDate
  }
}
