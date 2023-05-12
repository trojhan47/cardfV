import { TRPCError } from "@trpc/server";
import { hash, verify } from "argon2";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const settingsRouter = createTRPCRouter({
  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: {
        id: ctx.session.user.id,
      },
      select: {
        id: true,
        address1: true,
        city: true,
        companyName: true,
        country: true,
        dob: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        state: true,
        postalCode: true,
        customerType: true,
        bvnVerified: true,
      },
    });
    return user;
  }),
  updatePin: protectedProcedure
    .input(
      z.object({
        oldPin: z.string(),
        newPin: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: {
          id: ctx.session.user.id,
        },
        select: {
          pin: true,
        },
      });
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }
      const isValid = await verify(user.pin, input.oldPin);

      if (!isValid) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: " pin is incorrect",
        });
      }

      const hashedPassword = await hash(input.newPin);

      const updatedUser = await ctx.prisma.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          pin: hashedPassword,
        },
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
});
