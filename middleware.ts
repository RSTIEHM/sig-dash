// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const url = req.nextUrl;

  // 👇 Protect only /dashboard pages
  if (!url.pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  // ✅ Basic Auth check
  if (auth) {
    const [scheme, encoded] = auth.split(" ");
    if (scheme === "Basic") {
      const [user, pass] = atob(encoded).split(":");
      if (user === "sig" && pass === "secure123") {
        return NextResponse.next();
      }
    }
  }

  // 🚫 Not authorized
  return new Response("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Dashboard Access"',
    },
  });
}

export const config = {
  matcher: ["/dashboard/:path*"], // protect all dashboard routes
};
