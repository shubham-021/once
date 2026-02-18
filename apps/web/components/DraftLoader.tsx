"use client";

import { motion, useAnimation } from "motion/react";
import { useEffect, useState } from "react";

export function TypingLoader() {
    const [text, setText] = useState("");
    const fullText = "Drafting";

    useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            if (index <= fullText.length) {
                setText(fullText.slice(0, index));
                index++;
            } else {
                // Reset after a pause to loop smoothly
                setTimeout(() => {
                    index = 0;
                    setText("");
                }, 1000);
            }
        }, 150); // Typing speed

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="font-serif text-accent tracking-wider">
            {"> "}{text}
            <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                className="ml-1 inline-block h-[1.2em] w-0.5 bg-accent align-middle"
            />
        </div>
    );
}
