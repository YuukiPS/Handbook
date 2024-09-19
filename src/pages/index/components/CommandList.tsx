import YuukiPS from '@/api/yuukips'
import { ToastAction } from '@/components/ui/toast.tsx'
import { useToast } from '@/components/ui/use-toast'
import type { Command, GmhandbookGI } from '@/types/gm'
import { isTauri } from '@tauri-apps/api/core'
import { writeText } from '@tauri-apps/plugin-clipboard-manager'
import type React from 'react'
import { memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { MdOutlineContentCopy } from 'react-icons/md'
import { RiSlashCommands2 } from 'react-icons/ri'

interface CommandListProps {
	data: GmhandbookGI
	type: 'gc' | 'gio'
	uid: string
	code: string | number
	server: string
	setArgs: React.Dispatch<React.SetStateAction<string[]>>
	setCommand: React.Dispatch<React.SetStateAction<string>>
	setOpenModal: React.Dispatch<React.SetStateAction<boolean>>
}

const CommandList: React.FC<CommandListProps> = memo(
	({ data, type, uid, code, server, setArgs, setCommand, setOpenModal }) => {
		const { t } = useTranslation('translation', { keyPrefix: 'toast' })
		const { toast } = useToast()

		const handleIconClick = useCallback(
			(value: string, action: 'copy' | 'apply') => {
				if (action === 'copy') {
					const copyCommand = async (value: string) => {
						try {
							await (isTauri() ? writeText(value) : navigator.clipboard.writeText(value))
							toast({
								title: t('command_copied.title'),
								description: t('command_copied.description', {
									command: value,
								}),
							})
						} catch (e) {
							console.error(e)
						}
					}
					copyCommand(value)
				} else if (action === 'apply') {
					if (!uid || !code || !server) {
						toast({
							title: t('invalid_input.title'),
							description: t('invalid_input.description'),
							action: (
								<ToastAction altText={t('invalid_input.action.text')}>
									<a href={'/settings.html'}>{t('invalid_input.action.url_text')}</a>
								</ToastAction>
							),
						})
						return
					}
					const formatCommand = YuukiPS.extractFormattedPlaceholders(value)
					setArgs(formatCommand)
					setCommand(value)
					setOpenModal(true)
				}
			},
			[toast, uid, code, server, setArgs, setCommand, setOpenModal, t]
		)

		return (
			<div className='rounded-box border-base-300 p-6 dark:bg-base-100'>
				{(data.commands || data.command) &&
					Object.entries((data.commands || data.command)?.[type] ?? {}).map(
						([key, value]: [string, Command]) => (
							<div className='p-2' key={key}>
								<h3 className='font-bold'>{value.name}</h3>
								<div className='mt-2 flex items-center justify-between rounded-lg bg-gray-700 p-2'>
									<div className='group flex w-full items-center justify-between'>
										<code>{value.command || value.value || 'Unknown'}</code>
										<div className='flex items-center'>
											<div className='mr-2 cursor-pointer rounded-lg border-2 border-gray-600 p-2 transition-opacity duration-300 group-hover:opacity-100 md:opacity-0 lg:opacity-0'>
												<RiSlashCommands2
													onClick={() =>
														handleIconClick(
															value.command || value.value || 'Unknown',
															'apply'
														)
													}
												/>
											</div>
											<div className='cursor-pointer rounded-lg border-2 border-gray-600 p-2 transition-opacity duration-300 group-hover:opacity-100 md:opacity-0 lg:opacity-0'>
												<MdOutlineContentCopy
													onClick={() =>
														handleIconClick(
															value.command || value.value || 'Unknown',
															'copy'
														)
													}
												/>
											</div>
										</div>
									</div>
								</div>
							</div>
						)
					)}
			</div>
		)
	}
)

export default CommandList
