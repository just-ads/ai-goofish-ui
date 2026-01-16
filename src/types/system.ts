export interface BrowserConfig {
  headless: boolean
  channel: string
  timeout?: number
}

export interface NotificationConfig {
  enabled: boolean
  providers: string[]
}

export interface EvaluatorConfig {
  enabled: boolean
  textAI?: string | null
  imageAI?: string | null
}

export interface SystemConfig {
  browser: BrowserConfig
  notifications: NotificationConfig
  evaluator: EvaluatorConfig
}
