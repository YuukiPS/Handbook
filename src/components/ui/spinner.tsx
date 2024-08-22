import type React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpinnerProps extends React.HTMLAttributes<SVGElement> {
    size?: "sm" | "md" | "lg";
}

export const Spinner: React.FC<SpinnerProps> = ({
    className,
    size = "md",
    ...props
}) => {
    const sizeClasses = {
        sm: "w-4 h-4",
        md: "w-6 h-6",
        lg: "w-8 h-8",
    };

    return (
        <Loader2
            className={cn(
                "animate-spin text-primary",
                sizeClasses[size],
                className
            )}
            {...props}
        />
    );
};
