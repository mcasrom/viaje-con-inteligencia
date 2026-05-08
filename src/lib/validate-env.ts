/**
 * Environment variable validation utilities
 * Prevents runtime errors due to missing configuration
 */

type EnvVarSet = 'stripe' | 'supabase' | 'telegram' | 'all';

const requiredVars: Record<EnvVarSet, string[]> = {
  stripe: [
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_PRICE_ID',
  ],
  supabase: [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
  ],
  telegram: [
    'TELEGRAM_BOT_TOKEN',
    'TELEGRAM_CHANNEL_ID',
  ],
  all: [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_PRICE_ID',
    'TELEGRAM_BOT_TOKEN',
    'TELEGRAM_CHANNEL_ID',
  ],
};

/**
 * Validate that required environment variables are set
 * @param set - Which set of env vars to validate: 'stripe' | 'supabase' | 'telegram' | 'all'
 * @throws Error if any required variables are missing
 */
export function validateEnv(set: EnvVarSet = 'all'): void {
  const varsToCheck = requiredVars[set];
  const missing = varsToCheck.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
      `Please check your .env.local file and BUG_FIXES_SUMMARY.md for details.`
    );
  }
}

/**
 * Stripe-specific validation
 */
export function validateStripeEnv(): void {
  validateEnv('stripe');
}

/**
 * Supabase-specific validation
 */
export function validateSupabaseEnv(): void {
  validateEnv('supabase');
}

/**
 * Telegram-specific validation
 */
export function validateTelegramEnv(): void {
  validateEnv('telegram');
}
