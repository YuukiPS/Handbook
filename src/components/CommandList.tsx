'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import axios from 'axios'
import { AlertTriangle, Clipboard, Search, Loader2 } from 'lucide-react'
import type React from 'react'
import { useCallback, memo } from 'react'
import { debounce } from 'lodash'
import { type Dispatch, type SetStateAction, useEffect, useState } from 'react'
import YuukiPS from '@/api/yuukips'
import type { APIElaXan } from '@/types/gm'

type Argument = {
	key: string
	name: string
	description: string
	type: 'select' | 'search' | 'number'
	limit?: {
		min: number
		max: number
	}
	options?: Array<{
		value: string
		description: string
	}>
	api?: {
		game: 'gi' | 'sr'
		jsonBody: {
			[key: string]: string | Array<string>
		}
	}
}

type CommandLists = {
	id: number
	name: string
	command: string
	args?: Argument[]
}

interface TabsProps {
	activeTab: number
	setActiveTab: Dispatch<SetStateAction<number>>
}

const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab }) => {
	const listTabs = ['GC', 'GIO', 'LC']

	return (
		<div className='flex flex-wrap sm:flex-nowrap border-b border-gray-200 dark:border-gray-700'>
			{listTabs.map((tab, index) => (
				<button
					type='button'
					onClick={() => setActiveTab(index)}
					key={`tab-${tab}`}
					className={`${
						activeTab === index
							? 'border-blue-500 text-blue-600 dark:text-blue-400'
							: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
					}
						flex-1 sm:flex-none px-4 py-2 text-sm font-medium 
						border-b-2 transition-colors duration-200
						focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
						whitespace-nowrap
					`}
				>
					{tab}
				</button>
			))}
		</div>
	)
}

