"use client";
import { User } from "@/generated/prisma/client";
import { Button } from "@/shared/components/ui/button";
import { logout } from "@/shared/lib/actions";
import { Float, OrbitControls } from '@react-three/drei';
import { Canvas } from "@react-three/fiber";
import { motion } from "framer-motion";
import { Inter, Space_Grotesk } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { FaAws } from "react-icons/fa";
import { PiChat, PiCloud, PiCloudBold, PiHandWaving, PiNetwork, PiShieldCheck } from "react-icons/pi";
import { SiBun, SiHono, SiNextdotjs, SiPostgresql, SiSocketdotio, SiTailwindcss, SiTypescript } from "react-icons/si";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["700"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "600", "700"] });

const techStack = [
  { icon: SiNextdotjs, name: "Next.js", color: "text-neutral-800 dark:text-neutral-200" },
  { icon: SiTailwindcss, name: "Tailwind", color: "text-sky-500" },
  { icon: SiPostgresql, name: "PostgreSQL", color: "text-blue-600" },
  { icon: SiTypescript, name: "TypeScript", color: "text-blue-400" },
  { icon: SiHono, name: "Hono", color: "text-rose-500" },
  { icon: FaAws, name: "AWS", color: "text-amber-500" },
  { icon: SiSocketdotio, name: "Socket.io", color: "text-emerald-500" },
  { icon: SiBun, name: "Bun", color: "text-neutral-400" },
];

const features = [
  { icon: PiCloud, name: "Cloud Native", description: "Global deployment on AWS & Vercel edge network" },
  { icon: PiChat, name: "Real-Time Chat", description: "Secure messaging with end-to-end encryption" },
  { icon: PiShieldCheck, name: "Security First", description: "Enterprise-grade authentication protocols" },
  { icon: PiNetwork, name: "Global Scale", description: "Low-latency infrastructure across 50+ regions" },
  { icon: PiHandWaving, name: "Intuitive UI", description: "Thoughtfully crafted user experience" },
  { icon: PiCloudBold, name: "Cloud Sync", description: "Seamless cross-device synchronization" },
];

function FloatingGeometry() {
  return (
    <Canvas className="fixed inset-0 -z-10">
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} color="#7dd3fc" />
      {Array.from({ length: 16 }).map((_, i) => (
        <Float key={i} speed={1.5} rotationIntensity={0.8} floatIntensity={2}>
          <mesh position={[
            Math.random() * 20 - 10,
            Math.random() * 20 - 10,
            Math.random() * 20 - 10
          ]}>
            <tetrahedronGeometry args={[0.5, 0]} />
            <meshStandardMaterial color="#93c5fd" transparent opacity={0.2} />
          </mesh>
        </Float>
      ))}
      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1.2} />
    </Canvas>
  );
}

