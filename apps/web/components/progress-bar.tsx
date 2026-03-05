"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useProgressStore } from "@/stores/progress-store";
import { cn } from "@/lib/utils";

export function ProgressBar() {
    const { isLoading, progress, done } = useProgressStore();
    const pathname = usePathname();
    const prevPathname = useRef(pathname);

    useEffect(() => {
        if (prevPathname.current !== pathname) {
            prevPathname.current = pathname;
            done();
        }
    }, [pathname, done]);

    return (
        <AnimatePresence>
            {(isLoading || progress > 0) && (
                <motion.div
                    className={cn(
                        "fixed top-0 left-0 z-9999 h-[2px] bg-accent",
                        progress === 100 && "pointer-events-none"
                    )}
                    initial={{ width: "0%", opacity: 1 }}
                    animate={{
                        width: `${progress}%`,
                        opacity: progress === 100 ? 0 : 1,
                    }}
                    exit={{ opacity: 0 }}
                    transition={{
                        width: { duration: progress === 100 ? 0.15 : 0.4, ease: "easeOut" },
                        opacity: { duration: 0.3, ease: "easeOut", delay: progress === 100 ? 0.15 : 0 },
                    }}
                >
                    <div
                        className={cn(
                            "absolute right-0 top-0 h-full w-24 bg-accent",
                            progress === 100 && "opacity-0"
                        )}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
