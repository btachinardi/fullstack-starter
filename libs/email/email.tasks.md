# Email Service - Task Breakdown

> **Source**: email.prd.md
> **Status**: In Progress (70% Complete)
> **Priority**: High
> **Estimated Effort**: 25-30 hours total (18-20 hours completed, 7-10 hours remaining)

---

## Phase 1: Core Email System ✅ COMPLETE

**Objective**: Build foundational email system with React Email and Resend
**Checkpoint**: ✅ Checkpoint 1 - Emails can be built, previewed, and sent
**Status**: Complete (100%)
**Time Spent**: 18-20 hours

---

### Task 1.1: Create Email Templates Package ✅

**Status**: Completed
**Priority**: Critical
**Estimated Time**: 3 hours
**Actual Time**: 3 hours
**Dependencies**: None
**Type**: Infrastructure

**Description**:
Create `libs/email/templates` package with React Email for building email templates.

**Deliverables**:
- [x] Create `libs/email/templates/` directory structure
- [x] Create `package.json` with React Email dependencies
- [x] Create `tsconfig.json` for React Email
- [x] Install `react-email` CLI for preview
- [x] Install `@react-email/components` for email components
- [x] Configure preview server on port 3002
- [x] Export package from `src/index.ts`

**Requirements**:
- Use React Email 3.0+
- Support TypeScript
- Hot reload for development
- No build step needed (use source files directly)

**Acceptance Criteria**:
- Package structure created
- Dependencies installed
- TypeScript configuration works
- Can be imported by email/api package

---

### Task 1.2: Create Base Email Components ✅

**Status**: Completed
**Priority**: Critical
**Estimated Time**: 2 hours
**Actual Time**: 2 hours
**Dependencies**: Task 1.1
**Type**: Implementation

**Description**:
Create reusable email components for consistent email design.

**Deliverables**:
- [x] Create `EmailLayout` component
  - Header with logo/product name
  - Content area
  - Footer with links and copyright
  - Customizable branding props
  - Responsive design
- [x] Create `EmailButton` component
  - CTA button with hover states
  - Customizable styles
  - Accessible button element
- [x] Export components from index

**Requirements**:
- Mobile-responsive (max 600px width)
- Inline CSS (email client compatible)
- Support for all major email clients
- Dark mode compatible (future)

**Acceptance Criteria**:
- Components render correctly
- Responsive on mobile
- Work in Gmail, Outlook, Apple Mail
- Branding customization works

---

### Task 1.3: Create Authentication Email Templates ✅

**Status**: Completed
**Priority**: Critical
**Estimated Time**: 4 hours
**Actual Time**: 4 hours
**Dependencies**: Task 1.2
**Type**: Implementation

**Description**:
Create email templates for authentication flows.

**Deliverables**:
- [x] Create `VerificationEmail` template
  - Display 6-digit OTP code prominently
  - Include fallback verification link
  - Show expiration time (15 minutes)
  - Security disclaimer
  - Support branding customization
- [x] Create `PasswordResetEmail` template
  - Reset password button with secure link
  - Show expiration time (1 hour)
  - Security tips
  - "Didn't request this?" disclaimer
- [x] Create `WelcomeEmail` template
  - Friendly welcome message
  - Dashboard CTA button
  - Getting started tips
  - Support contact info
- [x] Export all templates from index

**Requirements**:
- All templates use EmailLayout
- Consistent styling across templates
- Mobile-responsive
- Professional appearance

**Acceptance Criteria**:
- Templates render beautifully
- All required props typed correctly
- Branding overrides work
- Mobile rendering perfect

---

### Task 1.4: Setup Email Preview Server ✅

**Status**: Completed
**Priority**: High
**Estimated Time**: 1 hour
**Actual Time**: 1 hour
**Dependencies**: Task 1.3
**Type**: Configuration

**Description**:
Configure React Email dev server for live email preview.

**Deliverables**:
- [x] Configure `email dev` script in package.json
- [x] Set preview port to 3002
- [x] Point to `src/emails/` directory
- [x] Add `email:preview` script to root package.json
- [x] Test preview server starts correctly
- [x] Verify all templates appear in preview
- [x] Test hot reload works

**Requirements**:
- Port 3002 (avoid conflicts)
- Hot reload on file changes
- Show all templates in sidebar
- Allow switching between templates

