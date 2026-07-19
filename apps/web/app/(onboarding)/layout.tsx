import { AuthGuard } from "@/shared/components/auth-guard";
import { Ubuntu } from "next/font/google";

const ubuntuFont = Ubuntu({ subsets: ["latin"], weight: ["300"] });

/**
 * Deliberately outside the `(main)` shell: no sidebar, no socket/presence
 * providers, and — critically — no OnboardingGate, which lives in `(main)` and
 * would otherwise redirect this route back onto itself.
 */
const OnboardingLayout = ({ children }: { children: React.ReactNode }) => (
  <div className={`min-h-screen bg-muted/40 dark:bg-background ${ubuntuFont.className}`}>
    <AuthGuard>
      <div className="flex min-h-screen items-center justify-center p-4 sm:p-8">
        {children}
      </div>
    </AuthGuard>
  </div>
);

export default OnboardingLayout;
