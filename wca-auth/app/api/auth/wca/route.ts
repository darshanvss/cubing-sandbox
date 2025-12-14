import { NextResponse } from "next/server";

const WCA_BASE_URL = "https://www.worldcubeassociation.org";
const WCA_OAUTH_AUTHORIZE_URL = `${WCA_BASE_URL}/oauth/authorize`;

export async function GET() {
  const clientId = process.env.WCA_CLIENT_ID;
  const redirectUri = process.env.WCA_REDIRECT_URI || `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/auth/callback`;
  const scope = process.env.WCA_SCOPE || "public email";

  if (!clientId) {
    return NextResponse.json(
      { error: "WCA_CLIENT_ID is not configured" },
      { status: 500 }
    );
  }

  // Generate state for CSRF protection
  const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
  // Store state in a cookie (in production, use httpOnly, secure cookies)
  const response = NextResponse.redirect(
    `${WCA_OAUTH_AUTHORIZE_URL}?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&state=${state}`
  );
  
  response.cookies.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
  });

  return response;
}
