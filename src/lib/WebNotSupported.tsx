import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { isTauri } from '@tauri-apps/api/core'
import { useTranslation } from 'react-i18next'

const WebNotSupported: React.FC = (): JSX.Element => {
	const { t } = useTranslation('default', { keyPrefix: 'web_not_supported' })

	return (
		<>
			{!isTauri() && (
				<Dialog open={true}>
					<DialogContent className='sm:max-w-[425px]'>
						<DialogHeader>
							<DialogTitle className='text-xl font-semibold'>{t('title')}</DialogTitle>
							<DialogDescription className='text-sm text-gray-500'>{t('description')}</DialogDescription>
						</DialogHeader>
						<DialogFooter className='flex flex-col sm:flex-row sm:justify-end gap-2'>
							<a
								href='https://github.com/YuukiPS/Handbook/releases'
								target='_blank'
								rel='noopener noreferrer'
								className='w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
							>
								{t('button')}
							</a>
							<a
								href='/'
								className='w-full sm:w-auto px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
							>
								{t('button_home')}
							</a>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			)}
		</>
	)
}

export default WebNotSupported
