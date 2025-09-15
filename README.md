# Medical Client (Next.js)

## Prerequisites

- Node.js 18+
- Backend API running (ASP.NET Core) with CORS allowing http://localhost:3000

## Setup

1. Copy env file

```
cp .env.local.example .env.local
```

2. Install dependencies

```
npm install
```

3. Run dev server

```
npm run dev
```

Set `NEXT_PUBLIC_API_BASE_URL` to your backend URL.

## Structure

- pages/: route pages
- components/: shared UI components
- lib/api.js: axios instance and endpoint wrappers
