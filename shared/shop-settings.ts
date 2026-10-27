import { defineShopSettings } from './utils/shop-fields'

export const shopSettingsSchema = defineShopSettings({
  version: 1,
  groups: [
    {
      id: 'general',
      label: 'Общие настройки',
      fields: [
        { key: 'name', type: 'text', label: 'Название магазина', icon: 'i-lucide-store', required: true, max: 64, default: 'FreshDonate Shop' },
        { key: 'description', type: 'textarea', label: 'Описание', max: 500, rows: 3, default: '' },
        { key: 'ip', type: 'text', label: 'Адрес сервера', icon: 'i-lucide-link', max: 64, placeholder: 'play.example.com', default: 'play.example.com' },
        { key: 'color', type: 'color', format: 'tailwind', label: 'Основной цвет', required: true, default: 'sky' },
        {
          key: 'cartEnabled',
          type: 'boolean',
          label: 'Корзина',
          description: 'Несколько товаров одним платежом. Без корзины товар покупается в один клик.',
          default: false
        }
      ]
    },
    {
      id: 'legal',
      label: 'Юридическая информация',
      description: 'Подставляется в оферту, соглашение и политику конфиденциальности. Пустые поля выводятся как «не указано».',
      fields: [
        {
          key: 'ownerName',
          type: 'text',
          label: 'Владелец магазина',
          icon: 'i-lucide-user',
          description: 'ФИО или полное наименование организации.',
          max: 256,
          placeholder: 'Иванов Иван Иванович'
        },
        {
          key: 'ownerType',
          type: 'select',
          label: 'Тип владельца',
          default: '',
          options: [
            { value: '', label: 'Не указывать' },
            { value: 'individual', label: 'Физическое лицо' },
            { value: 'self_employed', label: 'Самозанятый (НПД)' },
            { value: 'sole_proprietor', label: 'Индивидуальный предприниматель' },
            { value: 'legal_entity', label: 'Юридическое лицо' }
          ]
        },
        {
          key: 'ownerInn',
          type: 'text',
          label: 'ИНН',
          icon: 'i-lucide-hash',
          description: '10 цифр для юрлиц, 12 для остальных.',
          max: 12,
          pattern: '^(\\d{10}|\\d{12})$',
          placeholder: '123456789012'
        },
        {
          key: 'contactEmail',
          type: 'email',
          label: 'Контактный email',
          icon: 'i-lucide-mail',
          description: 'Для запросов по 152-ФЗ и претензий по покупкам.',
          placeholder: 'contact@example.com'
        }
      ]
    }
  ]
})
