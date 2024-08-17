'use client'

import * as React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { CheckIcon } from '@radix-ui/react-icons'

import { cn } from '@/lib/utils'

const Checkbox = React.forwardRef<
	React.ElementRef<typeof CheckboxPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
	<CheckboxPrimitive.Root
		ref={ref}
		className={cn(
			'peer h-5 w-5 shrink-0 rounded-sm border border-primary shadow transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground', // Add transition
			className
		)}
		{...props}
	>
		<CheckboxPrimitive.Indicator
			className={cn(
				'flex transform items-center justify-center text-current transition-transform duration-300 ease-in-out',
				{
					'scale-100': props.checked,
					'scale-0': !props.checked,
				}
			)}
		>
			<CheckIcon className='h-4 w-4' />
		</CheckboxPrimitive.Indicator>
	</CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
