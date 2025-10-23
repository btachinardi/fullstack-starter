# Authentication System - Product Requirements Document

**Version:** 1.0
**Status:** In Progress (60% Complete)
**Last Updated:** 2025-10-23
**Owner:** Engineering Team

---

## Executive Summary

Build a complete, production-ready authentication system for the fullstack starter monorepo using Better Auth, React Email, and Resend. The system provides secure user authentication, email verification, password management, and session handling with customizable branding for white-label applications.

**Target Users:**
- End users requiring secure account access
- Developers building on the starter template
- Product teams needing customizable auth UX

**Success Criteria:**
- ✅ 100% type-safe TypeScript implementation
- ✅ Modular architecture (can be dropped into any project)
- ✅ Customizable branding (white-label ready)
- ✅ Production-grade security (OWASP compliance)
- ✅ Excellent developer experience (simple API, good docs)
- ✅ Free tier friendly (Resend 3,000 emails/month)

---

## Problem Statement

### Current Pain Points

1. **No authentication** in the starter template
2. **Manual auth implementation** is time-consuming and error-prone
3. **Email systems** are complex to set up and maintain
4. **Security** requires expertise to implement correctly
5. **Branding customization** often requires deep code changes
6. **Email templates** are difficult to build and preview

### Opportunity

Create a **drop-in authentication system** that:
- Works out of the box with minimal configuration
- Provides beautiful, responsive email templates
- Supports complete auth flows (signup, login, verification, reset)
- Allows easy branding customization
- Follows security best practices
- Integrates seamlessly with the monorepo architecture

---

## Goals & Objectives

### Primary Goals

1. **Complete Auth Flows** - Signup, login, logout, verification, password reset
2. **Email Integration** - Transactional emails with React components
3. **Security First** - Industry-standard security practices
4. **Customizable Branding** - Easy white-labeling for different products
5. **Developer Experience** - Simple API, great docs, live preview

### Non-Goals (Out of Scope)

- ❌ Email marketing campaigns (transactional only)
- ❌ SMS-based authentication (email-only for MVP)
- ❌ Biometric authentication (web/mobile only)
- ❌ SAML/Enterprise SSO (SMB/startup focused)
- ❌ Admin dashboard for user management (separate feature)

---

## User Stories

### End Users

**As a new user, I want to:**
- [x] Sign up with email and password
- [x] Receive a verification email with a code
- [x] Verify my email with a simple code entry
- [x] Be automatically logged in after verification
- [x] Access my dashboard immediately
- [ ] Receive a welcome email after verification

**As a returning user, I want to:**
- [x] Log in with my credentials
- [x] Be redirected to my intended page after login
- [ ] See my login history for security
- [ ] Be notified of logins from new devices

**As a user who forgot their password, I want to:**
- [x] Request a password reset via email
- [x] Receive a secure reset link
- [x] Set a new password easily
- [x] Be automatically logged in after reset
- [ ] Have my other sessions invalidated for security

**As a logged-in user, I want to:**
- [x] See my profile information
- [x] Log out with one click
- [x] Have my session persist across page reloads
- [ ] Change my password
- [ ] Update my email address
- [ ] See and manage my active sessions
- [ ] Log out from all devices

### Developers

**As a developer, I want to:**
- [x] Add authentication with minimal code (<10 lines)
- [x] Customize branding without touching auth code
- [x] Preview email templates before deploying
- [x] Use type-safe APIs for all auth operations
- [ ] Add custom auth flows easily
- [ ] Monitor auth metrics and errors
- [ ] Test auth flows in development

### Product Teams

**As a product team, I want to:**
- [x] Customize product name and logo on auth pages
- [x] Customize email templates with our branding
- [x] Set custom terms and privacy URLs
- [ ] Track signup conversion rates
- [ ] Monitor email deliverability
- [ ] A/B test different auth flows

---

## Functional Requirements

### 1. User Registration

#### 1.1 Signup Form
- [x] **FR-1.1.1** Email input with format validation
- [x] **FR-1.1.2** Password input with strength requirements (min 8 chars)
- [x] **FR-1.1.3** Confirm password input with match validation
- [x] **FR-1.1.4** Optional name field
- [x] **FR-1.1.5** Client-side validation with immediate feedback
- [ ] **FR-1.1.6** Server-side validation with detailed error messages
- [ ] **FR-1.1.7** Password strength meter (weak/medium/strong)
- [x] **FR-1.1.8** Loading state during submission
- [x] **FR-1.1.9** Error display with specific messages

