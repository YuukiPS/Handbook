import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@radix-ui/react-scroll-area'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@radix-ui/react-select'
import { Loader2, Search } from 'lucide-react'
import { memo, useState, type Dispatch, type SetStateAction } from 'react'
import type { Argument, CommandLists } from '../App'
import { debounce } from 'lodash'
import axios from 'axios'
import type { APIElaXan } from '@/types/gm'
import { useToast } from '@/components/ui/use-toast'

interface SelectArgsProps {
	handleArgSelect: (commandId: number, argKey: string, value: string) => void
	cmd: CommandLists
	arg: Argument
	selectedArgs: { [key: number]: { [key: string]: string } }
}

const SelectArgs = memo(({ handleArgSelect, cmd, arg, selectedArgs }: SelectArgsProps) => {
	return (
		<Select
			onValueChange={(value) => handleArgSelect(cmd.id, arg.key, value)}
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
	)
})

interface SearchArgsProps {
	commands: CommandLists[]
	cmd: CommandLists
	arg: Argument
	showResults: boolean
	isLoading: boolean
	searchResults: { id: string; name: string; description: string | undefined; image: string | undefined }[]
	setShowResults: Dispatch<SetStateAction<boolean>>
	setSearchResults: Dispatch<
		SetStateAction<{ id: string; name: string; description: string | undefined; image: string | undefined }[]>
	>
	handleArgSelect: (commandId: number, argKey: string, value: string) => void
	setIsLoading: Dispatch<SetStateAction<boolean>>
}

const SearchArgs = memo(
	({
		commands,
		cmd,
		arg,
		showResults,
		isLoading,
		searchResults,
		setShowResults,
		setSearchResults,
		handleArgSelect,
		setIsLoading,
	}: SearchArgsProps) => {
		const { toast } = useToast()

		const [focusedInput, setFocusedInput] = useState<{ commandId: number; argKey: string } | null>(null)
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

		const dropDownResults = () => (
			<div className='absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg'>
				<ul className='py-1'>
					<ScrollArea className='max-h-40 overflow-y-auto'>
						{searchResults.map((result, index) => (
							<li
								onKeyUp={(e) => {
									if (e.key === 'Enter') {
										handleArgSelect(cmd.id, arg.key, result.id)
										setSearchResults([])
									}
								}}
								key={`${result.name}-${result.id}-${index}`}
								className='px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm text-gray-700 dark:text-gray-200'
								onClick={() => {
									handleArgSelect(cmd.id, arg.key, result.id)
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
									<p className='text-xs text-gray-500 dark:text-gray-400'>{result.description}</p>
								)}
							</li>
						))}
					</ScrollArea>
				</ul>
			</div>
		)

		return (
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
					focusedInput?.argKey === arg.key &&
					searchResults.length > 0 &&
					dropDownResults()}

				{/* No Results Message */}
				{showResults && searchResults.length === 0 && !isLoading && (
					<div className='absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg'>
						<div className='px-4 py-2 text-sm text-gray-500 dark:text-gray-400'>No results found</div>
					</div>
				)}
			</div>
		)
	}
)

export { SelectArgs, SearchArgs }
