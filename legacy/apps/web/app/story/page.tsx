'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { SidePanel } from '@/components/story/SidePanel';
import { StoryFeed } from '@/components/story/StoryFeed';
import { ActionInput } from '@/components/story/ActionInput';
import { LoadingIndicator } from '@/components/story/LoadingIndicator';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const DUMMY_USER_ID = 'user-123';

function generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function StoryPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [storyId, setStoryId] = useState('');
    const [protagonistId, setProtagonistId] = useState('');
    const [characterState, setCharacterState] = useState<any>(null);
    const [scenes, setScenes] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showMobilePanel, setShowMobilePanel] = useState(false);

    useEffect(() => {
        const sid = searchParams.get('storyId');
        const pid = searchParams.get('protagonistId');
        const name = searchParams.get('name');
        const genre = searchParams.get('genre');
        const trait = searchParams.get('trait');
        const location = searchParams.get('location');
        const narration = searchParams.get('narration');

        if (!sid || !pid || !name || !genre || !trait || !location || !narration) {
            router.push('/');
            return;
        }

        setStoryId(sid);
        setProtagonistId(pid);
        setCharacterState({
            name,
            coreTrait: trait,
            genre,
            location,
            health: 100,
            inventory: [
                {
                    id: generateId(),
                    name: "Traveler's Pack",
                    description: 'Basic supplies for the journey',
                },
            ],
        });

        setScenes([
            {
                id: generateId(),
                type: 'narrative',
                content: narration,
                timestamp: Date.now(),
            },
        ]);
    }, [searchParams, router]);

    const handleActionSubmit = async (action: string) => {
        if (!storyId || !characterState) return;

        try {
            setLoading(true);
            setError('');

            const actionScene = {
                id: generateId(),
                type: 'action',
                content: action,
                timestamp: Date.now(),
            };
            setScenes((prev) => [...prev, actionScene]);

            const response = await axios.post(`${API_URL}/continue`, {
                storyId,
                userId: DUMMY_USER_ID,
                userAction: action,
            });

            const { data: narration, newState } = response.data;

            const narrativeScene = {
                id: generateId(),
                type: 'narrative',
                content: narration,
                timestamp: Date.now(),
                stateChanges: {
                    location: newState.location !== characterState.location ? newState.location : undefined,
                    health: newState.health !== characterState.health ? newState.health : undefined,
                },
            };

            setScenes((prev) => [...prev, narrativeScene]);

            const currentInventoryNames = characterState.inventory.map((i: any) => i.name);
            const newInventoryNames = newState.inventory;

            const added = newInventoryNames
                .filter((name: string) => !currentInventoryNames.includes(name))
                .map((name: string) => ({
                    id: generateId(),
                    name,
                    description: undefined,
                }));

            const removed = characterState.inventory
                .filter((item: any) => !newInventoryNames.includes(item.name))
                .map((item: any) => item.id);

            let newInventory = [...characterState.inventory];
            if (added.length > 0) {
                newInventory = [...newInventory, ...added];
            }
            if (removed.length > 0) {
                newInventory = newInventory.filter((item: any) => !removed.includes(item.id));
            }

            setCharacterState({
                ...characterState,
                location: newState.location,
                health: newState.health,
                inventory: newInventory,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate story. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!characterState) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingIndicator message="Loading your story..." size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-[var(--color-bg-primary)]">
            {/* Header */}
            <motion.header
                className="border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-xl sticky top-0 z-20"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Logo */}
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-lg">
                            📖
                        </div>
                        <div>
                            <h1 className="text-lg md:text-xl font-bold text-[var(--color-text-primary)]">
                                {characterState.name}'s Adventure
                            </h1>
                            <div className="flex items-center gap-2 text-xs md:text-sm text-[var(--color-text-muted)]">
                                <span className="badge badge-primary py-0.5 px-2 text-xs">
                                    {characterState.genre}
                                </span>
                                <span className="badge badge-secondary py-0.5 px-2 text-xs">
                                    {characterState.coreTrait}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Mobile panel toggle */}
                        <button
                            onClick={() => setShowMobilePanel(!showMobilePanel)}
                            className="lg:hidden p-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </button>

                        <button
                            onClick={() => {
                                if (confirm('Start a new story? Current progress will be lost.')) {
                                    router.push('/');
                                }
                            }}
                            className="px-3 md:px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] rounded-lg transition-all flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span className="hidden md:inline">New Story</span>
                        </button>
                    </div>
                </div>
            </motion.header>

            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full">
                {/* Desktop Side Panel */}
                <div className="hidden lg:block w-80 flex-shrink-0 p-4 md:p-6">
                    <div className="sticky top-24">
                        <SidePanel characterState={characterState} />
                    </div>
                </div>

                {/* Mobile Side Panel */}
                <AnimatePresence>
                    {showMobilePanel && (
                        <motion.div
                            className="lg:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowMobilePanel(false)}
                        >
                            <motion.div
                                className="absolute right-0 top-0 h-full w-80 max-w-[calc(100%-3rem)] bg-[var(--color-bg-primary)] p-4 overflow-y-auto"
                                initial={{ x: '100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '100%' }}
                                transition={{ type: 'spring', damping: 25 }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-semibold">Character</h2>
                                    <button
                                        onClick={() => setShowMobilePanel(false)}
                                        className="p-2 hover:bg-[var(--color-surface)] rounded-lg"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <SidePanel characterState={characterState} />
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Story Feed */}
                <div className="flex-1 flex flex-col min-w-0 border-x border-[var(--color-border-subtle)]">
                    <div className="flex-1 overflow-hidden">
                        <StoryFeed scenes={scenes} />
                    </div>

                    {/* Loading State */}
                    <AnimatePresence>
                        {loading && (
                            <motion.div
                                className="border-t border-[var(--color-border)] px-4 py-3 bg-[var(--color-surface)]"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                <LoadingIndicator message="The story unfolds..." />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Error State */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                className="border-t border-[var(--color-border)] p-4 bg-[var(--color-error)]/10"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                            >
                                <div className="flex items-center gap-3">
                                    <svg className="w-5 h-5 text-[var(--color-error)]" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <p className="text-[var(--color-error)] text-sm flex-1">{error}</p>
                                    <button
                                        onClick={() => setError('')}
                                        className="text-[var(--color-error)] hover:text-[var(--color-error)]/80"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Action Input */}
                    <ActionInput onSubmit={handleActionSubmit} isDisabled={loading} isLoading={loading} />
                </div>

                {/* Right padding area for balance */}
                <div className="hidden lg:block w-16 flex-shrink-0" />
            </div>
        </div>
    );
}

export default function StoryPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <LoadingIndicator message="Loading..." size="lg" />
            </div>
        }>
            <StoryPageContent />
        </Suspense>
    );
}
