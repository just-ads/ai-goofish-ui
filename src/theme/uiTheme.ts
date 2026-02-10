export type UiThemeMode = 'dark' | 'light'

export type UiThemeAccent = 'blue' | 'teal' | 'indigo'

export type UiTheme = {
  mode: UiThemeMode
  accent: UiThemeAccent
}

const STORAGE_KEY = 'ai-goofish.uiTheme'

const DEFAULT_THEME: UiTheme = {
  mode: 'dark',
  accent: 'blue',
}

const isMode = (value: unknown): value is UiThemeMode => value === 'dark' || value === 'light'

const isAccent = (value: unknown): value is UiThemeAccent =>
  value === 'blue' || value === 'teal' || value === 'indigo'

export function readUiTheme(): UiTheme {
  if (typeof window === 'undefined') return DEFAULT_THEME

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_THEME
    const parsed = JSON.parse(raw) as Partial<UiTheme>

    return {
      mode: isMode(parsed.mode) ? parsed.mode : DEFAULT_THEME.mode,
      accent: isAccent(parsed.accent) ? parsed.accent : DEFAULT_THEME.accent,
    }
  } catch {
    return DEFAULT_THEME
  }
}

export function writeUiTheme(theme: UiTheme) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(theme))
}

export function applyUiThemeToDom(theme: UiTheme) {
  if (typeof document === 'undefined') return
  const el = document.documentElement
  el.dataset.theme = theme.mode
  el.dataset.accent = theme.accent
}

export function bootstrapUiTheme() {
  const theme = readUiTheme()
  applyUiThemeToDom(theme)
  return theme
}
