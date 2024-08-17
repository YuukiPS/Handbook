import type React from 'react'
import { useCallback, memo, useState } from 'react'
import { FaStar } from 'react-icons/fa'
import type { Description, GmhandbookGI } from '@/types/gm'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import YuukiPS from '@/api/yuukips'
import Collapse from '@/components/ui/collapse'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { useCookies } from 'react-cookie'
import { Label } from '@/components/ui/label.tsx'
import CommandList from '@/pages/index/components/CommandList.tsx'
import type { State } from './types'
import { useTranslation } from 'react-i18next'
import { isTauri } from '@tauri-apps/api/core'
import { writeText } from '@tauri-apps/plugin-clipboard-manager'

const ImageComponent = memo(({ data }: { data: GmhandbookGI }) => {
	const defaultImage = 'https://api.elaxan.com/images/genshin-impact/not-found.png'
	let imageSrc = defaultImage
	let isAvatar = false

	if (data.category === 'Characters' && data.image) {
		imageSrc = (data.image as unknown as { icon: string }).icon
		isAvatar = true
	} else if (data.category !== 'Characters' && 'image' in data) {
		imageSrc = data.image || defaultImage
	}

	return (
		<div className='flex-shrink-0'>
			<LazyLoadImage
				src={imageSrc}
				alt={isAvatar ? '' : 'Not Found'}
				className={`w-32 rounded-lg max-sm:ml-3 sm:ml-3 md:ml-0 ${
					'rarity' in data && data.rarity ? `${convertNumberToText(data.rarity) || ''}` : ''
				}`}
				effect='opacity'
				onError={(e) => {
					e.currentTarget.style.display = 'none'
				}}
			/>
		</div>
	)
})

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

const initialState = {
	args: [] as string[],
	command: '',
	openModal: false,
}

interface DataCardProps {
	currentLanguage: keyof Description
	uid: string
	code: string
	server: string
	stateApp: State
	setStateApp: React.Dispatch<React.SetStateAction<State>>
}

