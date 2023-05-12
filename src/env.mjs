/* eslint-disable @typescript-eslint/ban-ts-comment */
import { z } from "zod";

/**
 * Specify your server-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 */
const server = z.object({
  DATABASE_URL: z.string().url(),
  // DATABASE_URL: z.string(),
  NODE_ENV: z.enum(["development", "test", "production"]),
  NEXTAUTH_SECRET:
    process.env.NODE_ENV === "production"
      ? z.string().min(1)
      : z.string().min(1).optional(),
  NEXTAUTH_URL: z.preprocess(
    // This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
    // Since NextAuth.js automatically uses the VERCEL_URL if present.
    (str) => process.env.VERCEL_URL ?? str,
    // VERCEL_URL doesn't include `https` so it cant be validated as a URL
    process.env.VERCEL ? z.string().min(1) : z.string().url()
  ),
  MONO_BVN_LOOKUP_URL: z.string().url(),
  MONO_CAC_LOOKUP_URL: z.string().url(),
  TERMII_BASEURL: z.string().url(),
  MONO_SK: z.string(),
  TERMII_APIKEY: z.string(),
  SUDO_APIKEY: z.string(),
  SUDO_LIVE: z.string(),
  SUDO_USD_ACCOUNT_ID: z.string(),
  SUDO_NGN_ACCOUNT_ID: z.string(),
  FUNDING_FEE_DOLLAR: z.string(),
  WITHDRAWAL_FEE_DOLLAR: z.string(),
  FUNDING_FEE_PERCENTAGE_DOLLAR: z.string(),
  MINIMUM_DEPOSIT_NAIRA: z.string(),
  MINIMUM_DEPOSIT_DOLLAR: z.string(),
  JWT_SECRET: z.string(),
  MONO_API_URL: z.string().url(),
  // Dojah verification
  DOJAH_SK: z.string(),
  DOJAH_APP_ID: z.string(),
  DOJAH_API_URL: z.string(),

  // Sender app
  SENDER_APP_KEY: z.string(),
  // Add `.min(1) on ID and SECRET if you want to make sure they're not empty
});

/**
 * Specify your client-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 * To expose them to the client, prefix them with `NEXT_PUBLIC_`.
 */
const client = z.object({
  // NEXT_PUBLIC_CLIENTVAR: z.string().min(1),
  NEXT_PUBLIC_SUDO_VAULT_ID: z.string().min(1),
  NEXT_PUBLIC_VGS_URL: z.string().url(),
  NEXT_PUBLIC_FUNDING_FEE_DOLLAR: z.string(),
  NEXT_PUBLIC_FUNDING_FEE_PERCENTAGE_DOLLAR: z.string(),
  NEXT_PUBLIC_WITHDRAWAL_FEE_DOLLAR: z.string(),
  NEXT_PUBLIC_MINIMUM_DEPOSIT_NAIRA: z.string(),
  NEXT_PUBLIC_MINIMUM_DEPOSIT_DOLLAR: z.string(),
});

/**
 * You can't destruct `process.env` as a regular object in the Next.js
 * edge runtimes (e.g. middlewares) or client-side so we need to destruct manually.
 * @type {Record<keyof z.infer<typeof server> | keyof z.infer<typeof client>, string | undefined>}
 */
