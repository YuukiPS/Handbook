import { cn } from '@/lib/utils'
import type { IconType } from 'react-icons'

export interface IconProps extends React.HTMLAttributes<SVGElement> {
	icon: IconType
	size?: number
}

const Icon = ({ icon: IconComponent, size = 24, className, ...props }: IconProps) => {
	return <IconComponent className={cn('text-gray-800 dark:text-gray-100', className)} size={size} {...props} />
}

Icon.displayName = 'Icon'

export { Icon }
