'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { CharacterState } from '@/lib/types';

interface SidePanelProps {
    characterState: CharacterState;
}

export function SidePanel({ characterState }: SidePanelProps) {
    const healthPercentage = characterState.health;
    const healthColor =
        healthPercentage > 70
            ? 'var(--color-success)'
            : healthPercentage > 30
                ? 'var(--color-warning)'
                : 'var(--color-error)';

    const healthGradient =
        healthPercentage > 70
            ? 'from-emerald-500 to-emerald-400'
            : healthPercentage > 30
                ? 'from-amber-500 to-amber-400'
                : 'from-red-500 to-red-400';

    return (
        <Card variant="glass" padding="lg" className="space-y-5">
            {/* Character Avatar & Name */}
            <div className="flex items-center gap-4">
                <motion.div
                    className="w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-2xl shadow-lg shadow-[var(--color-primary)]/30"
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                >
                    {characterState.name.charAt(0).toUpperCase()}
                </motion.div>
                <div>
                    <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
                        {characterState.name}
                    </h2>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                        The {characterState.coreTrait}
                    </p>
                </div>
            </div>

            <div className="divider" />

            {/* Location */}
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center">
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
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                        </svg>
                    </div>
                    <span className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                        Location
                    </span>
                </div>
                <p className="text-[var(--color-text-primary)] text-sm pl-10 leading-relaxed">
                    {characterState.location}
                </p>
            </div>

            {/* Health */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[var(--color-error)]/10 flex items-center justify-center">
                            <svg
                                className="w-4 h-4 text-[var(--color-error)]"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <span className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                            Health
                        </span>
                    </div>
                    <span
                        className="text-sm font-bold tabular-nums"
                        style={{ color: healthColor }}
                    >
                        {characterState.health}%
                    </span>
                </div>
                <div className="h-2.5 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
                    <motion.div
                        className={`h-full rounded-full bg-gradient-to-r ${healthGradient}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${healthPercentage}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                </div>
            </div>

            {/* Inventory */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[var(--color-secondary)]/10 flex items-center justify-center">
                            <svg
                                className="w-4 h-4 text-[var(--color-secondary)]"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                />
                            </svg>
                        </div>
                        <span className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                            Inventory
                        </span>
                    </div>
                    <span className="text-xs text-[var(--color-text-muted)] bg-[var(--color-surface)] px-2 py-0.5 rounded-full">
                        {characterState.inventory.length} items
                    </span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {characterState.inventory.length === 0 ? (
                        <div className="text-center py-4">
                            <svg
                                className="w-8 h-8 mx-auto text-[var(--color-text-muted)] opacity-50 mb-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                />
                            </svg>
                            <p className="text-[var(--color-text-muted)] text-sm italic">
                                Your pack is empty
                            </p>
                        </div>
                    ) : (
                        characterState.inventory.map((item, index) => (
                            <motion.div
                                key={item.id}
                                className="group p-3 bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] rounded-lg border border-[var(--color-border-subtle)] hover:border-[var(--color-border)] transition-all cursor-default"
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ x: 4 }}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-md bg-[var(--color-secondary)]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--color-secondary)]/20 transition-colors">
                                        <span className="text-sm">📦</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                                            {item.name}
                                        </p>
                                        {item.description && (
                                            <p className="text-xs text-[var(--color-text-muted)] mt-0.5 line-clamp-2">
                                                {item.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </Card>
    );
}
