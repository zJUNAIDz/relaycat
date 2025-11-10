"use client"
import { useAuth } from "@/shared/providers/auth-provider";
import { ModalProvider } from "@/shared/providers/modal-provider";
import { QueryProvider } from "@/shared/providers/query-provider";
import SocketProvider from "@/shared/providers/socket-provider";
import { Ubuntu } from "next/font/google";
import { redirect } from "next/navigation";

const ubuntuFont = Ubuntu({ subsets: ['latin'], weight: ["300"] })

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return redirect("/auth");
  }
  return <div className={`h-full ${ubuntuFont.className}`}>
    <SocketProvider >
      <QueryProvider>
        <ModalProvider />
        <aside className="hidden md:flex h-full w-0 md:w-[72px] z-30 flex-col fixed inset-y-0">
          {/* <NavigationSidebar /> */}
        </aside>
        <main className="md:pl-[72px] h-full">
          {children}
        </main>
      </QueryProvider>
    </SocketProvider>
  </div>
}

export default MainLayout;  