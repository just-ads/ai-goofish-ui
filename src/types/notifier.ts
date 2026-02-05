export interface NotifierConfig {
  id: string
  name: string
  type: 'ntfy' | 'gotify' | string
  enable: boolean
  [key: string]: any
}


export interface NotifierTemplateField {
  name: string
  type: string
  required?: boolean
  placeholder?: string
  editable?: boolean
  default?: any
}

export interface NotifierTemplate {
  id: string
  name: string
  description: string
  type: 'ntfy' | 'gotify' | string
  template: Record<string, NotifierTemplateField>
}
