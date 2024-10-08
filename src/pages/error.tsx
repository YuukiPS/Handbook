'use client'

import { Button } from '@/components/ui/button'
import { RefreshCcw } from 'lucide-react'
import { memo } from 'react'

interface ErrorProps {
	error: Error | null
}

const ErrorHandling: React.FC<ErrorProps> = memo(
	({ error }): JSX.Element => (
		<div className='min-h-screen flex justify-center px-4 py-8 bg-background text-foreground'>
			<div className='max-w-xl w-full space-y-8 text-center'>
				<div className='space-y-4'>
					<h1 className='text-4xl font-bold'>Oops! Something went wrong</h1>
					<p className='text-lg text-muted-foreground'>Sorry about that. We've hit a bump in the road.</p>
				</div>
				<div className='bg-card text-card-foreground rounded-lg shadow-lg p-6'>
					<h2 className='text-xl font-semibold mb-2'>Error Details</h2>
					<p className='text-sm text-muted-foreground break-words'>
						{error?.message || 'Unknown error occurred'}
					</p>
				</div>
				<div className='space-y-4'>
					<Button
						onClick={() => {
							window.location.reload()
						}}
						className='inline-flex items-center justify-center'
					>
						<RefreshCcw className='mr-2 h-4 w-4' />
						Try again
					</Button>
					<p className='text-sm text-muted-foreground'>
						If you keep seeing this error, please let us know on{' '}
						<a className='underline' href='https://github.com/YuukiPS/Handbook/issues'>
							GitHub
						</a>
						. We appreciate your help in improving our app.
					</p>
				</div>
			</div>
		</div>
	)
)

export default ErrorHandling
