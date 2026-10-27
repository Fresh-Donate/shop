/**
 * Shared bindings for the public legal pages (offer / privacy / terms).
 */
export function useLegalInfo() {
  const settings = useShopSettingsStore()

  const NOT_SPECIFIED = 'не указано'

  const ownerTypeLabel = computed(() => {
    switch (settings.fields.ownerType) {
      case 'individual': return 'Физическое лицо'
      case 'self_employed': return 'Самозанятый (плательщик НПД)'
      case 'sole_proprietor': return 'Индивидуальный предприниматель'
      case 'legal_entity': return 'Юридическое лицо'
      default: return ''
    }
  })

  const ownerName = computed(() => settings.fields.ownerName || NOT_SPECIFIED)
  const ownerType = computed(() => ownerTypeLabel.value || NOT_SPECIFIED)
  const ownerInn = computed(() => settings.fields.ownerInn || NOT_SPECIFIED)
  const contactEmail = computed(() => settings.fields.contactEmail || NOT_SPECIFIED)
  const hasContactEmail = computed(() => !!settings.fields.contactEmail)

  const shopName = computed(() => settings.fields.name)
  const serverIp = computed(() => settings.fields.ip || NOT_SPECIFIED)

  const requestUrl = useRequestURL()
  const shopUrl = computed(() =>
    (settings.shopUrl || requestUrl.origin).replace(/\/+$/, '')
  )

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
