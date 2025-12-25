"use client";

import { useEffect, useRef, useState } from "react";

interface Particle {
    x: number;
    y: number;
    alpha: number;
    size: number;
}

export function EmberCursor() {
    const cursorRef = useRef<HTMLDivElement>(null);
    const [particles, setParticles] = useState<Particle[]>([]);
    const mousePos = useRef({ x: 0, y: 0 });
    const lastPos = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mousePos.current = { x: e.clientX, y: e.clientY };

            if (cursorRef.current) {
                cursorRef.current.style.left = `${e.clientX}px`;
                cursorRef.current.style.top = `${e.clientY}px`;
            }

            const dx = e.clientX - lastPos.current.x;
            const dy = e.clientY - lastPos.current.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 5) {
                setParticles((prev) => [
                    ...prev.slice(-20),
                    {
                        x: e.clientX,
                        y: e.clientY,
                        alpha: 0.6,
                        size: Math.random() * 4 + 2,
                    },
                ]);
                lastPos.current = { x: e.clientX, y: e.clientY };
            }
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setParticles((prev) =>
                prev
                    .map((p) => ({ ...p, alpha: p.alpha - 0.03, y: p.y - 0.5 }))
                    .filter((p) => p.alpha > 0)
            );
        }, 30);

        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <div
                ref={cursorRef}
                className="pointer-events-none fixed z-10000 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ember shadow-[0_0_20px_#FF4D00,0_0_40px_rgba(255,77,0,0.5)]"
            />
            {particles.map((particle, i) => (
                <div
                    key={i}
                    className="pointer-events-none fixed z-9999 rounded-full"
                    style={{
                        left: particle.x,
                        top: particle.y,
                        width: particle.size,
                        height: particle.size,
                        background: `rgba(255, 77, 0, ${particle.alpha * 0.5})`,
                        transform: "translate(-50%, -50%)",
                        filter: "blur(1px)",
                    }}
                />
            ))}
        </>
    );
}
