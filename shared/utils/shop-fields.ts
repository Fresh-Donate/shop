export type ShopFieldPrimitive = string | number | boolean | null

export interface ShopFieldCondition {
  key: string
  equals: ShopFieldPrimitive | readonly ShopFieldPrimitive[]
}

interface ShopFieldBase {
  key: string
  label: string
  description?: string
  placeholder?: string
  icon?: string
  required?: boolean
  visibleIf?: ShopFieldCondition
}

export interface ShopTextField extends ShopFieldBase {
  type: 'text' | 'textarea'
  default?: string
  min?: number
  max?: number
  pattern?: string
  rows?: number
}

export interface ShopNumberField extends ShopFieldBase {
  type: 'number'
  default?: number | null
  min?: number
  max?: number
  step?: number
  integer?: boolean
}

export interface ShopBooleanField extends ShopFieldBase {
  type: 'boolean'
  default?: boolean
}

export interface ShopSelectOption {
  value: string
  label: string
}

export interface ShopSelectField extends ShopFieldBase {
  type: 'select'
  options: readonly ShopSelectOption[]
  multiple?: boolean
  default?: string | readonly string[]
  min?: number
  max?: number
}

export interface ShopColorField extends ShopFieldBase {
  type: 'color'
  format?: 'hex' | 'tailwind'
  default?: string
}

export interface ShopStringField extends ShopFieldBase {
  type: 'url' | 'email' | 'date' | 'datetime' | 'image'
  default?: string
}

export interface ShopFileField extends ShopFieldBase {
  type: 'file'
  accept?: string
  default?: string
}

export type ShopItemField = ShopTextField | ShopNumberField | ShopBooleanField | ShopSelectField | ShopColorField | ShopStringField | ShopFileField

export interface ShopListField extends ShopFieldBase {
  type: 'list'
  fields: readonly ShopItemField[]
  default?: readonly Record<string, unknown>[]
  min?: number
  max?: number
  addLabel?: string
  titleKey?: string
}

export type ShopField = ShopItemField | ShopListField

export interface ShopFieldGroup {
  id: string
  label: string
  description?: string
  icon?: string
  fields: readonly ShopField[]
}

export interface ShopSettingsSchema {
  version: 1
  groups: readonly ShopFieldGroup[]
}

type OptionValue<F> = F extends { options: readonly (infer O)[] } ? O extends { value: infer V } ? V : never : never

export type ShopFieldValueOf<F>
  = F extends { type: 'boolean' } ? boolean
    : F extends { type: 'number' } ? number | null
      : F extends { type: 'select', multiple: true } ? OptionValue<F>[]
        : F extends { type: 'select' } ? OptionValue<F>
          : F extends { type: 'list', fields: readonly (infer I)[] } ? ShopFieldsValues<I>[]
            : string

export type ShopFieldsValues<F> = {
  [K in F as K extends { key: infer N extends string } ? N : never]: ShopFieldValueOf<K>
}

export type ShopSettingsValues<S extends ShopSettingsSchema> = ShopFieldsValues<S['groups'][number]['fields'][number]>

export function defineShopSettings<const S extends ShopSettingsSchema>(schema: S): S {
  return schema
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function resolveItem(fields: readonly ShopField[], raw: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(fields.map(field => [field.key, resolveShopField(field, raw[field.key])]))
}

function fallback(field: ShopField): unknown {
  switch (field.type) {
    case 'boolean':
      return field.default ?? false
    case 'number':
      return field.default ?? null
    case 'select': {
      const allowed = field.options.map(o => o.value)
      if (field.multiple) {
        return Array.isArray(field.default) ? field.default.filter(v => allowed.includes(v)) : []
      }
      return typeof field.default === 'string' && allowed.includes(field.default) ? field.default : allowed[0] ?? ''
    }
    case 'list':
      return (field.default ?? []).filter(isRecord).map(item => resolveItem(field.fields, item))
    default:
      return field.default ?? ''
  }
}

export function resolveShopField(field: ShopField, raw: unknown): unknown {
  if (raw === undefined) return fallback(field)
  switch (field.type) {
    case 'boolean':
      return typeof raw === 'boolean' ? raw : fallback(field)
    case 'number':
      return raw === null || (typeof raw === 'number' && Number.isFinite(raw)) ? raw : fallback(field)
    case 'select': {
      const allowed = new Set(field.options.map(o => o.value))
      if (field.multiple) {
        return Array.isArray(raw) ? raw.filter(v => typeof v === 'string' && allowed.has(v)) : fallback(field)
      }
      return typeof raw === 'string' && allowed.has(raw) ? raw : fallback(field)
    }
    case 'list':
      return Array.isArray(raw) ? raw.filter(isRecord).map(item => resolveItem(field.fields, item)) : fallback(field)
    default:
      return typeof raw === 'string' ? raw : fallback(field)
  }
}

export function resolveShopFields<S extends ShopSettingsSchema>(schema: S, raw: unknown): ShopSettingsValues<S> {
  const source = isRecord(raw) ? raw : {}
  return resolveItem(schema.groups.flatMap(g => g.fields), source) as ShopSettingsValues<S>
}