const EnhancedInteractiveCommandList = memo(() => {
	const [commands, setCommands] = useState<CommandLists[]>([])
	const [selectedArgs, setSelectedArgs] = useState<{ [key: number]: { [key: string]: string } }>({})
	const [showResults, setShowResults] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [searchResults, setSearchResults] = useState<
		{ id: string; name: string; description: string | undefined; image: string | undefined }[]
	>([])
	const [visibleArgs, setVisibleArgs] = useState<{ [key: number]: boolean }>({})
	const { toast } = useToast()
	const [loading, setLoading] = useState(true)
	const [focusedInput, setFocusedInput] = useState<{ commandId: number; argKey: string } | null>(null)
	const [activeTab, setActiveTab] = useState(0)

	const copyToClipboard = (text: string) => {
		const command = YuukiPS.generateResultCommand(text, {})
		navigator.clipboard.writeText(command).then(() => {
			toast({
				title: 'Copied!',
				description: 'Command copied to clipboard.',
			})
		})
	}

	const toggleArgsVisibility = (commandId: number) => {
		setVisibleArgs((prev) => ({
			...prev,
			[commandId]: !prev[commandId],
		}))
	}

	const handleArgSelect = (commandId: number, argKey: string, value: string) => {
		setSelectedArgs((prev) => ({
			...prev,
			[commandId]: {
				...prev[commandId],
				[argKey]: value,
			},
		}))
	}

	useEffect(() => {
		const fetchCommands = async () => {
			try {
				setLoading(true)
				setCommands([])
				const { data } = await axios.get<CommandLists[]>(`/commands/${activeTab}.json`)
				setCommands(data)
			} catch (error) {
				console.error('Failed to fetch commands:', error)
				toast({
					title: 'Error',
					description: 'Failed to fetch commands. Please try again.',
					variant: 'destructive',
				})
			} finally {
				setLoading(false)
			}
		}
		fetchCommands()
	}, [toast, activeTab])

	const getUpdatedCommand = useCallback(
		(cmd: CommandLists) => {
			let updatedCommand = cmd.command
			if (cmd.args && selectedArgs[cmd.id]) {
				for (const [key] of Object.entries(selectedArgs[cmd.id])) {
					const selectedValue = selectedArgs[cmd.id][key]
					if (selectedValue) {
						updatedCommand = updatedCommand.replace(`<${key}>`, selectedValue)
					}
				}
			}
			return updatedCommand
		},
		[selectedArgs]
	)
	const handleSearch = debounce(async (commandId: number, argKey: string, query: string) => {
		if (!query.trim()) {
			setSearchResults([])
			setShowResults(false)
			return
		}
		const arg = commands.find((cmd) => cmd.id === commandId)?.args?.find((a) => a.key === argKey)
		if (arg?.type === 'search' && arg.api) {
			try {
				setIsLoading(true)
				const endpoint = arg.api.game === 'gi' ? 'gm' : 'sr'
				const url = new URL(`v4/${endpoint}`, 'https://api.elaxan.xyz')
				const updatedJsonBody = { ...arg.api.jsonBody }
				for (const [key, value] of Object.entries(updatedJsonBody)) {
					if (Array.isArray(value)) {
						updatedJsonBody[key] = value.map((v) => (v === `${arg.key}` ? query : v))
					} else if (value === `${arg.key}`) {
						updatedJsonBody[key] = query
					}
				}
				const results = await axios.post<APIElaXan>(url.toString(), updatedJsonBody).then((res) => res.data)
				setSearchResults(
					results.data.map((result) => ({
						name: result.name,
						id: result.id.toString(),
						description: result.description?.toString(),
						image:
							typeof result.image === 'string'
								? result.image
								: result.image && typeof result.image === 'object'
									? result.image.icon || result.image.side
									: undefined,
					}))
				)
				setShowResults(true)
			} catch (error) {
				console.error('Failed to fetch search results:', error)
				toast({
					title: 'Error',
					description: 'Failed to fetch search results. Please try again.',
					variant: 'destructive',
				})
				setShowResults(false)
			} finally {
				setIsLoading(false)
			}
		}
	}, 500)

	return (
		<div className='container mx-auto p-4'>
			<Alert variant='default' className='mb-6'>
				<AlertTriangle className='h-4 w-4' />
				<AlertTitle>Work in Progress</AlertTitle>
				<AlertDescription>
					This feature is currently under development. Expect bugs or errors to occur. The UI and current
					functionality may change in the future as we continue to work on it. This is just a preview of what
					we are working on.
				</AlertDescription>
			</Alert>
			<Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
			<Card className='mb-6'>
				<CardHeader>
					<CardTitle>Command List</CardTitle>
				</CardHeader>
				<CardContent>
					{loading && (
						<div className='flex items-center justify-center w-full h-64'>
							<Loader2 className='w-8 h-8 animate-spin text-gray-400 dark:text-gray-500' />
						</div>
					)}
					<div className='grid gap-4 grid-cols-1 md:grid-cols-2'>
						{commands.map((cmd) => (
							<Card key={cmd.id} className='flex flex-col justify-between flex-grow'>
								<CardHeader>
									<CardTitle className='text-lg'>{cmd.name}</CardTitle>
								</CardHeader>
								<CardContent className='flex-grow'>
									<div className='relative mb-4'>
										<Button
											variant='secondary'
											size='sm'
											className='absolute top-1 right-2'
											onClick={() => copyToClipboard(getUpdatedCommand(cmd))}
										>
											<Clipboard className='h-4 w-4' />
										</Button>
										<pre className='bg-muted p-2 rounded-md whitespace-pre-wrap'>
											<code>{getUpdatedCommand(cmd)}</code>
										</pre>
									</div>
									{cmd.args && cmd.args.length > 0 && (
										<Button
											variant='secondary'
											className='w-full'
											onClick={() => toggleArgsVisibility(cmd.id)}
										>
											{visibleArgs[cmd.id] ? 'Hide' : 'Show'} Arguments
										</Button>
									)}
									{visibleArgs[cmd.id] && (
										<div className='space-y-2'>
											{cmd.args?.map((arg) => (
												<div key={`${cmd.id}-${arg.key}`} className='space-y-1'>
													<label
														htmlFor={`${cmd.id}-${arg.name}`}
														className='block text-sm font-medium text-gray-700 dark:text-gray-300'
													>
														{arg.key}
														<span className='ml-2 text-sm text-gray-500'>({arg.type})</span>
													</label>
													{arg.type === 'select' && (
														<Select
															onValueChange={(value) =>
																handleArgSelect(cmd.id, arg.key, value)
															}
															value={selectedArgs[cmd.id]?.[arg.key] || ''}
														>
															<SelectTrigger id={`${cmd.id}-${arg.key}`}>
																<SelectValue placeholder={`Select ${arg.name}`} />
															</SelectTrigger>
															<SelectContent>
																{arg.options?.map((option) => (
																	<SelectItem key={option.value} value={option.value}>
																		{option.description} ({option.value})
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
													)}
													{arg.type === 'search' && (
														<div className='relative'>
															{/* Search Input */}
															<div className='relative'>
																<Input
																	type='text'
																	onFocus={() =>
																		setFocusedInput({
																			commandId: cmd.id,
																			argKey: arg.key,
																		})
																	}
																	onChange={(e) => {
																		handleSearch(cmd.id, arg.key, e.target.value)
																	}}
																	onKeyDown={(e) => {
																		if (e.key === 'Escape') {
																			setShowResults(false)
																		}
																	}}
																	onBlur={() => {
																		setTimeout(() => {
																			setShowResults(false)
																		}, 200)
																	}}
																	placeholder={`Search ${arg.name}...`}
																	className='w-full px-4 py-2 pl-10 pr-4 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400 transition-colors duration-200'
																/>
																<div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
																	{isLoading ? (
																		<Loader2 className='w-4 h-4 animate-spin text-gray-400 dark:text-gray-500' />
																	) : (
																		<Search className='w-4 h-4 text-gray-400 dark:text-gray-500' />
																	)}
																</div>
																<div className='absolute inset-y-0 right-0 flex items-center pr-3'>
																	<Button
																		variant='ghost'
																		size='sm'
																		onClick={() => {
																			handleArgSelect(cmd.id, arg.key, '')
																			setShowResults(false)
																		}}
																	>
																		Clear
																	</Button>
																</div>
															</div>

															{/* Results Dropdown */}
															{showResults &&
																focusedInput?.commandId === cmd.id &&
																focusedInput.argKey === arg.key &&
																searchResults.length > 0 && (
																	<div className='absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg'>
																		<ul className='py-1'>
																			<ScrollArea className='max-h-40 overflow-y-auto'>
																				{searchResults.map((result, index) => (
																					<li
																						onKeyUp={(e) => {
																							if (e.key === 'Enter') {
																								handleArgSelect(
																									cmd.id,
																									arg.key,
																									result.id
																								)
																								setSearchResults([])
																							}
																						}}
																						key={`${result.name}-${result.id}-${index}`}
																						className='px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm text-gray-700 dark:text-gray-200'
																						onClick={() => {
																							handleArgSelect(
																								cmd.id,
																								arg.key,
																								result.id
																							)
																							setSearchResults([])
																							setShowResults(false)
																						}}
																					>
																						{result.image && (
																							<img
																								src={result.image}
																								alt={result.name}
																								className='w-6 h-6 mr-2 inline-block rounded-full'
																							/>
																						)}
																						{result.name}
																						{result.description && (
																							<p className='text-xs text-gray-500 dark:text-gray-400'>
																								{result.description}
																							</p>
																						)}
																					</li>
																				))}
																			</ScrollArea>
																		</ul>
																	</div>
																)}

															{/* No Results Message */}
															{showResults &&
																searchResults.length === 0 &&
																!isLoading && (
																	<div className='absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg'>
																		<div className='px-4 py-2 text-sm text-gray-500 dark:text-gray-400'>
																			No results found
																		</div>
																	</div>
																)}
														</div>
													)}
													{arg.type === 'number' && (
														<div>
															{arg.limit ? (
																<>
																	<div className='flex items-center mb-2 space-x-1'>
																		<Label
																			htmlFor={`toggle-${cmd.id}-${arg.key}`}
																			className='text-sm'
																		>
																			Use Slider
																		</Label>
																		<Checkbox
																			id={`toggle-${cmd.id}-${arg.key}`}
																			onCheckedChange={(e) => {
																				handleArgSelect(
																					cmd.id,
																					`${arg.key}-useSlider`,
																					e.toString()
																				)
																			}}
																			checked={
																				selectedArgs[cmd.id]?.[
																					`${arg.key}-useSlider`
																				] === 'true'
																			}
																		/>
																	</div>
																	{selectedArgs[cmd.id]?.[`${arg.key}-useSlider`] ===
																	'true' ? (
																		<Slider
																			min={arg.limit.min}
																			max={arg.limit.max}
																			onValueChange={(e) => {
																				handleArgSelect(
																					cmd.id,
																					arg.key,
																					e[0].toString()
																				)
																			}}
																			className='w-full'
																		/>
																	) : (
																		<Input
																			type='number'
																			min={arg.limit.min}
																			max={arg.limit.max}
																			onChange={(e) => {
																				handleArgSelect(
																					cmd.id,
																					arg.key,
																					e.target.value
																				)
																			}}
																			placeholder={`Enter ${arg.name}`}
																			className='w-full px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400 transition-colors duration-200'
																		/>
																	)}
																</>
															) : (
																<Input
																	type='number'
																	onChange={(e) => {
																		handleArgSelect(cmd.id, arg.key, e.target.value)
																	}}
																	placeholder={`Enter ${arg.name}`}
																	className='w-full px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400 transition-colors duration-200'
																/>
															)}
														</div>
													)}
													<p className='text-sm text-muted-foreground'>{arg.description}</p>
												</div>
											))}
										</div>
									)}
								</CardContent>
							</Card>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	)
})

export default EnhancedInteractiveCommandList
