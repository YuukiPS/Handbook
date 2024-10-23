import YuukiPS from '@/api/yuukips'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import Tabs from './components/Tabs'
import axios from 'axios'
import { AlertTriangle, Loader2, Clipboard } from 'lucide-react'
import { useState, useEffect, useCallback, useMemo } from 'react'
import ArgumentsContainer from './components/ArgsContainer'
import { Input } from '@/components/ui/input'

export type Argument = {
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

export type CommandLists = {
	id: number
	name: string
	command: string
	args?: Argument[]
}

export default function App() {
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
	const [activeTab, setActiveTab] = useState(0)
	const [searchQuery, setSearchQuery] = useState('')

	const copyToClipboard = useCallback(
		(text: string) => {
			const command = YuukiPS.generateResultCommand(text, {})
			navigator.clipboard.writeText(command).then(() => {
				toast({
					title: 'Copied!',
					description: 'Command copied to clipboard.',
				})
			})
		},
		[toast]
	)

	const toggleArgsVisibility = useCallback((commandId: number) => {
		setVisibleArgs((prev) => ({
			...prev,
			[commandId]: !prev[commandId],
		}))
	}, [])

	const handleArgSelect = useCallback((commandId: number, argKey: string, value: string) => {
		setSelectedArgs((prev) => ({
			...prev,
			[commandId]: {
				...prev[commandId],
				[argKey]: value,
			},
		}))
	}, [])

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
				for (const [key, selectedValue] of Object.entries(selectedArgs[cmd.id])) {
					if (selectedValue) {
						updatedCommand = updatedCommand.replace(`<${key}>`, selectedValue)
					}
				}
			}
			return updatedCommand
		},
		[selectedArgs]
	)

	const filteredCommands = useMemo(() => {
		return commands.filter(
			(cmd) =>
				cmd.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				cmd.command.toLowerCase().includes(searchQuery.toLowerCase())
		)
	}, [commands, searchQuery])

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
					<Input
						type='text'
						placeholder='Search commands...'
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className='w-full'
					/>
				</CardHeader>
				<CardContent>
					{loading && (
						<div className='flex items-center justify-center w-full h-64'>
							<Loader2 className='w-8 h-8 animate-spin text-gray-400 dark:text-gray-500' />
						</div>
					)}
					<div className='grid gap-4 grid-cols-1 md:grid-cols-2'>
						{filteredCommands.map((cmd) => (
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
												<ArgumentsContainer
													key={`${cmd.id}-${arg.key}`}
													cmd={cmd}
													arg={arg}
													handleArgSelect={handleArgSelect}
													commands={commands}
													setIsLoading={setIsLoading}
													selectedArgs={selectedArgs}
													showResults={showResults}
													isLoading={isLoading}
													searchResults={searchResults}
													setShowResults={setShowResults}
													setSearchResults={setSearchResults}
												/>
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
