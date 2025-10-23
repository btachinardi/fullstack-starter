# Email Service Documentation

Complete guide for sending transactional emails using React Email + Resend.

---

## 🎯 What's Included

### Email Templates (`libs/email/templates`)
- ✅ **React Email** components for building responsive emails
- ✅ Shared components: `EmailLayout`, `EmailButton`
- ✅ Pre-built templates: Verification, Password Reset, Welcome
- ✅ Live preview at `http://localhost:3002`
- ✅ Customizable branding (product name + logo)

### Email API (`libs/email/api`)
- ✅ **Resend** integration for sending emails
- ✅ NestJS `EmailService` with dependency injection
- ✅ Type-safe email methods
- ✅ HTML rendering from React components
- ✅ Error handling and retry logic

---

## 🚀 Quick Start

### 1. Install Dependencies

Already installed! The email packages are ready to use.

### 2. Get Resend API Key

1. Sign up at [resend.com](https://resend.com)
2. Create an API key in your dashboard
3. Add to `apps/api/.env`:
   ```bash
   RESEND_API_KEY="re_your_actual_api_key"
   EMAIL_FROM="onboarding@yourdomain.com"
   ```

**Free Tier:** 3,000 emails/month, 100 emails/day

### 3. Configure Email Module

**In `apps/api/src/app.module.ts`:**

```typescript
import { EmailModule } from '@libs/core/api';

@Module({
  imports: [
    EmailModule.forRoot({
      apiKey: process.env.RESEND_API_KEY!,
      from: process.env.EMAIL_FROM || 'onboarding@example.com',
      productName: process.env.EMAIL_PRODUCT_NAME || 'Fullstack Starter',
      logoUrl: process.env.EMAIL_LOGO_URL,
    }),
    // ... other modules
  ],
})
export class AppModule {}
```

### 4. Use Email Service

**In any NestJS service or controller:**

```typescript
import { Injectable } from '@nestjs/common';
import { EmailService } from '@libs/core/api';
import { VerificationEmail } from '@libs/email/templates';

@Injectable()
export class AuthService {
  constructor(private emailService: EmailService) {}

  async sendVerification(user: User, code: string) {
    const template = VerificationEmail({
      name: user.name,
      code: code,
      verificationUrl: `https://yourapp.com/verify?code=${code}`,
    });

    await this.emailService.sendEmail({
      to: user.email,
      subject: `Your verification code is ${code}`,
      template,
    });
  }
}
```

---

## 📧 Available Email Templates

### 1. Verification Email

**Purpose:** Email verification with 6-digit OTP code

**Usage:**
```typescript
import { VerificationEmail } from '@libs/email/templates';

const template = VerificationEmail({
  name: 'John Doe',
  code: '123456',
  verificationUrl: 'https://app.com/verify?token=xxx',
  productName: 'Acme Corp', // Optional
  logoUrl: 'https://app.com/logo.png', // Optional
});

await emailService.sendEmail({
  to: 'user@example.com',
  subject: 'Verify your email - 123456',
  template,
});
```

**What it includes:**
- Large, centered 6-digit code
- Fallback verification link button
- Expiration notice (15 minutes)
- Security disclaimer

### 2. Password Reset Email

**Purpose:** Password reset with secure token link

**Usage:**
```typescript
import { PasswordResetEmail } from '@libs/email/templates';

const template = PasswordResetEmail({
  name: 'John Doe',
  resetUrl: 'https://app.com/reset-password?token=secure-token',
  productName: 'Acme Corp',
  logoUrl: 'https://app.com/logo.png',
});

await emailService.sendEmail({
  to: 'user@example.com',
  subject: 'Reset your password',
  template,
});
```

**What it includes:**
- Reset password button with secure link
- Expiration notice (1 hour)
- Security tips
- "Didn't request this?" disclaimer

### 3. Welcome Email

**Purpose:** Welcome new users after signup

**Usage:**
```typescript
import { WelcomeEmail } from '@libs/email/templates';

const template = WelcomeEmail({
  name: 'John Doe',
  dashboardUrl: 'https://app.com/dashboard',
  productName: 'Acme Corp',
  logoUrl: 'https://app.com/logo.png',
});

