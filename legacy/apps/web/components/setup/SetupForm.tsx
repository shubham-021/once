'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FormField, SelectionCards } from './FormField';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const DUMMY_USER_ID = 'user-123';

const CORE_TRAITS = [
    { value: 'brave', label: 'Brave', icon: <span>⚔️</span>, description: 'Fearless in the face of danger' },
    { value: 'cunning', label: 'Cunning', icon: <span>🦊</span>, description: 'Quick-witted and strategic' },
    { value: 'wise', label: 'Wise', icon: <span>📚</span>, description: 'Deep knowledge and insight' },
    { value: 'charismatic', label: 'Charismatic', icon: <span>✨</span>, description: 'Natural leader and influencer' },
    { value: 'mysterious', label: 'Mysterious', icon: <span>🌙</span>, description: 'Enigmatic and unpredictable' },
    { value: 'ruthless', label: 'Ruthless', icon: <span>🗡️</span>, description: 'Determined to achieve goals' },
];

const GENRES = [
    { value: 'fantasy', label: 'Fantasy', icon: <span>🐉</span>, description: 'Magic and mythical creatures' },
    { value: 'sci-fi', label: 'Sci-Fi', icon: <span>🚀</span>, description: 'Futuristic technology and space' },
    { value: 'horror', label: 'Horror', icon: <span>👻</span>, description: 'Dark and terrifying tales' },
    { value: 'mystery', label: 'Mystery', icon: <span>🔍</span>, description: 'Solve puzzles and crimes' },
    { value: 'adventure', label: 'Adventure', icon: <span>🗺️</span>, description: 'Epic journeys and quests' },
    { value: 'cyberpunk', label: 'Cyberpunk', icon: <span>🤖</span>, description: 'High-tech dystopian future' },
];

type Step = 'welcome' | 'character' | 'world' | 'scenario';

