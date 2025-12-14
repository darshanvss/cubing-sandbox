import { NextRequest, NextResponse } from "next/server";

const WCA_BASE_URL = "https://www.worldcubeassociation.org";
const WCA_OAUTH_TOKEN_URL = `${WCA_BASE_URL}/oauth/token`;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // Check for OAuth errors
  if (error) {
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(error)}&error_description=${encodeURIComponent(errorDescription || "")}`, request.url)
    );
  }

  // Verify state
  const storedState = request.cookies.get("oauth_state")?.value;
  if (!storedState || state !== storedState) {
    return NextResponse.redirect(
      new URL("/?error=invalid_state&error_description=State mismatch", request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/?error=no_code&error_description=No authorization code received", request.url)
    );
  }

  const clientId = process.env.WCA_CLIENT_ID;
  const clientSecret = process.env.WCA_CLIENT_SECRET;
  const redirectUri = process.env.WCA_REDIRECT_URI || `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/auth/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      new URL("/?error=config_error&error_description=OAuth credentials not configured", request.url)
    );
  }

  try {
    // Exchange authorization code for access token
    const tokenResponse = await fetch(WCA_OAUTH_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      return NextResponse.redirect(
        new URL(`/?error=token_exchange_failed&error_description=${encodeURIComponent(errorData)}`, request.url)
      );
    }

    const tokenData = await tokenResponse.json();

    // Fetch user info using the access token
    let userData = null;
    try {
      const userResponse = await fetch(`${WCA_BASE_URL}/api/v0/me`, {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      });

      if (userResponse.ok) {
        userData = await userResponse.json();
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
    }

    // Store token data in a cookie (in production, use httpOnly, secure cookies)
    // For this demo, we'll pass it via query params to display on the page
    const response = NextResponse.redirect(
      new URL(
        `/?success=true&access_token=${encodeURIComponent(tokenData.access_token || "")}&token_type=${encodeURIComponent(tokenData.token_type || "")}&expires_in=${tokenData.expires_in || ""}&created_at=${tokenData.created_at || ""}&scope=${encodeURIComponent(tokenData.scope || "")}`,
        request.url
      )
    );

    // Clear the state cookie
    response.cookies.delete("oauth_state");

    // Store token data in a cookie (for demo purposes, not httpOnly so we can display it)
    response.cookies.set("wca_token_data", JSON.stringify(tokenData), {
      httpOnly: false, // Set to true in production
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 3600, // 1 hour
    });

    // Store user data in a cookie (temporary, for demo purposes)
    if (userData) {
      response.cookies.set("wca_user_data", JSON.stringify(userData), {
        httpOnly: false, // Set to true in production
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 3600, // 1 hour
      });
    }

    return response;
  } catch (err) {
    console.error("OAuth callback error:", err);
    return NextResponse.redirect(
      new URL(`/?error=callback_error&error_description=${encodeURIComponent(err instanceof Error ? err.message : "Unknown error")}`, request.url)
    );
  }
}
