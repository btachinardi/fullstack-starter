# Authentication Setup Guide

Complete guide for the Better Auth integration in your fullstack application.

## 🎯 What's Included

### Backend (`libs/auth/api`)
- ✅ Better Auth with Prisma adapter
- ✅ Email/password authentication
- ✅ Session management (7-day expiration)
- ✅ NestJS integration
- ✅ Database schema with User, Session, Account, Verification models

### Frontend (`libs/auth/web`)
- ✅ Better Auth React client
- ✅ Login page with customizable branding
- ✅ Signup page with validation
- ✅ `useAuth()` hook for auth state
- ✅ Logout button component
- ✅ Auth middleware for protected routes

## 🚀 Quick Start

### 1. Environment Setup

**API (.env):**
```bash
# Already configured in apps/api/.env
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
BETTER_AUTH_SECRET="your-secret-key-here"
BETTER_AUTH_URL="http://localhost:3001"
```

**Web (.env.local):**
```bash
# Already created at apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 2. Database Migration

Run the database migration to create auth tables:

```bash
cd apps/api
pnpm db:migrate
```

This command will:
1. Build the Prisma schema tool
2. Compose schemas from all imported libraries
3. Run Prisma migrate to create/update database tables

This creates:
- `users` table (id, email, name, emailVerified, etc.)
- `sessions` table (active user sessions)
- `accounts` table (for OAuth providers)
- `verifications` table (email verification tokens)

### 3. Start Development Servers

```bash
# Terminal 1: Start API
pnpm dev:api

# Terminal 2: Start Web
pnpm dev:web
```

- API: http://localhost:3001
- Web: http://localhost:3000

## 🧪 Testing the Auth Flow

### Step 1: Create Account
1. Navigate to http://localhost:3000/signup
2. Fill in the form:
   - Name: "Test User"
   - Email: "test@example.com"
   - Password: "password123" (min 8 chars)
   - Confirm Password: "password123"
3. Click "Create Account"
4. You should be redirected to `/dashboard`

### Step 2: Verify Dashboard Access
- Dashboard shows your user information
- Logout button in the top right
- Protected by middleware (try accessing without login)

### Step 3: Test Logout
1. Click "Log out" button
2. Should redirect to `/login`
3. Try accessing `/dashboard` - should redirect to login

### Step 4: Test Login
1. Go to http://localhost:3000/login
2. Enter credentials:
   - Email: "test@example.com"
   - Password: "password123"
3. Click "Login"
4. Should redirect to `/dashboard`

### Step 5: Test Middleware Protection
1. Log out if logged in
2. Try to access http://localhost:3000/dashboard directly
3. Should redirect to `/login?from=/dashboard`
4. After login, should redirect back to dashboard

## 🎨 Customizing Branding

The auth pages support customizable branding. Update in your app pages:

**apps/web/app/(auth)/login/page.tsx:**
```tsx
import { LoginPage } from "@libs/auth/web";
import { YourLogo } from "@/components/your-logo";

export default function Page() {
  return (
    <LoginPage
      branding={{
        productName: "Your App Name",
        logo: <YourLogo className="size-6" />,
        termsUrl: "/terms",
        privacyUrl: "/privacy",
      }}
    />
  );
}
```

**Available Branding Options:**
- `productName`: String - Your product/company name
- `logo`: ReactNode - Your logo component
- `termsUrl`: String - Terms of service URL (optional)
- `privacyUrl`: String - Privacy policy URL (optional)

## 📦 Package Structure

```
libs/auth/
├── api/                          # Backend authentication
│   ├── src/
│   │   ├── auth.module.ts       # NestJS module
│   │   ├── auth.config.ts       # Better Auth configuration
│   │   ├── prisma.client.ts     # Prisma client singleton
│   │   └── index.ts             # Exports
│   └── prisma/
│       └── schema.prisma        # Auth database schema
│
└── web/                          # Frontend authentication
    └── src/
        ├── lib/
        │   └── auth-client.ts    # Better Auth client
        ├── hooks/
        │   └── use-auth.ts       # useAuth hook
        ├── components/
        │   ├── auth-layout.tsx   # Layout with branding
        │   ├── login-form.tsx    # Login page & form
        │   ├── signup-form.tsx   # Signup page & form
        │   └── logout-button.tsx # Logout button
        └── index.ts              # Exports
```

## 🔐 Protected Routes

Routes are protected by middleware in `apps/web/middleware.ts`:

**Currently Protected:**
- `/dashboard`
- `/profile`
- `/settings`

**To Add More Protected Routes:**
Edit `apps/web/middleware.ts`:
```typescript
function isProtectedRoute(pathname: string): boolean {
  const protectedRoutes = [
    "/dashboard",
    "/profile",
    "/settings",
    "/your-new-route", // Add here
  ];
  return protectedRoutes.some((route) => pathname.startsWith(route));
}
```

## 🎣 Using Auth in Components

**Get Auth State:**
```tsx
"use client";

import { useAuth } from "@libs/auth/web";

export function MyComponent() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please log in</div>;

  return <div>Welcome, {user.name}!</div>;
}
```

**Add Logout Button:**
```tsx
import { LogoutButton } from "@libs/auth/web";

export function MyNav() {
  return (
    <nav>
      <LogoutButton variant="ghost" size="sm">
        Sign Out
      </LogoutButton>
    </nav>
  );
}
```

## 🔧 Advanced Configuration

### Session Duration
Edit `libs/auth/api/src/auth.config.ts`:
```typescript
session: {
  expiresIn: 60 * 60 * 24 * 30, // 30 days
  updateAge: 60 * 60 * 24,       // Update every 24 hours
}
```

### Email Verification
Enable in `libs/auth/api/src/auth.config.ts`:
```typescript
emailAndPassword: {
  enabled: true,
  requireEmailVerification: true, // Enable this
}
```

### OAuth Providers (Google, GitHub, etc.)
Add to `libs/auth/api/src/auth.config.ts`:
```typescript
socialProviders: {
  github: {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },
}
```

## 📝 API Endpoints

Better Auth automatically creates these endpoints at your API:

- `POST /api/auth/sign-up/email` - Create account
- `POST /api/auth/sign-in/email` - Login
- `POST /api/auth/sign-out` - Logout
- `GET /api/auth/get-session` - Get current session
- `POST /api/auth/verify-email` - Verify email (if enabled)

## 🐛 Troubleshooting

### "Cannot find module '@libs/auth/web'"
- Run `pnpm install` from project root
- Check `apps/web/tsconfig.json` has correct path mappings

### "Session not persisting"
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Verify API is running on the correct port
- Check browser cookies are enabled

### "Database connection failed"
- Verify `DATABASE_URL` in `apps/api/.env`
- Run `pnpm prisma:migrate` to create tables
- Check database is running

### "Middleware redirects not working"
- Clear browser cookies
- Check middleware is at `apps/web/middleware.ts` (not in app directory)
- Verify middleware matcher configuration

## 🎯 Next Steps

1. **Add User Profile Page** - Create `/profile` route with user settings
2. **Implement Password Reset** - Add forgot password flow
3. **Add OAuth Providers** - Configure Google/GitHub login
4. **Email Verification** - Enable and configure email verification
5. **Admin Roles** - Add role-based access control (RBAC)

## 📚 Resources

- [Better Auth Docs](https://better-auth.com/docs)
- [Better Auth React](https://better-auth.com/docs/integrations/react)
- [Better Auth NestJS](https://better-auth.com/docs/integrations/nestjs)
- [Prisma Docs](https://www.prisma.io/docs)

---

**Authentication is now fully configured and ready to use!** 🎉
