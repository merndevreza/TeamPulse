
# Team Pulse – Internal Feedback App

This is an internal employee recognition and micro-reward platform designed to encourage a culture of appreciation within teams.

The platform introduces a lightweight peer-to-peer system where employees can send **“Dots”** to recognize colleagues for their contributions, collaboration, and support.

In many organizations, valuable contributions often go unrecognized. Team members help each other, solve problems, and go the extra mile, but appreciation is not always expressed. **Team Pulse** addresses this gap by making recognition simple, quick, and visible.

Beyond peer recognition, the platform also provides insights for managers by visualizing **team engagement patterns**, helping them better understand collaboration and appreciation trends within the organization. 

## ✨ Key Features

### Authentication & Security
- JWT-based authentication (access + refresh tokens)
- HttpOnly, Secure, SameSite=Strict cookies
- Proactive token refresh (2-minute buffer before expiry)
- Token caching + cleanup (avoids repeated `jwt-decode` calls)
- Role-based access control (`admin` vs regular users)
- Strict domain restriction — only `@lexaeon.com` emails allowed
- XSS prevention through consistent HTML escaping (`sanitizeInput`)
- Middleware token validation & refresh (Next.js middleware)

### User Experience
- Clean login form with real-time validation
- Admin-only user registration/onboarding flow
- Profile management (name, image, email, password update)
- Personal Dots dashboard showing:
  - Dots received
  - Dots given
- "About Others" – view summary stats of any colleague
- Give Dots to any team member (simple & fast flow)

### Dashboard Highlights (admin view)
- **Dots Given** vs **Dots Received** tabs
- Visual cards showing behavioral patterns:
  - Longest time without giving Dots
  - Most recent givers
  - Lowest / highest average monthly givers (1-year window)
  - Top Thumb Up / Loop feedback givers

(Charts powered by **Recharts** – clean bar visualizations)

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- JWT
- Tailwind CSS
- Zod
- Recharts
- vitest
- Vercel (deployment)

## User Credential for testing

```bash
Email: ariful@lexaeon.com

Password: @Arif_1824
``` 