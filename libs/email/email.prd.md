# Email Service - Product Requirements Document

**Version:** 1.0
**Status:** In Progress (70% Complete)
**Last Updated:** 2025-10-23
**Owner:** Engineering Team

---

## Executive Summary

Build a complete, production-ready email system for the fullstack starter monorepo using React Email and Resend. The system provides transactional email delivery, beautiful responsive email templates, live preview capabilities, and customizable branding for white-label applications.

**Target Users:**
- Developers building email-dependent features (auth, notifications, invoices)
- Product teams needing branded transactional emails
- End users receiving system emails (verification, alerts, invoices)

**Success Criteria:**
- ✅ Beautiful, responsive email templates built with React components
- ✅ Live preview for rapid template development
- ✅ Type-safe email sending API
- ✅ High deliverability rates (>95%)
- ✅ Customizable branding (white-label ready)
- ✅ Free tier friendly (3,000 emails/month)
- ✅ Easy to extend with new templates

---

## Problem Statement

### Current Pain Points

1. **No email infrastructure** in starter template
2. **HTML email development** is painful and error-prone
3. **Email testing** requires sending to real inboxes
4. **Template consistency** is hard to maintain
5. **Email deliverability** requires expertise
6. **Vendor lock-in** makes it hard to switch providers
7. **Email previews** require complex setups

### Opportunity

Create a **modern email system** that:
- Uses React components for email templates (familiar DX)
- Provides live preview during development
- Ensures high deliverability with proven service (Resend)
- Allows easy branding customization
- Supports all transactional email needs
- Works seamlessly with authentication and other features

---

## Goals & Objectives

### Primary Goals

1. **React-Based Templates** - Build emails with React components
2. **Live Preview** - See emails instantly during development
3. **High Deliverability** - Use Resend for reliable delivery
4. **Customizable Branding** - Easy white-labeling
5. **Type Safety** - Full TypeScript support
6. **Extensibility** - Easy to add new email templates

### Non-Goals (Out of Scope)

- ❌ Email marketing campaigns (transactional only)
- ❌ Email newsletter builder/editor
- ❌ A/B testing for emails
- ❌ Email analytics dashboard (use Resend dashboard)
- ❌ SMS delivery (email only)
- ❌ In-app notifications (separate feature)

---

## User Stories

### Developers

**As a developer, I want to:**
- [x] Build email templates with React components
- [x] Preview emails live during development
- [x] Send emails with a simple API call
- [x] Customize email branding per template
- [x] Use TypeScript for type-safe emails
- [ ] Create new email templates easily
- [ ] Test emails without sending to real addresses
- [ ] Monitor email delivery status
- [ ] Handle email failures gracefully
- [ ] Queue emails for high volume

### Product Teams

**As a product team, I want to:**
- [x] Customize email templates with our branding
- [x] Preview emails before sending
- [ ] Track email delivery rates
- [ ] Monitor email open rates
- [ ] See bounce and complaint rates
- [ ] A/B test email content (future)
- [ ] Ensure consistent brand across all emails

### End Users

**As an end user, I want to:**
- [x] Receive beautiful, professional emails
- [x] View emails properly on mobile devices
- [x] See emails in dark mode (if enabled)
- [ ] Unsubscribe from non-critical emails
- [ ] Trust that emails are from the legitimate service
- [ ] Access email content even with images disabled

---

## Functional Requirements

### 1. Email Template System

#### 1.1 React Email Components
- [x] **FR-1.1.1** Use React components to build email templates
- [x] **FR-1.1.2** Support JSX/TSX syntax for templates
- [x] **FR-1.1.3** TypeScript type safety for all components
- [x] **FR-1.1.4** Reusable email components (Layout, Button, etc.)
- [x] **FR-1.1.5** Inline CSS styles (email-safe)
- [x] **FR-1.1.6** Support for all major email clients
- [ ] **FR-1.1.7** Dark mode support for emails
- [ ] **FR-1.1.8** Accessibility (alt text, semantic HTML)

#### 1.2 Base Components
- [x] **FR-1.2.1** EmailLayout - Base layout with header/footer
- [x] **FR-1.2.2** EmailButton - CTA button component
- [ ] **FR-1.2.3** EmailHeading - Styled heading component
- [ ] **FR-1.2.4** EmailText - Styled text component
- [ ] **FR-1.2.5** EmailTable - Data table component
- [ ] **FR-1.2.6** EmailImage - Responsive image component
- [ ] **FR-1.2.7** EmailDivider - Horizontal rule component
- [ ] **FR-1.2.8** EmailCodeBlock - Code snippet component

