import { clerkMiddleware } from "@clerk/nextjs/server";

// Protect specific API routes — same behavior as your old middleware
export default clerkMiddleware()

// Define which routes should use the proxy (same as matcher)
export const config = {
  matcher: [
    "/api/cart/:path*",
    "/api/orders/:path*",
    "/api/reviews/:path*",
  ],
};


