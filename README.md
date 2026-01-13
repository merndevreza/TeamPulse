
# Internal Lexaeon Dots Tool

An internal dots management platform built with Next.js for tracking and rewarding employee contributions at Lexaeon.

## Features --

- 🔐 **Secure JWT Authentication**: All API requests are protected using JWT-based authentication.
- 📝 **Admin User Registration**: Only administrators can register new users to ensure secure onboarding.
- 🔑 **User Login**: Employees can log in and receive a JWT token internally for secure access to all features.
- 👤 **Profile Management**: Users can view and update their profile, including image, name, email, and password.
- 🟢 **Personal Dots Overview**: View a summary of your Dots, including those received and given.
- 🌐 **View Others' Dots**: See summaries of Dots received and given by other employees.
- 🎁 **Give Dots**: Easily reward colleagues by giving Dots to any user in the system.

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Node.js 18+
- Vercel (deployment)

## Setup

Clone the repository:

```bash
git clone https://github.com/lexaeon-org/internal-feedback-tool-fe.git
cd lexaeon-dots
npm install
```

Set up environment variables:
Create a `.env.local` file in the project root:


```env
NODE_ENV=development
NEXT_PUBLIC_API_BASE_URL=https://your-api-url.com
API_BASE_URL=https://your-api-url.com
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
