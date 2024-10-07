import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Coffee, Heart } from 'lucide-react'
import { FaGithub } from 'react-icons/fa'
import { useTranslation } from 'react-i18next'
import i18n from '@/i18n'

function App() {
	const { t } = useTranslation()

	return (
		<div className='min-h-screen'>
			<div className='container mx-auto px-4 py-8 max-w-4xl'>
				<main className='space-y-8'>
					<Card className='bg-white dark:bg-gray-800 border-l-4 border-yellow-500'>
						<CardHeader>
							<CardTitle className='flex items-center gap-2 text-yellow-500'>
								<AlertTriangle className='h-5 w-5' />
								{t('needHelp')}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='prose dark:prose-invert max-w-none'>
								{(t('description', { returnObjects: true }) as string[]).map((text, index) => (
									<p key={`${i18n.language}-desc-${index}`}>{text}</p>
								))}
							</div>
						</CardContent>
					</Card>

					<div className='grid gap-6 md:grid-cols-2'>
						<Card className='bg-white dark:bg-gray-800 flex flex-col'>
							<CardHeader>
								<CardTitle className='flex items-center gap-2'>
									<Coffee className='h-5 w-5' />
									{t('buyCoffee')}
								</CardTitle>
							</CardHeader>
							<CardContent className='flex flex-col flex-grow'>
								<p className='mb-4 flex-grow'>{t('coffeeDescription')}</p>
								<Button
									className='w-full mt-auto'
									onClick={() => window.open('https://buymeacoffee.com/ElashXander', '_blank')}
								>
									{t('donateButton')}
								</Button>
							</CardContent>
						</Card>

						<Card className='bg-white dark:bg-gray-800 flex flex-col'>
							<CardHeader>
								<CardTitle className='flex items-center gap-2'>
									<Heart className='h-5 w-5' />
									{t('saweria')}
								</CardTitle>
							</CardHeader>
							<CardContent className='flex flex-col flex-grow'>
								<p className='mb-4 flex-grow'>{t('saweriaDescription')}</p>
								<Button
									className='w-full mt-auto'
									onClick={() => window.open('https://saweria.co/ElaXan', '_blank')}
								>
									{t('saweriaButton')}
								</Button>
							</CardContent>
						</Card>
					</div>

					<Card className='bg-white dark:bg-gray-800'>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<FaGithub className='h-5 w-5' />
								{t('openSource')}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className='mb-4'>{t('githubDescription')}</p>
							<Button
								className='w-full'
								onClick={() => window.open('https://github.com/YuukiPS/Handbook', '_blank')}
							>
								{t('githubButton')}
							</Button>
						</CardContent>
					</Card>

					<section className='prose dark:prose-invert max-w-none'>
						<h2 className='text-2xl font-semibold mb-4'>{t('donationUsage')}</h2>
						<ul className='list-disc pl-5 space-y-2'>
							{(t('usageList', { returnObjects: true }) as string[]).map((text, index) => (
								<li key={`${i18n.language}-usage-${index}`}>{text}</li>
							))}
						</ul>
					</section>
				</main>

				<footer className='mt-12 text-center text-sm text-gray-600 dark:text-gray-400'>
					<p>{t('footerMessage')}</p>
				</footer>
			</div>
		</div>
	)
}

export default App
