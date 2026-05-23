"use client";

import { Button } from "@/shared/components/ui/button";
import { useTheme } from "@wrksz/themes/client";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "../utils/cn";

export function ModeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="outline" className="bg-transparent border-0" size="icon" disabled>
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      </Button>
    );
  }

  const isDark = theme === "dark";

  return (
    <Button
      variant="outline"
      className="bg-transparent border-0 text-foreground"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      <Sun
        className={cn(
          "h-[1.2rem] w-[1.2rem] transition-all",
          isDark ? "rotate-90 scale-0" : "rotate-0 scale-100 text-yellow-500"
        )}
      />
      <Moon
        className={cn(
          "absolute h-[1.2rem] w-[1.2rem] transition-all",
          isDark ? "rotate-0 scale-100 text-gray-400" : "-rotate-90 scale-0 "
        )}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}