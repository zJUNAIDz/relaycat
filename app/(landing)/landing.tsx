"use client";
import { Ubuntu } from "next/font/google"
import { OrbitControls, Stars } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { motion, useAnimation, useMotionValue, useTransform } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FaAws } from "react-icons/fa";
import { PiChat, PiCloud, PiCloudBold, PiHandWaving, PiNetwork, PiShieldCheck } from "react-icons/pi";
import { SiBun, SiHono, SiNextdotjs, SiPostgresql, SiSocketdotio, SiTailwindcss, SiTypescript } from "react-icons/si";
import { Button } from "@/shared/components/ui/button";
import { logout } from "@/shared/lib/actions";
import Image from "next/image";

const ubuntuFont = Ubuntu({ weight: "700", subsets: ["latin"] })

const techStack = [
  { icon: SiNextdotjs, name: "Next.js", color: "dark:text-white text-gray-900" },
  { icon: SiTailwindcss, name: "TailwindCSS", color: "text-blue-600 dark:text-blue-400" },
  { icon: SiPostgresql, name: "PostgreSQL", color: "text-blue-600 dark:text-blue-400" },
  { icon: SiTypescript, name: "TypeScript", color: "text-blue-600 dark:text-blue-400" },
  { icon: SiHono, name: "Hono.js", color: "text-[#FF4911]" },
  { icon: FaAws, name: "AWS", color: "text-yellow-600 dark:text-yellow-400" },
  { icon: SiSocketdotio, name: "Socket.io", color: "text-green-600 dark:text-green-400" },
  { icon: SiBun, name: "Bun.js", color: "text-white-600 dark:text-white-400" },
];

const features = [
  { icon: PiCloud, name: "Cloud Native", description: "Deployed on AWS Lambda and Vercel" },
  { icon: PiChat, name: "Real-Time Chat", description: "Instant messaging with end-to-end encryption and real-time translation" },
  { icon: PiShieldCheck, name: "Secure Channels", description: "Built with WebSockets for secure communication with multi-factor authentication" },
  { icon: PiNetwork, name: "Global Network", description: "Low-latency servers across 50+ countries worldwide" },
  { icon: PiHandWaving, name: "User Friendly", description: "Easy to use and intuitive interface" },
  { icon: PiCloudBold, name: "Cloud Sync", description: "Seamless cloud synchronization across all devices" },
];

const FloatingParticles = () => {
  return (
    <Canvas className="fixed inset-0 -z-10">
      <ambientLight intensity={0.5} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
      <OrbitControls enableZoom={false} />
    </Canvas>
  );
};

const useMousePosition = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return { mouseX, mouseY };
};

const TiltComponent = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const { mouseX, mouseY } = useMousePosition();
  const [isHovered, setIsHovered] = useState(false);

  const rotateX = useTransform(mouseY, (val) => {
    if (!ref.current) return 0;
    const { top, height } = ref.current.getBoundingClientRect();
    const centerY = top + height / 2;
    return (val - centerY) / 25;
  });

  const rotateY = useTransform(mouseX, (val) => {
    if (!ref.current) return 0;
    const { left, width } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    return (val - centerX) / 25;
  });

  return (
    <motion.div
      ref={ref}
      style={{
        rotateX: isHovered ? rotateX : 0,
        rotateY: isHovered ? rotateY : 0,
        transformPerspective: 1000,
      }}
      className={className}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      animate={controls}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.div>
  );
};
const TechIcon = ({ icon: Icon, name, color }: any) => (
  <TiltComponent>
    <div className={`p-8 rounded-3xl border backdrop-blur-xl dark:border-blue-400/20 border-blue-600/30 ${color}`}>
      <Icon className="w-24 h-24 mx-auto mb-6 transition-transform duration-300 hover:scale-110" />
      <h3 className="text-2xl font-semibold text-center">{name}</h3>
    </div>
  </TiltComponent>
);

