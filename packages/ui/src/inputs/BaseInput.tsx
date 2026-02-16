"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "../input";
import { Label } from "../label";
import { cn } from "../lib/utils";
import BaseErrorText from "../Texts/BaseErrorText";


interface BaseInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
}

const BaseInput = React.forwardRef<HTMLInputElement, BaseInputProps>(
    ({ className, type, label, error, helperText, startIcon, endIcon, ...props }, ref) => {
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
                        className={cn([error && "text-destructive", "text-sm font-semibold ml-1 text-gray-700"])}
                    >
                        {label} {props.required && <span className="text-error">*</span>}
                    </Label>
                )}

                <div className="relative">
                    {startIcon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            {startIcon}
                        </div>
                    )}

                    <Input
                        type={inputType}
                        className={cn(
                            startIcon ? "pl-10" : "pl-4",
                            (endIcon || isPasswordField) ? "pr-10" : "pr-4",
                            error && "border-destructive focus-visible:ring-destructive",
                            "w-full h-11 rounded-lg border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:ring-1 outline-none transition-all text-sm bg-white",
                            error && "invalidField",
                            className,
                        )}
                        ref={ref}
                        {...props}
                    />

                    {isPasswordField ? (
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
                    ) : endIcon ? (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                            {endIcon}
                        </div>
                    ) : null}
                </div>

                <BaseErrorText errorMessage={error || null} />
            </div>
        );
    }
);

BaseInput.displayName = "BaseInput";

export default BaseInput;