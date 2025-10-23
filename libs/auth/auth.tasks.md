# Authentication System - Task Breakdown

> **Source**: auth.prd.md
> **Status**: In Progress (60% Complete)
> **Priority**: High
> **Estimated Effort**: 40-50 hours total (25-30 hours completed, 15-20 hours remaining)

---

## Phase 1: Core Authentication & Email Infrastructure ✅ COMPLETE

**Objective**: Build foundational auth system with Better Auth and email service
**Checkpoint**: ✅ Checkpoint 1 - Users can signup, verify email, login, and logout
**Status**: Complete (100%)
**Time Spent**: 25-30 hours

---

### Task 1.1: Create Auth Backend Package ✅

**Status**: Completed
**Priority**: Critical
**Estimated Time**: 2 hours
**Actual Time**: 2 hours
**Dependencies**: None
**Type**: Infrastructure

**Description**:
Create `libs/auth/api` package with Better Auth integration for NestJS.

**Deliverables**:
- [x] Create `libs/auth/api/` directory structure
- [x] Create `package.json` with Better Auth dependencies
- [x] Create `tsconfig.json` matching core/api best practices
- [x] Migrate auth code from `libs/core/api/src/auth`
- [x] Create Prisma schema with Better Auth models
- [x] Generate Prisma client
- [x] Export AuthModule, auth instance, prisma client

**Acceptance Criteria**:
- Package builds successfully
- Prisma client generates
- AuthModule can be imported by NestJS apps
- Better Auth configuration works

---

### Task 1.2: Create Auth Frontend Package ✅

**Status**: Completed
**Priority**: Critical
**Estimated Time**: 3 hours
**Actual Time**: 3 hours
**Dependencies**: Task 1.1
**Type**: Implementation

**Description**:
Create `libs/auth/web` package with Better Auth React client and auth pages.

**Deliverables**:
- [x] Create `libs/auth/web/` directory structure
- [x] Create `package.json` with Better Auth React dependencies
- [x] Create `tsconfig.json` matching core/web best practices
- [x] Create Better Auth client configuration
- [x] Create `useAuth()` hook
- [x] Create customizable `AuthLayout` component
- [x] Create `LoginPage` with branding support
- [x] Create `SignupPage` with branding support
- [x] Create `LogoutButton` component
- [x] Export all components and hooks

**Acceptance Criteria**:
- All components render correctly
- Better Auth client connects to backend
- Branding customization works
- TypeScript types are properly exported

---

### Task 1.3: Implement Protected Routes ✅

**Status**: Completed
**Priority**: Critical
**Estimated Time**: 1 hour
**Actual Time**: 1 hour
**Dependencies**: Task 1.2
**Type**: Implementation

**Description**:
Create Next.js middleware for protecting authenticated routes.

**Deliverables**:
- [x] Create `apps/web/middleware.ts`
- [x] Check session cookie in middleware
- [x] Redirect unauthenticated users to `/login`
- [x] Preserve intended destination with `?from=` param
- [x] Redirect authenticated users away from auth pages
- [x] Configure middleware matcher

**Acceptance Criteria**:
- Unauthenticated users cannot access `/dashboard`
- Redirect preserves intended page
- Authenticated users skip auth pages

---

### Task 1.4: Create Email Templates Package ✅

**Status**: Completed
**Priority**: High
**Estimated Time**: 3 hours
**Actual Time**: 3 hours
**Dependencies**: None
**Type**: Implementation

**Description**:
Create `libs/email/templates` package with React Email components.

**Deliverables**:
- [x] Create `libs/email/templates/` directory structure
- [x] Install React Email dependencies
- [x] Create `EmailLayout` component with branding
- [x] Create `EmailButton` component
- [x] Create `VerificationEmail` template
- [x] Create `PasswordResetEmail` template
- [x] Create `WelcomeEmail` template
- [x] Configure React Email dev server
- [x] Export all templates and components

**Acceptance Criteria**:
- Email preview server works (`pnpm email:preview`)
- All templates render correctly
- Branding customization works
- Mobile-responsive emails

---

### Task 1.5: Create Email API Service ✅

**Status**: Completed
**Priority**: High
**Estimated Time**: 2 hours
**Actual Time**: 2 hours
**Dependencies**: Task 1.4
**Type**: Implementation