**Acceptance Criteria**:
- `pnpm email:preview` starts server
- All templates visible in preview
- Hot reload works (<1s)
- Can view HTML source

---

### Task 1.5: Create Email API Package ✅

**Status**: Completed
**Priority**: Critical
**Estimated Time**: 2 hours
**Actual Time**: 2 hours
**Dependencies**: None
**Type**: Infrastructure

**Description**:
Create `libs/email/api` package with Resend integration.

**Deliverables**:
- [x] Create `libs/email/api/` directory structure
- [x] Create `package.json` with Resend dependencies
- [x] Create `tsconfig.json` matching core/api
- [x] Install `resend` SDK
- [x] Install `@react-email/render` for React → HTML
- [x] Export package from `src/index.ts`

**Requirements**:
- Use Resend SDK 4.0+
- TypeScript strict mode
- Match core/api package structure
- Minimal dependencies

**Acceptance Criteria**:
- Package builds successfully
- Can import Resend SDK
- Can import email templates
- TypeScript types work

---

### Task 1.6: Implement EmailService ✅

**Status**: Completed
**Priority**: Critical
**Estimated Time**: 3 hours
**Actual Time**: 3 hours
**Dependencies**: Tasks 1.4, 1.5
**Type**: Implementation

**Description**:
Create EmailService class for sending emails via Resend.

**Deliverables**:
- [x] Create `EmailService` class
- [x] Injectable decorator for NestJS
- [x] Constructor accepts EmailConfig
- [x] Initialize Resend client
- [x] Implement `sendEmail()` method
  - Accept to, subject, React template
  - Render React component to HTML
  - Send via Resend API
  - Handle errors
  - Return result
- [x] Implement helper methods (sendVerificationEmail, etc.)
- [x] Add comprehensive error handling
- [x] Add TypeScript types for all methods

**Requirements**:
- Render React components with @react-email/render
- Pass branding from config to templates
- Throw clear errors on failures
- Return Resend response data

**Acceptance Criteria**:
- Service builds successfully
- Can render React templates
- Emails send via Resend
- Error handling works
- Type-safe API

---

### Task 1.7: Create Email Module ✅

**Status**: Completed
**Priority**: Critical
**Estimated Time**: 1 hour
**Actual Time**: 1 hour
**Dependencies**: Task 1.6
**Type**: Infrastructure

**Description**:
Create NestJS module for email functionality.

**Deliverables**:
- [x] Create `EmailModule` class
- [x] Implement `forRoot()` static method
- [x] Accept EmailConfig parameter
- [x] Provide EmailService
- [x] Make module global (available everywhere)
- [x] Export module from index

**Requirements**:
- Use NestJS dynamic modules pattern
- Global module (no need to import everywhere)
- Type-safe configuration
- Singleton EmailService

**Acceptance Criteria**:
- Module can be imported in AppModule
- EmailService is injectable
- Configuration works
- Global availability works

---

### Task 1.8: Integrate with Core Packages ✅

**Status**: Completed
**Priority**: High
**Estimated Time**: 1 hour
**Actual Time**: 1 hour
**Dependencies**: Task 1.7
**Type**: Integration

**Description**:
Integrate email packages with core/api for convenient imports.

**Deliverables**:
- [x] Add `@libs/email/api` dependency to `libs/core/api`
- [x] Re-export EmailService from `libs/core/api`
- [x] Re-export EmailModule from `libs/core/api`
- [x] Update pnpm-workspace.yaml with `libs/email/*`
- [x] Add `email:preview` script to root package.json
- [x] Run pnpm install to link packages

**Requirements**:
- Follow existing re-export pattern
- Maintain type safety
- No breaking changes

**Acceptance Criteria**:
- Can import from `@libs/core/api`
- TypeScript autocomplete works
- No circular dependencies
- Builds successfully

---

### Task 1.9: Integrate with Authentication ✅

**Status**: Completed
**Priority**: Critical
**Estimated Time**: 2 hours
**Actual Time**: 2 hours
**Dependencies**: Tasks 1.7, auth system
**Type**: Integration

**Description**:
Integrate EmailService with Better Auth for verification emails.

**Deliverables**:
- [x] Add email verification callback to Better Auth config
- [x] Inject EmailService into AuthModule
- [x] Configure callback to use VerificationEmail template
- [x] Extract verification token from URL
- [x] Send verification email on signup
- [x] Add console logging for integration status
- [x] Handle case where EmailService not available

