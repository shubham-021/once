'use client';

import React, { useState, useRef, KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';

interface ActionInputProps {
    onSubmit: (action: string) => void;
    isDisabled: boolean;
    isLoading: boolean;
}

const MAX_LENGTH = 500;

export function ActionInput({ onSubmit, isDisabled, isLoading }: ActionInputProps) {
    const [action, setAction] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = () => {
        if (!action.trim() || isDisabled || action.length > MAX_LENGTH) return;

        onSubmit(action.trim());
        setAction('');

        setTimeout(() => {
            inputRef.current?.focus();
        }, 100);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const charProgress = (action.length / MAX_LENGTH) * 100;
    const isNearLimit = action.length > MAX_LENGTH * 0.8;
    const isOverLimit = action.length > MAX_LENGTH;

    return (
        <motion.div
            className="border-t border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-xl p-4 md:p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="max-w-4xl mx-auto">
                <div className="flex gap-3">
                    {/* Input container */}
                    <div className={`
                        flex-1 relative rounded-xl overflow-hidden transition-all duration-300
                        ${isFocused
                            ? 'ring-2 ring-[var(--color-primary)]/50 shadow-lg shadow-[var(--color-primary)]/10'
                            : 'ring-1 ring-[var(--color-border)]'
                        }
                    `}>
                        <textarea
                            ref={inputRef}
                            value={action}
                            onChange={(e) => setAction(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            disabled={isDisabled}
                            placeholder={
                                isLoading
                                    ? 'Waiting for the story to continue...'
                                    : "What do you do next?"
                            }
                            rows={2}
                            className="
                                w-full px-4 py-3 pr-16
                                bg-[var(--color-bg-secondary)]
                                text-[var(--color-text-primary)]
                                placeholder:text-[var(--color-text-muted)]
                                focus:outline-none
                                transition-colors duration-200
                                resize-none
                                disabled:opacity-50 disabled:cursor-not-allowed
                            "
                        />

                        {/* Character count with progress ring */}
                        <div className="absolute bottom-2 right-3 flex items-center gap-2">
                            <div className="relative w-7 h-7">
                                <svg className="w-7 h-7 -rotate-90" viewBox="0 0 24 24">
                                    {/* Background circle */}
                                    <circle
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        fill="none"
                                        strokeWidth="2"
                                        className="stroke-[var(--color-border)]"
                                    />
                                    {/* Progress circle */}
                                    <circle
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        fill="none"
                                        strokeWidth="2"
                                        strokeDasharray={`${2 * Math.PI * 10}`}
                                        strokeDashoffset={`${2 * Math.PI * 10 * (1 - Math.min(charProgress, 100) / 100)}`}
                                        className={`
                                            transition-all duration-300
                                            ${isOverLimit
                                                ? 'stroke-[var(--color-error)]'
                                                : isNearLimit
                                                    ? 'stroke-[var(--color-warning)]'
                                                    : 'stroke-[var(--color-primary)]'
                                            }
                                        `}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                {isNearLimit && (
                                    <span className={`
                                        absolute inset-0 flex items-center justify-center text-[9px] font-medium
                                        ${isOverLimit ? 'text-[var(--color-error)]' : 'text-[var(--color-warning)]'}
                                    `}>
                                        {MAX_LENGTH - action.length}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Submit button */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Button
                            onClick={handleSubmit}
                            disabled={isDisabled || !action.trim() || isOverLimit}
                            isLoading={isLoading}
                            variant="primary"
                            size="icon"
                            className="w-12 h-12 md:w-14 md:h-14 rounded-xl"
                        >
                            {!isLoading && (
                                <svg
                                    className="w-5 h-5 md:w-6 md:h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                    />
                                </svg>
                            )}
                        </Button>
                    </motion.div>
                </div>

                {/* Helper text */}
                <div className="mt-2 flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5">
                            <kbd className="px-1.5 py-0.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-[10px]">Enter</kbd>
                            to send
                        </span>
                        <span className="hidden md:flex items-center gap-1.5">
                            <kbd className="px-1.5 py-0.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-[10px]">Shift</kbd>
                            +
                            <kbd className="px-1.5 py-0.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-[10px]">Enter</kbd>
                            new line
                        </span>
                    </div>
                    <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        Be specific for better results
                    </span>
                </div>
            </div>
        </motion.div>
    );
}