const Landing = ({ user }: { user: User | null }) => {
  console.log("user: ", user?.image)
  return (
    <div className="bg-gradient-to-br from-white via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-gray-800 text-gray-900 dark:text-gray-100">
      <FloatingParticles />

      <nav className="fixed w-full top-0 backdrop-blur-lg z-50 py-4 px-8 flex justify-between items-center border-b dark:border-blue-400/20 border-blue-200/50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent"
        >
          <span className={ubuntuFont.className}>
            Relaycat
          </span>
        </motion.div>
        {
          user ? (
            <div className="flex items-center gap-x-3">
              <div className="relative flex h-5 w-5 md:h-10 md:w-10 rounded-full">
                <Image fill src={user.image} alt="user avatar" className="flex h-5 w-5 md:h-10 md:w-10 rounded-full" />
              </div>
              <Button onClick={async () => await logout()} className="px-4 py-2 rounded-full bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors">Log Out</Button>
            </div>
          ) : (
            <div className="flex gap-4">
              <Link href="/auth?login=" className="px-4 py-2 rounded-full bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors">Login</Link>
              <Link href="/auth" className="px-4 py-2 rounded-full bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors">Sign Up</Link>
            </div>
          )
        }
      </nav>

      <section className="min-h-screen flex items-center justify-center px-8 md:px-16 lg:px-24">
        <motion.div
          className="grid grid-cols-1 w-full max-w-7xl "
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <div className="flex flex-col justify-center space-y-8">
            <motion.h1
              className="text-4xl md:text-9xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent flex flex-col justify-center items-center gap-y-5"
              initial={{ x: -100 }}
              animate={{ x: 0 }}
              transition={{ type: "spring", stiffness: 50 }}
            >
              RelayCat
              <br />
              <span className="text-4xl md:text-6xl font-medium bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
                Fast. Connected. Inspired.
              </span>
            </motion.h1>

            <motion.div
              className="flex gap-7 justify-center"
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Link href="/auth" className="flex items-center">
                <motion.button
                  className="px-8 py-4 rounded-xl text-lg font-medium bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get Started
                </motion.button>
              </Link>
            </motion.div>
          </div>

          {/* <motion.div
            className="relative rounded-3xl backdrop-blur-xl border dark:border-blue-400/20 border-blue-200/30 p-8"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="aspect-video bg-white/5 rounded-xl flex items-center justify-center">
              <PiCloud className="w-32 h-32 text-blue-400 animate-pulse" />
            </div>
          </motion.div> */}
        </motion.div>
      </section>

      {features.map((feature, i) => (
        <section key={i} className="min-h-[70vh] flex items-center px-8 md:px-16 lg:px-24 py-24">
          <motion.div
            className="w-full max-w-7xl mx-auto rounded-[3rem] backdrop-blur-xl border dark:border-blue-400/20 border-blue-200/30 p-12 bg-white/10 dark:bg-gray-900/20"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <div className={`flex flex-col md:flex-row items-center gap-16 ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
              <motion.div
                className="flex-1 aspect-video bg-white/5 rounded-xl flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
              >
                <feature.icon className="w-32 h-32 text-purple-400 animate-pulse" />
              </motion.div>
              <div className="flex-1 space-y-6">
                <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                  {feature.name}
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          </motion.div>
        </section>
      ))
      }

      <section className="min-h-screen flex items-center px-8 md:px-16 lg:px-24 py-24">
        <div className="w-full max-w-7xl mx-auto space-y-20">
          <motion.h2
            className="text-5xl md:text-6xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Modern Tech Stack
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 perspective-1000">
            {techStack.map((tech, index) => (
              <TechIcon key={tech.name} {...tech} />
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t dark:border-blue-400/20 border-blue-200/30 py-16 px-8 md:px-16 lg:px-24">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <motion.div
            className="text-xl text-blue-600 dark:text-blue-400"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
          >
            Created by {" "}
            <a
              href="https://github.com/zjunaidz"
              className="underline hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Junaid
            </a>
          </motion.div>
          <p className="text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} Relaycat. All rights reserved.
          </p>
        </div>
      </footer>
    </div >
  );
};

export default Landing;