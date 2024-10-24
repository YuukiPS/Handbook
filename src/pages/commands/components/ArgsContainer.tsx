import type { CommandLists, Argument } from '@/pages/commands/App'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { type Dispatch, type SetStateAction, memo } from 'react'
import { SearchArgs, SelectArgs } from './ArgsType'

interface ArgumentsContainerProps {
	cmd: CommandLists
	arg: Argument
	handleArgSelect: (commandId: number, argKey: string, value: string) => void
	selectedArgs: { [key: number]: { [key: string]: string } }
	showResults: boolean
	searchResults: { id: string; name: string; description: string | undefined; image: string | undefined }[]
	setShowResults: Dispatch<SetStateAction<boolean>>
	setSearchResults: Dispatch<
		SetStateAction<{ id: string; name: string; description: string | undefined; image: string | undefined }[]>
	>
	commands: CommandLists[]
}

const ArgumentsContainer = memo(
	({
		cmd,
		arg,
		handleArgSelect,
		selectedArgs,
		showResults,
		searchResults,
		setShowResults,
		setSearchResults,
		commands,
	}: ArgumentsContainerProps) => {
		const renderArgInput = () => {
			switch (arg.type) {
				case 'select':
					return (
						<SelectArgs handleArgSelect={handleArgSelect} cmd={cmd} arg={arg} selectedArgs={selectedArgs} />
					)
				case 'search':
					return (
						<SearchArgs
							cmd={cmd}
							commands={commands}
							arg={arg}
							showResults={showResults}
							searchResults={searchResults}
							setShowResults={setShowResults}
							setSearchResults={setSearchResults}
							handleArgSelect={handleArgSelect}
						/>
					)
				case 'number':
					return (
						<NumberInput
							cmd={cmd}
							arg={arg}
							handleArgSelect={handleArgSelect}
							selectedArgs={selectedArgs}
						/>
					)
				default:
					return null
			}
		}

		return (
			<div key={`${cmd.id}-${arg.key}`} className='space-y-1'>
				<label
					htmlFor={`${cmd.id}-${arg.name}`}
					className='block text-sm font-medium text-gray-700 dark:text-gray-300'
				>
					{arg.key}
					<span className='ml-2 text-sm text-gray-500'>({arg.type})</span>
				</label>
				{renderArgInput()}
				<p className='text-sm text-muted-foreground'>{arg.description}</p>
			</div>
		)
	}
)

const NumberInput = memo(
	({
		cmd,
		arg,
		handleArgSelect,
		selectedArgs,
	}: {
		cmd: CommandLists
		arg: Argument
		handleArgSelect: (commandId: number, argKey: string, value: string) => void
		selectedArgs: { [key: number]: { [key: string]: string } }
	}) => {
		if (arg.limit) {
			return (
				<>
					<div className='flex items-center mb-2 space-x-1'>
						<Label htmlFor={`toggle-${cmd.id}-${arg.key}`} className='text-sm'>
							Use Slider
						</Label>
						<Checkbox
							id={`toggle-${cmd.id}-${arg.key}`}
							onCheckedChange={(e) => {
								handleArgSelect(cmd.id, `${arg.key}-useSlider`, e.toString())
							}}
							checked={selectedArgs[cmd.id]?.[`${arg.key}-useSlider`] === 'true'}
						/>
					</div>
					{selectedArgs[cmd.id]?.[`${arg.key}-useSlider`] === 'true' ? (
						<Slider
							min={arg.limit.min}
							max={arg.limit.max}
							onValueChange={(e) => {
								handleArgSelect(cmd.id, arg.key, e[0].toString())
							}}
							className='w-full'
						/>
					) : (
						<Input
							type='number'
							min={arg.limit.min}
							max={arg.limit.max}
							onChange={(e) => {
								handleArgSelect(cmd.id, arg.key, e.target.value)
							}}
							placeholder={`Enter ${arg.name}`}
							className='w-full px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400 transition-colors duration-200'
						/>
					)}
				</>
			)
		}

		return (
			<Input
				type='number'
				onChange={(e) => {
					handleArgSelect(cmd.id, arg.key, e.target.value)
				}}
				placeholder={`Enter ${arg.name}`}
				className='w-full px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400 transition-colors duration-200'
			/>
		)
	}
)

export default ArgumentsContainer
