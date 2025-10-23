# Layout Components

Composable layout components for building application shells with sidebar navigation.

## Components

### AppLayout

Main layout wrapper that provides sidebar and header with customizable configuration.

```tsx
import { AppLayout } from "@libs/core/ui/components/layout";
import { Home, Settings, LogOut } from "lucide-react";

export default function RootLayout({ children }) {
  return (
    <AppLayout
      config={{
        branding: {
          name: "Acme Inc.",
          logo: Building2,
          url: "/"
        },
        navMain: [
          { title: "Dashboard", url: "/dashboard", icon: Home },
          { title: "Projects", url: "/projects", icon: Folder }
        ],
        navSecondary: [
          { title: "Settings", url: "/settings", icon: Settings },
          { title: "Help", url: "/help", icon: HelpCircle }
        ],
        user: {
          name: "John Doe",
          email: "john@example.com",
          avatar: "/avatars/john.jpg"
        },
        headerTitle: "Dashboard",
        style: {
          "--sidebar-width": "16rem",
          "--header-height": "3rem"
        }
      }}
      userActions={{
        onLogout: () => signOut(),
        onSettings: () => router.push("/settings"),
        onAccount: () => router.push("/account")
      }}
    >
      {children}
    </AppLayout>
  );
}
```

### AppSidebar

Standalone sidebar component if you want more control.

```tsx
import { AppSidebar } from "@libs/core/ui/components/layout";
import { SidebarProvider, SidebarInset } from "@libs/core/ui/components/sidebar";

<SidebarProvider>
  <AppSidebar
    config={{
      branding: { name: "Acme" },
      navMain: [...],
      user: {...}
    }}
    userActions={{ onLogout: handleLogout }}
  />
  <SidebarInset>
    {/* Your content */}
  </SidebarInset>
</SidebarProvider>
```

### AppHeader

Header with sidebar trigger and actions.

```tsx
import { AppHeader } from "@libs/core/ui/components/layout";
import { Button } from "@libs/core/ui/components/button";

<AppHeader
  title="Dashboard"
  actions={
    <Button size="sm">Create New</Button>
  }
/>
```

### Navigation Components

Individual navigation components for custom layouts.

```tsx
import { NavMain, NavSecondary, NavUser } from "@libs/core/ui/components/layout";

// Main navigation
<NavMain items={[
  { title: "Home", url: "/", icon: Home },
  { title: "Settings", url: "/settings", icon: Settings }
]} />

// Secondary navigation (footer)
<NavSecondary items={[...]} className="mt-auto" />

// User dropdown
<NavUser
  user={{ name: "John", email: "john@example.com" }}
  onLogout={() => signOut()}
  onSettings={() => router.push("/settings")}
/>
```

## Configuration

### LayoutConfig

```typescript
interface LayoutConfig {
  // Sidebar branding
  branding?: {
    name: string;
    logo?: LucideIcon;
    url?: string;
  };

  // Main navigation items
  navMain?: NavItem[];

  // Secondary navigation items (footer)
  navSecondary?: NavItem[];

  // Current user information
  user?: NavUser;

  // Header title
  headerTitle?: string;

  // Header actions (right side)
  headerActions?: React.ReactNode;

  // Custom CSS variables
  style?: React.CSSProperties;

  // Sidebar variant
  sidebarVariant?: "sidebar" | "floating" | "inset";

  // Sidebar collapsible behavior
  sidebarCollapsible?: "offcanvas" | "icon" | "none";
}
```

### NavItem

```typescript
interface NavItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
  }[];
}
```

### NavUser

```typescript
interface NavUser {
  name: string;
  email: string;
  avatar?: string;
}
```

## Customization

### CSS Variables

Customize layout dimensions via CSS variables:

```tsx
<AppLayout
  config={{
    ...config,
    style: {
      "--sidebar-width": "20rem",
      "--header-height": "4rem"
    }
  }}
>
```

### Sidebar Variants

```tsx
// Default sidebar
<AppSidebar config={{ ...config, sidebarVariant: "sidebar" }} />

// Floating sidebar
<AppSidebar config={{ ...config, sidebarVariant: "floating" }} />

// Inset sidebar
<AppSidebar config={{ ...config, sidebarVariant: "inset" }} />
```

### Collapsible Behavior

```tsx
// Offcanvas (mobile drawer)
<AppSidebar config={{ ...config, sidebarCollapsible: "offcanvas" }} />

// Icon collapse (desktop)
<AppSidebar config={{ ...config, sidebarCollapsible: "icon" }} />

// No collapse
<AppSidebar config={{ ...config, sidebarCollapsible: "none" }} />
```

## Integration Example

Complete example with Next.js App Router:

```tsx
// app/layout.tsx
import { AppLayout } from "@libs/core/ui/components/layout";
import { Home, Settings, Users, HelpCircle, Building2 } from "lucide-react";
import { useAuth } from "@libs/auth/web";

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();

  const layoutConfig = {
    branding: {
      name: "Acme Inc.",
      logo: Building2,
      url: "/"
    },
    navMain: [
      { title: "Dashboard", url: "/dashboard", icon: Home, isActive: true },
      { title: "Team", url: "/team", icon: Users },
      { title: "Projects", url: "/projects", icon: Folder }
    ],
    navSecondary: [
      { title: "Settings", url: "/settings", icon: Settings },
      { title: "Help", url: "/help", icon: HelpCircle }
    ],
    user: user ? {
      name: user.name,
      email: user.email,
      avatar: user.avatar
    } : undefined,
    headerTitle: "Dashboard"
  };

  return (
    <AppLayout
      config={layoutConfig}
      userActions={{
        onLogout: () => logout(),
        onSettings: () => router.push("/settings"),
        onAccount: () => router.push("/account")
      }}
    >
      {children}
    </AppLayout>
  );
}
```

## Features

- ✅ Fully customizable via config object
- ✅ TypeScript support with strict types
- ✅ Responsive (mobile drawer, desktop sidebar)
- ✅ Dark mode support via next-themes
- ✅ Collapsible sidebar with multiple modes
- ✅ User dropdown with actions
- ✅ CSS variable customization
- ✅ Accessible (ARIA labels, keyboard navigation)
