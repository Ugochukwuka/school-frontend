import { Metadata } from "next";
import NotFound404 from "./components/NotFound404";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";

export const metadata: Metadata = {
  title: "404 - Page Not Found",
  description: "The page you're looking for doesn't exist.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <NotFound404 />
      <Footer />
    </div>
  );
}
