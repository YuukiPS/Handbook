import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import i18n from '@/i18n'
import { GlobeIcon } from 'lucide-react'
import { memo, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

const LanguageSwitcher: React.FC = memo(() => {
	const { t } = useTranslation('default', {
		keyPrefix: 'drawer',
	})
	const [currentLanguage, setCurrentLanguage] = useState(i18n.language)

	const languages = [
		{ id: 'en', name: 'English' },
		{ id: 'id', name: 'Indonesia' },
		{ id: 'ja', name: '日本語' },
		{ id: 'zh', name: '中文' },
		{ id: 'ru', name: 'Русский' },
		{ id: 'th', name: 'ไทย' },
		{ id: 'ptBR', name: 'Português (BR)' },
	]

	const changeLanguage = (language: string) => {
		i18n.changeLanguage(language)
		setCurrentLanguage(language)
	}

	useEffect(() => {
		const handleLanguageChanged = () => {
			setCurrentLanguage(i18n.language)
		}

		i18n.on('languageChanged', handleLanguageChanged)

		return () => {
			i18n.off('languageChanged', handleLanguageChanged)
		}
	}, [])

	const getCurrentLanguageName = () => {
		return languages.find((lang) => lang.id === currentLanguage)?.name || t('select_language')
	}

	return (
		<Select onValueChange={changeLanguage} value={currentLanguage}>
			<SelectTrigger className='w-full'>
				<GlobeIcon className='mr-2 h-4 w-4' />
				<SelectValue>{getCurrentLanguageName()}</SelectValue>
			</SelectTrigger>
			<SelectContent>
				{languages.map((language) => (
					<SelectItem value={language.id} key={language.id}>
						{language.name}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	)
})

export default LanguageSwitcher
