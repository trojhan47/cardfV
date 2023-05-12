import type { GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
} from "next-auth";
import { prisma } from "./db";
import Credentials from "next-auth/providers/credentials";
import { loginSchema } from "./validation/auth";
import { TRPCError } from "@trpc/server";
import { verify } from "argon2";
import { env } from "@/env.mjs";
import { sudoApi } from "./utils/sudoApiHelper";
import { state } from "@/data/State";

/**
 * Module augmentation for `next-auth` types.
 * Allows us to add custom properties to the `session` object and keep type
 * safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 **/
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks,
 * etc.
 *
 * @see https://next-auth.js.org/configuration/options
 **/
export const authOptions: NextAuthOptions = {
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }

      return token;
    },
    session: async ({ session, token }) => {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
      }

      return session;
    },
  },
  jwt: {
    maxAge: 15 * 24 * 30 * 60, // 15 days
  },
  pages: {
    signIn: "/",
    error: "/",
    signOut: "/",
  },
  secret: env.JWT_SECRET,
  providers: [
    Credentials({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        pin: { label: "pin", type: "password" },
      },
      async authorize(credentials) {
        const { email, pin } = await loginSchema.parseAsync(credentials);
        const user = await prisma.user.findUnique({
          where: {
            email,
          },
        });
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "email or pin is incorrect",
          });
        }
        const isValid = await verify(user.pin, pin);
        if (!isValid) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "email or pin is incorrect",
          });
        }

        const sudoCustomer = await sudoApi({
          method: "GET",
          url: `/customers/${user.sudoCustomerID}`,
        });

        if (sudoCustomer.statusCode !== 200) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Something went wrong",
          });
        }

        const hasLinkedBvn = (sudoCustomer) => {
          if (user.customerType === "COMPANY") {
            if (sudoCustomer.data.company?.officer?.identity?.type === "BVN") {
              return true;
            }
            return false;
          } else if (user.customerType === "INDIVIDUAL") {
            if (sudoCustomer.data.individual?.identity?.type === "BVN") {
              return true;
            }
            return false;
          }
        };
        // const StateFormater = (userState: string) => {
        //   if (
        //     userState.toLowerCase() ===
        //     "Federal Capital Territory".toLocaleLowerCase()
        //   ) {
        //     return "FCT - Abuja";
        //   }

        //   if (userState.split(" ").length > 1) {
        //     const newState = state.find(
        //       (item) =>
        //         item.name
        //           .toLowerCase()
        //           .search(userState.split(" ")[0]!.toLowerCase()) !== -1
        //     );
        //     return newState?.name;
        //   }

        //   const newState = state.find(
        //     (item) =>
        //       item.name.toLowerCase().search(userState.toLowerCase()) !== -1
        //   );
        //   return newState?.name;
        // };

        // const newState = StateFormater(user.state);

        const hasUserLinkedBvn = hasLinkedBvn(sudoCustomer);
        if (hasUserLinkedBvn) {
          await prisma.user.update({
            where: {
              id: user.id,
            },
            data: {
              bvnVerified: true,
            },
          });
        } else {
          await prisma.user.update({
            where: {
              id: user.id,
            },
            data: {
              bvnVerified: false,
            },
          });
        }
        // if (
        //   user.customerType === "INDIVIDUAL"
        //   //  &&
        //   // sudoCustomer.data.individual?.dob === undefined
        // ) {
        //   const updateUserSudoDetails = await sudoApi({
        //     method: "PUT",
        //     url: `/customers/${user.sudoCustomerID}`,
        //     data: {
        //       type: "individual",
        //       individual: {
        //         dob: new Date(user.dob)
        //           .toJSON()
        //           .slice(0, 10)
        //           .split("-")
        //           .join("/"),
        //         firstName: user.firstName,
        //         lastName: user.lastName,
        //         identity: {
        //           type: sudoCustomer.data.individual?.identity?.type,
        //           number: sudoCustomer.data.individual?.identity?.number,
        //         },
        //       },
        //       billingAddress: {
        //         line1: user.address1,
        //         line2: user.address2,
        //         city: user.city,
        //         state: newState ? newState : user.state,
        //         country: user.country,
        //         postalCode: user.postalCode,
        //       },
        //     },
        //   });

        //   if (updateUserSudoDetails.statusCode !== 200) {
        //     throw new TRPCError({
        //       code: "INTERNAL_SERVER_ERROR",
        //       message: "Something went wrong",
        //     });
        //   }
        //   await prisma.user.update({
        //     where: {
        //       id: user.id,
        //     },
        //     data: {
        //       state: newState ? newState : user.state,
        //     },
        //   });
        // }

        // if (
        //   user.customerType === "COMPANY"
        //   //  &&
        //   // sudoCustomer.data.company?.officer?.dob === undefined
        // ) {
        //   const updateUserSudoDetails = await sudoApi({
        //     method: "PUT",
        //     url: `/customers/${user.sudoCustomerID}`,
        //     data: {
        //       type: "company",
        //       company: {
        //         name: user.companyName,
        //         officer: {
        //           firstName: user.firstName,
        //           lastName: user.lastName,
        //           dob: new Date(user.dob)
        //             .toJSON()
        //             .slice(0, 10)
        //             .split("-")
        //             .join("/"),
        //           identity: {
        //             type: sudoCustomer.data.company?.officer?.identity?.type,
        //             number:
        //               sudoCustomer.data.company?.officer?.identity?.number,
        //           },
        //         },
        //       },
        //       billingAddress: {
        //         line1: user.address1,
        //         line2: user.address2,
        //         city: user.city,
        //         state: newState ? newState : user.state,
        //         country: user.country,
        //         postalCode: user.postalCode,
        //       },
        //     },
        //   });

        //   if (updateUserSudoDetails.statusCode !== 200) {
        //     throw new TRPCError({
        //       code: "INTERNAL_SERVER_ERROR",
        //       message: "Something went wrong",
        //     });
        //   }
        //   await prisma.user.update({
        //     where: {
        //       id: user.id,
        //     },
        //     data: {
        //       state: newState ? newState : user.state,
        //     },
        //   });
        // }

        return { id: user.id, email };
      },
    }),
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the
 * `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 **/
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
