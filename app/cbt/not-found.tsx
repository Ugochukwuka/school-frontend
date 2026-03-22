"use client";

import Link from "next/link";
import { Button } from "./components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const CBT_BASE = "/cbt";

export default function CbtNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-9xl font-bold text-slate-200">404</h1>
          <h2 className="text-3xl font-bold text-slate-900">Page Not Found</h2>
          <p className="text-slate-600 max-w-md mx-auto">
            Sorry, the page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>
        <div className="flex items-center justify-center gap-4">
          <Link href={CBT_BASE}>
            <Button>
              <Home className="w-4 h-4 mr-2" />
              CBT Home
            </Button>
          </Link>
          <Button variant="outline" onClick={() => typeof window !== "undefined" && window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
