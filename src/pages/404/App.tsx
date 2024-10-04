import { useTranslation } from 'react-i18next'

const Page404: React.FC = () => {
	const { t } = useTranslation('default', {
		keyPrefix: 'page_not_found',
	})
	return (
		<div className='flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-4'>
			<h1 className='text-6xl sm:text-9xl font-bold'>404</h1>
			<p className='mt-4 text-xl sm:text-2xl text-center'>{t('title')}</p>
			<p className='mt-2 text-base sm:text-lg text-muted-foreground text-center'>{t('description')}</p>
			<a
				href='/'
				className='mt-6 rounded-md bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary-foreground hover:text-primary text-sm sm:text-base'
			>
				{t('button')}
			</a>
		</div>
	)
}

export default Page404
