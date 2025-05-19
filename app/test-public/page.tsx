"use client";

import Link from "next/link";

export default function TestPublicPage() {
  console.log("[TestPublicPage] Rendering.");
  return (
    <div style={{ padding: "50px", textAlign: "center" }}>
      <h1>Test Public Page</h1>
      <p>
        If you can see this, client-side navigation to a new public page is
        working.
      </p>
      <Link href="/">
        <button>Go to Home Page</button>
      </Link>
    </div>
  );
}