const processEnv = {
  DATABASE_URL: process.env.DATABASE_URL,
  NODE_ENV: process.env.NODE_ENV,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  MONO_BVN_LOOKUP_URL: process.env.MONO_BVN_LOOKUP_URL,
  MONO_CAC_LOOKUP_URL: process.env.MONO_CAC_LOOKUP_URL,
  MONO_API_URL: process.env.MONO_API_URL,
  TERMII_BASEURL: process.env.TERMII_BASEURL,
  MONO_SK: process.env.MONO_SK,
  TERMII_APIKEY: process.env.TERMII_APIKEY,
  SUDO_APIKEY: process.env.SUDO_APIKEY,
  SUDO_LIVE: process.env.SUDO_LIVE,
  SUDO_USD_ACCOUNT_ID: process.env.SUDO_USD_ACCOUNT_ID,
  SUDO_NGN_ACCOUNT_ID: process.env.SUDO_NGN_ACCOUNT_ID,
  FUNDING_FEE_DOLLAR: process.env.FUNDING_FEE_DOLLAR,
  WITHDRAWAL_FEE_DOLLAR: process.env.WITHDRAWAL_FEE_DOLLAR,
  MINIMUM_DEPOSIT_NAIRA: process.env.MINIMUM_DEPOSIT_NAIRA,
  MINIMUM_DEPOSIT_DOLLAR: process.env.MINIMUM_DEPOSIT_DOLLAR,
  JWT_SECRET: process.env.JWT_SECRET,
  NEXT_PUBLIC_SUDO_VAULT_ID: process.env.NEXT_PUBLIC_SUDO_VAULT,
  NEXT_PUBLIC_VGS_URL: process.env.NEXT_PUBLIC_VGS_URL,
  NEXT_PUBLIC_FUNDING_FEE_DOLLAR: process.env.NEXT_PUBLIC_FUNDING_FEE_DOLLAR,
  FUNDING_FEE_PERCENTAGE_DOLLAR: process.env.FUNDING_FEE_PERCENTAGE_DOLLAR,
  NEXT_PUBLIC_FUNDING_FEE_PERCENTAGE_DOLLAR:
    process.env.NEXT_PUBLIC_FUNDING_FEE_PERCENTAGE_DOLLAR,
  NEXT_PUBLIC_WITHDRAWAL_FEE_DOLLAR:
    process.env.NEXT_PUBLIC_WITHDRAWAL_FEE_DOLLAR,
  NEXT_PUBLIC_MINIMUM_DEPOSIT_NAIRA:
    process.env.NEXT_PUBLIC_MINIMUM_DEPOSIT_NAIRA,
  NEXT_PUBLIC_MINIMUM_DEPOSIT_DOLLAR:
    process.env.NEXT_PUBLIC_MINIMUM_DEPOSIT_DOLLAR,
  // NEXT_PUBLIC_CLIENTVAR: process.env.NEXT_PUBLIC_CLIENTVAR,
  // DOJAH section
  DOJAH_SK: process.env.DOJAH_SK,
  DOJAH_APP_ID: process.env.DOJAH_APP_ID,
  DOJAH_API_URL: process.env.DOJAH_API_URL,

  // Sender app 
  SENDER_APP_KEY: process.env.SENDER_APP_KEY
};

// Don't touch the part below
// --------------------------

const merged = server.merge(client);
/** @type z.infer<merged>
 *  @ts-ignore - can't type this properly in jsdoc */
let env = process.env;

if (!!process.env.SKIP_ENV_VALIDATION == false) {
  const isServer = typeof window === "undefined";

  const parsed = isServer
    ? merged.safeParse(processEnv) // on server we can validate all env vars
    : client.safeParse(processEnv); // on client we can only validate the ones that are exposed

  if (parsed.success === false) {
    console.error(
      "❌ Invalid environment variables:",
      parsed.error.flatten().fieldErrors
    );
    throw new Error("Invalid environment variables");
  }

  /** @type z.infer<merged>
   *  @ts-ignore - can't type this properly in jsdoc */
  env = new Proxy(parsed.data, {
    get(target, prop) {
      if (typeof prop !== "string") return undefined;
      // Throw a descriptive error if a server-side env var is accessed on the client
      // Otherwise it would just be returning `undefined` and be annoying to debug
      if (!isServer && !prop.startsWith("NEXT_PUBLIC_"))
        throw new Error(
          process.env.NODE_ENV === "production"
            ? "❌ Attempted to access a server-side environment variable on the client"
            : `❌ Attempted to access server-side environment variable '${prop}' on the client`
        );
      /*  @ts-ignore - can't type this properly in jsdoc */
      return target[prop];
    },
  });
}

export { env };
