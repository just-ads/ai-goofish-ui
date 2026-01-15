// Model provider configuration
export interface ProviderConfig {
  id: string
  name: string
  endpoint: string
  api_key: string
  model: string
  proxy?: string
  headers?: Record<string, string>
  body?: Record<string, any>
}

export type ProviderTemplate = ProviderConfig & {
  description: string
}