**Description**:
Create `libs/email/api` package with Resend integration.

**Deliverables**:
- [x] Create `libs/email/api/` directory structure
- [x] Install Resend dependencies
- [x] Create `EmailService` class
- [x] Create `EmailModule` for NestJS
- [x] Implement `sendEmail()` method with React component rendering
- [x] Add error handling
- [x] Export service and module

**Acceptance Criteria**:
- EmailService builds successfully
- Can render React components to HTML
- Resend API integration works
- Type-safe email sending API

---

### Task 1.6: Integrate Email with Auth ✅

**Status**: Completed
**Priority**: Critical
**Estimated Time**: 2 hours
**Actual Time**: 2 hours
**Dependencies**: Tasks 1.1, 1.5
**Type**: Integration

**Description**:
Integrate EmailService with Better Auth for verification emails.

**Deliverables**:
- [x] Add email verification callback to Better Auth config
- [x] Inject EmailService into AuthModule
- [x] Configure verification email sending
- [x] Set up callback injection pattern
- [x] Add console logging for verification status

**Acceptance Criteria**:
- Verification email sends on signup
- Email contains correct verification link
- Integration doesn't break if EmailService unavailable

---

### Task 1.7: Create Email Verification Flow ✅

**Status**: Completed
**Priority**: Critical
**Estimated Time**: 3 hours
**Actual Time**: 3 hours
**Dependencies**: Task 1.6
**Type**: Implementation

**Description**:
Create OTP verification page for email verification.

**Deliverables**:
- [x] Create `VerifyEmailPage` component
- [x] Create `VerifyEmailForm` with 6-digit OTP input
- [x] Auto-focus and auto-advance between digits
- [x] Paste support for OTP codes
- [x] Auto-submit when all digits entered
- [x] Resend verification code functionality
- [x] 30-second cooldown timer for resend
- [x] Token validation from URL (`?token=xxx`)
- [x] Auto-login after verification
- [x] Error handling (invalid code, expired, etc.)

**Acceptance Criteria**:
- OTP input works smoothly
- Paste functionality works
- Auto-submit triggers correctly
- Resend cooldown prevents spam
- Verification redirects to dashboard

---

### Task 1.8: Create Password Reset Flow ✅

**Status**: Completed
**Priority**: High
**Estimated Time**: 4 hours
**Actual Time**: 4 hours
**Dependencies**: Task 1.5
**Type**: Implementation

**Description**:
Create forgot password and reset password pages.

