import { Header } from "./Header";
import { Toaster } from "@/components/ui/toaster";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col">
      {/* Sticky Header 
        Note: The 'sticky' behavior is defined inside the Header component classes 
      */}
      <Header />
      
      {/* Main Content Area 
        flex-1: Pushes the footer down (if you add one later)
        w-full: Ensures full width constraints
        overflow-x-hidden: Prevents horizontal scrolling from wide tables/charts
      */}
      <main className="flex-1 w-full relative overflow-x-hidden">
        {children}
      </main>

      {/* Global Toaster 
        This renders the toast notifications triggered from any child component 
      */}
      <Toaster />
    </div>
  );
}