**Requirements**:
- Use Better Auth's `sendVerificationEmail` callback
- Integrate without breaking auth if email unavailable
- Clear logging for debugging
- Type-safe integration

**Acceptance Criteria**:
- Verification emails send on signup
- Email contains correct OTP code
- Integration works gracefully
- Auth doesn't break if email unavailable

---

### Task 1.10: Create Email Documentation ✅

**Status**: Completed
**Priority**: High
**Estimated Time**: 3 hours
**Actual Time**: 3 hours
**Dependencies**: All Phase 1 tasks
**Type**: Documentation

**Deliverables**:
- [x] Create `EMAIL_SERVICE.md`
  - Setup guide
  - Template documentation
  - API reference
  - Customization examples
  - Resend configuration
  - Testing guide
- [x] Create `email.prd.md`
- [x] Update `apps/api/.env.example` with email vars
- [x] Create technical summary in `ai/docs/`
- [x] Add examples for each template

**Requirements**:
- Clear step-by-step instructions
- Working code examples
- Troubleshooting section
- Complete API reference

**Acceptance Criteria**:
- Documentation is comprehensive
- Examples work correctly
- Setup guide tested
- All templates documented

---

### ✅ CHECKPOINT 1 - Core Email System Complete

**Validation Checklist**:
- [x] Email templates can be built with React
- [x] Templates render to HTML correctly
- [x] Preview server works at localhost:3002
- [x] All templates display in preview
- [x] Emails send via Resend
- [x] EmailService is injectable
- [x] Integration with auth works
- [x] Branding is customizable
- [x] Documentation is complete
- [x] Three email templates available

**Status**: ✅ PASSED (2025-10-23)

---

## Phase 2: Enhanced Template Library 📅 PLANNED

**Objective**: Expand template library and add advanced email components
**Checkpoint**: ✅ Checkpoint 2 - Comprehensive email template library
**Status**: Not Started (0%)
**Estimated Time**: 8-10 hours

---

### Task 2.1: Create Security Alert Email Templates

**Status**: Pending
**Priority**: High
**Estimated Time**: 2 hours
**Dependencies**: Phase 1 complete
**Type**: Implementation

**Description**:
Create email templates for security-related notifications.

**Deliverables**:
- [ ] Create `PasswordChangedEmail` template
  - Confirmation of password change
  - Timestamp and device info
  - "Not you?" security link
  - Support contact info
- [ ] Create `EmailChangedEmail` template
  - Notification to OLD email
  - New email address shown
  - "Revert change" action link
  - Security tips
- [ ] Create `NewDeviceAlertEmail` template
  - Alert about login from new device
  - Device details (browser, OS)
  - IP address and location (optional)
  - "Secure your account" button
  - Session management link
- [ ] Create `AccountLockedEmail` template
  - Account locked notification
  - Reason (failed login attempts)
  - Auto-unlock time
  - "Reset password" option
  - Support contact
- [ ] Export all templates from index

**Requirements**:
- Clear security messaging
- Prominent action buttons
- Device info displayed clearly
- Professional tone

**Acceptance Criteria**:
- All templates render correctly
- Security information displays clearly
- Action links work
- Mobile-responsive

---

### Task 2.2: Create Business Email Templates

**Status**: Pending
**Priority**: Medium
**Estimated Time**: 3 hours
**Dependencies**: Task 2.1
**Type**: Implementation

**Description**:
Create email templates for business/transactional purposes.

**Deliverables**:
- [ ] Create `InvoiceEmail` template
  - Invoice number and date
  - Itemized list with prices
  - Total amount with tax
  - "View Invoice" button
  - "Download PDF" link
  - Payment information
- [ ] Create `ReceiptEmail` template
  - Payment confirmation
  - Transaction details
  - Receipt number
  - Itemized breakdown
  - "View Receipt" button
- [ ] Create `SubscriptionEmail` template (activated/cancelled/renewed)
  - Subscription status
  - Plan details
  - Billing information
  - Next billing date
  - "Manage Subscription" button
- [ ] Export all templates from index

**Requirements**:
- Clear financial information
- Professional appearance
- Legal compliance ready
- Support currency formatting

