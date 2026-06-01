"use client";

import { ModeToggle } from "@/shared/components/mode-toggle";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { authClient, User } from "@/shared/lib/auth-client";
import { PAGE_ROUTES } from "@/shared/lib/routes";
import { useAuth } from "@/shared/providers/auth-provider";
import { motion } from "framer-motion";
import { FolderGit, MessageSquare, MoveRight, Server, Zap } from "lucide-react";
import { Inter, Space_Grotesk } from "next/font/google";
import Link from "next/link";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["700"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

const features = [
  {
    title: "Real-time WebSockets",
    description: "Powered by Socket.io and Hono to ensure messages and presence updates are delivered instantly without polling.",
    icon: <Zap className="h-5 w-5 text-primary" />,
  },
  {
    title: "Server & Channel Architecture",
    description: "A familiar mental model. Organize communities into servers and categorize discussions into dedicated text channels.",
    icon: <Server className="h-5 w-5 text-primary" />,
  },
  {
    title: "Direct Messaging",
    description: "Seamless one-to-one conversations that exist outside of the server environment for private chats.",
    icon: <MessageSquare className="h-5 w-5 text-primary" />,
  },
  {
    title: "Modern Tech Stack",
    description: "Built from the ground up using Next.js, Bun, and Hono to explore full-stack architecture and real-time state management.",
    icon: <FolderGit className="h-5 w-5 text-primary" />,
  },
];

const techStack = [
  "Typescript",
  "Next.js 16 App Router",
  "Bun",
  "Hono",
  "Socket.io",
  "Tailwind CSS",
  "Framer Motion",
  "Shadcn UI",
  "Postgres with Drizzle ORM",
  "Docker",
  "Better-Auth",
  "AWS S3",
  "Tanstack Query",
  "Zod",
  "Zustand",
];

const Landing = () => {
  const { user, isLoading } = useAuth();

  return (
    <div className={`${inter.className} relative min-h-screen overflow-hidden bg-background text-foreground selection:bg-primary/30`}>
      {/* Sleeker, modern background */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-slate-200/40 via-background to-background dark:from-slate-800/40" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-size-[32px_32px]" />

      <Navbar isLoading={isLoading} user={user} />

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-24 px-6 pb-24 pt-32 md:px-10 lg:pt-40">
        <HeroSection />
        <FeatureSection />
      </main>
    </div>
  );
};

const Navbar = ({ isLoading, user }: { isLoading: boolean; user: User | null }) => {
  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-50 border-b border-border/40 bg-background/60 backdrop-blur-xl"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6 md:px-10">
        <Link href={PAGE_ROUTES.LANDING} className={`text-xl font-bold tracking-tight ${spaceGrotesk.className}`}>
          Relay<span className="text-primary">cat</span>
        </Link>

        <div className="flex items-center gap-4">
          <NavbarAuth isLoading={isLoading} user={user} />
        </div>
      </div>
    </motion.header>
  );
};

const NavbarAuth = ({ isLoading, user }: { isLoading: boolean; user: User | null }) => {
  if (isLoading) {
    return <div className="h-9 w-20 animate-pulse rounded-md bg-muted" aria-hidden />;
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => authClient.signOut()}>
          Sign out
        </Button>
        <ModeToggle />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button asChild size="sm" className="rounded-full px-5">
        <Link href={PAGE_ROUTES.AUTH}>Sign in</Link>
      </Button>
      <ModeToggle />
    </div>
  );
};

const HeroSection = () => {
  return (
    <section className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
      <motion.div
        className="space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >

        <div className="space-y-6">
          <h1 className={`${spaceGrotesk.className} max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl lg:leading-[1.1]`}>
            A Discord-inspired chat app built for the modern web.
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
            Relaycat isn&apos;t an enterprise SaaS. It&apos;s a hands-on technical exploration of real-time web technologies, authentication flows, and complex UI state management.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Button asChild variant="outline" size="lg" className="group rounded-full px-8">
            <Link href={PAGE_ROUTES.AUTH}>
              Enter the App
              <MoveRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>

        </div>

        <div className="pt-4">
          <p className="mb-3 text-sm font-medium text-muted-foreground">Built with</p>
          <div className="flex flex-wrap gap-2">
            {techStack.map((tech) => (
              <Badge key={tech} variant="outline" className="bg-background/50 text-xs text-muted-foreground">
                {tech}
              </Badge>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="overflow-hidden border-border/50 bg-background/50 shadow-2xl backdrop-blur-sm">
          <div className="border-b border-border/50 bg-muted/30 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500/80" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
              <div className="h-3 w-3 rounded-full bg-green-500/80" />
            </div>
          </div>
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg">Project Scope</CardTitle>
            <CardDescription>
              What to expect when testing this application.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="rounded-md border border-border/50 bg-background/50 p-3">
              <span className="font-semibold text-foreground">Functional:</span> Auth, real-time messaging, server creation, channel navigation.
            </div>
            <div className="rounded-md border border-border/50 bg-background/50 p-3">
              <span className="font-semibold text-foreground">In Progress:</span> Voice channels, deep notification systems, mobile responsiveness.
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
};

const FeatureSection = () => {
  return (
    <section className="space-y-10">
      <div className="max-w-2xl space-y-3">
        <h2 className={`text-3xl font-bold tracking-tight ${spaceGrotesk.className}`}>
          Core Features
        </h2>
        <p className="text-muted-foreground text-lg">
          Tackling the engineering challenges behind a real-time communication platform.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="group h-full border-border/50 bg-background/50 transition-colors hover:border-primary/50 hover:bg-muted/20">
              <CardHeader>
                <div className="mb-3 w-fit rounded-lg bg-primary/10 p-2.5">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Landing;