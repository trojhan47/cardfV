/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { sudoApi } from "@/server/utils/sudoApiHelper";
import { TRPCError } from "@trpc/server";
import axios from "axios";
import { z } from "zod";
import { env } from "../../../env.mjs";

import { createTRPCRouter, protectedProcedure } from "../trpc";

// const sdk = api("@dojahinc/v1.0#15p1c81fml12ajfr1");

// Todo: move raw data to env file
export const dojahBvnValidationRouter = createTRPCRouter({
  bvnselfie: protectedProcedure
    .input(
      z.object({
        bvn: z.string(),
        selfie_image: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // get the information of the currently logged in user and get their wallet information/status as well
      const user = await ctx.prisma.user.findUnique({
        where: {
          id: ctx.session.user.id,
        },
        include: {
          wallet: true,
        },
      });
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "something went wrong",
        });
      }

      const options = {
        method: "POST",
        // url: "https://api.dojah.io/api/v1/kyc/bvn/verify",
        url: env.DOJAH_API_URL,
        headers: {
          accept: "text/plain",
          AppId: env.DOJAH_APP_ID,
          "content-type": "application/json",
          Authorization: env.DOJAH_SK,
        },
        data: input,
      };

      try {
        // error is not being properly handled. need to rewrite the error handling.
        const response = await axios.request(options);

        // check if the response is ok if not throw error. if this error comes up and the error status is 401 or related, it probably as a result of the app configuration changes. such as app id, private key, pubic key etc. you may need to verufy these information or reach out to the service providers dojah...
        if (response.status !== 200) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Something went wrong, please try again in a few minutes",
          });
        }
        // get theinformation required such as bvn and selfie_verification from the response sent from the dojah api.
        const data = response.data;
        const { BVN, selfie_verification } = data.entity;
        console.log(BVN, selfie_verification);
        const { confidence_value, match } = selfie_verification;

        // if confidence level is less than 85, set verification to failed. the threshold for a successful verification is 85%. anything less is regarded as unsuccessful. and if verification match is false, flag as unsuccessful as well.
        if (confidence_value < 85 || match === false) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: " Selfie doesn't seem to match, Please try again",
          });
        }
      } catch (err) {
        // throw new error
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Verification failed! Selfie doesn't seem to match",
          // "Ooops... Something went wrong... please try again in a few minutes...!",
        });
      }
      // continue with veriification process
      // if the user type is individual this
      console.log(" sudo code :(");
      if (user.customerType === "INDIVIDUAL") {
        // Using the users sudocustomerid, update the users details, and with the bvn, names and dob.
        const updateUserSudoDetails = await sudoApi({
          method: "PUT",
          url: `/customers/${user.sudoCustomerID}`,
          data: {
            type: "individual",
            individual: {
              identity: {
                type: "BVN",
                number: input.bvn,
              },
              firstName: user.firstName,
              lastName: user.lastName,
              dob: new Date(user.dob)
                .toJSON()
                .slice(0, 10)
                .split("-")
                .join("/"),
            },
          },
        });
        console.log("sudo detials updated");
        // if the update fails, throw an error
        if (updateUserSudoDetails.statusCode !== 200) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Something went wrong",
          });
        }

        // update the user's getly details and set the bvn verification to true
        const updateUser = await ctx.prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            bvnVerified: true,
          },
        });
        // if the update fails, throw error
        if (!updateUser) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Something went wrong",
          });
        }
        // if the user doesnot have a wallet created yet, create user id for them using the sudo customer id
        if (!user.wallet) {
          const sudoCustomerWallet = await sudoApi({
            method: "POST",
            url: "/accounts",
            data: {
              currency: "NGN",
              type: "wallet",
              accountType: "Current",
              customerId: user.sudoCustomerID,
            },
          });
          // throw error if this process fails
          if (sudoCustomerWallet.statusCode !== 200) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Something went wrong while creating wallet",
            });
          }
          //
          const createUserWallet = await ctx.prisma.wallet.create({
            data: {
              sudoWalletID: sudoCustomerWallet.data._id,
              user: {
                connect: {
                  id: ctx.session.user.id,
                },
              },
            },
          });

          if (!createUserWallet)
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Something went wrong",
            });
        }

        return {
          verified: true,
        };

        console.log("wallet created successfully");
      }

      // else if it is a comapny account
      else {
        const updateUserSudoDetails = await sudoApi({
          method: "PUT",
          url: `/customers/${user.sudoCustomerID}`,
          data: {
            type: "company",
            company: {
              identity: {
                type: "BVN",
                number: input.bvn,
              },
              name: user.companyName,
            },
          },
        });
        if (updateUserSudoDetails.statusCode !== 200) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Something went wrong",
          });
        }

        const updateUser = await ctx.prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            bvnVerified: true,
          },
        });

        if (!updateUser) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Something went wrong",
          });
        }

        if (!user.wallet) {
          const sudoCustomerWallet = await sudoApi({
            method: "POST",
            url: "/accounts",
            data: {
              currency: "NGN",
              type: "wallet",
              accountType: "Current",
              customerId: user.sudoCustomerID,
            },
          });

          if (sudoCustomerWallet.statusCode !== 200) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Something went wrong while creating wallet",
            });
          }

          const createUserWallet = await ctx.prisma.wallet.create({
            data: {
              sudoWalletID: sudoCustomerWallet.data._id,
              user: {
                connect: {
                  id: ctx.session.user.id,
                },
              },
            },
          });

          if (!createUserWallet)
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Something went wrong",
            });
        }
        return {
          verified: true,
        };
      }
    }),
});
