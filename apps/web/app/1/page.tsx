"use client";

import { useEffect, useRef, useState, useMemo, useLayoutEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionTemplate,
  useMotionValue,
  animate,
} from "motion/react";
import Lenis from "lenis";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial, Float } from "@react-three/drei";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  Playfair_Display,
  Cormorant_Garamond,
  Outfit,
  Cinzel,
} from "next/font/google";
import { EmberCursor } from "@/components/ember-cursor";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MoveRight, Sparkles } from "lucide-react";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Fonts
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700", "800", "900"],
});
const cormorant = Cormorant_Garamond({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-cormorant",
});
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-cinzel" });

// --- 3D Components ---

function RandomSphere(count: number, radius: number) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = radius * Math.cbrt(Math.random());
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos(2 * Math.random() - 1);
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
  }
  return positions;
}

function Embers(props: any) {
  const ref = useRef<any>(null);
  const sphere = useMemo(() => RandomSphere(6000, 2.2), []);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 15;
      ref.current.rotation.y -= delta / 20;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points
        ref={ref}
        positions={sphere}
        stride={3}
        frustumCulled={false}
        {...props}
      >
        <PointMaterial
          transparent
          color="#FF5500"
          size={0.006}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.8}
          blending={2} // AdditiveBlending
        />
      </Points>
    </group>
  );
}

function Ash(props: any) {
  const ref = useRef<any>(null);
  const sphere = useMemo(() => RandomSphere(3000, 2.5), []);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 30;
      ref.current.rotation.y += delta / 35;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points
        ref={ref}
        positions={sphere}
        stride={3}
        frustumCulled={false}
        {...props}
      >
        <PointMaterial
          transparent
          color="#AAAAAA"
          size={0.003}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.3}
        />
      </Points>
    </group>
  );
}

// --- UI Components ---

const SmoothScroll = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
};

const Section = ({
  className,
  children,
  id,
}: {
  className?: string;
  children: React.ReactNode;
  id?: string;
}) => (
  <section
    id={id}
    className={cn(
      "relative min-h-screen w-full flex flex-col justify-center px-6 md:px-20 py-20 z-10",
      className,
    )}
  >
    {children}
  </section>
);

const RevealText = ({
  text,
  delay = 0,
  className,
}: {
  text: string;
  delay?: number;
  className?: string;
}) => {
  return (
    <motion.span
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn("inline-block", className)}
    >
      {text}
    </motion.span>
  );
};

