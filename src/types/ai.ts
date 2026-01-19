// AI configuration
export interface AIConfig {
  id: string
  name: string
  endpoint: string
  api_key: string
  model: string
  proxy?: string
  headers?: Record<string, string>
  body?: Record<string, any>
}

export type AITemplate = AIConfig & {
  description: string
}

