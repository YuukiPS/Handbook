import { toast } from '@/components/ui/use-toast'
import { invoke } from '@tauri-apps/api/core'
import { open } from '@tauri-apps/plugin-dialog'
import { platform } from '@tauri-apps/plugin-os'

interface StoragePermissionResponse {
	status: 'Granted' | 'Cancelled' | 'Denied'
}

interface SelectFolderResponse {
	displayName: string | undefined
	uri: string | undefined
}

async function getPlatformFolderSelector() {
	const currentPlatform = platform()

	if (currentPlatform === 'windows' || currentPlatform === 'linux') {
		return (title: string) => open({ directory: true, title, multiple: false })
	}

	if (currentPlatform === 'android') {
		const checkPermissions = await invoke<StoragePermissionResponse>('plugin:handbook-finder|checkPermissions')

		if (checkPermissions.status === 'Denied') {
			const result = await invoke<StoragePermissionResponse>('plugin:handbook-finder|requestStoragePermission')

			if (result.status === 'Cancelled') {
				// Re-check permissions may return 'Cancelled' even when granted
				const recheck = await invoke<StoragePermissionResponse>('plugin:handbook-finder|checkPermissions')

				if (recheck.status === 'Denied') {
					toast({
						title: 'Storage permission denied',
						description: 'Storage permission is required to read the handbook file',
					})
					return null
				}
			}
		}

		return () => invoke<SelectFolderResponse>('plugin:handbook-finder|openFolderPicker')
	}

	return null
}

export default getPlatformFolderSelector
