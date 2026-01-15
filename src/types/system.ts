// 浏览器配置
export interface BrowserConfig {
  headless: boolean
  channel: string
  timeout?: number
}

// 通知配置
export interface NotificationConfig {
  enabled: boolean
  providers: string[]
}

// 评估器配置
export interface EvaluatorConfig {
  enabled: boolean
  textProvider?: string | null
  imageProvider?: string | null
}



// 系统配置
export interface SystemConfig {
  browser: BrowserConfig
  notifications: NotificationConfig
  evaluator: EvaluatorConfig
}
