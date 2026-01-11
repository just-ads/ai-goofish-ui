// Agent配置
export interface AgentConfig {
  id: string
  name: string
  endpoint: string
  api_key: string
  model: string
  proxy?: string
  headers?: Record<string, string>
  body?: Record<string, any>
}

export type AgentTemplate = AgentConfig & {
  description: string
}
