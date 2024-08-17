import { isTauri } from '@tauri-apps/api/core'
import { check, type Update } from '@tauri-apps/plugin-updater'
import { useEffect, useState } from 'react'

const isAlreadyChecking = false

const Updater: React.FC = (): JSX.Element => {
	const [updateAvailable, setUpdateAvailable] = useState<boolean>(false)
	const [updateInfo, setUpdateInfo] = useState<Update | null>(null)
	const [isUpdating, setIsUpdating] = useState<boolean>(false)
	const [progress, setProgress] = useState<number>(0)

	useEffect(() => {
		const checkForUpdates = async () => {
			if (isAlreadyChecking || !isTauri()) return

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
	}, [])

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
						console.log(`Started downloading ${contentLength} bytes`)
						break
					case 'Progress': {
						downloaded += event.data.chunkLength
						const newProgress = Math.round((downloaded / contentLength) * 100)
						setProgress(newProgress)
						console.log(`Downloaded ${downloaded} from ${contentLength}`)
						break
					}
					case 'Finished':
						console.log('Download finished')
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

	return (
		// TODO: Update UI for updating
		<div className='fixed top-0 left-0 right-0 z-50'>
			{(updateAvailable || isUpdating) && (
				<div className='bg-background border-b border-border p-4 shadow-md'>
					{updateAvailable && !isUpdating && (
						<div className='flex items-center justify-between'>
							<p className='text-foreground'>An update is available. Do you want to update the app?</p>
							<button
								type='button'
								onClick={handleUpdate}
								className='bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition-colors'
							>
								Yes, update
							</button>
						</div>
					)}
					{isUpdating && (
						<div>
							<p className='text-foreground mb-2'>Updating... {progress}%</p>
							<progress value={progress} max='100' className='w-full' />
						</div>
					)}
				</div>
			)}
		</div>
	)
}

export default Updater
