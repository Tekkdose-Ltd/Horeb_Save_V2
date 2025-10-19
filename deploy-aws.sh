#!/bin/bash

# CircleTrust AWS Deployment Script
# Make this file executable: chmod +x deploy-aws.sh

echo "🚀 Horeb AWS Deployment Helper"
echo "======================================"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Please install it first:"
    echo "   npm install -g aws-cli"
    exit 1
fi

# Check if logged into AWS
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ Not logged into AWS. Please run:"
    echo "   aws configure"
    exit 1
fi

echo "✅ AWS CLI configured"

# Build the application
echo "📦 Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi

echo ""
echo "📋 Next Steps:"
echo "1. Go to AWS App Runner Console: https://console.aws.amazon.com/apprunner"
echo "2. Create a new service"
echo "3. Connect your GitHub repository"
echo "4. Use these settings:"
echo "   - Runtime: Node.js 18"
echo "   - Build command: npm ci && npm run build"
echo "   - Start command: npm start"
echo "   - Port: 8080"
echo "5. Add your environment variables"
echo "6. Deploy!"
echo ""
echo "🔗 Your backend will be available at:"
echo "   https://[random-id].[region].awsapprunner.com"
echo ""
echo "📝 Don't forget to update your Netlify VITE_API_BASE_URL!"