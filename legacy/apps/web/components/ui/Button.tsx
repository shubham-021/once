'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
    disabled?: boolean;
    fullWidth?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
}

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled = false,
    fullWidth = false,
    icon,
    iconPosition = 'left',
    className,
    ...props
}: ButtonProps) {
    const baseStyles = `
        relative inline-flex items-center justify-center gap-2
        font-medium transition-all duration-200
        rounded-lg overflow-hidden
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 
        focus-visible:ring-offset-[var(--color-bg-primary)]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    `;

    const variantStyles: Record<string, string> = {
        primary: `
            bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-primary-hover)] to-[var(--color-secondary)]
            bg-[length:200%_100%] bg-left
            text-white font-semibold
            hover:bg-right hover:shadow-lg hover:shadow-[var(--color-primary)]/30
            focus-visible:ring-[var(--color-primary)]
            active:scale-[0.98]
        `,
        secondary: `
            bg-[var(--color-surface-elevated)]
            text-[var(--color-text-primary)]
            border border-[var(--color-border)]
            hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-primary)]/50
            focus-visible:ring-[var(--color-primary)]
        `,
        ghost: `
            bg-transparent
            text-[var(--color-text-secondary)]
            hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)]
            focus-visible:ring-[var(--color-primary)]
        `,
        outline: `
            bg-transparent
            border-2 border-[var(--color-primary)]
            text-[var(--color-primary)]
            hover:bg-[var(--color-primary)]/10 hover:border-[var(--color-primary-hover)]
            focus-visible:ring-[var(--color-primary)]
        `,
        danger: `
            bg-[var(--color-error)]
            text-white font-semibold
            hover:bg-[var(--color-error)]/90 hover:shadow-lg hover:shadow-[var(--color-error)]/30
            focus-visible:ring-[var(--color-error)]
        `,
    };

    const sizeStyles: Record<string, string> = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-5 py-2.5 text-base',
        lg: 'px-7 py-3.5 text-lg',
        icon: 'p-2.5',
    };

    const widthStyles = fullWidth ? 'w-full' : '';

    const renderContent = () => {
        if (isLoading) {
            return (
                <>
                    <svg
                        className="animate-spin h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                    <span className="ml-1">Loading...</span>
                </>
            );
        }

        return (
            <>
                {icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
                <span>{children}</span>
                {icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
            </>
        );
    };

    return (
        <motion.button
            className={cn(
                baseStyles,
                variantStyles[variant],
                sizeStyles[size],
                widthStyles,
                className
            )}
            disabled={disabled || isLoading}
            whileHover={!disabled && !isLoading ? { scale: 1.02, y: -1 } : {}}
            whileTap={!disabled && !isLoading ? { scale: 0.98 } : {}}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            {...props}
        >
            {/* Shimmer effect for primary button */}
            {variant === 'primary' && !disabled && !isLoading && (
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
                    initial={false}
                    whileHover={{ translateX: '100%' }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                />
            )}
            {renderContent()}
        </motion.button>
    );
}
