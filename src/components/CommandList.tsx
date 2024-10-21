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
import { useEffect, useState } from 'react'

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
		required: boolean
		version: string
		game: 'gi' | 'sr'
		jsonBody: {
			[key: string]: string
		}
	}
}

type CommandLists = {
	id: number
	name: string
	command: string
	args?: Argument[]
}

export default function EnhancedInteractiveCommandList() {
	const [commands, setCommands] = useState<CommandLists[]>([])
	const [selectedArgs, setSelectedArgs] = useState<{ [key: number]: { [key: string]: string } }>({})
	const [showResults, setShowResults] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [searchResults, setSearchResults] = useState<{ id: string; name: string }[]>([])
	const [visibleArgs, setVisibleArgs] = useState<{ [key: number]: boolean }>({})
	const { toast } = useToast()
	const [focusedInput, setFocusedInput] = useState<{ commandId: number; argKey: string } | null>(null)

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text).then(() => {
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
				const { data } = await axios.get<CommandLists[]>('/command-list.json')
				setCommands(data)
			} catch (error) {
				console.error('Failed to fetch commands:', error)
				toast({
					title: 'Error',
					description: 'Failed to fetch commands. Please try again.',
					variant: 'destructive',
				})
			}
		}
		fetchCommands()
	}, [toast])

	const getUpdatedCommand = (cmd: CommandLists) => {
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
	}

	const handleSearch = (() => {
		let debounceTimeout: NodeJS.Timeout
		return async (commandId: number, argKey: string, query: string) => {
			clearTimeout(debounceTimeout)
			debounceTimeout = setTimeout(async () => {
				if (!query.trim()) {
					setSearchResults([])
					setShowResults(false)
					return
				}
				const arg = commands.find((cmd) => cmd.id === commandId)?.args?.find((a) => a.key === argKey)
				if (arg?.type === 'search' && arg.api?.required) {
					try {
						setIsLoading(true)
						const endpoint = arg.api.game === 'gi' ? 'gm' : 'sr'
						const url = new URL(`${arg.api.version}/${endpoint}`, 'https://api.elaxan.xyz')
						const updatedJsonBody = { ...arg.api.jsonBody }
						for (const [key, value] of Object.entries(updatedJsonBody)) {
							if (value === `${arg.key}`) {
								updatedJsonBody[key] = query
							}
						}
						const results = await axios
							.post<{ status: number; message: string; data: { name: string; value: string }[] }>(
								url.toString(),
								updatedJsonBody
							)
							.then((res) => res.data)
						setSearchResults(
							results.data.map((result) => ({
								name: result.name,
								id: result.value,
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
			}, 300)
		}
	})()

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
			<Card className='mb-6'>
				<CardHeader>
					<CardTitle>Command List</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='grid gap-4 sm:grid-cols-1 lg:grid-cols-2'>
						{commands.map((cmd) => (
							<Card key={cmd.id} className='flex flex-col justify-between flex-grow'>
								<CardHeader>
									<CardTitle className='text-lg'>{cmd.name}</CardTitle>
								</CardHeader>
								<CardContent className='flex-grow'>
									<div className='relative mb-4'>
										<pre className='bg-muted p-2 rounded-md overflow-x-auto'>
											<code>{getUpdatedCommand(cmd)}</code>
										</pre>
										<Button
											variant='secondary'
											size='sm'
											className='absolute top-1 right-2'
											onClick={() => copyToClipboard(getUpdatedCommand(cmd))}
										>
											<Clipboard className='h-4 w-4' />
										</Button>
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
																						{result.name}
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
}