**Acceptance Criteria**:
- Templates render correctly
- Financial data displays clearly
- Legal requirements met
- Mobile-responsive

---

### Task 2.3: Create Advanced Email Components

**Status**: Pending
**Priority**: Medium
**Estimated Time**: 3 hours
**Dependencies**: Task 2.1
**Type**: Implementation

**Description**:
Create advanced reusable email components.

**Deliverables**:
- [ ] Create `EmailHeading` component
  - Styled heading with hierarchy (h1, h2, h3)
  - Consistent typography
  - Customizable styles
- [ ] Create `EmailText` component
  - Styled paragraph text
  - Consistent line height and spacing
  - Support for bold, italic, links
- [ ] Create `EmailTable` component
  - Data table for invoices, receipts
  - Responsive on mobile
  - Alternating row colors
  - Header row styling
- [ ] Create `EmailImage` component
  - Responsive images
  - Alt text support
  - Fallback for blocked images
- [ ] Create `EmailCodeBlock` component
  - Monospace code display
  - Syntax highlighting (optional)
  - Copy-paste friendly
- [ ] Create `EmailDivider` component
  - Horizontal rule
  - Customizable color and width
- [ ] Export all components from index

**Requirements**:
- Consistent with EmailLayout
- Reusable across all templates
- Mobile-responsive
- Email client compatible

**Acceptance Criteria**:
- All components render correctly
- Components are reusable
- Documentation for each component
- Examples in preview

---

### Task 2.4: Add Dark Mode Support

**Status**: Pending
**Priority**: Medium
**Estimated Time**: 2 hours
**Dependencies**: Tasks 2.1, 2.2, 2.3
**Type**: Enhancement

**Description**:
Add dark mode support to all email templates.

**Deliverables**:
- [ ] Research email client dark mode support
- [ ] Add dark mode CSS using media queries
- [ ] Update EmailLayout with dark mode styles
- [ ] Update all templates with dark mode support
- [ ] Test in dark mode email clients
- [ ] Add dark mode preview toggle

**Requirements**:
- Use CSS media query: `@media (prefers-color-scheme: dark)`
- Ensure good contrast in dark mode
- Test in Gmail, Apple Mail dark modes
- Fallback to light mode if unsupported

**Acceptance Criteria**:
- Dark mode works in supported clients
- Good contrast and readability
- Consistent dark mode experience
- Preview shows both modes

---

### ✅ CHECKPOINT 2 - Enhanced Template Library

**Target Validation**:
- [ ] 10+ email templates available
- [ ] Advanced components available
- [ ] Dark mode support implemented
- [ ] All templates documented
- [ ] Preview shows all templates

---

## Phase 3: Reliability & Performance 📅 PLANNED

**Objective**: Add email queue, retry logic, and delivery tracking
**Checkpoint**: ✅ Checkpoint 3 - System handles high volume reliably
**Status**: Not Started (0%)
**Estimated Time**: 10-12 hours

---

### Task 3.1: Implement Email Queue

**Status**: Pending
**Priority**: High
**Estimated Time**: 4 hours
**Dependencies**: Phase 2 complete
**Type**: Infrastructure

**Description**:
Add email queue for reliable asynchronous email sending.

**Deliverables**:
- [ ] Install Bull or BullMQ
- [ ] Install Redis (or use in-memory for dev)
- [ ] Create `EmailQueue` service
- [ ] Create `EmailProcessor` for processing jobs
- [ ] Add jobs to queue instead of sending directly
- [ ] Implement job processing with retry
- [ ] Configure queue options:
  - Max attempts: 3
  - Backoff: Exponential (1s, 2s, 4s)
  - Timeout: 30s per job
- [ ] Add queue health checks
- [ ] Export queue service

**Requirements**:
- Use Bull or BullMQ (TypeScript-first)
- Redis for production, in-memory for dev
- Persistent jobs (survive restarts)
- Monitor queue depth

**Acceptance Criteria**:
- Emails queue correctly
- Jobs process asynchronously
- Retry logic works
- Queue survives restarts
- Health checks work

---

### Task 3.2: Implement Retry Logic

**Status**: Pending
**Priority**: High
**Estimated Time**: 2 hours
**Dependencies**: Task 3.1
**Type**: Reliability

**Description**:
Add intelligent retry logic for failed email sends.

