import {presetWind3} from "@unocss/preset-wind3";
import {
  defineConfig,
  presetAttributify,
  transformerDirectives
} from 'unocss'

const rgbVar = (cssVar: string) => `rgb(var(--${cssVar}) / <alpha-value>)`

export default defineConfig({
  shortcuts: {
    'wh-full': 'w-full h-full',
    'flex-center': 'flex justify-center items-center',
    'flex-col-center': 'flex-center flex-col',
    'flex-x-center': 'flex justify-center',
    'flex-y-center': 'flex items-center',
    'i-flex-center': 'inline-flex justify-center items-center',
    'i-flex-x-center': 'inline-flex justify-center',
    'i-flex-y-center': 'inline-flex items-center',
    'flex-col': 'flex flex-col',
    'flex-col-stretch': 'flex-col items-stretch',
    'i-flex-col': 'inline-flex flex-col',
    'i-flex-col-stretch': 'i-flex-col items-stretch',
    'flex-1-hidden': 'flex-1 overflow-hidden',
    'absolute-lt': 'absolute left-0 top-0',
    'absolute-lb': 'absolute left-0 bottom-0',
    'absolute-rt': 'absolute right-0 top-0',
    'absolute-rb': 'absolute right-0 bottom-0',
    'absolute-tl': 'absolute-lt',
    'absolute-tr': 'absolute-rt',
    'absolute-bl': 'absolute-lb',
    'absolute-br': 'absolute-rb',
    'absolute-center': 'absolute-lt flex-center wh-full',
    'fixed-lt': 'fixed left-0 top-0',
    'fixed-lb': 'fixed left-0 bottom-0',
    'fixed-rt': 'fixed right-0 top-0',
    'fixed-rb': 'fixed right-0 bottom-0',
    'fixed-tl': 'fixed-lt',
    'fixed-tr': 'fixed-rt',
    'fixed-bl': 'fixed-lb',
    'fixed-br': 'fixed-rb',
    'fixed-center': 'fixed-lt flex-center wh-full',
    'nowrap-hidden': 'whitespace-nowrap overflow-hidden',
    'ellipsis-text': 'nowrap-hidden text-ellipsis',
    'transition-base': 'transition-all duration-300 ease-in-out'
  },
  theme: {
    colors: {
      primary: {
        50: rgbVar('primary-50'),
        100: rgbVar('primary-100'),
        200: rgbVar('primary-200'),
        300: rgbVar('primary-300'),
        400: rgbVar('primary-400'),
        500: rgbVar('primary-500'),
        600: rgbVar('primary-600'),
        700: rgbVar('primary-700'),
        800: rgbVar('primary-800'),
        900: rgbVar('primary-900'),
      },
      secondary: {
        50: rgbVar('secondary-50'),
        100: rgbVar('secondary-100'),
        200: rgbVar('secondary-200'),
        300: rgbVar('secondary-300'),
        400: rgbVar('secondary-400'),
        500: rgbVar('secondary-500'),
        600: rgbVar('secondary-600'),
        700: rgbVar('secondary-700'),
        800: rgbVar('secondary-800'),
        900: rgbVar('secondary-900'),
      },
      gray: {
        50: rgbVar('gray-50'),
        100: rgbVar('gray-100'),
        200: rgbVar('gray-200'),
        300: rgbVar('gray-300'),
        400: rgbVar('gray-400'),
        500: rgbVar('gray-500'),
        600: rgbVar('gray-600'),
        700: rgbVar('gray-700'),
        800: rgbVar('gray-800'),
        900: rgbVar('gray-900'),
        950: rgbVar('gray-950'),
      },
      success: rgbVar('success'),
      warning: rgbVar('warning'),
      error: rgbVar('error'),
      info: rgbVar('info'),
    }
  },
  presets: [presetWind3(), presetAttributify()],
  transformers: [transformerDirectives()]
})
