import { Header } from "./Header";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-emerald-500/30 flex flex-col">
      {/* Header is sticky (defined in Header.tsx), so it stays visible 
        as the user scrolls the window.
      */}
      <Header />
      
      {/* Main Content Area:
        - flex-1: Ensures it fills available vertical space if content is short.
        - w-full: Prevents horizontal overflow issues.
        - relative: Establishes a positioning context for children.
      */}
      <main className="flex-1 w-full relative">
        {children}
      </main>
    </div>
  );
}