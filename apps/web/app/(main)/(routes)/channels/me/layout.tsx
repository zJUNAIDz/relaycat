import { DmSidebar } from "@/features/conversation/components/dm-sidebar";

const MeLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="h-full">
      <div className="hidden md:flex h-full w-60 z-20 fixed inset-y-0">
        <DmSidebar />
      </div>
      <main className="h-full md:pl-60">{children}</main>
    </div>
  );
};

export default MeLayout;
