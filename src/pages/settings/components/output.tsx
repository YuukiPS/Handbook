import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type React from 'react'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import type { State } from './types'

interface OutputProps {
	state: State
	setState: React.Dispatch<React.SetStateAction<State>>
}

const Output: React.FC<OutputProps> = memo(({ state, setState }) => {
	const { t } = useTranslation()
	const clearOutput = () => {
		setState((prevState) => ({
			...prevState,
			output: [],
			successCheckPlayer: false,
		}))
	}

	return (
		<>
			<div className='output-container mt-5 max-h-[200px] overflow-y-auto bg-slate-300 p-2 text-left dark:bg-slate-950'>
				{state.output.map((text) => (
					<p
						key={text.text.replace(/ /g, '')}
						className={cn('text-sm', text.color === 'green' ? 'text-green-600' : 'text-red-600')}
					>
						{text.text}
					</p>
				))}
			</div>
			<div className='mt-2 text-left text-sm'>
				<Button variant={'ghost'} size={'sm'} onClick={clearOutput}>
					{t('output.button')}
				</Button>
			</div>
		</>
	)
})

export default Output
