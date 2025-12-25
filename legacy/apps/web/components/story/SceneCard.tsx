'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Scene } from '@/lib/types';
import { formatTimestamp } from '@/lib/utils';

interface SceneCardProps {
    scene: Scene;
    index: number;
}

export function SceneCard({ scene, index }: SceneCardProps) {
    const isNarrative = scene.type === 'narrative';
    const isAction = scene.type === 'action';
    const isSystem = scene.type === 'system';

    if (isAction) {
        return (
            <motion.div
                className="flex justify-end mb-4"
                initial={{ opacity: 0, x: 20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
            >
                <div className="max-w-[85%] md:max-w-[75%]">
                    <div className="relative">
                        {/* Action bubble */}
                        <div className="bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 rounded-2xl rounded-br-md px-5 py-4 backdrop-blur-sm">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)]/20 flex items-center justify-center flex-shrink-0">
                                    <svg
                                        className="w-4 h-4 text-[var(--color-primary)]"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13 10V3L4 14h7v7l9-11h-7z"
                                        />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <p className="text-[var(--color-text-primary)] font-medium leading-relaxed">
                                        {scene.content}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-[var(--color-text-muted)] mt-2 text-right pr-1">
                            {formatTimestamp(scene.timestamp)}
                        </p>
                    </div>
                </div>
            </motion.div>
        );
    }

    if (isSystem) {
        return (
            <motion.div
                className="flex justify-center my-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
            >
                <div className="bg-[var(--color-surface)]/80 backdrop-blur-sm border border-[var(--color-border)] rounded-full px-5 py-2 shadow-sm">
                    <p className="text-sm text-[var(--color-text-muted)] italic flex items-center gap-2">
                        <span className="text-[var(--color-accent)]">✦</span>
                        {scene.content}
                        <span className="text-[var(--color-accent)]">✦</span>
                    </p>
                </div>
            </motion.div>
        );
    }

    // Narrative card
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.03 }}
            className="mb-5"
        >
            <Card variant="glass" padding="none" animate={false} className="overflow-hidden">
                {/* Story indicator bar */}
                <div className="h-1 bg-gradient-to-r from-[var(--color-secondary)] via-[var(--color-primary)] to-[var(--color-accent)]" />

                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <motion.div
                                className="w-2.5 h-2.5 bg-[var(--color-secondary)] rounded-full"
                                animate={{
                                    opacity: [0.5, 1, 0.5],
                                    scale: [0.9, 1.1, 0.9]
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                            <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                                Story
                            </span>
                        </div>
                        <span className="text-xs text-[var(--color-text-muted)]">
                            {formatTimestamp(scene.timestamp)}
                        </span>
                    </div>

                    {/* Narrative content with decorative quote */}
                    <div className="relative">
                        <div className="absolute -left-1 top-0 text-4xl text-[var(--color-secondary)]/20 font-serif leading-none">
                            "
                        </div>
                        <div className="narrative-text pl-4">
                            {scene.content}
                        </div>
                    </div>

                    {/* State changes */}
                    {scene.stateChanges && (
                        Object.values(scene.stateChanges).some(v => v !== undefined) && (
                            <motion.div
                                className="mt-5 pt-4 border-t border-[var(--color-border-subtle)]"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                <div className="flex flex-wrap gap-2">
                                    {scene.stateChanges.location && (
                                        <motion.span
                                            className="badge badge-primary"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: 'spring', stiffness: 500 }}
                                        >
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                            </svg>
                                            New location
                                        </motion.span>
                                    )}
                                    {scene.stateChanges.health !== undefined && (
                                        <motion.span
                                            className="badge badge-error"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: 'spring', stiffness: 500, delay: 0.1 }}
                                        >
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                            </svg>
                                            Health changed
                                        </motion.span>
                                    )}
                                    {scene.stateChanges.inventory && (
                                        <motion.span
                                            className="badge badge-secondary"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: 'spring', stiffness: 500, delay: 0.2 }}
                                        >
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                                            </svg>
                                            Item acquired
                                        </motion.span>
                                    )}
                                </div>
                            </motion.div>
                        )
                    )}
                </div>
            </Card>
        </motion.div>
    );
}