const DataCard: React.FC<DataCardProps> = ({ currentLanguage, code, uid, server, stateApp, setStateApp }) => {
	const { t } = useTranslation('translation', { keyPrefix: 'card' })
	const { t: tOutput } = useTranslation('translation', {
		keyPrefix: 'output',
	})
	const { t: tToast } = useTranslation('translation', { keyPrefix: 'toast' })

	const { toast } = useToast()

	const [cookies] = useCookies(['uid', 'server'])
	const [state, setState] = useState<typeof initialState>(initialState)

	const handleButtonCopy = useCallback(
		(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
			const { value } = e.currentTarget
			const [name, id] = value.split(' || ')
			;(isTauri() ? writeText(id) : navigator.clipboard.writeText(id))
				.then(() => {
					toast({
						title: tToast('copied_id.title'),
						description: tToast('copied_id.description', {
							id: id,
							name: name,
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

	const handleCommandApply = async () => {
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
			if (element && element.value !== '') obj[key] = element.value
			return obj
		}, {})
		const generateCommand = YuukiPS.generateResultCommand(state.command, userValues)
		setStateApp((prev) => ({
			...prev,
			output: [...prev.output, tOutput('executing_command', { command: generateCommand })],
		}))
		stateApp.yuukips.sendCommand(uid, code, server, generateCommand)
	}

	return (
		<>
			{stateApp.mainData.slice(0, stateApp.currentLimit).map((data) => (
				<div className='mt-5 flex items-center justify-center' key={`data-card-${data.id}`}>
					<div className='w-full bg-gray-300 dark:bg-slate-800 md:max-w-md lg:max-w-lg xl:max-w-xl'>
						<div className='flex flex-col rounded-lg p-5 shadow-lg md:flex-row'>
							{stateApp.showImage && 'image' in data && data.image ? (
								<ImageComponent data={data} />
							) : null}
							<div className='ml-3 flex flex-grow flex-col justify-between'>
								<div>
									{'rarity' in data && (
										<div className='flex items-center'>
											<FaStar className='text-yellow-600 dark:text-yellow-400' />
											<p className='ml-2 mt-[1px] select-none font-bold text-yellow-600 dark:text-yellow-400'>
												{data.rarity}
											</p>
										</div>
									)}
									<h1 className='text-2xl font-semibold'>
										{/* {data.name} */}
										{typeof data.name === 'object' ? data.name[currentLanguage] : data.name}
									</h1>
									<p className='font-bold text-gray-400 dark:text-gray-600'>{data.id}</p>
									<p className='text-gray-500'>
										{'description' in data &&
											(typeof data.description === 'object'
												? data.description[currentLanguage]
												: data.description)}
									</p>
								</div>
								<div className='mt-4 flex items-end justify-between md:mt-0'>
									<div className='select-none text-lg font-bold'>{data.category}</div>
									<Button
										className='mt-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700'
										value={`${data.name} || ${data.id}`}
										onClick={handleButtonCopy}
									>
										{t('button.copy_id')}
									</Button>
								</div>
							</div>
						</div>
						{stateApp.showCommands &&
							('commands' in data || 'command' in data) &&
							(data.commands || data.command) && (
								<div className={'mb-4 flex justify-center bg-gray-300 dark:bg-slate-800'}>
									<Collapse title={t('show_the_commands')} className='w-full'>
										<Tabs defaultValue='GC'>
											<TabsList className='grid w-full grid-cols-2'>
												<TabsTrigger value='GC'>{t('tabs_title.gc')}</TabsTrigger>
												<TabsTrigger value='GIO'>{t('tabs_title.gio')}</TabsTrigger>
											</TabsList>
											<TabsContent value='GC'>
												<Card>
													<CardHeader>
														<CardTitle>{t('title.gc')}</CardTitle>
														<CardDescription>{t('description.gc')}</CardDescription>
													</CardHeader>
													<CardContent className='space-y-2'>
														<CommandList
															data={data}
															uid={uid}
															setOpenModal={(open) =>
																setState((prev) => ({
																	...prev,
																	openModal: open as boolean,
																}))
															}
															setCommand={(command) =>
																setState((prev) => ({
																	...prev,
																	command: command.toString(),
																}))
															}
															code={code}
															server={server}
															type={'gc'}
															setArgs={(args) =>
																setState((prev) => ({
																	...prev,
																	args: args as string[],
																}))
															}
														/>
													</CardContent>
												</Card>
											</TabsContent>
											<TabsContent value='GIO'>
												<Card>
													<CardHeader>
														<CardTitle>{t('title.gio')}</CardTitle>
														<CardDescription>{t('description.gio')}</CardDescription>
													</CardHeader>
													<CardContent className='space-y-2'>
														<CommandList
															data={data}
															uid={uid}
															setOpenModal={(open) =>
																setState((prev) => ({
																	...prev,
																	openModal: open as boolean,
																}))
															}
															setCommand={(command) =>
																setState((prev) => ({
																	...prev,
																	command: command as string,
																}))
															}
															code={code}
															server={server}
															type={'gio'}
															setArgs={(args) =>
																setState((prev) => ({
																	...prev,
																	args: args as string[],
																}))
															}
														/>
													</CardContent>
												</Card>
											</TabsContent>
										</Tabs>
									</Collapse>
								</div>
							)}
					</div>
				</div>
			))}
			<Dialog open={state.openModal}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t('dialog.title')}</DialogTitle>
					</DialogHeader>
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
								uid: cookies.uid,
								server: cookies.server,
							})}
						</p>
					</DialogDescription>
					{state.args.map((arg) => (
						<>
							<Label key={`apply-the-command-args-${arg.replace(/ /, '')}`}>
								<span className='label-text'>{arg}</span>
								<input
									type='text'
									className='input input-bordered w-full'
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
									size={'sm'}
									variant={'ghost'}
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
					<DialogFooter>
						<Button type='submit' onClick={handleCommandApply}>
							{t('button.apply_command')}
						</Button>
						<Button
							type='button'
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
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	)
}

export default DataCard
