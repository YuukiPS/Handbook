import * as React from 'react';
import { cn } from '@/lib/utils';

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {}

const Kbd = React.forwardRef<HTMLElement, KbdProps>(
    ({ className, ...props }, ref) => {
        return (
            <kbd
                className={cn(
                    'inline-flex select-none items-center justify-center rounded bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800 shadow-sm dark:bg-gray-800 dark:text-gray-100',
                    className,
                )}
                ref={ref}
                {...props}
            />
        );
    },
);
Kbd.displayName = 'Kbd';

export { Kbd };
