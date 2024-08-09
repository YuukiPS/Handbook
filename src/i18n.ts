import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import HttpApi, { type HttpBackendOptions } from 'i18next-http-backend'
import LanguageDetector from 'i18next-browser-languagedetector'
import { en, id, ja, ru, th, zh } from '@/locales'

const getLoadPath = (): string => {
	const path = window.location.pathname
	if (path.startsWith('/settings')) {
		return '/locales/settings/{{lng}}.json'
	}
	if (path.startsWith('/commands')) {
		return '/locales/commands/{{lng}}.json'
	}
	return '/locales/{{lng}}.json'
}

i18n.use(HttpApi)
	.use(LanguageDetector)
	.use(initReactI18next)
	.init<HttpBackendOptions>({
		load: 'languageOnly',
		fallbackLng: 'en',
		defaultNS: 'translation',
		debug: false,
		interpolation: {
			escapeValue: false,
		},
		resources: {
			en: {
				default: en,
			},
			id: {
				default: id,
			},
			ja: {
				default: ja,
			},
			ru: {
				default: ru,
			},
			th: {
				default: th,
			},
			zh: {
				default: zh,
			},
		},
		partialBundledLanguages: true,
		backend: {
			loadPath: getLoadPath(),
		},
	})

export default i18n