await emailService.sendEmail({
  to: 'user@example.com',
  subject: 'Welcome to Acme Corp!',
  template,
});
```

**What it includes:**
- Welcome message with personalization
- "Go to Dashboard" button
- "What's next?" section with action items
- Helpful getting started tips

---

## 🎨 Customizing Email Templates

### Branding

All templates support customization:

```typescript
const template = VerificationEmail({
  // ... template props
  productName: 'Your Company',
  logoUrl: 'https://yoursite.com/email-logo.png',
});
```

### Creating Custom Templates

**Create a new template:**

```typescript
// libs/email/templates/src/emails/invoice-email.tsx
import { Heading, Text } from '@react-email/components';
import { EmailLayout } from '../components/email-layout';
import { EmailButton } from '../components/email-button';

export interface InvoiceEmailProps {
  customerName: string;
  invoiceNumber: string;
  amount: string;
  invoiceUrl: string;
}

export function InvoiceEmail({
  customerName,
  invoiceNumber,
  amount,
  invoiceUrl,
}: InvoiceEmailProps) {
  return (
    <EmailLayout preview={`Invoice ${invoiceNumber}`}>
      <Heading style={heading}>Invoice {invoiceNumber}</Heading>
      <Text>Hi {customerName},</Text>
      <Text>Your invoice for ${amount} is ready.</Text>
      <EmailButton href={invoiceUrl}>View Invoice</EmailButton>
    </EmailLayout>
  );
}

const heading = {
  fontSize: '24px',
  fontWeight: '600',
  marginBottom: '24px',
};
```

**Export in index.ts:**

```typescript
// libs/email/templates/src/index.ts
export { InvoiceEmail } from './emails/invoice-email';
export type { InvoiceEmailProps } from './emails/invoice-email';
```

### Shared Components

**EmailLayout** - Consistent header/footer with branding

```typescript
<EmailLayout
  preview="Preview text in email client"
  productName="Your App"
  logoUrl="https://example.com/logo.png"
  footerLinks={[
    { text: 'Help', url: 'https://help.example.com' },
    { text: 'Privacy', url: 'https://example.com/privacy' },
  ]}
>
  {/* Your email content */}
</EmailLayout>
```

**EmailButton** - Styled CTA button

```typescript
<EmailButton href="https://example.com/action">
  Click Here
</EmailButton>
```

---

## 🔍 Preview Email Templates

### Start Preview Server

```bash
# From project root
pnpm email:preview
```

This starts the React Email dev server at **http://localhost:3002**

### Preview Features

- ✅ Live preview of all email templates
- ✅ Switch between templates
- ✅ Test with different props/data
- ✅ View rendered HTML source
- ✅ Copy HTML for testing
- ✅ Mobile/desktop preview
- ✅ Dark mode preview

### Testing Templates

1. Start preview server: `pnpm email:preview`
2. Open http://localhost:3002
3. Select template from sidebar
4. View how it renders in different email clients
5. Test responsiveness
6. Copy HTML to send test emails

---

## 🛠️ Email Service API

### EmailService Methods

**Generic send method:**
```typescript
await emailService.sendEmail({
  to: 'user@example.com',
  subject: 'Your Subject',
  template: YourReactEmailComponent({ /* props */ }),
});
```

**Verification email:**
```typescript
await emailService.sendVerificationEmail({
  to: 'user@example.com',
  subject: 'Verify your email - 123456',
  template: VerificationEmail({ code: '123456', ... }),
});
```

**Password reset:**
```typescript
await emailService.sendPasswordResetEmail({
  to: 'user@example.com',
  subject: 'Reset your password',
  template: PasswordResetEmail({ resetUrl: '...', ... }),
});
```

**Welcome email:**
```typescript
await emailService.sendWelcomeEmail({
  to: 'user@example.com',
  subject: 'Welcome to Our Platform!',
  template: WelcomeEmail({ name: 'John', ... }),
});
```

### Error Handling

```typescript
try {
  const result = await emailService.sendEmail({
    to: 'user@example.com',
    subject: 'Test',
    template: MyTemplate({}),
  });

  console.log('Email sent:', result.id);
} catch (error) {
  console.error('Failed to send email:', error.message);
  // Handle error (retry, log, notify admin, etc.)
}
```

---

## 🔧 Configuration

### Environment Variables

**Required:**
```bash
RESEND_API_KEY="re_..."           # Get from resend.com
EMAIL_FROM="noreply@yourdomain.com"  # Your verified sender
```

**Optional:**
```bash
EMAIL_PRODUCT_NAME="Your App"      # Default: "Fullstack Starter"
EMAIL_LOGO_URL="https://..."       # Email header logo
```

### Email Module Configuration

```typescript
EmailModule.forRoot({
  apiKey: process.env.RESEND_API_KEY!,
  from: process.env.EMAIL_FROM!,
  productName: process.env.EMAIL_PRODUCT_NAME,
  logoUrl: process.env.EMAIL_LOGO_URL,
})
```

---

## 📦 Package Structure

```
libs/email/
├── templates/                    # Email templates with React
│   ├── src/
│   │   ├── components/
│   │   │   ├── email-layout.tsx    # Base layout
│   │   │   └── email-button.tsx    # CTA button
│   │   ├── emails/
│   │   │   ├── verification-email.tsx
│   │   │   ├── password-reset-email.tsx
│   │   │   └── welcome-email.tsx
│   │   └── index.ts
│   └── package.json
│
└── api/                          # Email sending service
    ├── src/
    │   ├── email.service.ts        # Resend integration
    │   ├── email.module.ts         # NestJS module
    │   └── index.ts
    └── package.json