export function SetupForm() {
    const router = useRouter();
    const [step, setStep] = useState<Step>('welcome');

    const [formData, setFormData] = useState({
        protagonistName: '',
        coreTrait: '',
        genre: '',
        startingScenario: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    const validateStep = (currentStep: Step): boolean => {
        const newErrors: Record<string, string> = {};

        if (currentStep === 'character') {
            if (!formData.protagonistName.trim()) {
                newErrors.protagonistName = 'Your protagonist needs a name';
            } else if (formData.protagonistName.length < 2) {
                newErrors.protagonistName = 'Name must be at least 2 characters';
            }
            if (!formData.coreTrait) {
                newErrors.coreTrait = 'Select a defining trait';
            }
        }

        if (currentStep === 'world') {
            if (!formData.genre) {
                newErrors.genre = 'Choose your story world';
            }
        }

        if (currentStep === 'scenario') {
            if (!formData.startingScenario.trim()) {
                newErrors.startingScenario = 'Describe where your story begins';
            } else if (formData.startingScenario.length < 10) {
                newErrors.startingScenario = 'Add more detail to set the scene';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        if (step === 'welcome') setStep('character');
        else if (step === 'character' && validateStep('character')) setStep('world');
        else if (step === 'world' && validateStep('world')) setStep('scenario');
    };

    const prevStep = () => {
        if (step === 'character') setStep('welcome');
        else if (step === 'world') setStep('character');
        else if (step === 'scenario') setStep('world');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateStep('scenario')) return;

        try {
            setLoading(true);
            setError('');

            const response = await axios.post(`${API_URL}/start`, {
                title: `${formData.protagonistName}'s ${formData.genre} Adventure`,
                description: `A ${formData.genre} story featuring ${formData.protagonistName}`,
                name: formData.protagonistName,
                currentScenario: formData.startingScenario,
                location: formData.startingScenario,
                genre: formData.genre,
                baseTraits: formData.coreTrait,
                userId: DUMMY_USER_ID,
            });

            const { storyId, protagonistId, data: narration } = response.data;

            router.push(
                `/story?storyId=${storyId}&protagonistId=${protagonistId}&name=${encodeURIComponent(formData.protagonistName)}&genre=${formData.genre}&trait=${formData.coreTrait}&location=${encodeURIComponent(formData.startingScenario)}&narration=${encodeURIComponent(narration)}`
            );
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create story. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const stepVariants = {
        enter: { opacity: 0, x: 20 },
        center: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 },
    };

    const getStepNumber = () => {
        if (step === 'character') return 1;
        if (step === 'world') return 2;
        if (step === 'scenario') return 3;
        return 0;
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
            <motion.div
                className="w-full max-w-2xl"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <AnimatePresence mode="wait">
                    {step === 'welcome' ? (
                        <motion.div
                            key="welcome"
                            variants={stepVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.3 }}
                            className="text-center space-y-8"
                        >
                            {/* Animated Logo/Icon */}
                            <motion.div
                                className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center shadow-xl shadow-[var(--color-primary)]/30"
                                animate={{
                                    boxShadow: [
                                        '0 0 30px hsla(270, 75%, 60%, 0.3)',
                                        '0 0 60px hsla(270, 75%, 60%, 0.4)',
                                        '0 0 30px hsla(270, 75%, 60%, 0.3)',
                                    ]
                                }}
                                transition={{ duration: 3, repeat: Infinity }}
                            >
                                <span className="text-4xl">📖</span>
                            </motion.div>

                            <div className="space-y-4">
                                <motion.h1
                                    className="text-5xl md:text-6xl font-bold"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    StoryWeaver
                                </motion.h1>
                                <motion.p
                                    className="text-xl text-[var(--color-text-secondary)] max-w-md mx-auto"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    Your words shape worlds. Begin your journey as the co-author of an epic adventure.
                                </motion.p>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <Button
                                    onClick={nextStep}
                                    variant="primary"
                                    size="lg"
                                    icon={
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    }
                                    iconPosition="right"
                                >
                                    Begin Your Story
                                </Button>
                            </motion.div>

                            <motion.div
                                className="flex items-center justify-center gap-8 text-sm text-[var(--color-text-muted)]"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-[var(--color-primary)]">✦</span>
                                    AI-Powered
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[var(--color-secondary)]">✦</span>
                                    Interactive
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[var(--color-accent)]">✦</span>
                                    Endless Stories
                                </div>
                            </motion.div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="form"
                            variants={stepVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.3 }}
                        >
                            {/* Progress indicator */}
                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-4">
                                    <button
                                        onClick={prevStep}
                                        className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                        Back
                                    </button>
                                    <span className="text-sm text-[var(--color-text-muted)]">
                                        Step {getStepNumber()} of 3
                                    </span>
                                </div>
                                <div className="h-1 bg-[var(--color-surface)] rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(getStepNumber() / 3) * 100}%` }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </div>
                            </div>

                            <Card variant="glass" padding="xl">
                                <form onSubmit={handleSubmit}>
                                    <AnimatePresence mode="wait">
                                        {step === 'character' && (
                                            <motion.div
                                                key="character-step"
                                                variants={stepVariants}
                                                initial="enter"
                                                animate="center"
                                                exit="exit"
                                                className="space-y-6"
                                            >
                                                <div className="text-center mb-6">
                                                    <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
                                                        Create Your Protagonist
                                                    </h2>
                                                    <p className="text-[var(--color-text-secondary)]">
                                                        Who will be the hero of your story?
                                                    </p>
                                                </div>

                                                <FormField
                                                    label="Character Name"
                                                    name="protagonistName"
                                                    value={formData.protagonistName}
                                                    onChange={(value) => handleChange('protagonistName', value)}
                                                    error={errors.protagonistName}
                                                    placeholder="Enter your character's name"
                                                    required
                                                />

                                                <div className="space-y-2">
                                                    <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
                                                        Core Trait <span className="text-[var(--color-primary)]">*</span>
                                                    </label>
                                                    <SelectionCards
                                                        options={CORE_TRAITS}
                                                        value={formData.coreTrait}
                                                        onChange={(value) => handleChange('coreTrait', value)}
                                                    />
                                                    {errors.coreTrait && (
                                                        <p className="text-sm text-[var(--color-error)]">{errors.coreTrait}</p>
                                                    )}
                                                </div>

                                                <Button
                                                    type="button"
                                                    onClick={nextStep}
                                                    variant="primary"
                                                    size="lg"
                                                    fullWidth
                                                >
                                                    Continue
                                                </Button>
                                            </motion.div>
                                        )}

                                        {step === 'world' && (
                                            <motion.div
                                                key="world-step"
                                                variants={stepVariants}
                                                initial="enter"
                                                animate="center"
                                                exit="exit"
                                                className="space-y-6"
                                            >
                                                <div className="text-center mb-6">
                                                    <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
                                                        Choose Your World
                                                    </h2>
                                                    <p className="text-[var(--color-text-secondary)]">
                                                        What kind of adventure awaits?
                                                    </p>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
                                                        Story Genre <span className="text-[var(--color-primary)]">*</span>
                                                    </label>
                                                    <SelectionCards
                                                        options={GENRES}
                                                        value={formData.genre}
                                                        onChange={(value) => handleChange('genre', value)}
                                                    />
                                                    {errors.genre && (
                                                        <p className="text-sm text-[var(--color-error)]">{errors.genre}</p>
                                                    )}
                                                </div>

                                                <Button
                                                    type="button"
                                                    onClick={nextStep}
                                                    variant="primary"
                                                    size="lg"
                                                    fullWidth
                                                >
                                                    Continue
                                                </Button>
                                            </motion.div>
                                        )}

                                        {step === 'scenario' && (
                                            <motion.div
                                                key="scenario-step"
                                                variants={stepVariants}
                                                initial="enter"
                                                animate="center"
                                                exit="exit"
                                                className="space-y-6"
                                            >
                                                <div className="text-center mb-6">
                                                    <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
                                                        Set the Scene
                                                    </h2>
                                                    <p className="text-[var(--color-text-secondary)]">
                                                        Where does {formData.protagonistName || 'your hero'}'s journey begin?
                                                    </p>
                                                </div>

                                                {/* Selected choices summary */}
                                                <div className="flex flex-wrap gap-2 justify-center mb-4">
                                                    <span className="badge badge-primary">
                                                        {CORE_TRAITS.find(t => t.value === formData.coreTrait)?.label}
                                                    </span>
                                                    <span className="badge badge-secondary">
                                                        {GENRES.find(g => g.value === formData.genre)?.label}
                                                    </span>
                                                </div>

                                                <FormField
                                                    label="Starting Location"
                                                    name="startingScenario"
                                                    type="textarea"
                                                    value={formData.startingScenario}
                                                    onChange={(value) => handleChange('startingScenario', value)}
                                                    error={errors.startingScenario}
                                                    placeholder={`Describe the opening scene... (e.g., "a misty forest at dawn", "the deck of a starship", "a crowded marketplace")`}
                                                    hint="Be vivid and specific"
                                                    required
                                                />

                                                {error && (
                                                    <motion.div
                                                        className="p-4 bg-[var(--color-error)]/10 border border-[var(--color-error)]/30 rounded-xl"
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                    >
                                                        <p className="text-[var(--color-error)] text-sm flex items-center gap-2">
                                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                            </svg>
                                                            {error}
                                                        </p>
                                                    </motion.div>
                                                )}

                                                <Button
                                                    type="submit"
                                                    variant="primary"
                                                    size="lg"
                                                    fullWidth
                                                    isLoading={loading}
                                                    icon={
                                                        !loading && (
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                            </svg>
                                                        )
                                                    }
                                                    iconPosition="right"
                                                >
                                                    {loading ? 'Creating your story...' : 'Begin Adventure'}
                                                </Button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </form>
                            </Card>

                            <motion.p
                                className="text-center text-[var(--color-text-muted)] text-sm mt-6"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                Your choices will shape the narrative. Every action matters.
                            </motion.p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
