'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FormFieldProps {
    label: string;
    name: string;
    type?: 'text' | 'textarea' | 'select';
    value: string;
    onChange: (value: string) => void;
    error?: string;
    placeholder?: string;
    options?: { value: string; label: string; icon?: string }[];
    required?: boolean;
    hint?: string;
}

export function FormField({
    label,
    name,
    type = 'text',
    value,
    onChange,
    error,
    placeholder,
    options,
    required = false,
    hint,
}: FormFieldProps) {
    const inputStyles = `
        w-full px-4 py-3.5
        bg-[var(--color-surface)]
        border border-[var(--color-border)]
        rounded-xl
        text-[var(--color-text-primary)]
        placeholder:text-[var(--color-text-muted)]
        transition-all duration-300
        focus:outline-none focus:border-[var(--color-primary)]
        focus:ring-2 focus:ring-[var(--color-primary)]/20
        focus:bg-[var(--color-surface-elevated)]
        hover:border-[var(--color-primary)]/50
        hover:bg-[var(--color-surface-hover)]
        disabled:opacity-50 disabled:cursor-not-allowed
    `;

    const errorStyles = error
        ? 'border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]/20'
        : '';

    return (
        <motion.div
            className="space-y-2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="flex items-center justify-between">
                <label
                    htmlFor={name}
                    className="block text-sm font-medium text-[var(--color-text-secondary)]"
                >
                    {label}
                    {required && (
                        <span className="text-[var(--color-primary)] ml-1">*</span>
                    )}
                </label>
                {hint && (
                    <span className="text-xs text-[var(--color-text-muted)]">
                        {hint}
                    </span>
                )}
            </div>

            {type === 'textarea' ? (
                <textarea
                    id={name}
                    name={name}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    rows={4}
                    className={cn(inputStyles, errorStyles, 'resize-none')}
                    required={required}
                />
            ) : type === 'select' && options ? (
                <div className="relative">
                    <select
                        id={name}
                        name={name}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className={cn(inputStyles, errorStyles, 'appearance-none cursor-pointer pr-10')}
                        required={required}
                    >
                        <option value="" className="bg-[var(--color-surface)] text-[var(--color-text-muted)]">
                            Select {label.toLowerCase()}
                        </option>
                        {options.map((option) => (
                            <option
                                key={option.value}
                                value={option.value}
                                className="bg-[var(--color-surface)] text-[var(--color-text-primary)]"
                            >
                                {option.icon ? `${option.icon} ${option.label}` : option.label}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg
                            className="w-5 h-5 text-[var(--color-text-muted)]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            ) : (
                <input
                    id={name}
                    name={name}
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={cn(inputStyles, errorStyles)}
                    required={required}
                />
            )}

            <AnimatePresence mode="wait">
                {error && (
                    <motion.div
                        className="flex items-center gap-2 text-sm text-[var(--color-error)]"
                        initial={{ opacity: 0, y: -8, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -8, height: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <span>{error}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// Card-based selection component for visual options
interface SelectionCardProps {
    options: { value: string; label: string; icon: React.ReactNode; description?: string }[];
    value: string;
    onChange: (value: string) => void;
    columns?: 2 | 3;
}

export function SelectionCards({ options, value, onChange, columns = 3 }: SelectionCardProps) {
    return (
        <div className={cn(
            'grid gap-3',
            columns === 2 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3'
        )}>
            {options.map((option, index) => (
                <motion.button
                    key={option.value}
                    type="button"
                    onClick={() => onChange(option.value)}
                    className={cn(
                        'p-4 rounded-xl border-2 transition-all duration-300',
                        'flex flex-col items-center gap-2 text-center',
                        'hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-surface-hover)]',
                        value === option.value
                            ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 shadow-lg shadow-[var(--color-primary)]/20'
                            : 'border-[var(--color-border)] bg-[var(--color-surface)]'
                    )}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <div className={cn(
                        'text-2xl transition-colors',
                        value === option.value
                            ? 'text-[var(--color-primary)]'
                            : 'text-[var(--color-text-secondary)]'
                    )}>
                        {option.icon}
                    </div>
                    <span className={cn(
                        'font-medium text-sm transition-colors',
                        value === option.value
                            ? 'text-[var(--color-text-primary)]'
                            : 'text-[var(--color-text-secondary)]'
                    )}>
                        {option.label}
                    </span>
                    {option.description && (
                        <span className="text-xs text-[var(--color-text-muted)] line-clamp-2">
                            {option.description}
                        </span>
                    )}
                </motion.button>
            ))}
        </div>
    );
}
