# ⚠️ DO NOT ADD FEATURES HERE

This `/server/` folder is **Vite dev-server scaffolding only**.

It exists solely to:
- Serve the React frontend (`client/`) via Vite in local development
- Proxy `/api` requests to the real backend during development

## Real backend is in `/src/`

All application logic — auth, groups, payments, Stripe, email, etc. — lives in:

```
/src/
├── App.ts                   ← Express entry point (deployed to Render)
├── routes.ts                ← Main router
├── features/
│   ├── auth/                ← Registration, login, JWT, email verify
│   ├── groups/              ← Savings groups, rotations, invites
│   └── waitlist/            ← Waitlist sign-up
├── config/
│   ├── database/            ← MongoDB connection
│   ├── mail/                ← Nodemailer / SendGrid
│   ├── cloudinary/          ← Image uploads
│   └── api-docummentation/  ← Swagger setup
├── middleware/              ← Auth guard, error handler, validation
└── util/                    ← Encryption, OTP generator
```

## Deployment
| What | Where | Entry point |
|---|---|---|
| Backend | Render | `/src/App.ts` → `npm run start:prod` |
| Frontend | Netlify | `/client/` → `npx vite build` |

## Local dev
```bash
npm run dev:frontend   # starts Vite + this /server/ proxy
```
