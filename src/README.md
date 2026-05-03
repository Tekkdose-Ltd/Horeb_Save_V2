# Backend Source — `/src/`

This is the **real production backend** deployed to Render.

## Stack
- **Runtime**: Node.js + TypeScript
- **Framework**: Express
- **Database**: MongoDB (Mongoose)
- **Auth**: JWT + bcrypt
- **Payments**: Stripe
- **Email**: Nodemailer / SendGrid
- **Storage**: Cloudinary
- **Docs**: Swagger UI at `/api-docs`

## Structure
```
src/
├── features/
│   ├── auth/account/        ← Register, login, verify email, JWT
│   ├── groups/              ← Create group, join, rotate, invite
│   └── waitlist/            ← Waitlist sign-up flow
├── config/
│   ├── database/            ← MongoDB connection (databaseConfig.ts)
│   ├── mail/                ← Email config
│   ├── cloudinary/          ← Image upload config
│   └── api-docummentation/  ← Swagger spec
├── middleware/
│   ├── errorHandlerMiddleware.ts
│   ├── userAuthenticationMiddleware.ts
│   └── validateRequestBody.ts
└── util/
    ├── encryptData.ts
    └── otpGenerator.ts
```

## Running locally
```bash
npm run dev          # nodemon App.ts  (hot-reload)
npm run start        # ts-node App.ts  (one-shot)
```

## Building for production (Render)
```bash
npm run build        # tsc → /build/
npm run start:prod   # node build/App.js
```

## API base path
```
/api/v1/horebSave/auth/...
/api/v1/horebSave/groups/...
/api/v1/horebSave/waitlist/...
```

## Do NOT confuse with `/server/`
The `/server/` folder at the root is only a Vite dev-server proxy. It is not deployed.
