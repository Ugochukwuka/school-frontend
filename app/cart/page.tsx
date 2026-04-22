import Link from "next/link";

export default function CartPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-3xl rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="mb-3 text-2xl font-bold text-slate-900">Your Cart</h1>
        <p className="mb-6 text-slate-600">
          Your selected items will appear here. Continue browsing courses and add items to begin checkout.
        </p>

        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-600">
          No items in cart yet.
        </div>

        <div className="mt-6">
          <Link
            href="/courses"
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Continue Browsing Courses
          </Link>
        </div>
      </div>
    </main>
  );
}