#### 1.3 Template Library
- [x] **FR-1.3.1** Verification email template (OTP code)
- [x] **FR-1.3.2** Password reset email template (secure link)
- [x] **FR-1.3.3** Welcome email template (getting started)
- [ ] **FR-1.3.4** Password changed notification
- [ ] **FR-1.3.5** Email changed notification
- [ ] **FR-1.3.6** New device login alert
- [ ] **FR-1.3.7** Account locked notification
- [ ] **FR-1.3.8** Invoice email template
- [ ] **FR-1.3.9** Receipt email template
- [ ] **FR-1.3.10** Notification digest email
- [ ] **FR-1.3.11** Team invitation email
- [ ] **FR-1.3.12** Generic transactional email template

### 2. Email Delivery

#### 2.1 Resend Integration
- [x] **FR-2.1.1** Resend API integration
- [x] **FR-2.1.2** Send emails via Resend
- [x] **FR-2.1.3** Render React components to HTML
- [x] **FR-2.1.4** Type-safe email sending API
- [x] **FR-2.1.5** Error handling for failed sends
- [ ] **FR-2.1.6** Retry logic with exponential backoff
- [ ] **FR-2.1.7** Track email delivery status
- [ ] **FR-2.1.8** Handle bounces automatically
- [ ] **FR-2.1.9** Handle spam complaints

#### 2.2 Email Service
- [x] **FR-2.2.1** Injectable EmailService in NestJS
- [x] **FR-2.2.2** Global module (available everywhere)
- [x] **FR-2.2.3** Configuration via EmailModule.forRoot()
- [x] **FR-2.2.4** sendEmail() generic method
- [x] **FR-2.2.5** sendVerificationEmail() helper
- [x] **FR-2.2.6** sendPasswordResetEmail() helper
- [x] **FR-2.2.7** sendWelcomeEmail() helper
- [ ] **FR-2.2.8** sendInvoiceEmail() helper
- [ ] **FR-2.2.9** sendNotificationEmail() helper
- [ ] **FR-2.2.10** Batch send support (multiple recipients)

#### 2.3 Email Queue (Future)
- [ ] **FR-2.3.1** Queue emails for asynchronous sending
- [ ] **FR-2.3.2** Retry failed emails automatically
- [ ] **FR-2.3.3** Priority queue (urgent vs normal)
- [ ] **FR-2.3.4** Rate limit sending to avoid provider limits
- [ ] **FR-2.3.5** Dead letter queue for failed emails
- [ ] **FR-2.3.6** Monitor queue health
- [ ] **FR-2.3.7** Manual retry from admin UI

### 3. Email Preview & Testing

#### 3.1 Live Preview
- [x] **FR-3.1.1** React Email dev server integration
- [x] **FR-3.1.2** Preview at http://localhost:3002
- [x] **FR-3.1.3** View all email templates
- [x] **FR-3.1.4** Switch between templates
- [x] **FR-3.1.5** View HTML source
- [x] **FR-3.1.6** Mobile/desktop preview
- [x] **FR-3.1.7** Dark mode preview
- [ ] **FR-3.1.8** Test with different data sets
- [ ] **FR-3.1.9** Copy HTML for manual testing
- [ ] **FR-3.1.10** Send test email from preview

