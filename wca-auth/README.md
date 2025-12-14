# WCA OAuth Explorer

A Next.js application for exploring and learning about the World Cube Association (WCA) OAuth authentication flow. This app demonstrates how WCA OAuth works, what scopes are available, what data you get back, and how the callback process works.

## Features

- 🔐 Complete WCA OAuth 2.0 Authorization Code Flow implementation
- 📊 Visual display of OAuth tokens, scopes, and user data
- 📚 Educational content explaining each step of the OAuth flow
- 🎨 Beautiful UI built with shadcn/ui components

## Setup

### 1. Create a WCA OAuth Application

1. Go to [WCA OAuth Applications](https://www.worldcubeassociation.org/oauth/applications)
2. Create a new OAuth application
3. Set the redirect URI to: `http://localhost:3000/api/auth/callback` (for local development)
4. Note down your **Client ID** and **Client Secret**

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# WCA OAuth Configuration
WCA_CLIENT_ID=your_client_id_here
WCA_CLIENT_SECRET=your_client_secret_here
WCA_REDIRECT_URI=http://localhost:3000/api/auth/callback
WCA_SCOPE=public email
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. Install Dependencies

```bash
pnpm install
# or
npm install
# or
yarn install
```

### 4. Run the Development Server

```bash
pnpm dev
# or
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## How It Works

### OAuth Flow Steps

1. **Authorization Request**: Click "Login with WCA" to initiate the flow
2. **User Authorization**: You'll be redirected to WCA to log in and authorize the app
3. **Token Exchange**: The callback route exchanges the authorization code for an access token
4. **API Access**: Use the access token to fetch user data from `/api/v0/me`

### Available Scopes

- `public` - Basic public information
- `email` - Access to email address
- `dob` - Access to date of birth
- `manage_competitions` - Manage competitions
- `delegate` - Delegate permissions

## Project Structure

```
wca-auth/
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── wca/
│   │       │   └── route.ts      # Initiates OAuth flow
│   │       └── callback/
│   │           └── route.ts      # Handles OAuth callback
│   ├── page.tsx                  # Main page displaying OAuth info
│   └── layout.tsx
├── components/
│   └── ui/                       # shadcn/ui components
└── .env.local                    # Your environment variables (not committed)
```

## Learn More

- [WCA API Documentation](https://www.worldcubeassociation.org/api/)
- [Next.js Documentation](https://nextjs.org/docs)
- [OAuth 2.0 Specification](https://oauth.net/2/)
