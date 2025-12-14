"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface OAuthData {
  access_token?: string;
  token_type?: string;
  expires_in?: string;
  created_at?: string;
  scope?: string;
  user_data?: any;
  error?: string;
  error_description?: string;
}

export default function Home() {
  const [oauthData, setOauthData] = useState<OAuthData>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get OAuth data from URL params
    const params = new URLSearchParams(window.location.search);
    const data: OAuthData = {};

    if (params.get("success") === "true") {
      data.access_token = params.get("access_token") || undefined;
      data.token_type = params.get("token_type") || undefined;
      data.expires_in = params.get("expires_in") || undefined;
      data.created_at = params.get("created_at") || undefined;
      data.scope = params.get("scope") || undefined;
    }

    if (params.get("error")) {
      data.error = params.get("error") || undefined;
      data.error_description = params.get("error_description") || undefined;
    }

    // Get token data from cookie (if not in URL params)
    const cookies = document.cookie.split(";");
    const tokenDataCookie = cookies.find((c) => c.trim().startsWith("wca_token_data="));
    if (tokenDataCookie && !data.access_token) {
      try {
        const tokenDataStr = tokenDataCookie.split("=")[1];
        const tokenData = JSON.parse(decodeURIComponent(tokenDataStr));
        data.access_token = tokenData.access_token;
        data.token_type = tokenData.token_type;
        data.expires_in = tokenData.expires_in?.toString();
        data.created_at = tokenData.created_at?.toString();
        data.scope = tokenData.scope;
      } catch (e) {
        console.error("Error parsing token data:", e);
      }
    }

    // Get user data from cookie
    const userDataCookie = cookies.find((c) => c.trim().startsWith("wca_user_data="));
    if (userDataCookie) {
      try {
        const userDataStr = userDataCookie.split("=")[1];
        data.user_data = JSON.parse(decodeURIComponent(userDataStr));
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }

    setOauthData(data);

    // Clean up URL
    if (params.toString()) {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const handleLogin = () => {
    setLoading(true);
    window.location.href = "/api/auth/wca";
  };

  const handleLogout = () => {
    // Clear all OAuth-related cookies
    document.cookie = "wca_user_data=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "wca_token_data=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "oauth_state=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    
    // Reset state
    setOauthData({});
    
    // Clear URL params
    window.history.replaceState({}, "", window.location.pathname);
  };

  const formatJSON = (obj: any) => {
    return JSON.stringify(obj, null, 2);
  };

  const isLoggedIn = !!(oauthData.access_token || oauthData.user_data);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">WCA OAuth Explorer</h1>
          <p className="text-muted-foreground">
            Learn about WCA OAuth flow, scopes, tokens, and user data
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>OAuth Flow</CardTitle>
            <CardDescription>
              {isLoggedIn 
                ? "You are logged in. Click logout to clear your session."
                : "Click the button below to initiate the WCA OAuth login flow"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            {!isLoggedIn ? (
              <Button onClick={handleLogin} disabled={loading} size="lg" className="w-full sm:w-auto">
                {loading ? "Redirecting..." : "Login with WCA"}
              </Button>
            ) : (
              <Button onClick={handleLogout} variant="outline" size="lg" className="w-full sm:w-auto">
                Logout
              </Button>
            )}
          </CardContent>
        </Card>

        {oauthData.error && (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">OAuth Error</CardTitle>
              <CardDescription>An error occurred during the OAuth flow</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-semibold mb-2">Error Code:</p>
                <code className="block p-3 bg-muted rounded-md text-sm">
                  {oauthData.error}
                </code>
              </div>
              {oauthData.error_description && (
                <div>
                  <p className="text-sm font-semibold mb-2">Error Description:</p>
                  <code className="block p-3 bg-muted rounded-md text-sm">
                    {oauthData.error_description}
                  </code>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {oauthData.access_token && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Access Token Response</CardTitle>
                <CardDescription>
                  Data returned from the token exchange endpoint
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-semibold mb-2">Access Token:</p>
                  <code className="block p-3 bg-muted rounded-md text-sm break-all">
                    {oauthData.access_token}
                  </code>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2">Token Type:</p>
                  <code className="block p-3 bg-muted rounded-md text-sm">
                    {oauthData.token_type}
                  </code>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2">Expires In (seconds):</p>
                  <code className="block p-3 bg-muted rounded-md text-sm">
                    {oauthData.expires_in}
                  </code>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2">Created At (timestamp):</p>
                  <code className="block p-3 bg-muted rounded-md text-sm">
                    {oauthData.created_at}
                  </code>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2">Scopes:</p>
                  <code className="block p-3 bg-muted rounded-md text-sm">
                    {oauthData.scope || "No scopes returned"}
                  </code>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Full Token Response (JSON)</CardTitle>
                <CardDescription>
                  Complete JSON response from the token endpoint
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="p-4 bg-muted rounded-md text-sm overflow-auto">
                  {formatJSON({
                    access_token: oauthData.access_token,
                    token_type: oauthData.token_type,
                    expires_in: oauthData.expires_in,
                    created_at: oauthData.created_at,
                    scope: oauthData.scope,
                  })}
                </pre>
              </CardContent>
            </Card>
          </>
        )}

        {oauthData.user_data && (
          <Card>
            <CardHeader>
              <CardTitle>User Data (/api/v0/me)</CardTitle>
              <CardDescription>
                User information fetched using the access token
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="p-4 bg-muted rounded-md text-sm overflow-auto">
                {formatJSON(oauthData.user_data)}
              </pre>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
            <CardDescription>Understanding the WCA OAuth flow</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">1. Authorization Request</h3>
              <p className="text-sm text-muted-foreground mb-2">
                When you click "Login with WCA", you're redirected to:
              </p>
              <code className="block p-3 bg-muted rounded-md text-sm">
                https://www.worldcubeassociation.org/oauth/authorize?client_id=...&redirect_uri=...&response_type=code&scope=...
              </code>
            </div>
            <div>
              <h3 className="font-semibold mb-2">2. User Authorization</h3>
              <p className="text-sm text-muted-foreground">
                You log in to WCA and authorize the application. WCA redirects back with an
                authorization code.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">3. Token Exchange</h3>
              <p className="text-sm text-muted-foreground mb-2">
                The callback route exchanges the authorization code for an access token:
              </p>
              <code className="block p-3 bg-muted rounded-md text-sm">
                POST /oauth/token with grant_type=authorization_code, code, client_id, client_secret
              </code>
            </div>
            <div>
              <h3 className="font-semibold mb-2">4. API Access</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Use the access token to make authenticated API requests:
              </p>
              <code className="block p-3 bg-muted rounded-md text-sm">
                GET /api/v0/me with Authorization: Bearer {`{access_token}`}
              </code>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Available Scopes</h3>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-2">
                <li>
                  <code className="bg-muted px-1.5 py-0.5 rounded">public</code> - Basic public information (default scope)
                </li>
                <li>
                  <code className="bg-muted px-1.5 py-0.5 rounded">email</code> - Access to email address and email verification status
                </li>
                <li>
                  <code className="bg-muted px-1.5 py-0.5 rounded">dob</code> - Access to date of birth
                </li>
                <li>
                  <code className="bg-muted px-1.5 py-0.5 rounded">profile</code> - Access to profile information (name, nickname, picture, etc.)
                </li>
                <li>
                  <code className="bg-muted px-1.5 py-0.5 rounded">openid</code> - OpenID Connect scope. Enables OIDC authentication and returns an ID token with user identification (sub claim). Required for OpenID Connect flows. When used with <code className="bg-muted px-1.5 py-0.5 rounded">profile</code> or <code className="bg-muted px-1.5 py-0.5 rounded">email</code>, provides additional user claims.
                </li>
                <li>
                  <code className="bg-muted px-1.5 py-0.5 rounded">manage_competitions</code> - Manage competitions (create, edit, delete)
                </li>
                <li>
                  <code className="bg-muted px-1.5 py-0.5 rounded">cms</code> - Content Management System access. Allows managing content on the WCA website (create, edit, delete content). Typically requires specific WCA roles/permissions.
                </li>
                <li>
                  <code className="bg-muted px-1.5 py-0.5 rounded">delegate</code> - Delegate permissions (for WCA delegates)
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
