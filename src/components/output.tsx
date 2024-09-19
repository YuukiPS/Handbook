import { ChevronDownIcon } from 'lucide-react'
import { useState } from 'react'
import React from 'react'
import { Button } from './ui/button'

interface Output {
	log_level: string
	message: string
}

interface OutputProps {
	outputLog: Output[]
	setOutputLog: (outputLog: Output[]) => void
	isOutputVisible: boolean
	setIsOutputVisible: (isVisible: boolean) => void
}

const Output: React.FC<OutputProps> = ({ outputLog, setOutputLog, isOutputVisible, setIsOutputVisible }) => {
	const outputContainerRef = React.useRef<HTMLDivElement>(null)

	// biome-ignore lint/correctness/useExhaustiveDependencies: We only want to update the scroll position when outputLog changes, not for other dependencies
	React.useEffect(() => {
		if (outputContainerRef.current) {
			outputContainerRef.current.scrollTop = outputContainerRef.current.scrollHeight
		}
	}, [outputLog])

	const renderOutputLog = () => {
		if (outputLog.length === 0) {
			return (
				<div className='py-1'>
					<span className='text-gray-500 dark:text-gray-400'>{'> No output'}</span>
				</div>
			)
		}

		return (
			<>
				<div className='mb-3'>
					<Button
						variant='outline'
						className='text-green-600 dark:text-green-400'
						onClick={() => setOutputLog([])}
					>
						Clear
					</Button>
				</div>
				{outputLog.map((line, index) => (
					<div key={`output-line-${index}-${line.message.slice(0, 10)}`} className='py-1'>
						<span
							className={`${
								line.log_level === 'info'
									? 'text-green-600 dark:text-green-400'
									: line.log_level === 'warn'
										? 'text-yellow-600 dark:text-yellow-400'
										: 'text-red-600 dark:text-red-400'
							}`}
						>
							{`> ${line.message}`}
						</span>
					</div>
				))}
			</>
		)
	}

	return (
		<div className='mt-6 max-w-4xl mx-auto bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md overflow-hidden'>
			<Button
				onClick={() => setIsOutputVisible(!isOutputVisible)}
				className='w-full p-4 text-left bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700 flex justify-between items-center transition-colors duration-200'
				variant='ghost'
			>
				<span className='text-lg font-semibold'>Output</span>
				<ChevronDownIcon
					className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
						isOutputVisible ? 'rotate-180' : ''
					}`}
				/>
			</Button>
			<div
				className='overflow-hidden transition-all duration-300 ease-in-out'
				style={{
					maxHeight: isOutputVisible ? '20rem' : '0px',
				}}
			>
				<div
					ref={outputContainerRef}
					className='p-4 font-mono text-sm overflow-auto max-h-[20rem] bg-white dark:bg-gray-900'
				>
					{renderOutputLog()}
				</div>
			</div>
		</div>
	)
}

export default Output

export function useOutputVisibility() {
	const [isOutputVisible, setIsOutputVisible] = useState<boolean>(false)

	return { isOutputVisible, setIsOutputVisible }
}
