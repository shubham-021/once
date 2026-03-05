import { useProgressStore } from "@/stores/progress-store";

export function useProgressBar() {
    const start = useProgressStore((s) => s.start);
    const done = useProgressStore((s) => s.done);

    return { start, done };
}