#### 1.2 Email Verification
- [x] **FR-1.2.1** Generate 6-digit OTP code
- [x] **FR-1.2.2** Store verification token in database with 15-minute expiration
- [x] **FR-1.2.3** Send verification email automatically on signup
- [x] **FR-1.2.4** OTP verification page with 6-digit input
- [x] **FR-1.2.5** Auto-submit when all digits entered
- [x] **FR-1.2.6** Paste support for OTP codes
- [x] **FR-1.2.7** Resend code functionality with 30-second cooldown
- [x] **FR-1.2.8** Auto-login after successful verification
- [x] **FR-1.2.9** Fallback verification link (if OTP doesn't work)
- [ ] **FR-1.2.10** Require email verification before login (configurable)
- [ ] **FR-1.2.11** Rate limit verification attempts (5 per 15 minutes)
- [ ] **FR-1.2.12** Rate limit resend requests (5 per hour)

#### 1.3 Post-Registration
- [x] **FR-1.3.1** Redirect to dashboard after verification
- [ ] **FR-1.3.2** Send welcome email after verification
- [ ] **FR-1.3.3** Track signup source/referrer
- [ ] **FR-1.3.4** Optional onboarding flow

### 2. User Login

#### 2.1 Login Form
- [x] **FR-2.1.1** Email input with validation
- [x] **FR-2.1.2** Password input (no strength validation on login)
- [x] **FR-2.1.3** "Forgot password?" link
- [ ] **FR-2.1.4** "Remember me" checkbox (30-day vs 7-day session)
- [x] **FR-2.1.5** Loading state during submission
- [x] **FR-2.1.6** Error display
- [ ] **FR-2.1.7** Link to signup if no account

#### 2.2 Login Validation
- [x] **FR-2.2.1** Verify email exists
- [x] **FR-2.2.2** Verify password with bcrypt
- [ ] **FR-2.2.3** Check email verification status (if required)
- [ ] **FR-2.2.4** Track failed login attempts per email/IP
- [ ] **FR-2.2.5** Lock account after 5 failed attempts (15-minute lockout)
- [ ] **FR-2.2.6** Send security alert email on new device login

#### 2.3 Session Management
- [x] **FR-2.3.1** Generate secure session token
- [x] **FR-2.3.2** Store session in database with expiration
- [x] **FR-2.3.3** Set httpOnly, secure cookie
- [x] **FR-2.3.4** Track IP address and user agent
- [x] **FR-2.3.5** Session expires after 7 days (default)
- [ ] **FR-2.3.6** Extend session on activity (sliding window)
- [ ] **FR-2.3.7** Display active sessions in settings
- [ ] **FR-2.3.8** Allow logout from specific sessions
- [ ] **FR-2.3.9** Logout from all devices

#### 2.4 Post-Login
- [x] **FR-2.4.1** Redirect to intended destination (preserve `?from=` param)
- [x] **FR-2.4.2** Default redirect to `/dashboard`
- [ ] **FR-2.4.3** Clear failed login attempts counter
- [ ] **FR-2.4.4** Update "last login" timestamp

### 3. Password Management

#### 3.1 Forgot Password
- [x] **FR-3.1.1** Forgot password page with email input
- [x] **FR-3.1.2** Generate secure reset token (UUID)
- [x] **FR-3.1.3** Store token with 1-hour expiration
- [x] **FR-3.1.4** Send password reset email
- [x] **FR-3.1.5** Always show success message (don't reveal if email exists)
- [ ] **FR-3.1.6** Rate limit reset requests (3 per hour per email)
- [ ] **FR-3.1.7** Track reset requests for security monitoring

#### 3.2 Reset Password
- [x] **FR-3.2.1** Reset password page with token validation
- [x] **FR-3.2.2** Validate token on page load
- [x] **FR-3.2.3** Show error if token invalid/expired/used
- [x] **FR-3.2.4** New password input with strength validation
- [x] **FR-3.2.5** Confirm password input with match validation
- [x] **FR-3.2.6** Update password with bcrypt hash
- [x] **FR-3.2.7** Mark reset token as used
- [ ] **FR-3.2.8** Invalidate all other sessions (force re-login everywhere)
- [x] **FR-3.2.9** Auto-login with new password
- [ ] **FR-3.2.10** Send confirmation email
- [ ] **FR-3.2.11** Prevent password reuse (check against last 3 passwords)

#### 3.3 Change Password (While Logged In)
- [ ] **FR-3.3.1** Change password page in settings
- [ ] **FR-3.3.2** Require current password for verification
- [ ] **FR-3.3.3** New password with strength requirements
- [ ] **FR-3.3.4** Confirm new password
- [ ] **FR-3.3.5** Validate current password is correct
- [ ] **FR-3.3.6** Ensure new password is different from current
- [ ] **FR-3.3.7** Update password in database
- [ ] **FR-3.3.8** Invalidate all OTHER sessions (keep current)
- [ ] **FR-3.3.9** Send confirmation email
- [ ] **FR-3.3.10** Show success message

### 4. Email System

#### 4.1 Email Templates
- [x] **FR-4.1.1** React Email component library
- [x] **FR-4.1.2** Responsive email layouts
- [x] **FR-4.1.3** Dark mode support
- [x] **FR-4.1.4** Customizable branding (product name + logo)
- [x] **FR-4.1.5** Verification email template with OTP
- [x] **FR-4.1.6** Password reset email template
- [x] **FR-4.1.7** Welcome email template
- [ ] **FR-4.1.8** Password changed notification email
- [ ] **FR-4.1.9** Email changed notification email
- [ ] **FR-4.1.10** New device login alert email
- [ ] **FR-4.1.11** Account locked notification email

#### 4.2 Email Delivery
- [x] **FR-4.2.1** Resend integration for email sending
- [x] **FR-4.2.2** Injectable EmailService in NestJS
- [x] **FR-4.2.3** Render React components to HTML
- [x] **FR-4.2.4** Type-safe email sending API
- [x] **FR-4.2.5** Error handling and logging
- [ ] **FR-4.2.6** Retry logic for failed sends
- [ ] **FR-4.2.7** Email delivery tracking
- [ ] **FR-4.2.8** Bounce and complaint handling
- [ ] **FR-4.2.9** Email queue for high volume (optional)

#### 4.3 Email Preview
- [x] **FR-4.3.1** React Email dev server
- [x] **FR-4.3.2** Live preview at localhost:3002
- [x] **FR-4.3.3** View all templates
- [x] **FR-4.3.4** Test with different data
- [x] **FR-4.3.5** View HTML source
- [x] **FR-4.3.6** Mobile/desktop preview
- [x] **FR-4.3.7** Dark mode preview

### 5. Protected Routes & Authorization

#### 5.1 Route Protection
- [x] **FR-5.1.1** Middleware-based route protection
- [x] **FR-5.1.2** Check session cookie existence
- [x] **FR-5.1.3** Validate session in database
- [x] **FR-5.1.4** Check session not expired
- [x] **FR-5.1.5** Redirect unauthenticated users to login
- [x] **FR-5.1.6** Preserve intended destination (`?from=` param)
- [x] **FR-5.1.7** Redirect authenticated users away from auth pages
- [ ] **FR-5.1.8** Handle session expiration during browsing (show modal)

#### 5.2 Authorization Levels
- [x] **FR-5.2.1** Public routes (accessible to all)
- [x] **FR-5.2.2** Protected routes (authenticated only)
- [ ] **FR-5.2.3** Role-based routes (admin, user, etc.)
- [ ] **FR-5.2.4** Permission-based access control

### 6. User Profile & Settings

#### 6.1 View Profile
- [x] **FR-6.1.1** Display user information (name, email, join date)
- [ ] **FR-6.1.2** Display email verification status
- [ ] **FR-6.1.3** Display account status (active, locked, etc.)
- [ ] **FR-6.1.4** Profile picture upload and display

#### 6.2 Edit Profile
- [ ] **FR-6.2.1** Update name
- [ ] **FR-6.2.2** Upload/change profile picture
- [ ] **FR-6.2.3** Crop and resize image
- [ ] **FR-6.2.4** Delete profile picture
- [ ] **FR-6.2.5** Save changes with validation

#### 6.3 Change Email
- [ ] **FR-6.3.1** Request email change
- [ ] **FR-6.3.2** Require current password verification
- [ ] **FR-6.3.3** Send verification to NEW email
- [ ] **FR-6.3.4** Verify new email before updating
- [ ] **FR-6.3.5** Send notification to OLD email
- [ ] **FR-6.3.6** Cancel email change option

#### 6.4 Security Settings
- [ ] **FR-6.4.1** View active sessions list
- [ ] **FR-6.4.2** Display session details (device, IP, last active)
- [ ] **FR-6.4.3** Logout specific sessions
- [ ] **FR-6.4.4** Logout all other sessions
- [ ] **FR-6.4.5** View login history
- [ ] **FR-6.4.6** Enable/disable security notifications

#### 6.5 Delete Account
- [ ] **FR-6.5.1** Delete account option
- [ ] **FR-6.5.2** Require password confirmation
- [ ] **FR-6.5.3** Warning about data deletion
- [ ] **FR-6.5.4** Delete user data from database
- [ ] **FR-6.5.5** Invalidate all sessions
- [ ] **FR-6.5.6** Send goodbye email
- [ ] **FR-6.5.7** Redirect to homepage

### 7. Social Authentication (OAuth)

#### 7.1 Providers
- [ ] **FR-7.1.1** Google OAuth integration
- [ ] **FR-7.1.2** GitHub OAuth integration
- [ ] **FR-7.1.3** OAuth redirect flow
- [ ] **FR-7.1.4** Handle OAuth callbacks
- [ ] **FR-7.1.5** Create account from OAuth profile
- [ ] **FR-7.1.6** Link OAuth account to existing email account

#### 7.2 Error Handling
- [ ] **FR-7.2.1** Handle OAuth provider errors
- [ ] **FR-7.2.2** Handle email conflicts (email already exists)
- [ ] **FR-7.2.3** Handle user cancellation
- [ ] **FR-7.2.4** Fallback to email/password option

### 8. Two-Factor Authentication (2FA)

#### 8.1 Setup 2FA
- [ ] **FR-8.1.1** Enable 2FA in settings
- [ ] **FR-8.1.2** Generate and display QR code for authenticator app
- [ ] **FR-8.1.3** Generate 10 backup codes
- [ ] **FR-8.1.4** Require entering first TOTP code to enable
- [ ] **FR-8.1.5** Store backup codes securely (hashed)
- [ ] **FR-8.1.6** Display backup codes once with download option

#### 8.2 2FA Login Flow
- [ ] **FR-8.2.1** 2FA verification page after password
- [ ] **FR-8.2.2** 6-digit TOTP code input
- [ ] **FR-8.2.3** "Use backup code" option
- [ ] **FR-8.2.4** "Trust this device for 30 days" checkbox
- [ ] **FR-8.2.5** Validate TOTP code
- [ ] **FR-8.2.6** Mark backup codes as used
- [ ] **FR-8.2.7** Rate limit 2FA attempts (5 per 15 minutes)

#### 8.3 2FA Management
- [ ] **FR-8.3.1** Disable 2FA (require password + 2FA code)
- [ ] **FR-8.3.2** Regenerate backup codes
- [ ] **FR-8.3.3** View trusted devices
- [ ] **FR-8.3.4** Remove trusted devices

### 9. Security Features

#### 9.1 Password Security
- [x] **FR-9.1.1** Bcrypt password hashing (Better Auth built-in)
- [ ] **FR-9.1.2** Password complexity requirements (8+ chars, uppercase, lowercase, number, special)
- [ ] **FR-9.1.3** Password strength validation
- [ ] **FR-9.1.4** Prevent password reuse (last 3 passwords)
- [ ] **FR-9.1.5** Force password change after X days (optional)

#### 9.2 Rate Limiting
- [ ] **FR-9.2.1** Login endpoint: 5 attempts per 15 minutes per IP
- [ ] **FR-9.2.2** Signup endpoint: 3 attempts per hour per IP
- [ ] **FR-9.2.3** Password reset: 3 requests per hour per email
- [ ] **FR-9.2.4** Email verification resend: 5 per hour per user
- [ ] **FR-9.2.5** 2FA attempts: 5 per 15 minutes per session

#### 9.3 Account Lockout
- [ ] **FR-9.3.1** Lock account after 5 failed login attempts
- [ ] **FR-9.3.2** 15-minute lockout duration
- [ ] **FR-9.3.3** Display lockout message with countdown
- [ ] **FR-9.3.4** Send security alert email
- [ ] **FR-9.3.5** Auto-unlock after timeout
- [ ] **FR-9.3.6** Manual unlock via email link

#### 9.4 Security Alerts
- [ ] **FR-9.4.1** Detect login from new device/IP
- [ ] **FR-9.4.2** Send email alert with device details
- [ ] **FR-9.4.3** Include "Secure account" action link
- [ ] **FR-9.4.4** Alert on password change
- [ ] **FR-9.4.5** Alert on email change
- [ ] **FR-9.4.6** Alert on 2FA disable
- [ ] **FR-9.4.7** Alert on account lockout

#### 9.5 Session Security
- [x] **FR-9.5.1** Secure session token generation
- [x] **FR-9.5.2** httpOnly cookies (prevent XSS)
- [x] **FR-9.5.3** secure flag in production (HTTPS only)
- [x] **FR-9.5.4** sameSite: "lax" (prevent CSRF)
- [x] **FR-9.5.5** Session regeneration after login
- [ ] **FR-9.5.6** Session fixation prevention
- [ ] **FR-9.5.7** Concurrent session handling

#### 9.6 Audit Logging
- [ ] **FR-9.6.1** Log all authentication events
- [ ] **FR-9.6.2** Log successful logins (user, IP, timestamp)
- [ ] **FR-9.6.3** Log failed login attempts
- [ ] **FR-9.6.4** Log password resets
- [ ] **FR-9.6.5** Log email verifications
- [ ] **FR-9.6.6** Log account lockouts
- [ ] **FR-9.6.7** Searchable audit log UI (admin)

### 10. User Experience

#### 10.1 Loading States
- [x] **FR-10.1.1** Button loading states with spinners
- [x] **FR-10.1.2** Disable buttons during submission
- [x] **FR-10.1.3** Loading text changes ("Logging in...")
- [ ] **FR-10.1.4** Skeleton loaders for page transitions
- [ ] **FR-10.1.5** Progress indicators for multi-step flows

#### 10.2 Error Handling
- [x] **FR-10.2.1** Inline field errors below inputs
- [x] **FR-10.2.2** Red border on invalid fields
- [x] **FR-10.2.3** Clear errors on field change
- [x] **FR-10.2.4** Form-level error display
- [ ] **FR-10.2.5** Toast notifications for success/error
- [ ] **FR-10.2.6** Error recovery suggestions
- [ ] **FR-10.2.7** Network error retry mechanism

#### 10.3 Accessibility
- [x] **FR-10.3.1** Keyboard navigation support
- [x] **FR-10.3.2** Enter to submit forms
- [x] **FR-10.3.3** Auto-focus on primary field
- [ ] **FR-10.3.4** ARIA labels for screen readers
- [ ] **FR-10.3.5** Error announcements for screen readers
- [ ] **FR-10.3.6** Focus management (first error field)
- [ ] **FR-10.3.7** WCAG 2.1 AA compliance

#### 10.4 Mobile Experience
- [x] **FR-10.4.1** Responsive design (mobile/tablet/desktop)
- [x] **FR-10.4.2** Touch-friendly buttons (min 44x44px)
- [x] **FR-10.4.3** Proper input types (email, password, numeric)
- [ ] **FR-10.4.4** Prevent zoom on input focus (iOS)
- [ ] **FR-10.4.5** Autofill support for credentials
- [ ] **FR-10.4.6** Biometric authentication (Touch ID, Face ID)

### 11. Customization & Branding

#### 11.1 Auth Page Branding
- [x] **FR-11.1.1** Customizable product name
- [x] **FR-11.1.2** Custom logo component support
- [x] **FR-11.1.3** Custom terms URL
- [x] **FR-11.1.4** Custom privacy URL
- [x] **FR-11.1.5** Consistent branding across all auth pages
- [ ] **FR-11.1.6** Custom color scheme (theme)
- [ ] **FR-11.1.7** Custom background images

#### 11.2 Email Branding
- [x] **FR-11.2.1** Customizable product name in emails
- [x] **FR-11.2.2** Custom logo URL for emails
- [x] **FR-11.2.3** Custom footer links
- [x] **FR-11.2.4** Consistent branding across all emails
- [ ] **FR-11.2.5** Custom email color scheme
- [ ] **FR-11.2.6** Custom email header/footer templates

### 12. Analytics & Monitoring

#### 12.1 Metrics
- [ ] **FR-12.1.1** Track signup conversion rate
- [ ] **FR-12.1.2** Track email verification completion rate
- [ ] **FR-12.1.3** Track login success rate
- [ ] **FR-12.1.4** Track password reset completion rate
- [ ] **FR-12.1.5** Track average session duration
- [ ] **FR-12.1.6** Track failed login attempts by user/IP
- [ ] **FR-12.1.7** Dashboard for auth metrics

#### 12.2 Email Metrics
- [ ] **FR-12.2.1** Email delivery rate (via Resend dashboard)
- [ ] **FR-12.2.2** Email open rate
- [ ] **FR-12.2.3** Email click rate
- [ ] **FR-12.2.4** Bounce rate
- [ ] **FR-12.2.5** Spam complaint rate

---

## Non-Functional Requirements

### Performance

- **NFR-1.1** Login response time < 500ms (p95)
- **NFR-1.2** Signup response time < 1s (p95)
- **NFR-1.3** Email delivery < 5s (send API call)
- **NFR-1.4** Page load time < 2s (auth pages)
- **NFR-1.5** Email preview server start < 10s
- **NFR-1.6** Support 1,000 concurrent sessions
- **NFR-1.7** Database query time < 100ms (p95)

### Security

- **NFR-2.1** Passwords hashed with bcrypt (cost factor 10+)
- **NFR-2.2** Session tokens cryptographically random (256 bits)
- **NFR-2.3** Reset tokens cryptographically random (UUID v4)
- **NFR-2.4** All cookies httpOnly, secure (production), sameSite
- **NFR-2.5** No passwords in logs or error messages
- **NFR-2.6** SQL injection prevention (Prisma parameterized queries)
- **NFR-2.7** XSS prevention (React auto-escaping)
- **NFR-2.8** CSRF protection (Better Auth built-in)
- **NFR-2.9** Rate limiting on all auth endpoints
- **NFR-2.10** OWASP Top 10 compliance

### Scalability

- **NFR-3.1** Support 10,000+ users
- **NFR-3.2** Support 100,000+ sessions
- **NFR-3.3** Email queue for high volume (>1,000 emails/hour)
- **NFR-3.4** Horizontal scaling support (stateless sessions)
- **NFR-3.5** Database connection pooling
- **NFR-3.6** Redis session storage (optional upgrade)

### Reliability

- **NFR-4.1** 99.9% uptime for auth services
- **NFR-4.2** Graceful degradation if email service down
- **NFR-4.3** Automatic retry for failed email sends
- **NFR-4.4** Session persistence across server restarts
- **NFR-4.5** Database transaction support for auth operations

### Maintainability

- **NFR-5.1** 100% TypeScript type coverage
- **NFR-5.2** Unit test coverage >80%
- **NFR-5.3** Integration test coverage for critical flows
- **NFR-5.4** E2E test coverage for user flows
- **NFR-5.5** Comprehensive documentation
- **NFR-5.6** Modular architecture (easy to extend)
- **NFR-5.7** Zero breaking changes to existing APIs

### Developer Experience

- **NFR-6.1** Setup time < 10 minutes
- **NFR-6.2** Email preview live reload < 1s
- **NFR-6.3** TypeScript autocomplete for all APIs
- **NFR-6.4** Clear error messages with solutions
- **NFR-6.5** Working examples for all features
- **NFR-6.6** API documentation with examples

---

## Technical Architecture

### Backend Stack

- **Framework:** NestJS 11
- **Auth Library:** Better Auth 1.3+
- **Database:** PostgreSQL (via Prisma)
- **Email Service:** Resend
- **Session Storage:** Database (PostgreSQL)
- **Password Hashing:** bcrypt (via Better Auth)

### Frontend Stack

- **Framework:** Next.js 15+ (App Router)
- **UI Library:** React 19
- **Auth Client:** Better Auth React
- **Styling:** Tailwind CSS + shadcn/ui
- **Forms:** Native HTML forms with validation
- **State:** React hooks + Better Auth client state

### Email Stack

- **Templates:** React Email 3.0+
- **Components:** @react-email/components
- **Rendering:** @react-email/render
- **Delivery:** Resend API 4.0+
- **Preview:** React Email dev server

### Database Schema

```prisma
model User {
  id            String    @id
  email         String    @unique
  emailVerified Boolean   @default(false)
  name          String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  image         String?
  sessions      Session[]
  accounts      Account[]

  @@map("users")
  @@schema("auth")
}

model Session {
  id        String   @id
  expiresAt DateTime
  token     String   @unique
  userId    String
  ipAddress String?
  userAgent String?
  user      User     @relation(...)

  @@map("sessions")
  @@schema("auth")
}

model Account {
  id           String @id
  accountId    String
  providerId   String
  userId       String
  user         User   @relation(...)
  password     String?  // For email/password
  // OAuth fields...

  @@map("accounts")
  @@schema("auth")
}

model Verification {
  id         String   @id
  identifier String   // email or user ID
  value      String   // OTP code or token
  expiresAt  DateTime

  @@map("verifications")
  @@schema("auth")
}
```

### Package Architecture

```
Three-layer modular architecture:

1. Core Layer (foundational)
   - @libs/core/utils - Shared errors, types
   - @libs/core/ui - UI components
   - @libs/core/web - React hooks
   - @libs/core/api - NestJS decorators, Prisma

2. Feature Layer (domain modules)
   - @libs/auth/* - Authentication
   - @libs/email/* - Email system
   - @libs/health/* - Health checks

3. Platform Layer (wiring)
   - @libs/platform/api - Bootstrap + module orchestration
   - @libs/platform/web - Provider configuration

4. App Layer
   - @apps/api - NestJS application
   - @apps/web - Next.js application
```

---

## API Endpoints (Better Auth)

### Authentication Endpoints

- `POST /api/auth/sign-up/email` - Create account
- `POST /api/auth/sign-in/email` - Login
- `POST /api/auth/sign-out` - Logout
- `GET /api/auth/get-session` - Get current session

### Email Verification

- `POST /api/auth/send-verification-email` - Resend verification
- `POST /api/auth/verify-email` - Verify email with token/code

### Password Management

- `POST /api/auth/forget-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### OAuth (Future)

- `GET /api/auth/sign-in/google` - Google OAuth
- `GET /api/auth/sign-in/github` - GitHub OAuth
- `GET /api/auth/callback/google` - Google callback
- `GET /api/auth/callback/github` - GitHub callback

### 2FA (Future)

- `POST /api/auth/2fa/enable` - Enable 2FA
- `POST /api/auth/2fa/disable` - Disable 2FA
- `POST /api/auth/2fa/verify` - Verify TOTP code
- `POST /api/auth/2fa/backup-codes` - Get backup codes

---

## Data Models

### User

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | String | Yes | Unique user ID (generated) |
| email | String | Yes | User email (unique) |
| emailVerified | Boolean | Yes | Email verification status |
| name | String | No | User display name |
| image | String | No | Profile picture URL |
| createdAt | DateTime | Yes | Account creation timestamp |
| updatedAt | DateTime | Yes | Last update timestamp |

### Session

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | String | Yes | Session ID (generated) |
| token | String | Yes | Session token (unique) |
| expiresAt | DateTime | Yes | Session expiration |
| userId | String | Yes | Associated user |
| ipAddress | String | No | IP address |
| userAgent | String | No | Browser/device info |

### Verification

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | String | Yes | Verification ID |
| identifier | String | Yes | Email or user ID |
| value | String | Yes | OTP code or token |
| expiresAt | DateTime | Yes | Expiration timestamp |

---

## Success Metrics

### Key Performance Indicators (KPIs)

**Adoption Metrics:**
- Signup conversion rate > 60%
- Email verification rate > 85%
- Login success rate > 95%
- Password reset completion rate > 70%

**Performance Metrics:**
- Auth API response time < 500ms (p95)
- Email delivery time < 5s
- Page load time < 2s
- Zero security incidents

**User Experience:**
- Time to first login < 5 minutes (new user)
- Password reset time < 2 minutes
- Session persistence rate > 99%

**Developer Experience:**
- Setup time < 10 minutes
- Email template preview load time < 5s
- API documentation clarity score > 4.5/5

---

## Risks & Mitigations

### Technical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Email deliverability issues | High | Use Resend (proven deliverability), monitor bounce rates |
| Session fixation attacks | High | Better Auth handles session regeneration |
| Brute force attacks | High | Implement rate limiting + account lockout |
| Token expiration edge cases | Medium | Clear expiration messages, easy token regeneration |
| OAuth provider downtime | Low | Fallback to email/password, clear error messages |

### Security Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Password database leak | Critical | Bcrypt hashing (irreversible), salted per-user |
| Session hijacking | High | httpOnly cookies, secure flag, short expiration |
| Email interception | High | HTTPS only, short token expiration |
| CSRF attacks | High | Better Auth built-in protection, sameSite cookies |
| XSS attacks | High | React auto-escaping, CSP headers |

### Operational Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Resend API downtime | Medium | Queue emails, retry logic, fallback provider |
| Database connection pool exhaustion | Medium | Connection pooling, monitoring, auto-scaling |
| Email quota exceeded | Low | Monitor usage, upgrade plan, queue management |

---

## Dependencies

### External Services

- **Resend** - Email delivery (required)
  - Free tier: 3,000 emails/month
  - Fallback: SendGrid, Postmark

- **PostgreSQL** - Database (required)
  - Can use SQLite for development

### NPM Packages

**Backend:**
- `better-auth` - Auth framework
- `@thallesp/nestjs-better-auth` - NestJS integration
- `@nestjs/common`, `@nestjs/core` - NestJS framework
- `@prisma/client`, `prisma` - Database ORM
- `resend` - Email API client
- `@react-email/render` - React to HTML rendering

**Frontend:**
- `better-auth` - Auth client
- `react`, `react-dom` - React framework
- `next` - Next.js framework
- `@libs/core/ui` - UI components

**Email Templates:**
- `react-email` - Email dev server
- `@react-email/components` - Email components

---

## Future Enhancements (Out of Scope for MVP)

### Phase 2 Enhancements
- [ ] Social authentication (Google, GitHub, Apple)
- [ ] Two-factor authentication (TOTP)
- [ ] Session management UI
- [ ] Login history and audit log UI
- [ ] Advanced password requirements

### Phase 3 Enhancements
- [ ] Passwordless authentication (magic links)
- [ ] WebAuthn/Passkeys support
- [ ] Multi-factor authentication (SMS, authenticator, hardware keys)
- [ ] Device trust management
- [ ] Admin panel for user management

### Phase 4 Enhancements
- [ ] Role-based access control (RBAC)
- [ ] Permission-based authorization
- [ ] API key authentication
- [ ] OAuth provider (allow others to auth with your app)
- [ ] Account recovery via security questions
- [ ] Geolocation-based security

---

## Compliance & Standards

### Security Standards
- OWASP Top 10 compliance
- NIST password guidelines
- OAuth 2.0 / OpenID Connect (for social auth)
- WCAG 2.1 AA (accessibility)

### Data Privacy
- GDPR compliance (EU users)
  - Data export
  - Right to deletion
  - Consent management
- CCPA compliance (California users)
- Email unsubscribe links

### Email Standards
- CAN-SPAM compliance
- DMARC, SPF, DKIM configuration
- Unsubscribe links in emails
- Bounce and complaint handling

---

## Acceptance Criteria

### Phase 1: Core Authentication (✅ 100% Complete)
- [x] User can sign up with email/password
- [x] User receives verification email
- [x] User can verify email with OTP
- [x] User is auto-logged in after verification
- [x] User can log in with credentials
- [x] User can log out
- [x] Protected routes redirect to login
- [x] Branding is customizable

### Phase 2: Password Management (✅ 95% Complete)
- [x] User can request password reset
- [x] User receives reset email with secure link
- [x] User can set new password
- [x] User is auto-logged in after reset
- [ ] Other sessions are invalidated
- [ ] User receives confirmation email

### Phase 3: Email System (✅ 100% Complete)
- [x] Email templates built with React components
- [x] Emails are responsive and branded
- [x] Email preview works in development
- [x] Emails send via Resend
- [x] Email service is injectable in NestJS
- [x] Three email templates available

### Phase 4: Security Hardening (🚧 40% Complete)
- [x] Passwords are securely hashed
- [x] Sessions are secure
- [x] CSRF protection enabled
- [ ] Rate limiting implemented
- [ ] Account lockout after failed attempts
- [ ] Security alerts via email
- [ ] Audit logging enabled

### Phase 5: Advanced Features (🔴 Not Started)
- [ ] Social authentication works
- [ ] 2FA can be enabled
- [ ] Session management UI
- [ ] Login history visible
- [ ] Password strength requirements enforced

---

## Open Questions

1. **Password Requirements:**
   - Should we enforce complexity (uppercase, lowercase, number, special)?
   - Should we allow common passwords (e.g., "password123")?
   - Should we have a minimum password strength requirement?

2. **Email Verification:**
   - Should we require verification before login (block unverified users)?
   - Or allow login but show banner prompting verification?

3. **Session Duration:**
   - Current: 7 days default
   - Should "Remember me" extend to 30 days?
   - Should we implement sliding session windows?

4. **Social Auth Priority:**
   - Which providers first? (Google > GitHub > Apple?)
   - Required for MVP or Phase 2?

5. **2FA:**
   - Required for all users or optional?
   - TOTP only or support SMS/email codes too?

---

## Release Plan

### Phase 1: MVP - Core Auth ✅ (Complete)
**Timeline:** Completed 2025-10-23
**Features:**
- Email/password signup and login
- Email verification with OTP
- Password reset flow
- Email service integration
- Protected routes
- Customizable branding

### Phase 2: Security Hardening 🚧 (Next)
**Timeline:** 1-2 weeks
**Features:**
- Rate limiting on all endpoints
- Account lockout after failed attempts
- Password complexity requirements
- Security alert emails
- Audit logging

### Phase 3: Enhanced UX 📅 (Planned)
**Timeline:** 2-3 weeks
**Features:**
- Change password (while logged in)
- Change email with verification
- Session management UI
- Login history
- Profile picture upload
- Better error messages and recovery

### Phase 4: Advanced Features 📅 (Future)
**Timeline:** 3-4 weeks
**Features:**
- Social authentication (Google, GitHub)
- Two-factor authentication
- Passwordless login (magic links)
- WebAuthn/Passkeys
- Admin panel

---

## Appendix

### A. Related Documents

- `AUTH_SETUP.md` - Setup and testing guide
- `AUTH_CHECKLIST.md` - 95-item implementation checklist
- `EMAIL_SERVICE.md` - Email service documentation
- `auth.tasks.md` - Detailed task breakdown
- `ai/docs/complete-auth-implementation.md` - Technical summary

### B. External Resources

- [Better Auth Documentation](https://www.better-auth.com/docs)
- [React Email Documentation](https://react.email/docs)
- [Resend Documentation](https://resend.com/docs)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

### C. Glossary

- **OTP** - One-Time Password (6-digit verification code)
- **TOTP** - Time-based One-Time Password (for 2FA)
- **JWT** - JSON Web Token (not used; we use database sessions)
- **OAuth** - Open Authorization (for social login)
- **CSRF** - Cross-Site Request Forgery
- **XSS** - Cross-Site Scripting
- **WCAG** - Web Content Accessibility Guidelines

---

**Document Status:** Living document, updated as features are implemented

**Next Review:** After Phase 2 completion (security hardening)