export default function Page1() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Pinning the hero section for a parallax effect if needed
      // but let's stick to motion/react for the main heavy lifting to avoid conflicts unless complex.

      // Example GSAP interaction for "The Forge" section horizontal scroll
      const forgeSection = document.getElementById("forge");
      if (forgeSection) {
        // Implement horizontal scroll logic here if we had more content
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <SmoothScroll>
      <main
        ref={containerRef}
        className={cn(
          "relative bg-[#030303] text-[#f0f0f0] selection:bg-[#FF4D00] selection:text-white overflow-x-hidden cursor-none",
          playfair.variable,
          cormorant.variable,
          outfit.variable,
          cinzel.variable,
        )}
      >
        <EmberCursor />

        {/* 3D Background - Fixed */}
        <div className="fixed inset-0 z-0 pointer-events-none opacity-60">
          <Canvas camera={{ position: [0, 0, 1.5] }}>
            <ambientLight intensity={0.2} />
            <pointLight
              position={[10, 10, 10]}
              intensity={0.5}
              color="#FF4D00"
            />
            <Embers />
            <Ash />
          </Canvas>
          {/* Vignette & Grain Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_120%)] mix-blend-multiply" />
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150 pointer-events-none" />
        </div>

        {/* Navigation */}
        <nav className="fixed top-0 left-0 w-full z-50 px-8 py-6 flex justify-between items-center mix-blend-difference">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-xl font-cinzel font-bold tracking-[0.2em] text-[#FF4D00]"
          >
            IGNIS
          </motion.div>
          <div className="hidden md:flex gap-8 text-xs font-outfit uppercase tracking-widest text-white/70">
            {["The Origin", "Process", "Engine", "Contact"].map((item, i) => (
              <motion.button
                key={item}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 + i * 0.1 }}
                whileHover={{ color: "#FF4D00", scale: 1.1 }}
                className="hover:text-white transition-colors"
              >
                {item}
              </motion.button>
            ))}
          </div>
        </nav>

        {/* Hero Section */}
        <Section className="h-screen items-center text-center">
          <div className="relative z-10 flex flex-col items-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="relative"
            >
              <h1 className="font-playfair text-[15vw] leading-[0.85] font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-[#cccccc] to-[#444444] mix-blend-overlay tracking-tighter">
                ONCE
              </h1>
              <motion.h1
                className="absolute inset-0 font-playfair text-[15vw] leading-[0.85] font-black text-transparent bg-clip-text bg-gradient-to-b from-transparent via-[#FF4D00]/20 to-transparent blur-xl tracking-tighter"
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                ONCE
              </motion.h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1 }}
              className="mt-8 flex flex-col items-center gap-4"
            >
              <p className="font-cormorant text-2xl md:text-4xl italic tracking-wide text-white/80 max-w-2xl">
                "The fuel is ready. <br />{" "}
                <span className="text-[#FF4D00]">Bring the spark.</span>"
              </p>

              <motion.div
                className="mt-12 w-px h-24 bg-gradient-to-b from-[#FF4D00] to-transparent"
                initial={{ height: 0 }}
                animate={{ height: 96 }}
                transition={{ duration: 1.5, delay: 1.5 }}
              />
            </motion.div>
          </div>
        </Section>

        {/* Manifesto Section */}
        <Section className="items-start max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1 relative">
              {/* Abstract decorative element */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
                className="w-full aspect-square border border-[#FF4D00]/20 rounded-full flex items-center justify-center relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-[#FF4D00]/5 animate-pulse" />
                <div className="w-2/3 h-2/3 border border-white/10 rounded-full rotate-45" />
                <div className="w-1/2 h-1/2 border border-white/10 rounded-full -rotate-12" />
              </motion.div>
            </div>
            <div className="order-1 md:order-2">
              <span className="font-outfit text-[#FF4D00] text-sm tracking-[0.3em] uppercase mb-4 block">
                01. The Origin
              </span>
              <h2 className="font-playfair text-5xl md:text-7xl mb-8 leading-tight">
                <RevealText text="Reclaim the" /> <br />
                <span className="italic text-white/50">
                  <RevealText text="Narrative" delay={0.2} />
                </span>
              </h2>
              <p className="font-outfit text-white/60 text-lg leading-relaxed max-w-md">
                Once is not just a story; it's a living world that breathes with
                you. Powered by advanced AI, every choice you make ripples
                through the narrative fabric. Become the protagonist in a tale
                that has never been told before—and will never be told again.
              </p>

              <motion.button
                whileHover={{ x: 10 }}
                className="mt-10 flex items-center gap-2 font-cormorant text-xl italic text-[#FF4D00] group"
              >
                Enter the Void{" "}
                <MoveRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </motion.button>
            </div>
          </div>
        </Section>

        {/* Parallax / Feature Section */}
        <Section id="how-it-works" className="py-32">
          <div className="mb-20 text-center">
            <span className="font-outfit text-[#FF4D00] text-sm tracking-[0.3em] uppercase mb-4 block">
              02. The Process
            </span>
            <h2 className="font-playfair text-5xl md:text-6xl">
              Ignite Your Story
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-7xl mx-auto px-4">
            {/* Step 1: Forge */}
            <motion.div
              whileHover={{ y: -10 }}
              className="group relative aspect-[3/4] bg-[#0A0A0A] border border-white/5 overflow-hidden rounded-sm"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 opacity-90" />
              <div className="absolute bottom-0 left-0 p-8 z-20">
                <div className="text-[#FF4D00] text-6xl font-playfair font-black mb-4 opacity-20 group-hover:opacity-100 transition-opacity">
                  I
                </div>
                <h3 className="font-playfair text-3xl mb-2 text-white group-hover:text-[#FF4D00] transition-colors">
                  Forge
                </h3>
                <p className="font-outfit text-sm text-white/60 leading-relaxed mt-4">
                  Craft your protagonist in the Character Vault. Define their
                  past, their fears, and their desires. They are not just
                  avatars; they are souls waiting to wake.
                </p>
              </div>
              <div className="absolute inset-0 bg-[#FF4D00]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              {/* Visual: Glowing Core */}
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full border border-white/10 flex items-center justify-center group-hover:border-[#FF4D00]/50 transition-colors duration-500">
                <div className="w-2 h-2 bg-[#FF4D00] rounded-full shadow-[0_0_20px_#FF4D00] animate-pulse" />
              </div>
            </motion.div>

            {/* Step 2: Choose */}
            <motion.div
              whileHover={{ y: -10 }}
              className="group relative aspect-[3/4] bg-[#0A0A0A] border border-white/5 overflow-hidden rounded-sm md:translate-y-16"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 opacity-90" />
              <div className="absolute bottom-0 left-0 p-8 z-20">
                <div className="text-[#FF4D00] text-6xl font-playfair font-black mb-4 opacity-20 group-hover:opacity-100 transition-opacity">
                  II
                </div>
                <h3 className="font-playfair text-3xl mb-2 text-white group-hover:text-[#FF4D00] transition-colors">
                  Embark
                </h3>
                <p className="font-outfit text-sm text-white/60 leading-relaxed mt-4">
                  Select your world. From neon-drenched cyberpunk cities to
                  forgotten elven ruins. The stage is set, but the script is
                  blank.
                </p>
              </div>
              <div className="absolute inset-0 bg-[#FF4D00]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              {/* Visual: Pathways */}
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-40 h-40 opacity-50">
                <div className="absolute inset-0 border-l border-r border-white/10 skew-x-12 group-hover:skew-x-0 transition-transform duration-700" />
                <div className="absolute inset-0 border-t border-b border-white/10 -skew-y-12 group-hover:skew-y-0 transition-transform duration-700" />
              </div>
            </motion.div>

            {/* Step 3: Live */}
            <motion.div
              whileHover={{ y: -10 }}
              className="group relative aspect-[3/4] bg-[#0A0A0A] border border-white/5 overflow-hidden rounded-sm"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 opacity-90" />
              <div className="absolute bottom-0 left-0 p-8 z-20">
                <div className="text-[#FF4D00] text-6xl font-playfair font-black mb-4 opacity-20 group-hover:opacity-100 transition-opacity">
                  III
                </div>
                <h3 className="font-playfair text-3xl mb-2 text-white group-hover:text-[#FF4D00] transition-colors">
                  Live
                </h3>
                <p className="font-outfit text-sm text-white/60 leading-relaxed mt-4">
                  Make choices that matter. The AI adapts instantly. Betray a
                  friend? They remember. Save a kingdom? Statues rise. Your
                  story, your consequences.
                </p>
              </div>
              <div className="absolute inset-0 bg-[#FF4D00]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              {/* Visual: Ripple */}
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 flex items-center justify-center">
                <div className="absolute w-20 h-20 border border-white/5 rounded-full scale-50 group-hover:scale-150 opacity-0 group-hover:opacity-100 transition-all duration-1000 ease-out" />
                <div className="absolute w-20 h-20 border border-white/5 rounded-full scale-50 group-hover:scale-125 opacity-0 group-hover:opacity-100 transition-all duration-1000 delay-100 ease-out" />
                <Sparkles className="w-8 h-8 text-white/20 group-hover:text-[#FF4D00] transition-colors" />
              </div>
            </motion.div>
          </div>
        </Section>

        {/* Technical / Behind the Scenes Section */}
        <Section className="py-20 bg-black/40 border-y border-white/5 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="font-outfit text-[#FF4D00] text-sm tracking-[0.3em] uppercase mb-4 block">
                03. The Engine
              </span>
              <h2 className="font-playfair text-4xl md:text-5xl text-white mb-6">
                Silicon & Synapses
              </h2>
              <p className="font-outfit text-white/60 mb-6 leading-relaxed">
                Beneath the narrative lies a complex web of intelligence. We
                fuse
                <span className="text-white"> Large Language Models </span> for
                creativity with
                <span className="text-white"> Vector Memory (Qdrant) </span> and
                <span className="text-white"> Graph Databases (Neo4j)</span>.
              </p>
              <p className="font-outfit text-white/60 mb-8 leading-relaxed">
                This isn't just text generation. It's{" "}
                <span className="italic text-[#FF4D00]">
                  stateful existence
                </span>
                . The system remembers every location visited, every item
                collected, and every heart broken.
              </p>

              <div className="flex gap-4">
                <div className="px-4 py-2 border border-white/10 rounded-full text-xs font-mono text-white/50 uppercase tracking-widest">
                  OpenAI / Gemini
                </div>
                <div className="px-4 py-2 border border-white/10 rounded-full text-xs font-mono text-white/50 uppercase tracking-widest">
                  Neo4j
                </div>
                <div className="px-4 py-2 border border-white/10 rounded-full text-xs font-mono text-white/50 uppercase tracking-widest">
                  Qdrant
                </div>
              </div>
            </div>

            <div className="relative aspect-square border border-white/5 rounded-full flex items-center justify-center overflow-hidden bg-[#050505]">
              {/* Abstract Data Visualization */}
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="w-[80%] h-[80%] border border-dashed border-[#FF4D00]/20 rounded-full"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{
                    duration: 30,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute w-[60%] h-[60%] border border-dotted border-white/10 rounded-full"
                />
                <div className="absolute w-[40%] h-[40%] bg-[#FF4D00]/10 rounded-full blur-2xl animate-pulse" />
              </div>
            </div>
          </div>
        </Section>

        {/* CTA Section */}
        <Section className="items-center justify-center py-40 relative overflow-hidden">
          <div className="relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="mb-8 inline-block"
            >
              <Sparkles className="w-12 h-12 text-[#FF4D00] mx-auto mb-6" />
            </motion.div>

            <h2 className="font-playfair text-6xl md:text-8xl text-white mb-8 tracking-tighter leading-none">
              The Story{" "}
              <span className="text-[#FF4D00] italic font-cormorant px-2">
                Waits
              </span>{" "}
              <br />
              For No One.
            </h2>

            <Link href="/library">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-8 px-12 py-5 border border-white/20 rounded-full font-outfit text-sm uppercase tracking-[0.2em] bg-white/5 hover:bg-[#FF4D00] hover:border-[#FF4D00] hover:text-black transition-all duration-300 backdrop-blur-md"
              >
                Begin Your Journey
              </motion.button>
            </Link>
          </div>

          {/* Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-[#FF4D00] opacity-[0.08] blur-[150px] rounded-full pointer-events-none" />
        </Section>

        {/* Footer */}
        <footer className="relative z-10 w-full px-8 py-12 border-t border-white/5 bg-black/50 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8">
            <div className="text-[#FF4D00] font-cinzel text-2xl font-bold">
              IGNIS
            </div>
            <div className="flex gap-8 text-xs font-outfit text-white/40 uppercase tracking-widest">
              <a href="#" className="hover:text-white transition-colors">
                Twitter
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Instagram
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Email
              </a>
            </div>
            <div className="text-xs font-outfit text-white/20">
              © 2024 Ignis Digital. All rights reserved.
            </div>
          </div>
        </footer>
      </main>
    </SmoothScroll>
  );
}