**Deliverables**:
- [x] Create `ForgotPasswordPage` component
- [x] Email input with validation
- [x] Request password reset functionality
- [x] Always show success (don't reveal if email exists)
- [x] Create `ResetPasswordPage` component
- [x] Token validation on page load
- [x] New password input with validation
- [x] Confirm password input
- [x] Password strength validation
- [x] Reset password functionality
- [x] Auto-login after reset
- [x] Error handling (invalid/expired token)

**Acceptance Criteria**:
- Request flow works end-to-end
- Tokens expire after 1 hour
- Invalid tokens show helpful error
- New password validates correctly
- Auto-login works after reset

---

### Task 1.9: Update Database Commands ✅

**Status**: Completed
**Priority**: Medium
**Estimated Time**: 30 minutes
**Actual Time**: 30 minutes
**Dependencies**: None
**Type**: Configuration

**Description**:
Unify database commands to use Prisma build tool.

**Deliverables**:
- [x] Replace `prisma:*` commands with `db:*`
- [x] Add `db:build` - Build composed schema
- [x] Add `db:migrate` - Build + migrate
- [x] Add `db:generate` - Build + generate
- [x] Add `db:push` - Build + push
- [x] Update documentation

**Acceptance Criteria**:
- All `db:*` commands work
- Schema builds before Prisma operations
- Documentation updated

---

### Task 1.10: Create Documentation ✅

**Status**: Completed
**Priority**: High
**Estimated Time**: 3 hours
**Actual Time**: 3 hours
**Dependencies**: All Phase 1 tasks
**Type**: Documentation

**Deliverables**:
- [x] Create `AUTH_SETUP.md` - Setup and testing guide
- [x] Create `AUTH_CHECKLIST.md` - 95-item checklist
- [x] Create `EMAIL_SERVICE.md` - Email service docs
- [x] Create `auth.prd.md` - Product requirements
- [x] Update `CLAUDE.md` - Workspace structure
- [x] Update `PRISMA-BUILD-TOOL.md` - Database commands
- [x] Create technical summaries in `ai/docs/`

**Acceptance Criteria**:
- All documentation is clear and comprehensive
- Setup guide works for new users
- Examples are accurate and tested

---

### ✅ CHECKPOINT 1 - Core Authentication Complete

**Validation Checklist**:
- [x] User can sign up with email/password
- [x] Verification email is sent
- [x] User can verify email with OTP
- [x] User is auto-logged in after verification
- [x] User can log in with credentials
- [x] User can log out
- [x] Protected routes work correctly
- [x] Password reset flow works end-to-end
- [x] Email templates are beautiful and responsive
- [x] Branding can be customized
- [x] Documentation is complete

**Status**: ✅ PASSED (2025-10-23)

---

## Phase 2: Security Hardening 🚧 IN PROGRESS

**Objective**: Implement production-grade security features
**Checkpoint**: ✅ Checkpoint 2 - System is production-secure
**Status**: Not Started (0%)
**Estimated Time**: 15-20 hours

---

### Task 2.1: Implement Rate Limiting

**Status**: Pending
**Priority**: Critical
**Estimated Time**: 3 hours
**Dependencies**: Phase 1 complete
**Type**: Security

**Description**:
Add rate limiting to all authentication endpoints to prevent brute force attacks.

**Deliverables**:
- [ ] Install `@nestjs/throttler` or implement custom rate limiter
- [ ] Configure rate limits:
  - Login: 5 attempts per 15 minutes per IP
  - Signup: 3 attempts per hour per IP
  - Password reset: 3 requests per hour per email
  - Email verification resend: 5 per hour per user
- [ ] Add rate limit guards to auth endpoints
- [ ] Store rate limit data in Redis or database
- [ ] Return 429 status with retry-after header
- [ ] Display user-friendly error messages
- [ ] Test rate limits work correctly

**Requirements**:
- Use sliding window algorithm
- Track by IP address and email
- Clear rate limit on successful action
- Provide countdown in error messages

**Acceptance Criteria**:
- Rate limits enforce correctly
- Error messages show retry time
- Legitimate users not impacted
- Brute force attacks prevented

---

### Task 2.2: Implement Account Lockout

**Status**: Pending
**Priority**: Critical
**Estimated Time**: 2 hours
**Dependencies**: Task 2.1
**Type**: Security

**Description**:
Lock accounts after repeated failed login attempts.

**Deliverables**:
- [ ] Track failed login attempts in database
- [ ] Lock account after 5 failed attempts
- [ ] Set lockout expiration (15 minutes)
- [ ] Display lockout message with countdown
- [ ] Send security alert email
- [ ] Auto-unlock after timeout
- [ ] Clear failed attempts on successful login
- [ ] Optional: Manual unlock via email link

**Requirements**:
- Track per email address (not just IP)
- Persist failed attempts in database
- Email includes unlock time
- Prevent enumeration attacks

**Acceptance Criteria**:
- Account locks after 5 failures
- Lockout message displays correctly
- Security email sent
- Auto-unlock works
- Failed attempts reset on success

---

### Task 2.3: Add Password Complexity Requirements

**Status**: Pending
**Priority**: High
**Estimated Time**: 2 hours
**Dependencies**: None
**Type**: Security

**Description**:
Enforce password complexity requirements on signup and password change.

**Deliverables**:
- [ ] Define password requirements:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character
- [ ] Implement server-side validation
- [ ] Add client-side validation with real-time feedback
- [ ] Create password strength meter component
- [ ] Display requirements checklist
- [ ] Show strength indicator (weak/medium/strong)
- [ ] Reject common passwords (optional: use library)
- [ ] Test validation works correctly

**Requirements**:
- Server-side validation is authoritative
- Client-side provides immediate feedback
- Clear error messages for each requirement
- Visual strength indicator

**Acceptance Criteria**:
- Weak passwords rejected
- Requirements display clearly
- Strength meter accurate
- Good UX (not frustrating)

---

### Task 2.4: Implement Security Alert Emails

**Status**: Pending
**Priority**: High
**Estimated Time**: 3 hours
**Dependencies**: Task 1.5
**Type**: Security

**Description**:
Send security alert emails for important account events.

**Deliverables**:
- [ ] Create email templates:
  - New device login alert
  - Password changed notification
  - Email changed notification
  - Account locked notification
  - 2FA disabled alert
- [ ] Detect new device/IP on login
- [ ] Send alert email on password change
- [ ] Send notification to old email on email change
- [ ] Send alert on account lockout
- [ ] Include device details (browser, OS, location)
- [ ] Add "Secure your account" action links
- [ ] Add "Not you?" recovery links

**Requirements**:
- Emails sent asynchronously (don't block login)
- Include relevant security information
- Provide clear action items
- Professional email templates

**Acceptance Criteria**:
- Alerts send for all events
- Device detection works
- Emails contain correct information
- Action links work

---

### Task 2.5: Add Audit Logging

**Status**: Pending
**Priority**: Medium
**Estimated Time**: 3 hours
**Dependencies**: None
**Type**: Security

**Description**:
Log all authentication events for security monitoring and compliance.

**Deliverables**:
- [ ] Create `AuditLog` model in database
- [ ] Log events:
  - Successful logins (user, IP, timestamp, device)
  - Failed login attempts
  - Password resets
  - Email verifications
  - Email changes
  - Account lockouts
  - Session terminations
- [ ] Include metadata (IP, user agent, location)
- [ ] Create cleanup job for old logs (retention: 90 days)
- [ ] Optional: Create audit log UI for users
- [ ] Optional: Admin audit log search

**Requirements**:
- Log asynchronously (don't slow down requests)
- Include all relevant context
- Queryable and searchable
- Retention policy

**Acceptance Criteria**:
- All events logged correctly
- Logs include complete context
- Performance not impacted
- Old logs cleaned up

---

### Task 2.6: Improve Error Messages

**Status**: Pending
**Priority**: Medium
**Estimated Time**: 2 hours
**Dependencies**: Tasks 2.1, 2.2, 2.3
**Type**: UX

**Description**:
Improve error messages to be more helpful and user-friendly.

**Deliverables**:
- [ ] Specific validation error messages
- [ ] Suggested actions for each error
- [ ] User-friendly language (not technical)
- [ ] Consistent error format
- [ ] Error codes for debugging
- [ ] Link to help docs where relevant

**Requirements**:
- Don't reveal security information
- Clear and actionable
- Consistent tone and format
- Include error codes for support

**Acceptance Criteria**:
- Errors are clear and helpful
- Users know what to do
- No security info leaked
- Consistent across all forms

---

### ✅ CHECKPOINT 2 - Security Hardening Complete

**Target Validation**:
- [ ] Rate limiting prevents brute force
- [ ] Account lockout works correctly
- [ ] Password requirements enforced
- [ ] Security alerts send
- [ ] Audit log captures all events
- [ ] Error messages are helpful
- [ ] Zero security vulnerabilities

---

## Phase 3: Enhanced User Experience 📅 PLANNED

**Objective**: Improve UX with profile management and session controls
**Checkpoint**: ✅ Checkpoint 3 - Users can manage their account
**Status**: Not Started (0%)
**Estimated Time**: 12-15 hours

---

### Task 3.1: Implement Change Password

**Status**: Pending
**Priority**: High
**Estimated Time**: 2 hours
**Dependencies**: Phase 2 complete
**Type**: Feature

**Description**:
Allow logged-in users to change their password.

**Deliverables**:
- [ ] Create change password page (`/settings/password`)
- [ ] Current password input
- [ ] New password input with strength meter
- [ ] Confirm new password input
- [ ] Validate current password is correct
- [ ] Ensure new password is different
- [ ] Update password in database
- [ ] Invalidate all OTHER sessions (keep current)
- [ ] Send confirmation email
- [ ] Show success message

**Requirements**:
- Require current password for security
- Apply password complexity rules
- Keep current session active
- Clear notification of change

**Acceptance Criteria**:
- Password changes successfully
- Other sessions invalidated
- Current session stays active
- Confirmation email sent

---

### Task 3.2: Implement Change Email

**Status**: Pending
**Priority**: High
**Estimated Time**: 3 hours
**Dependencies**: Task 3.1
**Type**: Feature

**Description**:
Allow users to change their email address with verification.

**Deliverables**:
- [ ] Create change email page (`/settings/email`)
- [ ] New email input
- [ ] Require current password verification
- [ ] Send verification to NEW email
- [ ] Create email change verification page
- [ ] Verify new email before updating
- [ ] Send notification to OLD email
- [ ] Update email in database
- [ ] Add "Cancel change" link in notification

**Requirements**:
- Don't change until verified
- Notify both old and new email
- Allow cancellation
- Check email not already in use

**Acceptance Criteria**:
- Email changes after verification
- Both emails receive notifications
- Change can be cancelled
- Duplicate email prevented

---

### Task 3.3: Create Session Management UI

**Status**: Pending
**Priority**: Medium
**Estimated Time**: 3 hours
**Dependencies**: None
**Type**: Feature

**Description**:
Display and manage active sessions in settings.

**Deliverables**:
- [ ] Create sessions list page (`/settings/sessions`)
- [ ] Display active sessions:
  - Device/browser info (parsed from user agent)
  - IP address
  - Last active timestamp
  - Current session indicator
- [ ] Logout specific session button
- [ ] Logout all other sessions button
- [ ] Refresh session list
- [ ] Show session creation date

**Requirements**:
- Real-time session data
- Clear current session indicator
- Confirm before logout all
- Update list after actions

**Acceptance Criteria**:
- Sessions display correctly
- Device info parsed accurately
- Logout session works
- Current session protected

---

### Task 3.4: Create Login History

**Status**: Pending
**Priority**: Medium
**Estimated Time**: 2 hours
**Dependencies**: Task 2.5 (audit logging)
**Type**: Feature

**Description**:
Display login history for security transparency.

**Deliverables**:
- [ ] Create login history page (`/settings/security`)
- [ ] Query audit logs for login events
- [ ] Display:
  - Login timestamp
  - Device/browser info
  - IP address
  - Location (optional: IP geolocation)
  - Success/failure status
- [ ] Pagination for long histories
- [ ] Filter by date range
- [ ] Highlight suspicious logins

**Requirements**:
- Query from audit log
- Most recent first
- Efficient pagination
- Clear visual design

**Acceptance Criteria**:
- History displays correctly
- Shows last 50 logins
- Pagination works
- Performance is good

---

### Task 3.5: Implement Profile Picture Upload

**Status**: Pending
**Priority**: Low
**Estimated Time**: 4 hours
**Dependencies**: None
**Type**: Feature

**Description**:
Allow users to upload and manage profile pictures.

**Deliverables**:
- [ ] Create profile picture upload component
- [ ] File input with drag-and-drop
- [ ] Image preview
- [ ] Crop and resize interface
- [ ] Upload to cloud storage (Cloudinary, S3, etc.)
- [ ] Update user.image in database
- [ ] Display picture in navigation
- [ ] Delete picture option
- [ ] Validate file type (image only)
- [ ] Validate file size (max 5MB)

**Requirements**:
- Support common image formats (JPG, PNG, WebP)
- Resize to standard size (e.g., 256x256)
- Store in CDN for performance
- Optimize images

**Acceptance Criteria**:
- Upload works smoothly
- Crop/resize works
- Pictures display correctly
- File validation works

---

### Task 3.6: Add Welcome Email

**Status**: Pending
**Priority**: Low
**Estimated Time**: 1 hour
**Dependencies**: Task 1.6
**Type**: Feature

**Description**:
Send welcome email after successful email verification.

**Deliverables**:
- [ ] Trigger welcome email after verification
- [ ] Use WelcomeEmail template
- [ ] Include user name
- [ ] Include dashboard link
- [ ] Include getting started tips
- [ ] Add to Better Auth verification callback

**Requirements**:
- Send only after verification (not on signup)
- Personalize with user name
- Include helpful next steps

**Acceptance Criteria**:
- Welcome email sends after verification
- Email is personalized
- Links work correctly

---

### ✅ CHECKPOINT 3 - Enhanced UX Complete

**Target Validation**:
- [ ] Users can change password
- [ ] Users can change email
- [ ] Users can view active sessions
- [ ] Users can see login history
- [ ] Users can upload profile pictures
- [ ] Welcome emails send correctly

---

## Phase 4: Advanced Features 📅 FUTURE

**Objective**: Add social auth, 2FA, and advanced security
**Checkpoint**: ✅ Checkpoint 4 - Advanced features functional
**Status**: Not Started (0%)
**Estimated Time**: 20-25 hours

---

### Task 4.1: Implement Google OAuth

**Status**: Pending
**Priority**: High
**Estimated Time**: 4 hours
**Dependencies**: Phase 3 complete
**Type**: Feature

**Description**:
Add Google sign-in as authentication option.

**Deliverables**:
- [ ] Configure Google OAuth in Better Auth
- [ ] Get Google OAuth credentials
- [ ] Add Google sign-in button to login/signup
- [ ] Implement OAuth redirect flow
- [ ] Handle OAuth callback
- [ ] Create/link account from Google profile
- [ ] Handle email conflicts
- [ ] Test OAuth flow end-to-end

**Requirements**:
- Use Better Auth's Google provider
- Handle new and existing accounts
- Link accounts by email
- Error handling for OAuth failures

**Acceptance Criteria**:
- Google sign-in works
- New accounts created correctly
- Existing accounts linked
- Error handling works

---

### Task 4.2: Implement GitHub OAuth

**Status**: Pending
**Priority**: Medium
**Estimated Time**: 3 hours
**Dependencies**: Task 4.1
**Type**: Feature

**Description**:
Add GitHub sign-in as authentication option.

**Deliverables**:
- [ ] Configure GitHub OAuth in Better Auth
- [ ] Get GitHub OAuth credentials
- [ ] Add GitHub sign-in button
- [ ] Implement OAuth flow (similar to Google)
- [ ] Test GitHub OAuth

**Acceptance Criteria**:
- GitHub sign-in works
- Accounts created/linked correctly

---

### Task 4.3: Implement Account Linking

**Status**: Pending
**Priority**: Medium
**Estimated Time**: 3 hours
**Dependencies**: Task 4.2
**Type**: Feature

**Description**:
Allow users to link multiple OAuth providers to one account.

**Deliverables**:
- [ ] Create account linking page (`/settings/accounts`)
- [ ] Display linked accounts (Google, GitHub, Email)
- [ ] Link new provider button
- [ ] Unlink provider button (require password)
- [ ] Ensure at least one auth method remains
- [ ] Test linking/unlinking

**Requirements**:
- Require password to unlink
- Prevent removing last auth method
- Update Account table

**Acceptance Criteria**:
- Can link multiple providers
- Cannot remove last method
- Unlinking requires password

---

### Task 4.4: Setup 2FA (TOTP)

**Status**: Pending
**Priority**: High
**Estimated Time**: 5 hours
**Dependencies**: Phase 3 complete
**Type**: Feature

**Description**:
Implement two-factor authentication with authenticator apps.

**Deliverables**:
- [ ] Install TOTP library (e.g., `otpauth`)
- [ ] Create 2FA setup page (`/settings/2fa`)
- [ ] Generate TOTP secret
- [ ] Display QR code for authenticator app
- [ ] Generate 10 backup codes
- [ ] Require entering first code to enable
- [ ] Store secret and backup codes (hashed)
- [ ] Display backup codes with download option
- [ ] Test 2FA setup flow

**Requirements**:
- Use standard TOTP algorithm (RFC 6238)
- 30-second time window
- 6-digit codes
- Hash backup codes
- Show codes only once

**Acceptance Criteria**:
- QR code scans in authenticator apps
- Setup requires valid code
- Backup codes work
- 2FA can be enabled/disabled

---

### Task 4.5: Implement 2FA Login Flow

**Status**: Pending
**Priority**: High
**Estimated Time**: 3 hours
**Dependencies**: Task 4.4
**Type**: Feature

**Description**:
Add 2FA verification step to login flow.

**Deliverables**:
- [ ] Create 2FA verification page
- [ ] 6-digit TOTP code input
- [ ] "Use backup code" option
- [ ] Backup code input (different UI)
- [ ] "Trust this device" checkbox (30-day cookie)
- [ ] Validate TOTP code
- [ ] Mark backup codes as used
- [ ] Rate limit 2FA attempts
- [ ] Test 2FA login

**Requirements**:
- Show after password verification
- Support both TOTP and backup codes
- Trusted devices skip 2FA
- Rate limiting prevents guessing

**Acceptance Criteria**:
- 2FA verification works
- Backup codes work
- Trusted devices work
- Rate limiting works

---

### Task 4.6: Implement 2FA Management

**Status**: Pending
**Priority**: Medium
**Estimated Time**: 2 hours
**Dependencies**: Task 4.5
**Type**: Feature

**Description**:
Allow users to manage 2FA settings.

**Deliverables**:
- [ ] Disable 2FA option (require password + code)
- [ ] Regenerate backup codes
- [ ] View trusted devices
- [ ] Remove trusted devices
- [ ] Download backup codes again (require password)

**Requirements**:
- Require 2FA code to disable
- Generate new backup codes invalidates old ones
- Clear trusted devices on 2FA disable

**Acceptance Criteria**:
- Can disable 2FA securely
- Can regenerate backup codes
- Can manage trusted devices

---

### Task 4.7: Implement Passwordless Login (Magic Links)

**Status**: Pending
**Priority**: Low
**Estimated Time**: 4 hours
**Dependencies**: Task 1.5
**Type**: Feature

**Description**:
Add passwordless authentication via email magic links.

**Deliverables**:
- [ ] Add "Sign in with email link" option
- [ ] Generate secure magic link token
- [ ] Store token with 15-minute expiration
- [ ] Send magic link email
- [ ] Create magic link verification page
- [ ] Validate token and create session
- [ ] Rate limit magic link requests

**Requirements**:
- Use Better Auth magic link plugin
- Short expiration (15 minutes)
- One-time use tokens
- Rate limiting

**Acceptance Criteria**:
- Magic links work
- Tokens expire correctly
- One-time use enforced
- Good UX

---

### ✅ CHECKPOINT 4 - Advanced Features Complete

**Target Validation**:
- [ ] Social auth (Google, GitHub) works
- [ ] Accounts can be linked
- [ ] 2FA can be enabled and used
- [ ] Trusted devices work
- [ ] Magic links work (optional)

---

## Phase 5: Polish & Optimization 📅 FUTURE

**Objective**: Final polish, performance optimization, and advanced features
**Checkpoint**: ✅ Final - Production-ready and battle-tested
**Status**: Not Started (0%)
**Estimated Time**: 8-10 hours

---

### Task 5.1: Add Password Strength Meter

**Status**: Pending
**Priority**: Medium
**Estimated Time**: 2 hours
**Dependencies**: Task 2.3
**Type**: UX

**Description**:
Add visual password strength indicator to password inputs.

**Deliverables**:
- [ ] Install password strength library (e.g., `zxcvbn`)
- [ ] Create strength meter component
- [ ] Display strength (weak/medium/strong/very strong)
- [ ] Color-coded progress bar
- [ ] Real-time feedback as user types
- [ ] Suggestions for stronger passwords

**Acceptance Criteria**:
- Meter updates in real-time
- Strength calculation accurate
- Helpful suggestions provided

---

### Task 5.2: Implement Session Timeout Warning

**Status**: Pending
**Priority**: Low
**Estimated Time**: 2 hours
**Dependencies**: None
**Type**: UX

**Description**:
Warn users before session expires and allow extension.

**Deliverables**:
- [ ] Detect session near expiration (5 minutes before)
- [ ] Show modal: "Your session will expire in X minutes"
- [ ] "Stay logged in" button to extend
- [ ] Auto-logout if no action
- [ ] Countdown timer in modal

**Requirements**:
- Check session expiration in middleware
- Non-intrusive warning
- Easy to extend session

**Acceptance Criteria**:
- Warning shows 5 minutes before expiry
- Can extend session
- Auto-logout works

---

### Task 5.3: Add Toast Notifications

**Status**: Pending
**Priority**: Medium
**Estimated Time**: 2 hours
**Dependencies**: None
**Type**: UX

**Description**:
Add toast notifications for success/error feedback.

**Deliverables**:
- [ ] Install toast library (e.g., `sonner`)
- [ ] Create toast component
- [ ] Add success toasts:
  - "Logged in successfully"
  - "Password changed"
  - "Email verified"
- [ ] Add error toasts for failures
- [ ] Auto-dismiss after 5 seconds
- [ ] Action buttons in toasts (optional)

**Requirements**:
- Non-blocking notifications
- Auto-dismiss
- Accessible
- Consistent styling

**Acceptance Criteria**:
- Toasts display correctly
- Auto-dismiss works
- Good UX

---

### Task 5.4: Optimize Email Delivery

**Status**: Pending
**Priority**: Low
**Estimated Time**: 3 hours
**Dependencies**: Task 1.5
**Type**: Optimization

**Description**:
Optimize email sending for reliability and performance.

**Deliverables**:
- [ ] Implement email queue (Bull, BullMQ)
- [ ] Add retry logic (3 attempts with backoff)
- [ ] Handle bounces and complaints
- [ ] Track delivery status
- [ ] Log failed sends
- [ ] Optional: Fallback email provider

**Requirements**:
- Queue in Redis or database
- Retry with exponential backoff
- Handle all Resend errors

**Acceptance Criteria**:
- Emails queue correctly
- Retries work
- Bounces handled
- Performance improved

---

### Task 5.5: Add Account Deletion

**Status**: Pending
**Priority**: Low
**Estimated Time**: 3 hours
**Dependencies**: Phase 3 complete
**Type**: Feature

**Description**:
Allow users to delete their account (GDPR requirement).

**Deliverables**:
- [ ] Create delete account page (`/settings/delete-account`)
- [ ] Require password confirmation
- [ ] Show warning about data deletion
- [ ] List what will be deleted
- [ ] Final confirmation modal
- [ ] Delete user and related data
- [ ] Invalidate all sessions
- [ ] Send goodbye email
- [ ] Redirect to homepage

**Requirements**:
- Irreversible action (clear warning)
- Password confirmation required
- Delete all user data (GDPR)
- Cascade delete (sessions, etc.)

**Acceptance Criteria**:
- Account deletes successfully
- All data removed
- Sessions invalidated
- Goodbye email sent

---

### ✅ FINAL CHECKPOINT - Production Ready

**Target Validation**:
- [ ] All Phase 1-4 features complete
- [ ] All security features implemented
- [ ] All UX enhancements done
- [ ] Performance optimized
- [ ] Zero TypeScript errors
- [ ] Zero security vulnerabilities
- [ ] All tests passing
- [ ] Documentation complete
- [ ] Ready for production deployment

---

## Summary

### Total Tasks: 31

**By Phase:**
- Phase 1 (Core Auth + Email): 10 tasks ✅ **COMPLETE**
- Phase 2 (Security): 6 tasks 🚧 **PENDING**
- Phase 3 (UX): 6 tasks 📅 **PLANNED**
- Phase 4 (Advanced): 6 tasks 📅 **FUTURE**
- Phase 5 (Polish): 5 tasks 📅 **FUTURE**

**By Status:**
- Completed: 10 tasks (32%)
- In Progress: 0 tasks (0%)
- Pending: 21 tasks (68%)

**By Priority:**
- Critical: 5 tasks (3 done, 2 pending)
- High: 10 tasks (7 done, 3 pending)
- Medium: 9 tasks (0 done, 9 pending)
- Low: 7 tasks (0 done, 7 pending)

### Time Estimates

**Completed:**
- Phase 1: ~25-30 hours ✅

**Remaining:**
- Phase 2: ~15-20 hours (Security)
- Phase 3: ~12-15 hours (UX)
- Phase 4: ~20-25 hours (Advanced)
- Phase 5: ~8-10 hours (Polish)

**Total Remaining:** ~55-70 hours

**Total Project:** ~80-100 hours

### Critical Path

```
Phase 1 (Complete) → Phase 2 (Security) → Phase 3 (UX) → Phase 4 (Advanced) → Phase 5 (Polish)
```

### Completion Status

**Overall:** 60% Feature Complete (30% Total Effort)

| Phase | Status | Tasks Done | Total Tasks | % Complete |
|-------|--------|------------|-------------|------------|
| Phase 1 | ✅ Complete | 10 | 10 | 100% |
| Phase 2 | 🚧 Not Started | 0 | 6 | 0% |
| Phase 3 | 📅 Planned | 0 | 6 | 0% |
| Phase 4 | 📅 Future | 0 | 6 | 0% |
| Phase 5 | 📅 Future | 0 | 5 | 0% |

---

## Risk Mitigation

- Test thoroughly after each checkpoint
- Commit after successful checkpoints
- Document security decisions
- Regular security audits
- Monitor auth metrics
- Keep dependencies updated

---

**Next Up:** Phase 2 - Security Hardening (Tasks 2.1-2.6)

**Current Status:** Production-ready MVP with core auth flows. Security hardening recommended before production deployment.
