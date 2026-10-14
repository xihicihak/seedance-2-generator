/**
 * Centralized configuration for PornMake (Wan 2.2 Studio).
 * All environment variables are validated and exported from here.
 */

const config = {
  appName: "PornMake - Wan 2.2 Studio",
  brandName: "PornMake",
  domain: process.env.NEXT_PUBLIC_APP_URL || "https://www.pornmakes.com",
  auth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
    secret: process.env.NEXTAUTH_SECRET,
    url: process.env.NEXTAUTH_URL || "http://localhost:3000",
    webhook_url: process.env.WEBHOOK_URL || process.env.NEXTAUTH_URL || "http://localhost:3000",
  },
  stripe: {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    plans: {
      default: {
        amount: 50, // 50 credits
        price: 500, // $5.00
        currency: "usd",
      }
    }
  },
  ai: {
    comfyui: {
      apiUrl: process.env.COMFYUI_API_URL || "http://127.0.0.1:8188",
      defaultT2VModel: "wan2.1_t2v_14B_bf16.safetensors",
      defaultI2VModel: "wan2.1_i2v_14B_720p.safetensors",
    },
  },
  db: {
    url: process.env.DATABASE_URL,
    directUrl: process.env.DIRECT_URL,
  }
};

export default config;
