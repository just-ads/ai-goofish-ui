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

// 浏览器配置
export interface BrowserConfig {
  headless: boolean
  channel: string
  timeout?: number
}

// 通知配置
export interface NotificationConfig {
  enabled: boolean
  providers: NotificationProvider[]
}

export interface NotificationProvider {
  type: 'ntfy' | 'gotify' | 'wechat'
  config: Record<string, any>
}

// 评估器配置
export interface EvaluatorConfig {
  enabled: boolean
  textAgent?: string | null
  imagAgent?: string | null
}

// 代理配置
export interface ProxyConfig {
  http?: string
  https?: string
  enabled?: boolean
}

// 系统配置
export interface SystemConfig {
  browser: BrowserConfig
  notifications: NotificationConfig
  agents: AgentConfig[]
  evaluator: EvaluatorConfig
}
