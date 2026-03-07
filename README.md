
# Team Pulse – Lexaeon Dots

**Internal employee recognition & micro-reward platform**  
A modern Next.js application used at **Lexaeon** to track, give, and visualize "Dots" — a lightweight peer-to-peer appreciation system.

> "Small thanks → big culture"

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