"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export type LinearMenuItem = {
    title: string;
    icon: (className: string) => React.ReactNode;
} & (
        | { href: string; onClick?: never }
        | { onClick: () => void; href?: never }
    );

interface LinearMenuProps {
    items: LinearMenuItem[];
    isOpen: boolean;
    onClose: () => void;
    currentPath: string;
}

export function LinearMenu({ items, isOpen, onClose, currentPath }: LinearMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) onClose();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
        };
        const id = setTimeout(() => document.addEventListener("click", handleClickOutside), 10);
        return () => {
            clearTimeout(id);
            document.removeEventListener("click", handleClickOutside);
        };
    }, [isOpen, onClose]);

    const isMobile = !useMediaQuery("(min-width: 600px)");

    return (
        <div ref={menuRef} className={cn("absolute top-0 right-0 z-40")}>
            <AnimatePresence>
                {isOpen && items.map((item, index) => {
                    const offset = (index + 1) * 56; // 48px button + 8px gap
                    const isActive = 'href' in item && currentPath === item.href;

                    return (
                        <MenuItemButton
                            key={item.title}
                            item={item}
                            index={index}
                            offset={offset}
                            isActive={isActive}
                            totalItems={items.length}
                            onClose={onClose}
                            isMobile={isMobile}
                        />
                    );
                })}
            </AnimatePresence>
        </div>
    );
}

function MenuItemButton({
    item,
    index,
    offset,
    isActive,
    totalItems,
    onClose,
    isMobile
}: {
    item: LinearMenuItem;
    index: number;
    offset: number;
    isActive: boolean;
    totalItems: number;
    onClose: () => void;
    isMobile: boolean;
}) {
    const [hovered, setHovered] = useState(false);
    const [canHover, setCanHover] = useState(false);
    const isLink = 'href' in item && item.href;
    const Component = isLink ? motion.a : motion.button;

    const handleClick = () => {
        if ('onClick' in item && item.onClick) item.onClick();
        onClose();
    };

    return (
        <Component
            {...(isLink ? { href: item.href } : {})}
            onClick={handleClick}
            initial={{ opacity: 0, scale: 0.5, x: 0 }}
            animate={{
                opacity: 1,
                scale: 1,
                x: isMobile ? 0 : -offset,
                y: isMobile ? offset : 0
            }}
            exit={{ opacity: 0, scale: 0.5, x: 0, transition: { delay: (totalItems - 1 - index) * 0.03, duration: 0.15 } }}
            transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 20 }}
            onAnimationComplete={() => setCanHover(true)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{ pointerEvents: canHover ? 'auto' : 'none' }}
            className={cn(
                "absolute top-0 right-0 flex items-center justify-center w-12 h-12 rounded-full",
                "bg-surface/80 backdrop-blur-md border border-line hover:border-accent",
                "transition-colors cursor-pointer",
            )}
        >
            <div className="w-5 h-5">
                {item.icon(isActive ? "text-accent" : "text-neutral-500 dark:text-neutral-300")}
            </div>

            <AnimatePresence>
                {hovered && (
                    <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className={cn(
                            "absolute px-2 py-1 rounded-md text-xs whitespace-nowrap",
                            "bg-surface border border-line",
                            isActive && "text-accent",
                            isMobile ? "right-full mr-2" : "top-full mt-2"
                        )}
                    >
                        {item.title}
                    </motion.div>
                )}
            </AnimatePresence>
        </Component>
    );
}