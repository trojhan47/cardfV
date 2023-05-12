import { createTRPCRouter } from "./trpc";
import { registerRouter } from "./routers/register";
import { walletRouter } from "./routers/wallet";
import { settingsRouter } from "./routers/settings";
import { cardsRouter } from "./routers/cards";
import { userRouter } from "./routers/user";
import { dojahBvnValidationRouter } from "./routers/dojahbvnvalidation";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  register: registerRouter,
  wallet: walletRouter,
  settings: settingsRouter,
  cards: cardsRouter,
  user: userRouter,
  dojah: dojahBvnValidationRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
