import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "../input";
import { Label } from "../label";
import { cn } from "../lib/utils";
import { Button } from "../button";

interface BaseInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

const BaseInput = React.forwardRef<HTMLInputElement, BaseInputProps>(
    ({ className, type, label, error, helperText, ...props }, ref) => {
        const [showPassword, setShowPassword] = useState(false);
        const isPasswordField = type === "password";

        const inputType = isPasswordField
            ? showPassword
                ? "text"
                : "password"
            : type;

        return (
            <div className="flex flex-col gap-1.5">
                {label && (
                    <Label
                        htmlFor={props.id}
                        className={cn([error && "text-destructive", "text-xs font-semibold ml-1"])}
                    >
                        {label}
                    </Label>
                )}

                <div className="relative">
                    <Input
                        type={inputType}
                        className={cn(
                            "pl-4", // Explicit default left padding
                            "pr-10", // Space for the icon (default right padding)
                            error && "border-destructive focus-visible:ring-destructive",
                            "w-full h-11 rounded-lg border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:ring-1 outline-none transition-all text-sm bg-white",
                            error && "invalidField",
                            className,
                        )}
                        ref={ref}
                        {...props}
                    />

                    {isPasswordField && (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                            tabIndex={-1}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? (
                                <EyeOff className="h-5 w-5 text-gray-400" />
                            ) : (
                                <Eye className="h-5 w-5 text-gray-400" />
                            )}
                        </button>
                    )}
                </div>

                {error ? (
                    <p className="text-sm font-medium text-destructive">{error}</p>
                ) : helperText ? (
                    <p className="text-sm text-muted-foreground">{helperText}</p>
                ) : null}
            </div>
        );
    }
);

BaseInput.displayName = "BaseInput";

export default BaseInput;