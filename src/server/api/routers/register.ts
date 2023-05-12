/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { sudoApi } from "@/server/utils/sudoApiHelper";
import { senderHelper } from "@/server/utils/senderApiHelper";
import { MonoResponse } from "@/types/interfaces.js";
import { TRPCError } from "@trpc/server";
import { hash } from "argon2";
import axios from "axios";
import { decode, encode } from "next-auth/jwt";
import { z } from "zod";
import { env } from "../../../env.mjs";
import type { MonoBvnResponse } from "../../validation/mono";
import { registerSchema } from "../../validation/register";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

interface BvnInitiateProps extends MonoResponse {
  data: {
    session_id: string;
    methods: {
      method: string;
      hint: string;
    }[];
  };
}

export const registerRouter = createTRPCRouter({
  bvnInitiate: protectedProcedure
    .input(
      z.object({
        bvn: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const response = await axios.post<BvnInitiateProps>(
        `${env.MONO_API_URL}/v2/lookup/bvn/initiate`,
        { bvn: input.bvn },
        {
          headers: {
            accept: "application/json",
            "mono-sec-key": env.MONO_SK,
            "content-type": "application/json",
          },
        }
      );

      if (response.data.status !== "successful") {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error initiating bvn",
        });
      }
      return response.data.data;
    }),
  bvnVerify: protectedProcedure
    .input(
      z.object({
        method: z.enum(["phone", "email"]),
        sessionId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const response = await axios.post<MonoResponse>(
        `${env.MONO_API_URL}/v2/lookup/bvn/verify`,
        {
          method: input.method,
        },
        {
          headers: {
            accept: "application/json",
            "mono-sec-key": env.MONO_SK,
            "content-type": "application/json",
            "x-session-id": input.sessionId,
          },
        }
      );

      if (response.data.status !== "successful") {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error verifying bvn",
        });
      }

      return response.data;
    }),
  bvnDetails: protectedProcedure
    .input(
      z.object({
        otp: z.string(),
        sessionId: z.string(),
        bvn: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
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

      try {
        const response = await axios.post<MonoBvnResponse>(
          `${env.MONO_API_URL}/v2/lookup/bvn/details`,
          { otp: input.otp },
          {
            headers: {
              accept: "application/json",
              "mono-sec-key": env.MONO_SK,
              "content-type": "application/json",
              "x-session-id": input.sessionId,
            },
          }
        );

        if (response.data.status !== "successful") {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Invalid otp",
          });
        }
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error verifing otp",
        });
      }

      if (user.customerType === "INDIVIDUAL") {
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
      } else {
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

  verifyCac: publicProcedure
    .input(
      z.object({
        companyName: z.string(),
        companyCac: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const response = await axios.get(`${env.MONO_CAC_LOOKUP_URL}`, {
        params: {
          name: input.companyName,
        },
        headers: {
          accept: "application/json",
          "mono-sec-key": env.MONO_SK,
          "content-type": "application/json",
        },
      });

      if (response.data.status !== "successful") {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error verifying Cac",
        });
      }

      if (response.data.data[0].rcNumber === input.companyCac) {
        return true;
      }

      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Error verifying Cac",
      });
    }),
  sendOtp: publicProcedure
    .input(
      z.object({
        phoneNumber: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const transformedPhoneNumber = input.phoneNumber.replace(/^0/, "234");
      try {
        const response = await axios.post(
          `${env.TERMII_BASEURL}/api/sms/otp/send`,
          {
            api_key: env.TERMII_APIKEY,
            message_type: "NUMERIC",
            to: transformedPhoneNumber,
            from: "N-Alert",
            channel: "dnd",
            pin_attempts: 10,
            pin_time_to_live: 5,
            pin_length: 6,
            pin_placeholder: "< token >",
            message_text:
              "Hey there, Getly will like to verify your phone number. Your confirmation code is < token >. The code expires in 5 minutes. Get In!",
            pin_type: "NUMERIC",
          },
          {
            headers: {
              accept: "application/json",
              "content-type": "application/json",
            },
          }
        );

        if (response.data.status === 200) {
          return response.data;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error sending otp",
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error sending otp",
        });
      }
    }),
  forgotPin: publicProcedure
    .input(
      z.object({
        email: z.string(),
        otp: z.string().nullish(),
        newPin: z.string().nullish(),
        authToken: z.string().nullish(),
        type: z.enum(["OTP", "RESET"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: {
          email: input.email,
        },
      });
      console.log(user);
      console.log(input);

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      if (input.type === "OTP" && input.email) {
        // generate 6 random digit
        const otp = Math.floor(100000 + Math.random() * 900000);
        const response = await fetch(
          `${env.TERMII_BASEURL}/api/email/otp/send`,
          {
            method: "POST",
            headers: {
              accept: "application/json",
              "content-type": "application/json",
            },
            body: JSON.stringify({
              api_key: env.TERMII_APIKEY,
              email_address: input.email,
              code: otp,
              email_configuration_id: "549accec-0adb-4a28-a45c-b430f7d5f79e",
            }),
          }
        );
        const data = await response.json();

        const signedJwt = await encode({
          secret: env.JWT_SECRET,
          token: {
            email: input.email,
            otp: otp,
            id: input.email,
          },
          maxAge: 5 * 60,
        });

        if (data.code !== "ok") {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Error sending otp",
          });
        }
        return {
          statusCode: 200,
          message: "Email sent successfully",
          authToken: signedJwt,
        };
      }
      if (!input.otp) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "otp is required",
        });
      }
      if (!input.email) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "email is required",
        });
      }
      if (!input.type) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "type is required",
        });
      }
      if (!input.authToken) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "authToken is required",
        });
      }
      if (!input.newPin) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "new pin is required",
        });
      }
      const decodedJwt: any = await decode({
        secret: env.JWT_SECRET,
        token: input.authToken,
      }).catch(() => {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Expired token",
        });
      });

      if (parseInt(input.otp) !== decodedJwt?.otp) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "invalid otp",
        });
      }

      if (Date.now() >= decodedJwt.exp * 1000) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Otp has expired",
        });
      }

      const hashedPassword = await hash(input.newPin);

      const updatedUser = await ctx.prisma.user
        .update({
          where: {
            email: input.email,
          },
          data: {
            pin: hashedPassword,
          },
        })
        .catch(() => {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Error updating pin",
          });
        });

      if (!updatedUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Pin update failed",
        });
      }

      return {
        statusCode: 200,
        message: "Pin updated successfully",
      };
    }),
  verifyOtp: publicProcedure
    .input(
      z.object({
        pin_id: z.string(),
        pin: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const response = await fetch(`${env.TERMII_BASEURL}/api/sms/otp/verify`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          api_key: env.TERMII_APIKEY,
          pin_id: input.pin_id,
          pin: input.pin,
        }),
      });
      const data = await response.json();

      if (data.verified) {
        return data;
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Error verifying otp",
      });
    }),
  signUp: publicProcedure
    .input(registerSchema)
    .mutation(async ({ input, ctx }) => {
      const transformedPhoneNumber = input.phoneNumber.replace(/^0/, "+234");

      // check if user exists
      const exists = await ctx.prisma.user.findUnique({
        where: {
          email: input.email,
        },
      });

      if (exists) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User already exists.",
        });
      }
      // individual
      if (input.userType === "INDIVIDUAL") {
        const sudoCustomer = await sudoApi({
          method: "POST",
          url: "/customers",
          data: {
            type: "individual",
            name: `${input.firstName} ${input.lastName}`,
            status: "active",
            phoneNumber: transformedPhoneNumber,
            emailAddress: input.email,
            individual: {
              firstName: input.firstName,
              lastName: input.lastName,
              dob: new Date(input.dob)
                .toJSON()
                .slice(0, 10)
                .split("-")
                .join("/"),
            },
            billingAddress: {
              line1: input.address1,
              line2: input.address2,
              city: input.city,
              state: input.state,
              country: input.country,
              postalCode: input.postalCode,
            },
          },
        });

        if (sudoCustomer.statusCode !== 200) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Something went wrong",
          });
        }

        const hashedPassword = await hash(input.pin);

        const createUser = await ctx.prisma.user.create({
          data: {
            firstName: input.firstName,
            lastName: input.lastName,
            email: input.email,
            phoneNumber: input.phoneNumber,
            address1: input.address1,
            address2: input.address2,
            customerType: input.userType,
            city: input.city,
            state: input.state,
            country: input.country,
            postalCode: input.postalCode,
            pin: hashedPassword,
            dob: new Date(input.dob),
            sudoCustomerID: sudoCustomer.data._id,
            companyName: undefined,
          },
        });
        if (!createUser)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Something went wrong",
          });

        return {
          code: 200,
          status: "success",
          message: "User created successfully",
        };
      }

      // company

      const sudoCustomer = await sudoApi({
        method: "POST",
        url: "/customers",
        data: {
          type: "company",
          name: input.companyName,
          status: "active",
          phoneNumber: transformedPhoneNumber,
          emailAddress: input.email,
          identity: {
            number: input.companyCac,
            type: "CAC",
          },
          company: {
            name: input.companyName,
            officer: {
              firstName: input.firstName,
              lastName: input.lastName,
              dob: new Date(input.dob)
                .toJSON()
                .slice(0, 10)
                .split("-")
                .join("/"),
            },
          },
          billingAddress: {
            line1: input.address1,
            line2: input.address2,
            city: input.city,
            state: input.state,
            country: input.country,
            postalCode: input.postalCode,
          },
        },
      });
      if (sudoCustomer.statusCode !== 200) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
      }

      const hashedPassword = await hash(input.pin);
      const createUser = await ctx.prisma.user.create({
        data: {
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          phoneNumber: input.phoneNumber,
          address1: input.address1,
          address2: input.address2,
          customerType: input.userType,
          city: input.city,
          state: input.state,
          country: input.country,
          postalCode: input.postalCode,
          pin: hashedPassword,
          dob: new Date(input.dob),
          sudoCustomerID: sudoCustomer.data._id,
          companyName: input.companyName,
        },
      });
      if (!createUser)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });

      return {
        code: 200,
        status: "success",
        message: "User created successfully",
      };
    }),

  // subscribe sender test
  subSender: publicProcedure
    .input(
      z.object({
        firstname: z.string(),
        lastname: z.string(),
        email: z.string().email(),
        recieveCommunications: z.boolean(),
        storePersonalData: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      if (input.recieveCommunications || input.storePersonalData) {
        // alert("in here");
        console.log("subbing");
        await senderHelper({
          data: {
            firstname: input.firstname,
            lastname: input.lastname,
            email: input.email,
            // group is manually added to the data to send to the sender api
            // test group
            // groups: [" aKLGBz"],
            // getly subscription group
            groups: [" e5RMgq"],
          },
        })
          .then((res) => {
            console.log(res.data, "res");
          })
          .catch((error) => {
            // return error;
            console.log(error);
          });

        return {
          code: 200,
          status: "success",
          message: "User subbed",
        };
      }
    }),
});
