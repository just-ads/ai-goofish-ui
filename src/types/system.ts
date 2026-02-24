export interface BrowserConfig {
  headless: boolean
  channel: string
  timeout?: number
}

export interface NotificationConfig {
  enabled: boolean
  threshold: number
}

export interface EvaluationStep {
  disabled: boolean
  threshold: number
  prompt?: string
}
export interface EvaluationSteps {
  step1?: EvaluationStep
  step2?: EvaluationStep
  step3?: EvaluationStep
  step4?: EvaluationStep
}

export interface EvaluatorConfig {
  enabled: boolean
  textAI?: string | null
  imageAI?: string | null
  steps?: EvaluationSteps
}

export interface SystemConfig {
  browser: BrowserConfig
  notifications: NotificationConfig
  evaluator: EvaluatorConfig
}
