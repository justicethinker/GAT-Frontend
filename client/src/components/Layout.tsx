import { Header } from "./Header";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="h-screen overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 bg-black">
      <Header />
      {children}
    </div>
  );
}