**Deliverables**:
- [ ] Configure retry attempts (3 max)
- [ ] Implement exponential backoff (1s, 2s, 4s)
- [ ] Handle different error types:
  - Transient errors → retry
  - Invalid email → don't retry
  - Rate limit → delay and retry
  - Server errors → retry with backoff
- [ ] Move to dead letter queue after max retries
- [ ] Log retry attempts
- [ ] Alert on repeated failures

**Requirements**:
- Smart error classification
- Exponential backoff prevents server overload
- Dead letter queue for manual inspection
- Clear logging

**Acceptance Criteria**:
- Transient failures retry successfully
- Exponential backoff works
- Invalid emails don't retry
- Dead letter queue populated correctly

---

### Task 3.3: Add Email Delivery Tracking

**Status**: Pending
**Priority**: Medium
**Estimated Time**: 3 hours
**Dependencies**: Task 3.1
**Type**: Feature

**Description**:
Track email delivery status and store logs.

**Deliverables**:
- [ ] Create `EmailLog` model in database
- [ ] Store email send records:
  - User ID (if applicable)
  - Recipient email
  - Subject
  - Template name
  - Status (queued, sent, delivered, failed, bounced)
  - Resend email ID
  - Error message (if failed)
  - Timestamps (queued, sent, delivered)
- [ ] Update status from Resend webhooks
- [ ] Query email history by user
- [ ] Create cleanup job (delete logs after 90 days)
- [ ] Add indexes for common queries

