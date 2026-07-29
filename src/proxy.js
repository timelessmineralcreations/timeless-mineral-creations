import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((request) => {
  const isLoggedIn = !!request.auth;
  const isLoginPage =
    request.nextUrl.pathname === "/admin/login";

  if (isLoginPage) {
    if (isLoggedIn) {
      return NextResponse.redirect(
        new URL("/admin/dashboard", request.url)
      );
    }

    return NextResponse.next();
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(
      new URL("/admin/login", request.url)
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};