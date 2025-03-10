import NavigationSidebar from "@/features/server/navigation/navigation-sidebar";
import { ModalProvider } from "@/shared/providers/modal-provider";
import { QueryProvider } from "@/shared/providers/query-provider";
import SocketProvider from "@/shared/providers/socket-provider";
import { getAuthTokenOnServer } from "@/shared/utils/server";
const MainLayout: React.FC<{ children: React.ReactNode }> = async ({ children }) => {
  const authToken = await getAuthTokenOnServer();

  return <div className="h-full">
    <SocketProvider >
      <QueryProvider>
        <ModalProvider />
        <aside className="hidden md:flex h-full w-0 md:w-[72px] z-30 flex-col fixed inset-y-0">
          <NavigationSidebar />
        </aside>
        <main className="md:pl-[72px] h-full">
          {children}
        </main>
      </QueryProvider>
    </SocketProvider>
  </div>
}

export default MainLayout;  