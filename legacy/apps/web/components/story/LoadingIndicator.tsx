'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface LoadingIndicatorProps {
    message?: string;
    size?: 'sm' | 'md' | 'lg';
}

const loadingMessages = [
    'The story unfolds...',
    'Weaving your tale...',
    'Crafting the narrative...',
    'Spinning destiny...',
];

export function LoadingIndicator({
    message,
    size = 'md'
}: LoadingIndicatorProps) {
    const displayMessage = message || loadingMessages[Math.floor(Math.random() * loadingMessages.length)];

    const sizeStyles = {
        sm: { dots: 'w-1.5 h-1.5', gap: 'gap-1', text: 'text-xs' },
        md: { dots: 'w-2 h-2', gap: 'gap-1.5', text: 'text-sm' },
        lg: { dots: 'w-3 h-3', gap: 'gap-2', text: 'text-base' },
    };

    const styles = sizeStyles[size];

    return (
        <motion.div
            className="flex flex-col items-center justify-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            {/* Animated quill/pen icon for large size */}
            {size === 'lg' && (
                <motion.div
                    className="mb-2"
                    animate={{
                        rotate: [-5, 5, -5],
                        y: [0, -3, 0]
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeInOut'
                    }}
                >
                    <svg
                        className="w-10 h-10 text-[var(--color-primary)]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                    </svg>
                </motion.div>
            )}

            {/* Bouncing dots */}
            <div className={`flex items-center ${styles.gap}`}>
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className={`${styles.dots} rounded-full`}
                        style={{
                            background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))`
                        }}
                        animate={{
                            y: [0, -8, 0],
                            scale: [1, 1.2, 1],
                        }}
                        transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            delay: i * 0.15,
                            ease: 'easeInOut',
                        }}
                    />
                ))}
            </div>

            {/* Message */}
            <motion.span
                className={`${styles.text} text-[var(--color-text-secondary)] italic`}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
            >
                {displayMessage}
            </motion.span>
        </motion.div>
    );
}
