import { NotificationProvider } from "@/features/notifications/notification-provider";
import { PresenceProvider } from "@/features/presence/presence-provider";
import NavigationSidebar from "@/features/server/navigation/navigation-sidebar";
import { AuthGuard } from "@/shared/components/auth-guard";
import { OnboardingGate } from "@/shared/components/onboarding-gate";
import { ModalProvider } from "@/shared/providers/modal-provider";
import { SocketProvider } from "@/shared/providers/socket-provider";
import { Ubuntu } from "next/font/google";

const ubuntuFont = Ubuntu({ subsets: ['latin'], weight: ["300"] })

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  return <div className={`h-full ${ubuntuFont.className}`}>
    <AuthGuard>
      <OnboardingGate>
        <SocketProvider >
          <PresenceProvider>
            <NotificationProvider>
              <ModalProvider />
              <aside className="hidden md:flex h-full w-0 md:w-18 z-30 flex-col fixed inset-y-0">
                <NavigationSidebar />
              </aside>
              <main className="md:pl-18 h-full">
                {children}
              </main>
            </NotificationProvider>
          </PresenceProvider>
        </SocketProvider>
      </OnboardingGate>
    </AuthGuard>
  </div>
}

export default MainLayout; 