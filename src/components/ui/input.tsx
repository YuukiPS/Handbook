import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, label, ...props }, ref) => {
        return (
            <div className="relative w-full">
                <input
                    type={type}
                    className={cn(
                        "peer h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
                        className
                    )}
                    placeholder={label ? "" : props.placeholder}
                    ref={ref}
                    {...props}
                />
                {label && (
                    <label
                        htmlFor={props.id}
                        className="absolute -top-6 left-1 cursor-text transition-all peer-placeholder-shown:left-3 peer-placeholder-shown:top-1 peer-placeholder-shown:text-base peer-placeholder-shown:text-muted-foreground peer-focus:-top-6 peer-focus:left-1"
                    >
                        {label}
                    </label>
                )}
            </div>
        );
    }
);
Input.displayName = "Input";

export { Input };