**Requirements**:
- Asynchronous logging (don't slow sends)
- Webhook support for status updates
- Efficient queries
- Data retention policy

**Acceptance Criteria**:
- All emails logged
- Status updates from Resend
- Can query user email history
- Old logs cleaned up

---

### Task 3.4: Handle Bounces and Complaints

**Status**: Pending
**Priority**: Medium
**Estimated Time**: 2 hours
**Dependencies**: Task 3.3
**Type**: Reliability

**Description**:
Handle email bounces and spam complaints automatically.

**Deliverables**:
- [ ] Set up Resend webhooks for bounces/complaints
- [ ] Create webhook endpoint (`/webhooks/resend`)
- [ ] Handle bounce events:
  - Hard bounce → mark email as invalid
  - Soft bounce → retry later
  - Block bounce → user action required
- [ ] Handle spam complaints:
  - Mark user as unsubscribed from marketing
  - Log complaint
  - Review email content
- [ ] Update EmailLog with bounce/complaint status
- [ ] Optional: Alert admin on high bounce rate

**Requirements**:
- Validate webhook signatures
- Handle all Resend event types
- Update database accordingly
- Monitor bounce rates

**Acceptance Criteria**:
- Webhooks process correctly
- Bounces handled appropriately
- Complaints logged
- Email status updated

---

### Task 3.5: Optimize Email Performance

**Status**: Pending
**Priority**: Low
**Estimated Time**: 2 hours
**Dependencies**: Task 3.1
**Type**: Optimization

**Description**:
Optimize email sending for better performance.

**Deliverables**:
- [ ] Batch email sending (multiple recipients)
- [ ] Template caching (render once, send many)
- [ ] Connection pooling for Resend API
- [ ] Compress email HTML (minify)
- [ ] Optimize image loading in emails
- [ ] Monitor email send latency
- [ ] Add performance metrics

**Requirements**:
- Maintain deliverability
- Don't sacrifice quality for speed
- Monitor performance impact

**Acceptance Criteria**:
- Batch sending works
- Performance improves measurably
- Deliverability maintained
- Metrics tracked

---

### ✅ CHECKPOINT 3 - Reliability & Performance Complete

**Target Validation**:
- [ ] Email queue processes jobs
- [ ] Retry logic works correctly
- [ ] Delivery tracking implemented
- [ ] Bounces handled automatically
- [ ] Performance optimized
- [ ] Can handle 10,000 emails/hour

---

## Phase 4: Analytics & Monitoring 📅 FUTURE

**Objective**: Add comprehensive email analytics and monitoring
**Checkpoint**: ✅ Checkpoint 4 - Complete email observability
**Status**: Not Started (0%)
**Estimated Time**: 8-10 hours

---

### Task 4.1: Create Email Analytics Dashboard

**Status**: Pending
**Priority**: Medium
**Estimated Time**: 4 hours
**Dependencies**: Task 3.3
**Type**: Feature

**Description**:
Create dashboard for viewing email analytics.

**Deliverables**:
- [ ] Create email analytics page (`/admin/emails`)
- [ ] Display metrics:
  - Total emails sent (daily, weekly, monthly)
  - Delivery rate
  - Bounce rate
  - Spam complaint rate
  - Open rate (from Resend)
  - Click rate (from Resend)
- [ ] Charts/graphs for trends
- [ ] Filter by template type
- [ ] Filter by date range
- [ ] Export data as CSV
- [ ] Real-time updates

**Requirements**:
- Query EmailLog table
- Fetch metrics from Resend API
- Visualize data clearly
- Admin-only access

**Acceptance Criteria**:
- Dashboard displays correctly
- Metrics are accurate
- Filters work
- Charts helpful

---

### Task 4.2: Add Email Monitoring & Alerts

**Status**: Pending
**Priority**: Medium
**Estimated Time**: 2 hours
**Dependencies**: Task 4.1
**Type**: Operations

**Description**:
Monitor email system health and alert on issues.

**Deliverables**:
- [ ] Monitor delivery rate (alert if <90%)
- [ ] Monitor bounce rate (alert if >5%)
- [ ] Monitor queue depth (alert if >1000)
- [ ] Monitor Resend quota usage (alert at 80%)
- [ ] Send alerts to admin email or Slack
- [ ] Create health check endpoint for emails
- [ ] Dashboard for system health

**Requirements**:
- Real-time monitoring
- Configurable alert thresholds
- Multiple alert channels
- Historical data

**Acceptance Criteria**:
- Alerts send on threshold breach
- Health check works
- Dashboard shows system health
- Historical data retained

---

### Task 4.3: Implement Email Preferences

**Status**: Pending
**Priority**: Low
**Estimated Time**: 3 hours
**Dependencies**: None
**Type**: Feature

**Description**:
Allow users to manage email notification preferences.

**Deliverables**:
- [ ] Create email preferences page (`/settings/emails`)
- [ ] Create `EmailPreference` model in database
- [ ] Allow toggling email types:
  - Security alerts (always on)
  - Account notifications
  - Product updates
  - Marketing emails
- [ ] Unsubscribe link in emails
- [ ] Unsubscribe landing page
- [ ] Re-subscribe option
- [ ] Respect preferences when sending

**Requirements**:
- Security emails always send (override preferences)
- One-click unsubscribe
- GDPR/CAN-SPAM compliant
- Persist preferences

**Acceptance Criteria**:
- Users can set preferences
- Emails respect preferences
- Unsubscribe works
- Can re-subscribe

---

### Task 4.4: Add Email Testing Tools

**Status**: Pending
**Priority**: Low
**Estimated Time**: 2 hours
**Dependencies**: None
**Type**: Developer Tools

**Description**:
Add tools for testing emails during development.

**Deliverables**:
- [ ] Email capture in development mode
  - Store sent emails in memory
  - View captured emails in UI
  - Clear captured emails
- [ ] Send test email from preview server
- [ ] Email assertion helpers for tests
  - `expectEmailSent(to, subject)`
  - `getEmailByRecipient(email)`
  - `clearEmailInbox()`
- [ ] Snapshot testing for email HTML
- [ ] Integration test examples

**Requirements**:
- Dev-only (not in production)
- Simple API for tests
- Works with Jest/Vitest

**Acceptance Criteria**:
- Can capture emails in dev
- Test helpers work
- Snapshot tests pass
- Examples clear

---

### ✅ CHECKPOINT 4 - Analytics & Monitoring Complete

**Target Validation**:
- [ ] Email analytics dashboard works
- [ ] Monitoring alerts on issues
- [ ] Email preferences functional
- [ ] Testing tools available
- [ ] Complete observability

---

## Phase 5: Advanced Features 📅 FUTURE

**Objective**: Add advanced email features and optimizations
**Checkpoint**: ✅ Final - Enterprise-ready email system
**Status**: Not Started (0%)
**Estimated Time**: 12-15 hours

---

### Task 5.1: Implement Email Template Versioning

**Status**: Pending
**Priority**: Low
**Estimated Time**: 3 hours
**Dependencies**: Phase 4 complete
**Type**: Feature

**Description**:
Add versioning system for email templates.

**Deliverables**:
- [ ] Store template versions in database
- [ ] Track template changes over time
- [ ] A/B test different template versions
- [ ] Roll back to previous versions
- [ ] Preview template versions
- [ ] Analytics per version

**Requirements**:
- Version control for templates
- Easy rollback mechanism
- A/B testing support
- Performance tracking

**Acceptance Criteria**:
- Templates can be versioned
- Can roll back versions
- A/B testing works
- Analytics per version

---

### Task 5.2: Add Multi-Language Support

**Status**: Pending
**Priority**: Low
**Estimated Time**: 4 hours
**Dependencies**: None
**Type**: Feature

**Description**:
Support sending emails in multiple languages.

**Deliverables**:
- [ ] Create translation system for emails
- [ ] Store translations in JSON files
- [ ] Detect user language preference
- [ ] Pass language to email templates
- [ ] Translate email templates:
  - Verification email (en, es, fr, de)
  - Password reset email
  - Welcome email
- [ ] Language switcher in preview
- [ ] Default to English if translation missing

**Requirements**:
- Use i18n library (e.g., i18next)
- Support 4+ languages initially
- Fallback to English
- Easy to add new languages

**Acceptance Criteria**:
- Emails send in correct language
- Translations accurate
- Fallback works
- Easy to extend

---

### Task 5.3: Implement Email Scheduling

**Status**: Pending
**Priority**: Low
**Estimated Time**: 3 hours
**Dependencies**: Task 3.1 (queue)
**Type**: Feature

**Description**:
Allow scheduling emails to send at specific times.

**Deliverables**:
- [ ] Add `scheduledAt` parameter to sendEmail()
- [ ] Store scheduled emails in queue
- [ ] Process scheduled jobs at correct time
- [ ] Cancel scheduled emails option
- [ ] Reschedule emails option
- [ ] View scheduled emails in admin
- [ ] Time zone support

**Requirements**:
- Accurate scheduling (±1 minute)
- Time zone aware
- Can cancel/reschedule
- Persistent (survive restarts)

**Acceptance Criteria**:
- Emails send at scheduled time
- Can cancel scheduled sends
- Time zones handled correctly
- Scheduling UI works

---

### Task 5.4: Add Fallback Email Provider

**Status**: Pending
**Priority**: Low
**Estimated Time**: 3 hours
**Dependencies**: Task 3.2
**Type**: Reliability

**Description**:
Add fallback email provider for redundancy.

**Deliverables**:
- [ ] Add fallback provider configuration (SendGrid, Postmark, etc.)
- [ ] Detect Resend failures
- [ ] Auto-switch to fallback provider
- [ ] Track which provider used per email
- [ ] Switch back to primary when available
- [ ] Monitor fallback usage
- [ ] Alert when fallback activated

**Requirements**:
- Seamless failover
- No email loss
- Track provider usage
- Alert on failover

**Acceptance Criteria**:
- Failover works automatically
- All emails still send
- Provider usage tracked
- Alerts sent

---

### Task 5.5: Create Email Template CLI Generator

**Status**: Pending
**Priority**: Low
**Estimated Time**: 3 hours
**Dependencies**: None
**Type**: Developer Tools

**Description**:
Create CLI tool for generating new email templates.

**Deliverables**:
- [ ] Add `email generate` command to dev CLI
- [ ] Prompt for template name
- [ ] Prompt for template type (transactional, security, business)
- [ ] Generate template file from boilerplate
- [ ] Generate TypeScript types
- [ ] Add to exports in index.ts
- [ ] Open template in editor
- [ ] Add template to preview server

**Requirements**:
- Interactive CLI prompts
- Generated code follows patterns
- Includes helpful comments
- Ready to use immediately

**Acceptance Criteria**:
- Command generates template
- Template follows conventions
- Opens in editor
- Appears in preview

---

### ✅ FINAL CHECKPOINT - Advanced Features Complete

**Target Validation**:
- [ ] Template versioning works
- [ ] Multi-language emails send
- [ ] Email scheduling works
- [ ] Fallback provider configured
- [ ] Template CLI generator works
- [ ] System is enterprise-ready

---

## Summary

### Total Tasks: 20

**By Phase:**
- Phase 1 (Core System): 10 tasks ✅ **COMPLETE**
- Phase 2 (Enhanced Templates): 4 tasks 📅 **PLANNED**
- Phase 3 (Reliability): 5 tasks 📅 **PLANNED**
- Phase 4 (Analytics): 4 tasks 📅 **FUTURE**
- Phase 5 (Advanced): 5 tasks 📅 **FUTURE**

**By Status:**
- Completed: 10 tasks (50%)
- In Progress: 0 tasks (0%)
- Pending: 10 tasks (50%)

**By Priority:**
- Critical: 6 tasks (6 done, 0 pending)
- High: 4 tasks (2 done, 2 pending)
- Medium: 7 tasks (2 done, 5 pending)
- Low: 3 tasks (0 done, 3 pending)

### Time Estimates

**Completed:**
- Phase 1: ~18-20 hours ✅

**Remaining:**
- Phase 2: ~8-10 hours (Enhanced Templates)
- Phase 3: ~10-12 hours (Reliability)
- Phase 4: ~8-10 hours (Analytics)
- Phase 5: ~12-15 hours (Advanced)

**Total Remaining:** ~38-47 hours

**Total Project:** ~56-67 hours

### Critical Path

```
Phase 1 (Complete) → Phase 2 (Templates) → Phase 3 (Reliability) → Phase 4 (Analytics) → Phase 5 (Advanced)
```

### Completion Status

**Overall:** 70% Feature Complete (35% Total Effort)

| Phase | Status | Tasks Done | Total Tasks | % Complete |
|-------|--------|------------|-------------|------------|
| Phase 1 | ✅ Complete | 10 | 10 | 100% |
| Phase 2 | 📅 Planned | 0 | 4 | 0% |
| Phase 3 | 📅 Planned | 0 | 5 | 0% |
| Phase 4 | 📅 Future | 0 | 4 | 0% |
| Phase 5 | 📅 Future | 0 | 5 | 0% |

---

## Current Architecture

### Package Structure

```
libs/email/
├── templates/                    ✅ Complete
│   ├── src/
│   │   ├── components/
│   │   │   ├── email-layout.tsx     ✅
│   │   │   └── email-button.tsx     ✅
│   │   ├── emails/
│   │   │   ├── verification-email.tsx     ✅
│   │   │   ├── password-reset-email.tsx   ✅
│   │   │   └── welcome-email.tsx          ✅
│   │   └── index.ts                 ✅
│   └── package.json                 ✅
│
└── api/                          ✅ Complete
    ├── src/
    │   ├── email.service.ts         ✅
    │   ├── email.module.ts          ✅
    │   └── index.ts                 ✅
    └── package.json                 ✅
```

### Integration Points

**With Authentication:**
- ✅ Verification emails on signup
- ✅ Password reset emails
- 🚧 Password changed notifications (pending)
- 🚧 Email changed notifications (pending)
- 🚧 New device alerts (pending)

**With Core API:**
- ✅ Re-exported from `@libs/core/api`
- ✅ Global module (available everywhere)

**Future Integrations:**
- 📅 With notifications module
- 📅 With billing module (invoices)
- 📅 With admin module (user management)

---

## Risk Mitigation

**Primary Risks:**
1. **Resend downtime** → Implement fallback provider
2. **Quota exceeded** → Monitor usage, upgrade plan, queue throttling
3. **Poor deliverability** → Configure SPF/DKIM/DMARC, monitor metrics
4. **Queue failures** → Redis persistence, health checks, dead letter queue

**Mitigation Strategy:**
- Implement email queue early
- Add comprehensive monitoring
- Configure fallback provider
- Regular deliverability testing

---

## Next Steps

### Immediate (Phase 2)
1. Create security alert email templates
2. Create business email templates (invoice, receipt)
3. Add advanced email components (Table, Image, etc.)
4. Implement dark mode support

### Short-term (Phase 3)
1. Implement email queue with Bull
2. Add retry logic with exponential backoff
3. Implement delivery tracking
4. Handle bounces and complaints

### Long-term (Phase 4-5)
1. Email analytics dashboard
2. Email preferences UI
3. Template versioning
4. Multi-language support

---

**Current Status:** Production-ready MVP for transactional emails. Core functionality complete. Enhanced features planned for future phases.

**Recommendation:** Phase 1 is sufficient for most applications. Implement Phase 2-3 as usage scales.
