import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Personal single-user app: Basic Auth is opt-in via APP_PASSWORD.
// Leave APP_PASSWORD unset to keep the app open.
export function proxy(request: NextRequest) {
  const appPassword = process.env.APP_PASSWORD;
  if (!appPassword) return NextResponse.next();

  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Basic ")) {
    const [, password] = atob(auth.slice(6)).split(":");
    if (password === appPassword) return NextResponse.next();
  }

  return new NextResponse("Auth required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="NY Trip Planner"' },
  });
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};
