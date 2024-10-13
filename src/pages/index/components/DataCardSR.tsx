import YuukiPS from '@/api/yuukips'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Collapse from '@/components/ui/collapse'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ToastAction } from '@/components/ui/toast'
import { useToast } from '@/components/ui/use-toast'
import type { Command, Datum, ImageClass } from '@/types/hsr'
import { isTauri } from '@tauri-apps/api/core'
import { writeText } from '@tauri-apps/plugin-clipboard-manager'
import type React from 'react'
import { memo, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaStar } from 'react-icons/fa'
import { MdOutlineContentCopy } from 'react-icons/md'
import { RiSlashCommands2 } from 'react-icons/ri'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import type { State } from './types'

const defaultImage = 'https://api.elaxan.com/images/genshin-impact/not-found.png'

const convertNumberToText = (num: number): string | undefined => {
	switch (num) {
		case 5:
			return 'bg-rarityFive'
		case 4:
			return 'bg-rarityFour'
		case 3:
			return 'bg-rarityThree'
		default:
			return
	}
}

const getImageSrc = (image: string | ImageClass): string => {
	if (typeof image === 'string') {
		return image
	}
	if (typeof image === 'object' && image.icon) {
		return image.icon
	}
	return defaultImage
}

const ImageComponent: React.FC<{
	item: Datum
	currentLanguage: DataCardSRProps['currentLanguage']
}> = memo(({ item, currentLanguage }) => {
	const imageSrc = getImageSrc(item.image || '')

	return (
		<div className='flex-shrink-0'>
			<LazyLoadImage
				src={imageSrc}
				alt={item.name[currentLanguage]}
				className={`w-32 rounded-lg max-sm:ml-3 sm:ml-3 md:ml-0 ${convertNumberToText(item.rarity || 1)}`}
				effect='opacity'
				onError={(e) => {
					e.currentTarget.style.display = 'none'
				}}
			/>
		</div>
	)
})

const initialState = {
	args: [] as string[],
	command: '',
	openModal: false,
}

interface DataCardSRProps {
	currentLanguage: 'en' | 'id' | 'ru' | 'jp' | 'th' | 'chs' | 'cht' | 'fr'
	uid: string
	code: string
	server: string
	stateApp: State
	setStateApp: React.Dispatch<React.SetStateAction<State>>
}