#### 3.2 Email Testing
- [ ] **FR-3.2.1** Send to test email addresses
- [ ] **FR-3.2.2** Test mode (don't actually send)
- [ ] **FR-3.2.3** Capture emails in development
- [ ] **FR-3.2.4** Email assertion helpers for tests
- [ ] **FR-3.2.5** Integration test support
- [ ] **FR-3.2.6** Snapshot testing for email HTML

### 4. Branding & Customization

#### 4.1 Global Branding
- [x] **FR-4.1.1** Customizable product name (global)
- [x] **FR-4.1.2** Customizable logo URL (global)
- [x] **FR-4.1.3** Customizable footer links (global)
- [ ] **FR-4.1.4** Customizable color scheme (global)
- [ ] **FR-4.1.5** Customizable font family (global)
- [ ] **FR-4.1.6** Customizable header/footer templates

#### 4.2 Per-Template Branding
- [x] **FR-4.2.1** Override product name per template
- [x] **FR-4.2.2** Override logo URL per template
- [x] **FR-4.2.3** Override footer links per template
- [ ] **FR-4.2.4** Custom header content per template
- [ ] **FR-4.2.5** Custom footer content per template
- [ ] **FR-4.2.6** Template-specific color overrides

### 5. Email Analytics & Monitoring

#### 5.1 Delivery Tracking
- [ ] **FR-5.1.1** Track email delivery status (sent, delivered, failed)
- [ ] **FR-5.1.2** Store email send records in database
- [ ] **FR-5.1.3** Query email history by user
- [ ] **FR-5.1.4** Resend failed emails
- [ ] **FR-5.1.5** Email delivery dashboard (admin)

#### 5.2 Email Metrics
- [ ] **FR-5.2.1** Track delivery rate
- [ ] **FR-5.2.2** Track bounce rate
- [ ] **FR-5.2.3** Track spam complaint rate
- [ ] **FR-5.2.4** Track open rate (via Resend)
- [ ] **FR-5.2.5** Track click rate (via Resend)
- [ ] **FR-5.2.6** Metrics dashboard

#### 5.3 Error Handling
- [x] **FR-5.3.1** Catch and log email send errors
- [x] **FR-5.3.2** Return meaningful error messages
- [ ] **FR-5.3.3** Alert admin on critical failures
- [ ] **FR-5.3.4** Track error patterns
- [ ] **FR-5.3.5** Auto-switch to fallback provider on failures

### 6. Email Standards & Compliance

#### 6.1 Deliverability
- [ ] **FR-6.1.1** SPF records configured
- [ ] **FR-6.1.2** DKIM signatures enabled
- [ ] **FR-6.1.3** DMARC policy configured
- [ ] **FR-6.1.4** Domain verification in Resend
- [ ] **FR-6.1.5** Proper from/reply-to addresses
- [ ] **FR-6.1.6** Unsubscribe links (for marketing emails)

#### 6.2 Content Best Practices
- [x] **FR-6.2.1** Plain text fallback for HTML emails
- [x] **FR-6.2.2** Responsive design (mobile-first)
- [x] **FR-6.2.3** Images have alt text
- [ ] **FR-6.2.4** Proper email subject lines
- [ ] **FR-6.2.5** Preview text optimization
- [ ] **FR-6.2.6** Avoid spam trigger words
- [ ] **FR-6.2.7** CAN-SPAM compliance

### 7. Developer Experience

#### 7.1 API Usability
- [x] **FR-7.1.1** Simple send API (one method call)
- [x] **FR-7.1.2** Type-safe parameters
- [x] **FR-7.1.3** Autocomplete support in IDE
- [x] **FR-7.1.4** Clear error messages
- [ ] **FR-7.1.5** Email validation helpers
- [ ] **FR-7.1.6** Template prop validation
- [ ] **FR-7.1.7** Async/await support

#### 7.2 Documentation
- [x] **FR-7.2.1** Setup guide with examples
- [x] **FR-7.2.2** Template creation guide
- [x] **FR-7.2.3** API documentation
- [x] **FR-7.2.4** Customization examples
- [ ] **FR-7.2.5** Troubleshooting guide
- [ ] **FR-7.2.6** Best practices guide
- [ ] **FR-7.2.7** Migration guide (from other providers)

#### 7.3 Development Tools
- [x] **FR-7.3.1** Live preview server (`pnpm email:preview`)
- [x] **FR-7.3.2** Hot reload during development
- [x] **FR-7.3.3** Template switching in preview
- [ ] **FR-7.3.4** Send test emails from preview
- [ ] **FR-7.3.5** Email template CLI generator
- [ ] **FR-7.3.6** Email HTML export command

---

## Non-Functional Requirements

### Performance

- **NFR-1.1** Email send API response < 1s
- **NFR-1.2** Email delivery < 5s (Resend processing)
- **NFR-1.3** Template rendering < 100ms
- **NFR-1.4** Preview server start < 10s
- **NFR-1.5** Preview hot reload < 1s
- **NFR-1.6** Support 1,000 emails/hour sustained
- **NFR-1.7** Support 10,000 emails/hour burst (with queue)

### Deliverability

- **NFR-2.1** Delivery rate > 95%
- **NFR-2.2** Inbox placement rate > 90%
- **NFR-2.3** Bounce rate < 2%
- **NFR-2.4** Spam complaint rate < 0.1%
- **NFR-2.5** Email rendering in 30+ email clients
- **NFR-2.6** Mobile rendering accuracy > 95%

### Reliability

- **NFR-3.1** 99.9% uptime for email service
- **NFR-3.2** Automatic retry for transient failures
- **NFR-3.3** Fallback to secondary provider (optional)
- **NFR-3.4** Queue persistence (survive restarts)
- **NFR-3.5** Graceful degradation if Resend down

### Scalability

- **NFR-4.1** Support 100,000+ emails/month
- **NFR-4.2** Horizontal scaling (stateless service)
- **NFR-4.3** Queue can handle 10,000+ pending emails
- **NFR-4.4** Database efficient for email logs

### Developer Experience

- **NFR-5.1** Setup time < 5 minutes
- **NFR-5.2** New template creation < 30 minutes
- **NFR-5.3** Preview load time < 3s
- **NFR-5.4** TypeScript autocomplete for all APIs
- **NFR-5.5** Clear error messages with solutions
- **NFR-5.6** Working examples for all use cases

### Maintainability

- **NFR-6.1** 100% TypeScript coverage
- **NFR-6.2** Unit test coverage > 80%
- **NFR-6.3** Comprehensive documentation
- **NFR-6.4** Modular architecture (easy to swap providers)
- **NFR-6.5** No vendor lock-in (templates portable)

---

## Technical Architecture

### Email Stack

- **Template Engine:** React Email 3.0+
- **Components:** @react-email/components
- **Rendering:** @react-email/render (React → HTML)
- **Delivery:** Resend API 4.0+
- **Preview:** React Email dev server
- **Queue:** Bull/BullMQ (future)
- **Storage:** Redis (for queue) + PostgreSQL (for logs)

### Package Architecture

```
libs/email/
├── templates/                    # React Email templates
│   ├── src/
│   │   ├── components/          # Shared email components
│   │   │   ├── email-layout.tsx
│   │   │   ├── email-button.tsx
│   │   │   ├── email-heading.tsx (future)
│   │   │   ├── email-table.tsx (future)
│   │   │   └── email-image.tsx (future)
│   │   └── emails/              # Email templates
│   │       ├── verification-email.tsx
│   │       ├── password-reset-email.tsx
│   │       ├── welcome-email.tsx
│   │       ├── password-changed-email.tsx (future)
│   │       ├── new-device-alert.tsx (future)
│   │       ├── invoice-email.tsx (future)
│   │       └── notification-email.tsx (future)
│   └── package.json
│
└── api/                          # Email sending service
    ├── src/
    │   ├── email.service.ts     # Core EmailService
    │   ├── email.module.ts      # NestJS module
    │   ├── email.queue.ts       # Queue service (future)
    │   ├── email.processor.ts   # Queue processor (future)
    │   └── email.logger.ts      # Email logging (future)
    └── package.json
```

### Data Models (Future)

```prisma
// Future: Email tracking
model EmailLog {
  id          String   @id @default(cuid())
  userId      String?
  to          String
  subject     String
  template    String   // Template name
  status      EmailStatus // QUEUED, SENT, DELIVERED, FAILED, BOUNCED
  resendId    String?  // Resend email ID
  error       String?
  sentAt      DateTime?
  deliveredAt DateTime?
  createdAt   DateTime @default(now())

  @@index([userId])
  @@index([status])
  @@index([createdAt])
}

enum EmailStatus {
  QUEUED
  SENT
  DELIVERED
  FAILED
  BOUNCED
  COMPLAINED
}
```

---

## API Specification

### EmailService Methods

#### Core Methods

```typescript
class EmailService {
  // Generic send method
  async sendEmail(params: {
    to: string;
    subject: string;
    template: ReactElement;
  }): Promise<EmailResult>

  // Batch send
  async sendBatch(params: {
    emails: Array<{ to: string; subject: string; template: ReactElement }>;
  }): Promise<EmailResult[]>
}
```

#### Helper Methods

```typescript
// Auth-related emails
async sendVerificationEmail(params: { to, subject, template })
async sendPasswordResetEmail(params: { to, subject, template })
async sendWelcomeEmail(params: { to, subject, template })

// Future helpers
async sendInvoiceEmail(params: { to, subject, template })
async sendNotificationEmail(params: { to, subject, template })
async sendAlertEmail(params: { to, subject, template })
```

### EmailModule Configuration

```typescript
EmailModule.forRoot({
  apiKey: string;           // Required: Resend API key
  from: string;             // Required: Default sender
  productName?: string;     // Optional: Product name for branding
  logoUrl?: string;         // Optional: Logo for emails
  replyTo?: string;         // Optional: Reply-to address
  fallbackProvider?: {      // Optional: Backup email provider
    apiKey: string;
    from: string;
  };
})
```

---

## Email Template Specifications

### Verification Email

**Purpose:** Verify user email address after signup

**Required Props:**
- `code: string` - 6-digit OTP code
- `verificationUrl: string` - Fallback verification link

**Optional Props:**
- `name?: string` - User's name for personalization
- `productName?: string` - Override global product name
- `logoUrl?: string` - Override global logo

**Key Elements:**
- Large, centered OTP code
- Clear expiration notice (15 minutes)
- Fallback verification button
- Security disclaimer
- Product branding

---

### Password Reset Email

**Purpose:** Send secure link for password reset

**Required Props:**
- `resetUrl: string` - Password reset URL with token

**Optional Props:**
- `name?: string` - User's name
- `productName?: string` - Product name
- `logoUrl?: string` - Logo URL

**Key Elements:**
- Prominent reset password button
- 1-hour expiration notice
- Security tips
- "Didn't request this?" disclaimer

---

### Welcome Email

**Purpose:** Welcome new users after verification

**Required Props:**
- `name: string` - User's name
- `dashboardUrl: string` - Link to dashboard

**Optional Props:**
- `productName?: string` - Product name
- `logoUrl?: string` - Logo URL

**Key Elements:**
- Friendly welcome message
- Dashboard CTA button
- Getting started tips
- Support contact information

---

### Future Templates

**Password Changed Notification:**
- Confirms password was changed
- Includes timestamp and device info
- "Not you?" security link

**New Device Alert:**
- Alerts user of login from new device
- Device details (browser, OS, location)
- "Secure your account" action link

**Invoice Email:**
- Invoice summary (items, amount, tax)
- View invoice button
- Download PDF link
- Payment information

**Notification Digest:**
- Summary of recent notifications
- Grouped by category
- View all notifications link
- Unsubscribe option

---

## Success Metrics

### Key Performance Indicators (KPIs)

**Delivery Metrics:**
- Email delivery rate > 95%
- Inbox placement rate > 90%
- Bounce rate < 2%
- Average delivery time < 5s

**Quality Metrics:**
- Email rendering accuracy > 95%
- Mobile responsiveness 100%
- Dark mode support 100%
- Template consistency score > 4.5/5

**Developer Experience:**
- Template creation time < 30 minutes
- Setup time < 5 minutes
- Preview load time < 3s
- API satisfaction score > 4.5/5

**Business Metrics:**
- Email open rate > 25% (industry average: 20%)
- Click-through rate > 3% (industry average: 2.5%)
- Unsubscribe rate < 0.2%
- Email cost < $0.01 per email

---

## Resend vs Alternatives

### Why Resend?

**Pros:**
- ✅ Built by creators of React Email (seamless integration)
- ✅ Developer-first API (simple, clean)
- ✅ Generous free tier (3,000 emails/month)
- ✅ High deliverability rates
- ✅ Fast delivery (<5s average)
- ✅ Good documentation
- ✅ No bloat (focused on transactional)

**Cons:**
- ⚠️ Newer service (less battle-tested than SendGrid)
- ⚠️ Limited marketing features (transactional only)

### Alternatives Considered

**SendGrid:**
- More established
- More features (marketing automation)
- More complex API
- Lower deliverability in tests
- Only 100 emails/day free

**Postmark:**
- Excellent deliverability
- Good developer experience
- Only 100 emails/month free
- More expensive at scale

**Amazon SES:**
- Very cheap ($0.10 per 1,000 emails)
- More complex setup
- Requires AWS account
- Warm-up period required

**Mailgun:**
- Good deliverability
- Flexible API
- Complex pricing
- Shared IPs on free tier

**Decision:** Resend wins for developer experience, React Email integration, and generous free tier.

---

## Dependencies

### External Services

**Resend** (Required)
- Free tier: 3,000 emails/month, 100 emails/day
- Pro tier: $20/month for 50,000 emails
- Enterprise: Custom pricing
- No credit card required for free tier

**Domain** (Optional for production)
- Custom domain for professional sender addresses
- DNS access for SPF/DKIM/DMARC configuration

### NPM Packages

**Email Templates:**
- `react-email` (v3.0+) - Dev server and CLI
- `@react-email/components` (v0.0.29+) - Email components
- `react` (v19.0+) - React runtime

**Email API:**
- `resend` (v4.0+) - Resend SDK
- `@react-email/render` (v1.0+) - React to HTML
- `@nestjs/common` (v11.0+) - NestJS integration

**Future:**
- `bull` or `bullmq` - Email queue
- `ioredis` - Redis client for queue

---

## Security & Privacy

### Data Protection

- **No password storage** - Never send passwords via email
- **Secure tokens** - Use cryptographically random tokens
- **HTTPS only** - All email links use https://
- **Token expiration** - Short-lived tokens (15min-1hour)
- **One-time use** - Tokens invalidated after use

### Email Security

- **SPF/DKIM/DMARC** - Email authentication
- **No user data exposure** - Don't include sensitive data in emails
- **Link validation** - Verify all links before sending
- **Phishing prevention** - Clear sender identification

### Privacy Compliance

- **GDPR** - Right to access email history, right to deletion
- **CAN-SPAM** - Unsubscribe links (for marketing emails)
- **Data retention** - Delete email logs after 90 days
- **Consent** - Clear opt-in for non-transactional emails

---

## Email Template Guidelines

### Design Principles

1. **Mobile-First** - Design for mobile, enhance for desktop
2. **Scannable** - Use hierarchy, white space, short paragraphs
3. **Actionable** - One primary CTA per email
4. **Branded** - Consistent with product identity
5. **Accessible** - Alt text, semantic HTML, high contrast
6. **Fast** - Minimal images, inline CSS, optimized

### Content Guidelines

1. **Clear Subject** - Descriptive, under 50 characters
2. **Preview Text** - Compelling, unique per email
3. **Greeting** - Personalized when possible
4. **Context** - Why they're receiving this email
5. **Action** - Clear next step with prominent button
6. **Footer** - Contact info, unsubscribe, legal

### Technical Guidelines

1. **Width** - Max 600px for email clients
2. **Tables** - Use for layout (email client compatibility)
3. **Inline CSS** - All styles inline (no external CSS)
4. **Images** - Alt text, hosted on CDN, fallback text
5. **Links** - Absolute URLs, track clicks
6. **Testing** - Test in Gmail, Outlook, Apple Mail minimum

---

## Email Categories

### 1. Transactional (Critical Path)

**Examples:**
- Email verification (signup)
- Password reset
- Password changed confirmation
- Email changed confirmation
- Payment receipts
- Order confirmations

**Requirements:**
- Must send immediately
- High priority
- No unsubscribe option
- Critical for user journey

### 2. Security Alerts

**Examples:**
- New device login
- Account locked
- 2FA disabled
- Unusual activity detected

**Requirements:**
- Send immediately
- High priority
- Clear action items
- No unsubscribe option

### 3. System Notifications

**Examples:**
- Welcome email
- Feature announcements
- Service updates
- Maintenance notices

**Requirements:**
- Can be queued
- Medium priority
- Unsubscribe option recommended
- Batching allowed

### 4. Business Emails (Future)

**Examples:**
- Invoices
- Receipts
- Subscription updates
- Trial expiration warnings

**Requirements:**
- Can be queued
- Medium/low priority
- Legal compliance required
- Tracking important

---

## Resend Configuration

### Development Setup

1. **Sign up** at resend.com
2. **Get API key** from dashboard
3. **Use test domain** (`onboarding@resend.dev`)
4. **Send test emails** (free, doesn't count toward quota)

### Production Setup

1. **Add custom domain** (e.g., `yourdomain.com`)
2. **Configure DNS records:**
   - SPF: `v=spf1 include:_spf.resend.com ~all`
   - DKIM: Add provided CNAME records
   - DMARC: `v=DMARC1; p=none; ...`
3. **Verify domain** (usually takes minutes)
4. **Update sender** to `noreply@yourdomain.com`
5. **Monitor** delivery in Resend dashboard

### Email Quotas

**Free Tier:**
- 3,000 emails/month
- 100 emails/day
- All features included
- No credit card required

**Pro Tier ($20/month):**
- 50,000 emails/month
- $1 per additional 1,000 emails
- Dedicated IP addresses available
- Priority support

**Recommended for:**
- Development: Free tier
- Small apps (<3,000 users): Free tier
- Growing apps (3,000-50,000 users): Pro tier
- Large apps (>50,000 users): Enterprise tier

---

## Risks & Mitigations

### Technical Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Resend API downtime | High | Low | Implement email queue, retry logic, fallback provider |
| Email deliverability issues | High | Medium | Use Resend best practices, monitor metrics, configure SPF/DKIM/DMARC |
| Template rendering errors | Medium | Low | Comprehensive testing, error boundaries, fallback to plain text |
| Quota exceeded | Medium | Medium | Monitor usage, upgrade plan, implement queue with throttling |

### Business Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Email costs scale unexpectedly | Medium | Medium | Monitor usage, set alerts, optimize sends, batch when possible |
| Spam complaints increase | High | Low | Follow best practices, easy unsubscribe, quality content |
| Vendor lock-in | Low | High | Abstract email service, portable templates |

---

## Future Enhancements

### Phase 2 Enhancements (After MVP)
- [ ] Email queue with Bull/BullMQ
- [ ] Retry logic with exponential backoff
- [ ] Email delivery tracking and logging
- [ ] Bounce and complaint handling
- [ ] More email templates (10+ total)
- [ ] Advanced email components (Table, CodeBlock, etc.)

### Phase 3 Enhancements
- [ ] Email analytics dashboard
- [ ] A/B testing for email content
- [ ] Email template versioning
- [ ] Template inheritance system
- [ ] Multi-language email support (i18n)
- [ ] Custom email domains per tenant

### Phase 4 Enhancements
- [ ] Visual email editor (drag-and-drop)
- [ ] Email template marketplace
- [ ] AI-powered email suggestions
- [ ] Advanced personalization (user data merge)
- [ ] Email scheduling (send later)
- [ ] Recurring email campaigns

---

## Compliance & Standards

### Email Standards

- **RFC 5322** - Internet Message Format
- **RFC 2045-2049** - MIME (Multipurpose Internet Mail Extensions)
- **RFC 6376** - DKIM Signatures
- **RFC 7208** - SPF (Sender Policy Framework)
- **RFC 7489** - DMARC (Domain-based Message Authentication)

### Privacy Regulations

- **CAN-SPAM Act** (US)
  - Unsubscribe option in marketing emails
  - Honor unsubscribe requests within 10 days
  - Accurate from/subject lines
  - Physical address in footer

- **GDPR** (EU)
  - Consent for marketing emails
  - Right to access email history
  - Right to deletion
  - Data retention limits

- **CCPA** (California)
  - Opt-out of data sales
  - Transparency in data usage

### Accessibility Standards

- **WCAG 2.1 AA** for email content
- **Alt text** for all images
- **Semantic HTML** structure
- **High contrast** text (4.5:1 minimum)
- **Readable font sizes** (14px+ for body)

---

## Testing Strategy

### Unit Tests

- [ ] Email service methods
- [ ] Template rendering
- [ ] Error handling
- [ ] Configuration validation

### Integration Tests

- [ ] Email sending end-to-end
- [ ] Template rendering with real data
- [ ] Resend API integration
- [ ] Error scenarios

### Email Client Tests

- [ ] Gmail (web, mobile app, iOS app)
- [ ] Outlook (web, desktop, mobile)
- [ ] Apple Mail (macOS, iOS)
- [ ] Yahoo Mail
- [ ] ProtonMail
- [ ] Thunderbird

### Manual Tests

- [ ] Preview all templates in dev server
- [ ] Send test emails to real addresses
- [ ] Verify mobile rendering
- [ ] Check dark mode rendering
- [ ] Test all links work
- [ ] Verify branding displays correctly

---

## Acceptance Criteria

### Phase 1: Core Email System ✅ (Complete)
- [x] Email templates can be built with React
- [x] Templates render correctly to HTML
- [x] Emails send via Resend
- [x] Live preview works at localhost:3002
- [x] EmailService is injectable in NestJS
- [x] Three email templates available
- [x] Branding is customizable
- [x] Documentation is complete

### Phase 2: Enhanced Templates 📅 (Planned)
- [ ] 8+ email templates available
- [ ] Advanced components (Table, CodeBlock, etc.)
- [ ] All templates support dark mode
- [ ] Templates are fully accessible
- [ ] Email library documentation complete

### Phase 3: Reliability & Scale 📅 (Future)
- [ ] Email queue implemented
- [ ] Retry logic works correctly
- [ ] Delivery tracking implemented
- [ ] Bounce handling works
- [ ] Can send 10,000 emails/hour
- [ ] Fallback provider configured

### Phase 4: Analytics & Monitoring 📅 (Future)
- [ ] Email logs stored in database
- [ ] Delivery metrics tracked
- [ ] Analytics dashboard available
- [ ] Alerting for critical failures
- [ ] All compliance requirements met

---

## Open Questions

1. **Email Queue:**
   - Implement now or wait for scale needs?
   - Use Bull (Node.js) or BullMQ (TypeScript)?
   - Redis required or use database queue?

2. **Fallback Provider:**
   - Configure SendGrid as backup?
   - Or handle Resend downtime with retry queue?

3. **Email Logging:**
   - Store all sent emails in database?
   - Or only track deliveries/failures?
   - How long to retain logs (90 days? 1 year?)?

4. **Template Organization:**
   - Group by feature (auth/, billing/, notifications/)?
   - Or flat structure in emails/ directory?

5. **Multi-tenancy:**
   - Support different branding per tenant?
   - Multiple Resend accounts?
   - Tenant-specific email domains?

---

## Release Plan

### Phase 1: MVP - Core Email System ✅ (Complete)
**Timeline:** Completed 2025-10-23
**Features:**
- React Email template system
- Resend integration
- Three email templates
- Live preview
- Basic EmailService
- Customizable branding

### Phase 2: Template Library 📅 (Next)
**Timeline:** 1-2 weeks
**Features:**
- 5+ additional email templates
- Advanced email components
- Dark mode support
- Accessibility improvements
- Enhanced documentation

### Phase 3: Reliability & Scale 📅 (Planned)
**Timeline:** 2-3 weeks
**Features:**
- Email queue (Bull/BullMQ)
- Retry logic
- Delivery tracking
- Bounce handling
- Performance optimization

### Phase 4: Analytics & Compliance 📅 (Future)
**Timeline:** 3-4 weeks
**Features:**
- Email analytics dashboard
- Advanced metrics
- Compliance tooling
- Admin UI for email management

---

## Appendix

### A. Related Documents

- `EMAIL_SERVICE.md` - Email service documentation
- `email.tasks.md` - Detailed task breakdown
- `AUTH_SETUP.md` - Auth integration examples
- `ai/docs/email-service-summary.md` - Technical summary

### B. External Resources

- [React Email Documentation](https://react.email/docs)
- [Resend Documentation](https://resend.com/docs)
- [Resend + React Email Guide](https://resend.com/docs/send-with-react)
- [Email Client CSS Support](https://www.caniemail.com/)

### C. Email Client Support

**Target Support:**
- Gmail (web, iOS, Android) - #1 priority
- Outlook (web, Windows, macOS, mobile) - #2 priority
- Apple Mail (macOS, iOS) - #3 priority
- Yahoo Mail - #4 priority
- Others: Best effort

### D. Glossary

- **Transactional Email** - System-triggered emails (not marketing)
- **SPF** - Sender Policy Framework (email authentication)
- **DKIM** - DomainKeys Identified Mail (email signing)
- **DMARC** - Domain-based Message Authentication (policy)
- **Bounce** - Email rejected by recipient server
- **Soft Bounce** - Temporary failure (mailbox full)
- **Hard Bounce** - Permanent failure (email doesn't exist)
- **Spam Complaint** - Recipient marked email as spam
- **OTP** - One-Time Password (verification code)

---

**Document Status:** Living document, updated as features are implemented

**Next Review:** After Phase 2 completion (enhanced templates)
