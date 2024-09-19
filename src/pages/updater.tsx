import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/use-toast'
import expiresInAMonth from '@/pages/index/components/cookieExpires'
import { isTauri } from '@tauri-apps/api/core'
import { type Update, check } from '@tauri-apps/plugin-updater'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDownToLine, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useCookies } from 'react-cookie'

const isAlreadyChecking = false

const Updater: React.FC = (): JSX.Element => {
	const [updateAvailable, setUpdateAvailable] = useState<boolean>(false)
	const [updateInfo, setUpdateInfo] = useState<Update | null>(null)
	const [isUpdating, setIsUpdating] = useState<boolean>(false)
	const [progress, setProgress] = useState<number>(0)
	const [cookies, setCookies] = useCookies(['skipUpdate'])
	const { toast } = useToast()

	useEffect(() => {
		const checkForUpdates = async () => {
			if (isAlreadyChecking || !isTauri() || cookies.skipUpdate) return

			try {
				const update = await check()
				if (!update) return
				setUpdateAvailable(true)
				setUpdateInfo(update)
				console.log(`Found update ${update.version} from ${update.date} with notes ${update.body}`)
			} catch (error) {
				console.error('Error checking for updates:', error)
			}
		}

		checkForUpdates()
	}, [cookies.skipUpdate])

	const handleUpdate = async () => {
		if (!updateInfo) return

		setIsUpdating(true)
		let downloaded = 0
		let contentLength = 0

		try {
			await updateInfo.downloadAndInstall((event) => {
				switch (event.event) {
					case 'Started':
						contentLength = event.data.contentLength ?? 0
						toast({
							variant: 'default',
							title: 'Updating',
							description: `Started downloading ${contentLength} bytes`,
						})
						break
					case 'Progress': {
						downloaded += event.data.chunkLength
						const newProgress = Math.round((downloaded / contentLength) * 100)
						setProgress(newProgress)
						break
					}
					case 'Finished':
						toast({
							variant: 'default',
							title: 'Update finished',
							description: 'Updating Handbook Finder is finished',
						})
						break
				}
			})

			console.log('Update installed')
			setIsUpdating(false)
			setUpdateAvailable(false)
		} catch (error) {
			console.error('Error during update:', error)
			setIsUpdating(false)
		}
	}

	const skipUpdate = () => {
		setCookies('skipUpdate', 1, {
			expires: expiresInAMonth(),
		})
		setUpdateAvailable(false)
	}

	return (
		<AnimatePresence>
			{(updateAvailable || isUpdating) && (
				<motion.div
					initial={{ y: -100 }}
					animate={{ y: 0 }}
					exit={{ y: -100 }}
					transition={{ type: 'spring', stiffness: 300, damping: 30 }}
					className='fixed top-0 left-0 right-0 z-50 p-4 md:p-6'
				>
					<div className='max-w-3xl mx-auto bg-background/80 backdrop-blur-md border border-border rounded-lg shadow-lg overflow-hidden'>
						{!isUpdating ? (
							<div className='p-4 md:p-6 space-y-4'>
								<div className='flex items-center justify-between'>
									<h3 className='text-lg font-semibold text-foreground'>Update Available</h3>
									<Button variant='ghost' size='icon' onClick={skipUpdate}>
										<X className='h-4 w-4' />
									</Button>
								</div>
								<p className='text-muted-foreground'>
									{updateInfo?.body || 'A new version is available. Do you want to update the app?'}
								</p>
								<div className='flex justify-end space-x-2'>
									<Button variant='outline' onClick={skipUpdate}>
										Skip
									</Button>
									<Button onClick={handleUpdate}>
										<ArrowDownToLine className='mr-2 h-4 w-4' />
										Update Now
									</Button>
								</div>
							</div>
						) : (
							<div className='p-4 md:p-6 space-y-4'>
								<h3 className='text-lg font-semibold text-foreground'>Updating...</h3>
								<Progress value={progress} className='w-full h-2' />
								<p className='text-sm text-muted-foreground text-right'>{progress}% complete</p>
							</div>
						)}
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	)
}

export default Updater
