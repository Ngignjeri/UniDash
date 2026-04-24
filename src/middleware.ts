import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role as string | undefined;
    const { pathname } = req.nextUrl;

    if (pathname.startsWith("/student") && role !== "STUDENT") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (pathname.startsWith("/retailer") && role !== "RETAILER") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (pathname.startsWith("/rider") && role !== "RIDER") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  },
);

export const config = {
  matcher: ["/student/:path*", "/retailer/:path*", "/rider/:path*"],
};
