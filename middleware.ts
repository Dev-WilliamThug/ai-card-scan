import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
	const sessionCookie = getSessionCookie(request);


	const isProtectedRoute = request.nextUrl.pathname.startsWith("/contacts") || request.nextUrl.pathname.startsWith("/scan");
	if ( isProtectedRoute && !sessionCookie) {
		return NextResponse.redirect(new URL("/sign-in", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/contacts/:path*", "/scan/:path*"], 
};