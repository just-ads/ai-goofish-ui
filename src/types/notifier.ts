export interface NotifierConfig {
  id: string
  name: string
  type: 'ntfy' | 'gotify' | string
  enable: boolean
  [key: string]: any
}


export interface NotifierSelectOption {
  label: string
  value: string
}
export interface NotifierTemplateField {
  name: string
  type: string
  required?: boolean
  placeholder?: string
  editable?: boolean
  default?: any
  options?: NotifierSelectOption[]
  multiple?: boolean
  // switch
  checkedValue?: any
  uncheckedValue?: any
  checkedLabel?: string
  uncheckedLabel?: string
  // textarea
  rows?: number
  help?: string
}

export interface NotifierTemplate {
  id: string
  name: string
  description: string
  type: 'ntfy' | 'gotify' | string
  template: Record<string, NotifierTemplateField>
}
