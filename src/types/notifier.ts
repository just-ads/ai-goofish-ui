export interface NotifierConfig {
  id: string
  name: string
  type: 'ntfy' | 'gotify' | string
  [key: string]: any
}


export interface NotifierTemplateField {
  name: string
  type: string
  required?: boolean
  placeholder?: string
  default?: any
}

export interface NotifierTemplate {
  id: string
  name: string
  description: string
  type: 'ntfy' | 'gotify' | string
  template: Record<string, NotifierTemplateField>
}

export interface NotifierCreateRequest {
  name: string
  type: 'ntfy' | 'gotify'
  url: string
  token?: string
}

export interface NotifierUpdateRequest {
  name?: string
  type?: 'ntfy' | 'gotify'
  url?: string
  token?: string
}
