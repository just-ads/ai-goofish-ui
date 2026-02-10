import {applyUiThemeToDom, readUiTheme, writeUiTheme, type UiThemeAccent, type UiTheme, type UiThemeMode} from '@/theme/uiTheme'

export const useUiThemeStore = defineStore('ui-theme-store', () => {
  const theme = ref<UiTheme>(readUiTheme())

  const apply = () => {
    applyUiThemeToDom(theme.value)
  }

  const setAccent = (accent: UiThemeAccent) => {
    theme.value = {
      ...theme.value,
      accent,
    }
    writeUiTheme(theme.value)
    apply()
  }

  const setMode = (mode: UiThemeMode) => {
    theme.value = {
      ...theme.value,
      mode,
    }
    writeUiTheme(theme.value)
    apply()
  }

  const toggleMode = () => {
    setMode(theme.value.mode === 'dark' ? 'light' : 'dark')
  }

  return {
    theme,
    apply,
    setAccent,
    setMode,
    toggleMode,
  }
})
