import { create } from "zustand";

interface ProgressState {
    isLoading: boolean;
    progress: number;
    _timer: ReturnType<typeof setInterval> | null;
    start: () => void;
    done: () => void;
    reset: () => void;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
    isLoading: false,
    progress: 0,
    _timer: null,
    start: () => {
        const { _timer } = get();
        if (_timer) clearInterval(_timer);

        set({ isLoading: true, progress: 15 });

        const timer = setInterval(() => {
            set((state) => {
                if (state.progress >= 90) {
                    clearInterval(timer);
                    return state;
                }

                const increment = state.progress < 50 ? Math.random() * 8 + 2 : state.progress < 80 ? Math.random() * 3 + 2 : 0.5;
                return { progress: Math.min(state.progress + increment, 90) };
            })
        }, 400);

        set({ _timer: timer });
    },
    done: () => {
        const { _timer } = get();
        if (_timer) clearInterval(_timer);

        set({ progress: 100, _timer: null });

        setTimeout(() => {
            set({ isLoading: false, progress: 0 });
        }, 300)
    },
    reset: () => {
        const { _timer } = get();
        if (_timer) clearInterval(_timer);
        set({ isLoading: false, progress: 0, _timer: null });
    }
}))