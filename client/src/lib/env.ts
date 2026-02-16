/**
 * Environment Configuration Validator
 * 
 * Validates that all required environment variables are set before the app starts
 */

interface EnvironmentConfig {
  // Stripe Configuration
  stripePublicKey: string | undefined;
  
  // API Configuration
  apiUrl: string;
  
  // Environment
  nodeEnv: string;
  isDevelopment: boolean;
  isProduction: boolean;
}

// List of required environment variables for production
const REQUIRED_PROD_VARS = [
  'VITE_STRIPE_PUBLIC_KEY',
];

// List of recommended environment variables
const RECOMMENDED_VARS = [
  'VITE_API_URL',
];

/**
 * Validate environment variables
 */
export function validateEnvironment(): void {
  const isProduction = import.meta.env.PROD;
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required variables in production
  if (isProduction) {
    REQUIRED_PROD_VARS.forEach((varName) => {
      if (!import.meta.env[varName]) {
        missing.push(varName);
      }
    });

    if (missing.length > 0) {
      console.error('❌ Missing required environment variables:');
      missing.forEach((varName) => {
        console.error(`   - ${varName}`);
      });
      console.error('\nPlease set these variables in your .env file');
      
      // In production, we should fail hard
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }

  // Check recommended variables (warnings only)
  RECOMMENDED_VARS.forEach((varName) => {
    if (!import.meta.env[varName]) {
      warnings.push(varName);
    }
  });

  if (warnings.length > 0 && !isProduction) {
    console.warn('⚠️  Missing recommended environment variables:');
    warnings.forEach((varName) => {
      console.warn(`   - ${varName}`);
    });
    console.warn('\nThe app will use defaults, but you may want to set these for full functionality');
  }

  // Log success
  if (missing.length === 0) {
    console.log('✅ Environment configuration validated successfully');
  }
}

/**
 * Get environment configuration
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  return {
    stripePublicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY,
    apiUrl: import.meta.env.VITE_API_URL || '/api/v1/horebSave',
    nodeEnv: import.meta.env.MODE || 'development',
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
  };
}

/**
 * Check if Stripe is configured
 */
export function isStripeConfigured(): boolean {
  const key = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
  return !!(key && key.startsWith('pk_'));
}

/**
 * Get a user-friendly error message for missing Stripe configuration
 */
export function getStripeConfigError(): string {
  return 'Stripe is not configured. Please add VITE_STRIPE_PUBLIC_KEY to your .env file. You can get your key from https://dashboard.stripe.com/test/apikeys';
}

// Run validation on module load
validateEnvironment();
