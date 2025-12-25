'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SceneCard } from './SceneCard';
import { Scene } from '@/lib/types';
import { scrollToBottom } from '@/lib/utils';

interface StoryFeedProps {
    scenes: Scene[];
}

export function StoryFeed({ scenes }: StoryFeedProps) {
    const feedRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [scenes.length]);

    return (
        <div
            ref={feedRef}
            className="flex-1 overflow-y-auto px-4 md:px-6 py-6"
            style={{ maxHeight: 'calc(100vh - 180px)' }}
        >
            <AnimatePresence mode="popLayout">
                {scenes.length === 0 ? (
                    <motion.div
                        key="empty"
                        className="flex flex-col items-center justify-center h-full min-h-[300px]"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                    >
                        <motion.div
                            className="w-20 h-20 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center mb-4"
                            animate={{
                                y: [0, -8, 0],
                                rotate: [0, -3, 3, 0]
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: 'easeInOut'
                            }}
                        >
                            <span className="text-3xl">📜</span>
                        </motion.div>
                        <p className="text-[var(--color-text-muted)] text-center">
                            Your story will unfold here...
                        </p>
                        <p className="text-xs text-[var(--color-text-muted)] mt-2 opacity-60">
                            Take your first action to begin
                        </p>
                    </motion.div>
                ) : (
                    <div className="max-w-3xl mx-auto">
                        {scenes.map((scene, index) => (
                            <SceneCard key={scene.id} scene={scene} index={index} />
                        ))}
                    </div>
                )}
            </AnimatePresence>

            {/* Scroll anchor */}
            <div ref={bottomRef} />
        </div>
    );
}