const Landing = ({ user }: { user: User | null }) => {
  const containerRef = useRef(null);

  return (
    <div className={`${inter.className} min-h-screen bg-neutral-50 dark:bg-neutral-900`} ref={containerRef}>
      <FloatingGeometry />
      {/* <LinguisticBackground /> */}

      <motion.nav
        className="fixed w-full opacity-1 z-999  top-0 backdrop-blur-md z-50 py-4 px-6 md:px-12 flex justify-between items-center bg-white/80 dark:bg-neutral-900/80 border-b border-neutral-200 dark:border-neutral-800"
      >
        <motion.div
          className={`text-xl ${spaceGrotesk.className} tracking-tight text-neutral-800 dark:text-neutral-200`}
          initial={{ x: -20 }}
          animate={{ x: 0 }}
        >
          Relay<span className="text-sky-500">cat</span>
        </motion.div>

        <div className="hidden md:flex gap-6 items-center">
          <Link href="#features" className="text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-sky-500 transition-colors">
            Features
          </Link>
          <Link href="#tech-stack" className="text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-sky-500 transition-colors">
            Technology
          </Link>
          {user ? (
            <div className="flex items-center gap-4 ml-4">
              <Image
                src={user.image}
                alt="Profile"
                width={40}
                height={40}
                className="rounded-full border-2 border-sky-500 hover:border-sky-600 transition-colors"
              />
              <Button
                onClick={logout}
                className="px-4 py-2.5 bg-gradient-to-br from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-sm rounded-lg shadow-sm"
              >
                Sign out
              </Button>
            </div>
          ) : (
            <div className="flex gap-3 ml-4">
              <Link
                href="/auth"
                className="px-4 py-2.5 text-sm rounded-lg border border-neutral-300 hover:border-sky-500 bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm transition-colors"
              >
                Login
              </Link>
              <Link
                href="/auth"
                className="px-4 py-2.5 bg-gradient-to-br from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-sm rounded-lg text-white shadow-sm"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </motion.nav>

      <main className="pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto">
        <section className="text-center mb-32">
          <motion.div
            className="inline-block relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className={`${spaceGrotesk.className} text-5xl md:text-7xl mb-6 text-neutral-900 dark:text-neutral-100`}>
              Modern Communication
              <span className="block mt-4 pb-1 bg-gradient-to-r from-sky-500 via-purple-500 to-blue-600 bg-clip-text text-transparent">
                Reimagined
              </span>
            </h1>
            <div className="absolute inset-x-0 -bottom-6 h-1 bg-gradient-to-r from-sky-500/30 via-purple-500/30 to-blue-600/30 rounded-full" />
          </motion.div>

          <motion.p
            className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 mb-12 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.2 } }}
          >
            Secure enterprise messaging platform with real-time translation, end-to-end encryption, and global infrastructure.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.4 } }}
            className="inline-flex flex-col sm:flex-row gap-4"
          >
            <Link
              href="/auth"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-br from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 rounded-xl text-white shadow-lg hover:shadow-xl transition-all"
            >
              <span>Get Started</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </motion.div>
        </section>

        <section id="features" className="mb-32">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                className="group p-8 rounded-2xl bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm border border-neutral-200/50 dark:border-neutral-700/50 hover:border-sky-500/30 transition-all"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <div className="mb-6">
                  <feature.icon className="w-12 h-12 text-sky-500 group-hover:text-purple-500 transition-colors" />
                </div>
                <h3 className={`${spaceGrotesk.className} text-2xl mb-4`}>{feature.name}</h3>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="tech-stack" className="mb-32">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
          >
            <h2 className={`${spaceGrotesk.className} text-4xl mb-4`}>Technology Stack</h2>
            <p className="text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto">
              Built with modern tools and technologies for peak performance
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {techStack.map((tech, i) => (
              <motion.div
                key={i}
                className="p-6 rounded-xl bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm border border-neutral-200/50 dark:border-neutral-700/50 hover:border-sky-500/30 transition-all flex flex-col items-center gap-4"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                <tech.icon className={`w-14 h-14 ${tech.color} transition-transform hover:scale-110`} />
                <span className={`${spaceGrotesk.className} text-sm font-medium`}>{tech.name}</span>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-neutral-200 dark:border-neutral-800 py-12 px-6 md:px-12 bg-white/50 dark:bg-neutral-800/50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-neutral-600 dark:text-neutral-400">
          <div className={`${spaceGrotesk.className} mb-4 md:mb-0 text-lg`}>
            Relay<span className="text-sky-500">cat</span>
          </div>
          <div className="flex gap-6 mb-4 md:mb-0">
            <Link href="#" className="hover:text-sky-500 transition-colors">Documentation</Link>
            <Link href="#" className="hover:text-sky-500 transition-colors">Security</Link>
            <Link href="#" className="hover:text-sky-500 transition-colors">Status</Link>
          </div>
          <div className="text-sm">
            © {new Date().getFullYear()} Relaycat. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing; 