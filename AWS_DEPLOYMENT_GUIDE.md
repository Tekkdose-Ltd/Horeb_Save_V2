# CircleTrust AWS Deployment Guide

## Architecture Overview

- **Frontend**: Netlify (React app)
- **Backend**: AWS App Runner (Node.js API)
- **Database**: Your existing database
- **Authentication**: Keep Replit auth or migrate to AWS Cognito

## Step 1: Prepare Your Code

### Environment Variables for AWS App Runner

Set these in AWS App Runner configuration:

```
NODE_ENV=production
PORT=8080
DATABASE_URL=your_database_connection_string
STRIPE_SECRET_KEY=sk_test_or_sk_live_your_stripe_key
REPLIT_CLIENT_ID=your_replit_client_id
REPLIT_CLIENT_SECRET=your_replit_client_secret
SESSION_SECRET=your_random_session_secret
FRONTEND_URL=https://your-app.netlify.app
```

## Step 2: Deploy Backend to AWS App Runner

### Option A: Using AWS Console (Recommended)

1. Go to AWS App Runner in AWS Console
2. Click "Create service"
3. Choose "Source code repository"
4. Connect your GitHub repository
5. Select branch: `main` or `theosBranch`
6. Build settings:
   - Runtime: Node.js 18
   - Build command: `npm ci && npm run build`
   - Start command: `npm start`
   - Port: 8080
7. Add environment variables listed above
8. Create service

### Option B: Using AWS CLI

```bash
# Install AWS CLI and configure
aws configure

# Create App Runner service
aws apprunner create-service \
    --service-name circletrust-backend \
    --source-configuration '{
        "ImageRepository": {
            "ImageIdentifier": "your-image-uri",
            "ImageConfiguration": {
                "Port": "8080"
            }
        },
        "AutoDeploymentsEnabled": true
    }'
```

## Step 3: Deploy Frontend to Netlify

### Update Netlify Environment Variables

In your Netlify dashboard, set:

```
VITE_STRIPE_PUBLIC_KEY=pk_test_or_pk_live_your_stripe_key
VITE_API_BASE_URL=https://your-app-runner-url.region.awsapprunner.com
```

### Build Settings in Netlify

- Build command: `npm run build:frontend`
- Publish directory: `dist`

## Step 4: Database Considerations

### Current Setup

If using external database (like PlanetScale, Supabase, etc.), no changes needed.

### AWS RDS Option

If you want to move to AWS RDS:

1. Create RDS PostgreSQL instance
2. Update DATABASE_URL environment variable
3. Run database migrations

## Step 5: Authentication Migration

### Option A: Keep Replit Auth (Easier)

- No changes needed
- Users continue using Replit login

### Option B: Migrate to AWS Cognito (Advanced)

- Better integration with AWS
- More control over user management
- Requires code changes

## Step 6: Testing

### Health Check

Your backend now has a health endpoint:

```
GET https://your-app-runner-url.region.awsapprunner.com/api/health
```

### Payment Methods Test

```
GET https://your-app-runner-url.region.awsapprunner.com/api/payment-methods
```

## Cost Estimation (AWS App Runner)

- **Basic**: ~$25-50/month for small traffic
- **Auto-scales** based on requests
- **Pay per use** model

## Next Steps

1. Deploy backend to AWS App Runner
2. Get the App Runner URL
3. Update Netlify environment variables
4. Deploy frontend to Netlify
5. Test payment flow
6. Update any hardcoded URLs in your code

## Troubleshooting

- Check AWS App Runner logs for backend issues
- Check Netlify deployment logs for frontend issues
- Verify CORS settings if getting cross-origin errors
- Ensure all environment variables are set correctly
