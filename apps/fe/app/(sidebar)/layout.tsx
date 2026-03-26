import Sidebar from "../../components/Sidebar";

export default function SidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#030005]">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 min-h-screen relative overflow-y-auto">
        {/* Background decorative glows */}
        <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-[#7000ff]/5 blur-[120px] pointer-events-none -z-10" />
        <div className="fixed bottom-0 left-64 w-[500px] h-[500px] bg-[#00f0ff]/5 blur-[120px] pointer-events-none -z-10" />
        
        {children}
      </main>
    </div>
  );
}
