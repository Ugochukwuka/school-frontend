import { Toaster } from "./components/ui/sonner";
import "./cbt-theme.css";

/**
 * Root layout for the CBT dashboard.
 * Isolated from the main School ERP layout — uses its own styling and structure.
 */
export default function CbtRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="cbt-root min-h-screen min-h-[100dvh] overflow-x-hidden bg-slate-100">
      {children}
      <Toaster />
    </div>
  );
}