```

---

## 🌐 Resend Setup

### 1. Sign Up

Visit [resend.com](https://resend.com) and create an account

### 2. Add Domain (Production)

For production, verify your sending domain:

1. Go to Settings → Domains
2. Add your domain (e.g., `yourdomain.com`)
3. Add DNS records provided by Resend
4. Wait for verification (usually a few minutes)
5. Use `noreply@yourdomain.com` as `EMAIL_FROM`

**For development:** Use `onboarding@resend.dev` (provided by Resend)

### 3. Create API Key

1. Go to Settings → API Keys
2. Create new key
3. Copy and add to `.env` as `RESEND_API_KEY`

---

## 🧪 Testing Emails

### Development Testing

**Use Resend Test Mode:**
```typescript
// Emails sent to these domains don't actually send
const testEmail = 'test@resend.dev';

await emailService.sendEmail({
  to: testEmail,
  subject: 'Test Email',
  template: VerificationEmail({ code: '123456', ... }),
});

// Check in Resend dashboard > Emails
```

### Preview Before Sending

```bash
# Start preview server
pnpm email:preview

# View at http://localhost:3002
# Test with different data
# Check mobile/desktop rendering
```

### Send Test Email

```typescript
// In your API code
await emailService.sendEmail({
  to: 'your-actual-email@gmail.com',
  subject: 'Test Email',
  template: WelcomeEmail({
    name: 'Test User',
    dashboardUrl: 'http://localhost:3000/dashboard',
  }),
});
```

---

## 💡 Usage Examples

### Example 1: Send Verification on Signup

```typescript
// auth.service.ts
import { EmailService } from '@libs/core/api';
import { VerificationEmail } from '@libs/email/templates';

@Injectable()
export class AuthService {
  constructor(private emailService: EmailService) {}

  async register(dto: RegisterDto) {
    // Create user
    const user = await this.prisma.user.create({
      data: { email: dto.email, ... },
    });

    // Generate OTP
    const code = this.generateOTP(); // e.g., '123456'

    // Save to database
    await this.prisma.verification.create({
      data: {
        userId: user.id,
        code,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 min
      },
    });

    // Send verification email
    const template = VerificationEmail({
      name: user.name,
      code,
      verificationUrl: `${process.env.BETTER_AUTH_URL}/verify?code=${code}`,
    });

    await this.emailService.sendEmail({
      to: user.email,
      subject: `Verify your email - ${code}`,
      template,
    });

    return user;
  }
}
```

### Example 2: Send Password Reset

```typescript
async forgotPassword(email: string) {
  const user = await this.findUserByEmail(email);

  if (!user) {
    // Don't reveal if email exists (security)
    return;
  }

  // Generate secure token
  const token = crypto.randomUUID();

  // Save to database
  await this.prisma.passwordReset.create({
    data: {
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    },
  });

  // Send reset email
  const template = PasswordResetEmail({
    name: user.name,
    resetUrl: `${process.env.BETTER_AUTH_URL}/reset-password?token=${token}`,
  });

  await this.emailService.sendEmail({
    to: user.email,
    subject: 'Reset your password',
    template,
  });
}
```

### Example 3: Send Welcome Email

```typescript
async verifyEmail(code: string) {
  // Verify code and mark user as verified
  const verification = await this.verifyCode(code);

  // Send welcome email
  const template = WelcomeEmail({
    name: verification.user.name,
    dashboardUrl: `${process.env.BETTER_AUTH_URL}/dashboard`,
  });

  await this.emailService.sendEmail({
    to: verification.user.email,
    subject: 'Welcome to Fullstack Starter!',
    template,
  });
}
```

---

## 🎨 Branding & Customization

### Update Product Name

**Method 1: Environment variable**
```bash
# apps/api/.env
EMAIL_PRODUCT_NAME="Acme Corporation"
```

**Method 2: Per-template**
```typescript
const template = VerificationEmail({
  // ... other props
  productName: 'Custom Product Name',
});
```

### Add Logo

**Method 1: Global logo (all emails)**
```bash
# apps/api/.env
EMAIL_LOGO_URL="https://yourcdn.com/logo.png"
```

**Method 2: Per-template**
```typescript
const template = WelcomeEmail({
  // ... other props
  logoUrl: 'https://special-logo.png',
});
```

### Customize Footer Links

```typescript
<EmailLayout
  // ... other props
  footerLinks={[
    { text: 'Help Center', url: 'https://help.yoursite.com' },
    { text: 'Contact Us', url: 'https://yoursite.com/contact' },
    { text: 'Unsubscribe', url: 'https://yoursite.com/unsubscribe' },
  ]}
