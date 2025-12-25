'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
    children: React.ReactNode;
    variant?: 'default' | 'glass' | 'gradient-border' | 'elevated';
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    hover?: boolean;
    glow?: boolean;
    animate?: boolean;
}

export function Card({
    children,
    variant = 'default',
    padding = 'md',
    hover = false,
    glow = false,
    animate = true,
    className,
    ...props
}: CardProps) {
    const baseStyles = 'relative rounded-xl transition-all duration-300';

    const variantStyles: Record<string, string> = {
        default: `
            bg-[var(--color-surface)]
            border border-[var(--color-border)]
        `,
        glass: `
            glass-panel
            bg-[var(--glass-bg)]
            backdrop-blur-xl
            border border-[var(--glass-border)]
        `,
        'gradient-border': `
            bg-[var(--color-surface)]
            gradient-border
        `,
        elevated: `
            bg-[var(--color-surface-elevated)]
            border border-[var(--color-border)]
            shadow-lg
        `,
    };

    const paddingStyles: Record<string, string> = {
        none: '',
        sm: 'p-4',
        md: 'p-5',
        lg: 'p-6',
        xl: 'p-8',
    };

    const hoverStyles = hover
        ? `
            cursor-pointer
            hover:shadow-xl hover:shadow-[var(--color-primary)]/10
            hover:border-[var(--color-primary)]/40
            hover:-translate-y-1
        `
        : '';

    const glowStyles = glow
        ? 'shadow-lg shadow-[var(--color-primary)]/20'
        : '';

    const animationProps = animate
        ? {
            initial: { opacity: 0, y: 16 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
        }
        : {};

    return (
        <motion.div
            className={cn(
                baseStyles,
                variantStyles[variant],
                paddingStyles[padding],
                hoverStyles,
                glowStyles,
                className
            )}
            {...animationProps}
            {...props}
        >
            {/* Inner glow accent for glass variant */}
            {variant === 'glass' && (
                <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                    <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-[var(--color-primary)]/5 to-transparent" />
                </div>
            )}
            <div className="relative z-10">{children}</div>
        </motion.div>
    );
}

// Subcomponents for structured card layouts
export function CardHeader({
    children,
    className
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={cn('mb-4', className)}>
            {children}
        </div>
    );
}

export function CardTitle({
    children,
    className
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <h3 className={cn(
            'text-xl font-semibold text-[var(--color-text-primary)]',
            className
        )}>
            {children}
        </h3>
    );
}

export function CardDescription({
    children,
    className
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <p className={cn(
            'text-sm text-[var(--color-text-secondary)] mt-1',
            className
        )}>
            {children}
        </p>
    );
}

export function CardContent({
    children,
    className
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={cn('', className)}>
            {children}
        </div>
    );
}

export function CardFooter({
    children,
    className
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={cn(
            'mt-4 pt-4 border-t border-[var(--color-border-subtle)]',
            className
        )}>
            {children}
        </div>
    );
}