const DataCardSR: React.FC<DataCardSRProps> = ({ currentLanguage, code, server, uid, setStateApp, stateApp }) => {
	const { t } = useTranslation('translation', { keyPrefix: 'card' })
	const { t: tToast } = useTranslation('translation', { keyPrefix: 'toast' })
	const { t: tOutput } = useTranslation('translation', {
		keyPrefix: 'output',
	})
	const { toast } = useToast()
	const [state, setState] = useState<typeof initialState>(initialState)

	const handleButtonCopy = useCallback(
		(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
			const { value } = e.currentTarget
			const [name, id] = value.split(' || ')
			navigator.clipboard
				.writeText(id)
				.then(() => {
					toast({
						title: tToast('copied_id.title'),
						description: tToast('copied_id.description', {
							id,
							name,
						}),
					})
				})
				.catch((error) => {
					console.error('Failed to copy:', error)
					toast({
						title: tToast('failed_copy_id.title'),
						description: tToast('failed_copy_id.description'),
						variant: 'destructive',
					})
				})
		},
		[toast, tToast]
	)

	const handleCommandCopy = useCallback(
		(command: string) => {
			;(isTauri() ? writeText(command) : navigator.clipboard.writeText(command))
				.then(() => {
					toast({
						title: tToast('copied_command.title'),
						description: tToast('copied_command.description', {
							command: command,
						}),
					})
				})
				.catch((error) => {
					console.error('Failed to copy:', error)
					toast({
						title: tToast('failed_copy_command.title'),
						description: tToast('failed_copy_command.description'),
						variant: 'destructive',
					})
				})
		},
		[toast, tToast]
	)

	const handleApplyCommand = (value: string) => {
		if (!uid || !code || !server) {
			toast({
				title: tToast('apply_command_no_configured.title'),
				description: tToast('apply_command_no_configured.description'),
				action: (
					<ToastAction
						onClick={() => {
							document.location.href = '/settings.html'
						}}
						altText={tToast('apply_command_no_configured.action.text')}
					>
						{tToast('apply_command_no_configured.action.url_text')}
					</ToastAction>
				),
			})
			return
		}
		const formatCommand = YuukiPS.extractFormattedPlaceholders(value)
		setState((prev) => ({
			...prev,
			args: formatCommand,
			command: value,
			openModal: true,
		}))
	}

	const handleModalExecute = () => {
		if (!stateApp.yuukips) {
			setStateApp((prev) => ({
				...prev,
				output: [...prev.output, tOutput('websocket_not_established')],
			}))
			return
		}
		const userValues = state.args.reduce<Record<string, string>>((obj, arg) => {
			const key = arg.replace(/ /g, '')
			const element = document.getElementById(`data-card-apply-command-args-${key}`) as HTMLInputElement
			if (element && element.value !== '') {
				obj[key] = element.value
			}
			return obj
		}, {})
		const generateCommand = YuukiPS.generateResultCommand(state.command, userValues)
		setStateApp((prev) => ({
			...prev,
			output: [...prev.output, tOutput('executing_command', { command: generateCommand })],
		}))
		stateApp.yuukips.sendCommand(uid, code, server, generateCommand)
	}

	const commandList = (data: Command) => {
		return (
			<div className='rounded-box border-base-300 p-6'>
				{Object.entries(data).map(([key, value]: [string, Command[keyof Command]]) => (
					<div key={key}>
						<h3 className='font-bold'>{value?.name}</h3>
						<div className='mt-2 flex items-center justify-between rounded-lg bg-gray-300 p-2 dark:bg-gray-700'>
							<div className='group flex w-full items-center justify-between'>
								<code>{value?.value}</code>
								<div className='flex items-center'>
									<div className='mr-2 cursor-pointer rounded-lg border-2 border-gray-600 p-2 transition-opacity duration-300 group-hover:opacity-100 md:opacity-0 lg:opacity-0'>
										<RiSlashCommands2 onClick={() => handleApplyCommand(value?.value || '')} />
									</div>
									<div className='cursor-pointer rounded-lg border-2 border-gray-600 p-2 transition-opacity duration-300 group-hover:opacity-100 md:opacity-0 lg:opacity-0'>
										<MdOutlineContentCopy onClick={() => handleCommandCopy(value?.value || '')} />
									</div>
								</div>
							</div>
						</div>
					</div>
				))}
			</div>
		)
	}

	return (
		<>
			{stateApp.mainDataSR.slice(0, stateApp.currentLimit).map((item) => (
				<div className='mt-5 flex items-center justify-center' key={`card-sr-${item.id}`}>
					<div className='w-full rounded-lg bg-slate-300 p-6 shadow-lg dark:bg-slate-800 md:max-w-md lg:max-w-lg xl:max-w-xl'>
						<div className='flex flex-col md:flex-row'>
							{stateApp.showImage && <ImageComponent item={item} currentLanguage={currentLanguage} />}
							<div className='ml-3 flex flex-grow flex-col justify-between'>
								<div>
									{item.rarity && (
										<div className='mb-2 flex items-center'>
											<FaStar className='text-yellow-500' />
											<p className='ml-2 mt-[1px] select-none font-bold text-yellow-500'>
												{item.rarity}
											</p>
										</div>
									)}
									<h1 className='text-2xl font-semibold text-gray-700 dark:text-gray-300'>
										{item.name[currentLanguage.toLowerCase() as keyof typeof item.name]}
										{item.type && (
											<span className='ml-2 text-[1rem] font-bold text-gray-400 dark:text-gray-600'>
												{item.type}
											</span>
										)}
										{item.level && (
											<span className='ml-2 text-[1rem] font-bold text-gray-400 dark:text-gray-600'>
												{t('level_stage', { level: item.level })}
											</span>
										)}
									</h1>
									<p className='font-bold text-gray-400 dark:text-gray-600'>{item.id}</p>
									{item.nextMission && (
										<p className='font-bold text-gray-400 dark:text-gray-600'>
											{t('next_mission', {
												id: item.nextMission,
											})}
										</p>
									)}
									{item.description && (
										<p className='text-gray-500'>
											{
												item.description[
													currentLanguage.toLowerCase() as keyof typeof item.description
												]
											}
										</p>
									)}
								</div>
								<div className='mt-4 flex items-end justify-between md:mt-0'>
									<div className='select-none text-lg font-bold text-gray-800 dark:text-gray-300'>
										{item.category}
									</div>
									<Button
										className='mt-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition duration-300 hover:bg-blue-700'
										value={`${item.name[currentLanguage]} || ${item.id}`}
										onClick={handleButtonCopy}
									>
										{t('button.copy_id')}
									</Button>
								</div>
							</div>
						</div>
						{stateApp.showCommandsSR && (
							<div className='mt-4 rounded-lg bg-slate-300 p-4 dark:bg-slate-800'>
								<Collapse title={t('show_the_commands')} className='w-full'>
									<Card className='space-x-2'>
										<CardHeader>
											<CardTitle>{t('title.lc')}</CardTitle>
											<CardDescription>{t('description.lc')}</CardDescription>
										</CardHeader>
										<CardContent>{commandList(item.command)}</CardContent>
									</Card>
								</Collapse>
							</div>
						)}
					</div>
				</div>
			))}
			{/* TODO: Create new components for apply commands */}
			<Dialog open={state.openModal}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t('dialog.title')}</DialogTitle>
						<DialogDescription>
							<p>
								{state.args.length > 0
									? t('dialog.description.with_values', {
											command: state.command,
											list: state.args.join(', '),
										})
									: t('dialog.description.without_values', {
											command: state.command,
										})}
							</p>
							<p>
								{t('dialog.account', {
									uid: uid,
									server: server,
								})}
							</p>
						</DialogDescription>
					</DialogHeader>
					{state.args.map((arg) => (
						<>
							<Label key={`apply-the-command-args-${arg.replace(/ /, '')}`}>
								<span>{arg}</span>
								<Input
									className='input-bordered w-full'
									id={`data-card-apply-command-args-${arg.replace(/ /, '')}`}
								/>
							</Label>
						</>
					))}
					{stateApp.output.length > 0 && (
						<>
							<div className='output-container mt-5 max-h-[200px] overflow-y-auto bg-slate-950 p-2'>
								{stateApp.output.map((text) => (
									<div
										key={text.replace(/ /g, '')}
										className='text-sm'
										// biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
										dangerouslySetInnerHTML={{
											__html: text,
										}}
									/>
								))}
							</div>
							<div className='mt-2 text-sm'>
								<Button
									variant={'ghost'}
									size={'sm'}
									onClick={() => {
										setState((prev) => ({
											...prev,
											output: [],
										}))
									}}
								>
									{t('button.clear_output')}
								</Button>
							</div>
						</>
					)}
					<div className='flex justify-end gap-2'>
						<Button className='mt-3' onClick={handleModalExecute}>
							{t('button.apply_command')}
						</Button>
						<Button
							className='mt-3'
							variant={'secondary'}
							onClick={() =>
								setState((prev) => ({
									...prev,
									openModal: false,
								}))
							}
						>
							{t('button.close')}
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</>
	)
}

export default DataCardSR
