'use client'

import { Button } from '@/components/ui/button'
import { RefreshCcw } from 'lucide-react'
import { memo } from 'react'
import { Trans, useTranslation } from 'react-i18next'

interface ErrorProps {
	error: Error | null
}

const ErrorHandling: React.FC<ErrorProps> = memo(({ error }): JSX.Element => {
	const { t } = useTranslation('default', { keyPrefix: 'error' })
	return (
		<div className='min-h-screen flex justify-center px-4 py-8 bg-background text-foreground'>
			<div className='max-w-xl w-full space-y-8 text-center'>
				<div className='space-y-4'>
					<h1 className='text-4xl font-bold'>{t('title')}</h1>
					<p className='text-lg text-muted-foreground'>{t('description')}</p>
				</div>
				<div className='bg-card text-card-foreground rounded-lg shadow-lg p-6'>
					<h2 className='text-xl font-semibold mb-2'>{t('details')}</h2>
					<p className='text-sm text-muted-foreground break-words'>{error?.message || t('unknown')}</p>
				</div>
				<div className='space-y-4'>
					<Button
						onClick={() => {
							window.location.reload()
						}}
						className='inline-flex items-center justify-center'
					>
						<RefreshCcw className='mr-2 h-4 w-4' />
						{t('button')}
					</Button>
					<p className='text-sm text-muted-foreground'>
						<Trans
							i18nKey={'report'}
							t={t}
							// biome-ignore lint/a11y/useAnchorContent: The anchor content is provided by the Trans component
							// biome-ignore lint/correctness/useJsxKeyInIterable: Keys are not needed for static content in Trans component
							components={[<a className='underline' href='https://github.com/YuukiPS/Handbook/issues' />]}
						/>
					</p>
				</div>
			</div>
		</div>
	)
})

export default ErrorHandling
