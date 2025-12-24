# Health Care Website Server

Health Care Website is a Telemedicine Service. Where user can book their appointment their desire doctor and specialist. Doctor can talk with each other one by one in video call and doctor can give prescriptions. I also implemented ai doctor suggestion where patient input their symptoms and ai can suggest their best matches doctors.

## Features of this website:

    * User Can register default as a patient
    * Patient can described their medical histories and symptoms.
    * Patient can search their desired doctor and can meet with each others by video call.
    * Doctor can register for their lesser time and admin approves for authorization doctors..
    * Admin can manages all the patients, doctors, fees etc.

## Tech Stack:

    - **Runtime:** Node
    - **Language:** Typescript
    - **Framework:** Express
    - **Database & ORM:** Postgres & Prisma
    - **Authorization & Authentication:** Json Web Token (Jwt)
    - **Data Validation & Security:** Zod, Bcrypt and Moduler Architecture.
    - **Payment Gateway:** Stripe AND SSLCommerz

# Set Up and Installation

**Clone the repository**

```bash

git clone git@github.com:mdselimme/HealthCare-Server-Node-TypeScript-Postgres-Prisma.git

```

**Set up .env file with requirement variables**

```env

# initialize server environment variables

NODE_ENV=development
PORT=5000
DATABASE_URL=

# RATE LIMITER
RATE_LIMIT_WINDOW_MS=
AUTH_RATE_LIMIT_MAX_REQUESTS=
API_RATE_LIMIT_MAX_REQUESTS=

# FRONTEND URL
FRONTEND_URL=http://localhost:3000

# BCRYPT
BCRYPT_SALT_ROUND=

#CLOUDINARY
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_CLOUD_NAME=

# JWT
JWT_ACCESS_TOKEN_SECRET=
JWT_ACCESS_TOKEN_EXPIRES=
JWT_REFRESH_TOKEN_SECRET=
JWT_REFRESH_TOKEN_EXPIRES=

# OPENROUTER
OPEN_ROUTER_API_KEY=

# STRIPE
STRIPE_SECRET_KEY=
CLIENT_URL=
WEBHOOK_SECRET=

# SMTP EMAIL SENDER KEY
SMTP_EMAIL_SENDER_SERVICE=
SMTP_EMAIL_SENDER_USER=
SMTP_EMAIL_SENDER_PASSWORD=
SMTP_EMAIL_SENDER_HOST=
SMTP_EMAIL_SENDER_PORT=

# SSL COMMERZ
STORE_ID=
STORE_PASS=
SUCCESS_URL=
CANCEL_URL=
FAIL_URL=
SSL_PAYMENT_API=
SSL_VALIDATION_API=

```

## Getting Started

First, run the development server:

```bash
npm run dev
```

--
