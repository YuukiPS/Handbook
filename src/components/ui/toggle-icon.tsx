import { cn } from '@/lib/utils'
import * as React from 'react'
import type { IconType } from 'react-icons'

export interface ToggleIconProps extends React.HTMLAttributes<HTMLDivElement> {
	className?: string
	originalIcon: IconType
	toggledIcon: IconType
}

const ToggleIcon = React.forwardRef<HTMLDivElement, ToggleIconProps>(
	({ className, originalIcon: OriginalIcon, toggledIcon: ToggledIcon, onClick, ...props }, ref) => {
		const [isToggled, setIsToggled] = React.useState(false)

		const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
			setIsToggled(!isToggled)
			if (onClick) {
				onClick(event)
			}
		}

		return (
			<div className={cn('cursor-pointer', className)} onClick={handleClick} ref={ref} {...props}>
				<div className='relative'>
					<div className={cn('transform p-2 transition-transform duration-300', isToggled && '-rotate-90')}>
						<div className='absolute inset-0'>
							<OriginalIcon
								className={`transition-opacity duration-200 ${isToggled ? 'opacity-0' : 'opacity-100'}`}
							/>
						</div>
						<div className='absolute inset-0'>
							<ToggledIcon
								className={`transition-opacity duration-200 ${
									!isToggled ? 'opacity-0' : 'opacity-100'
								}`}
							/>
						</div>
					</div>
				</div>
			</div>
		)
	}
)

ToggleIcon.displayName = 'ToggleIcon'

export { ToggleIcon }