>
  {/* Content */}
</EmailLayout>
```

---

## 🔒 Security Best Practices

### Email Verification

✅ Use 6-digit OTP codes (easy to type)
✅ Expire codes after 15 minutes
✅ Rate limit resend requests (max 5 per hour)
✅ Delete code after successful verification
✅ Provide fallback verification link

### Password Reset

✅ Use cryptographically secure tokens (UUID v4 or crypto.randomBytes)
✅ Expire tokens after 1 hour
✅ Invalidate token after use
✅ Don't reveal if email exists in database
✅ Rate limit reset requests (max 3 per hour per email)
✅ Send notification when password is changed

### General

✅ Never send passwords via email
✅ Use https:// links only
✅ Include security disclaimers
✅ Log all email sends for auditing
✅ Handle bounces and complaints

---

## 📊 Monitoring & Analytics

### Resend Dashboard

Monitor email performance:
- Delivery rate
- Open rate
- Click rate
- Bounce rate
- Spam complaints

### Logging

```typescript
// Log email sends
console.log('Sent verification email:', {
  to: user.email,
  userId: user.id,
  timestamp: new Date(),
});

// Track in database (optional)
await prisma.emailLog.create({
  data: {
    userId: user.id,
    type: 'verification',
    sentAt: new Date(),
  },
});
```

---

## 🐛 Troubleshooting

### "Email not received"

**Check:**
1. Verify RESEND_API_KEY is correct
2. Check sender domain is verified (production)
3. Check spam folder
4. View email in Resend dashboard > Emails
5. Check for errors in Resend logs

### "Invalid API key"

**Fix:**
1. Verify key starts with `re_`
2. Check for extra spaces in `.env`
3. Restart API server after changing `.env`

### "Domain not verified"

**For development:**
- Use `onboarding@resend.dev` (Resend test domain)

**For production:**
- Add and verify your domain in Resend dashboard
- Update `EMAIL_FROM` to use your domain

### "Template not rendering"

**Check:**
1. Template is exported from `@libs/email/templates`
2. All required props are provided
3. React Email CLI works: `pnpm email:preview`
4. Check console for React errors

---

## 📈 Rate Limits & Quotas

### Resend Free Tier

- **3,000 emails/month**
- **100 emails/day**
- **All features included**
- **No credit card required**

### Resend Pro Tier

- **$20/month**
- **50,000 emails/month**
- **$1 per additional 1,000 emails**
- **Dedicated IPs available**

### Rate Limiting Implementation

```typescript
// Implement in your service
private async checkRateLimit(userId: string, type: string) {
  const count = await this.prisma.emailLog.count({
    where: {
      userId,
      type,
      sentAt: { gte: new Date(Date.now() - 60 * 60 * 1000) }, // Last hour
    },
  });

  if (count >= 5) {
    throw new Error('Too many emails sent. Try again later.');
  }
}
```

---

## 🚀 Next Steps

1. **Get Resend API key** from [resend.com](https://resend.com)
2. **Add to environment** (`apps/api/.env`)
3. **Configure EmailModule** in your app module
4. **Preview templates** with `pnpm email:preview`
5. **Send test email** to verify setup
6. **Integrate with auth flow** (verification, password reset)

---

## 📚 Resources

- [React Email Docs](https://react.email/docs)
- [Resend Docs](https://resend.com/docs)
- [Resend React Integration](https://resend.com/docs/send-with-react)
- [Email Best Practices](https://resend.com/docs/knowledge-base/best-practices)

---

**Your email system is ready to send beautiful, responsive emails!** 📧
