import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Search } from 'lucide-react'
import type React from 'react'
import { memo, useRef, useState, type Dispatch, type SetStateAction, useEffect, useCallback } from 'react'
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

const SelectArgs = memo(({ handleArgSelect, cmd, arg, selectedArgs }: SelectArgsProps) => (
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
))

interface SearchArgsProps {
	commands: CommandLists[]
	cmd: CommandLists
	arg: Argument
	showResults: boolean
	searchResults: { id: string; name: string; description: string | undefined; image: string | undefined }[]
	setShowResults: Dispatch<SetStateAction<boolean>>
	setSearchResults: Dispatch<
		SetStateAction<{ id: string; name: string; description: string | undefined; image: string | undefined }[]>
	>
	handleArgSelect: (commandId: number, argKey: string, value: string) => void
}

const SearchArgs = memo(
	({
		commands,
		cmd,
		arg,
		showResults,
		searchResults,
		setShowResults,
		setSearchResults,
		handleArgSelect,
	}: SearchArgsProps) => {
		const { toast } = useToast()
		const [inputValue, setInputValue] = useState('')
		const [selectedIndex, setSelectedIndex] = useState(-1)
		const inputRef = useRef<HTMLInputElement>(null)
		const scrollAreaRef = useRef<HTMLDivElement>(null)
		const [isFocused, setIsFocused] = useState(false)
		const [localIsLoading, setLocalIsLoading] = useState(false)

		useEffect(() => {
			if (scrollAreaRef.current && selectedIndex >= 0) {
				const listItems = scrollAreaRef.current.querySelectorAll('li')
				const selectedItem = listItems[selectedIndex]
				if (selectedItem) {
					selectedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
				}
			}
		}, [selectedIndex])

		const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
			if (showResults) {
				if (e.key === 'ArrowDown') {
					e.preventDefault()
					setSelectedIndex((prevIndex) => (prevIndex < searchResults.length - 1 ? prevIndex + 1 : prevIndex))
				} else if (e.key === 'ArrowUp') {
					e.preventDefault()
					setSelectedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : -1))
				} else if (e.key === 'Enter' || e.key === 'Tab') {
					e.preventDefault()
					if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
						handleArgSelect(cmd.id, arg.key, searchResults[selectedIndex].id)
						setSearchResults([])
						setShowResults(false)
						setSelectedIndex(-1)
					}
				} else if (e.key === 'Escape') {
					setShowResults(false)
					setSelectedIndex(-1)
				}
			}
		}

		const handleInputFocus = () => {
			setIsFocused(true)
		}

		const handleInputBlur = () => {
			setTimeout(() => {
				setIsFocused(false)
				setShowResults(false)
				setSelectedIndex(-1)
			}, 200)
		}

		const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			const query = e.target.value
			setInputValue(query)
			if (isFocused) {
				handleSearch(query)
				setSelectedIndex(-1)
			}
		}

		const handleSelectResult = (result: { id: string }) => {
			handleArgSelect(cmd.id, arg.key, result.id)
			setShowResults(false)
			setInputValue('')
			setIsFocused(false)
			inputRef.current?.focus()
		}

		// biome-ignore lint/correctness/useExhaustiveDependencies: This useCallback hook intentionally omits some dependencies to prevent unnecessary re-renders. The omitted dependencies (setSearchResults, setShowResults, setLocalIsLoading) are state setters that don't change between renders, and including them would cause the callback to be recreated on every render, defeating the purpose of memoization.
		const handleSearch = useCallback(
			debounce(async (query: string) => {
				if (!query.trim()) {
					setSearchResults([])
					setShowResults(false)
					return
				}

				const currentArg = commands.find((c) => c.id === cmd.id)?.args?.find((a) => a.key === arg.key)
				if (currentArg?.type !== 'search' || !currentArg.api) return

				try {
					setLocalIsLoading(true)
					const endpoint = currentArg.api.game === 'gi' ? 'gm' : 'sr'
					const url = new URL(`v4/${endpoint}`, 'https://api.elaxan.xyz')
					const updatedJsonBody = { ...currentArg.api.jsonBody }

					for (const [key, value] of Object.entries(updatedJsonBody)) {
						if (Array.isArray(value)) {
							updatedJsonBody[key] = value.map((v) => (v === `${currentArg.key}` ? query : v))
						} else if (value === `${currentArg.key}`) {
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
					setLocalIsLoading(false)
				}
			}, 500),
			[commands, cmd.id, arg.key, toast]
		)

		const dropDownResults = () => (
			<div className='absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg'>
				<ul className='py-1'>
					<ScrollArea ref={scrollAreaRef} className='max-h-40 overflow-y-auto'>
						{searchResults.map((result, index) => (
							<li
								key={`${result.name}-${result.id}-${index}`}
								className={`px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm text-gray-700 dark:text-gray-200 ${
									index === selectedIndex ? 'bg-blue-100 dark:bg-blue-700' : ''
								}`}
								onClick={() => {
									handleArgSelect(cmd.id, arg.key, result.id)
									setShowResults(false)
									setInputValue('')
									inputRef.current?.focus()
								}}
								onMouseEnter={() => setSelectedIndex(index)}
								aria-selected={index === selectedIndex}
								onKeyDown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										e.preventDefault()
										handleSelectResult(result)
									}
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
						ref={inputRef}
						type='text'
						value={inputValue}
						onFocus={handleInputFocus}
						onBlur={handleInputBlur}
						onChange={handleInputChange}
						onKeyDown={handleKeyDown}
						placeholder={`Search ${arg.name}...`}
						className='w-full px-4 py-2 pl-10 pr-4 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400 transition-colors duration-200'
					/>
					<div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
						{localIsLoading ? (
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
								setInputValue('')
								inputRef.current?.focus()
							}}
						>
							Clear
						</Button>
					</div>
				</div>

				{/* Results Dropdown */}
				{showResults && isFocused && searchResults.length > 0 && dropDownResults()}

				{/* No Results Message */}
				{showResults && isFocused && searchResults.length === 0 && !localIsLoading && (
					<div className='absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg'>
						<div className='px-4 py-2 text-sm text-gray-500 dark:text-gray-400'>No results found</div>
					</div>
				)}
			</div>
		)
	}
)

export { SelectArgs, SearchArgs }
