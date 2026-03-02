"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Alert, Button } from "antd";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-8">
        <Alert
          type="error"
          showIcon
          message="Something went wrong"
          description={
            <div className="mt-2">
              <p className="text-sm text-gray-600 mb-2">
                A client-side error occurred. Check the browser console for details.
              </p>
              <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-32">
                {error?.message ?? "Unknown error"}
              </pre>
            </div>
          }
        />
        <div className="mt-6 flex gap-3">
          <Button type="primary" onClick={reset}>
            Try again
          </Button>
          <Link href="/">
            <Button>Go home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
