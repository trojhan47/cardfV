import { sudoApi } from "@/server/utils/sudoApiHelper";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const walletRouter = createTRPCRouter({
  wallet: protectedProcedure.query(async ({ ctx }) => {
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
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong",
      });
    }

    if (user.bvnVerified === false) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "You need to verify your BVN first",
      });
    }

    const sudoCustomerWallet = await sudoApi({
      method: "GET",
      url: `/accounts/${user.wallet?.sudoWalletID}`,
    });

    if (sudoCustomerWallet.statusCode !== 200) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong",
      });
    }

    const sudoCustomerBalance = await sudoApi({
      method: "GET",
      url: `/accounts/${user.wallet?.sudoWalletID}/balance`,
    });

    if (sudoCustomerBalance.statusCode !== 200) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong",
      });
    }
    return {
      bankName: sudoCustomerWallet.data.provider,
      accountNumber: sudoCustomerWallet.data.accountNumber,
      accountName: sudoCustomerWallet.data.accountName,
      currentBalance: sudoCustomerBalance.data.currentBalance,
    };
  }),
  balance: protectedProcedure
    .input(
      z.object({
        id: z.string().nullish(),
      })
    )
    .query(async ({ input }) => {
      const sudoCustomerBalance = await sudoApi({
        method: "GET",
        url: `/accounts/${input.id}/balance`,
      });

      if (sudoCustomerBalance.statusCode !== 200) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
      }
      return {
        currentBalance: sudoCustomerBalance.data.currentBalance,
      };
    }),
  rates: protectedProcedure.query(async () => {
    // Fetch exchange rate
    const sudoExchangeRate = await sudoApi({
      method: "GET",
      url: `/accounts/transfer/rate/USDNGN`,
    });

    if (sudoExchangeRate.statusCode !== 200) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong",
      });
    }

    return {
      code: "200",
      rate: sudoExchangeRate.data.rate,
      sell: sudoExchangeRate.data.sell,
    };
  }),
  withdraw: protectedProcedure
    .input(
      z.object({
        amount: z.string(),
        accountNumber: z.string(),
        accountName: z.string(),
        bankCode: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      //  fetch user with wallet
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
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
      }

      // check if user has enough balance
      const sudoCustomerBalance = await sudoApi({
        method: "GET",
        url: `/accounts/${user.wallet?.sudoWalletID}/balance`,
      });

      if (sudoCustomerBalance.statusCode !== 200) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
      }

      if (sudoCustomerBalance.data.currentBalance < input.amount) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Insufficient balance",
        });
      }

      // create transfer
      const sudoTransfer = await sudoApi({
        method: "POST",
        url: `/accounts/transfer`,
        data: {
          debitAccountId: user.wallet?.sudoWalletID,
          beneficiaryBankCode: input.bankCode,
          beneficiaryAccountNumber: input.accountNumber,
          amount: parseInt(input.amount),
          narration: "Withdrawal to bank account from getly wallet",
        },
      });
      if (sudoTransfer.statusCode !== 200) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
      }

      return {
        statusCode: 200,
        message: "Withdrawal created successfully.",
      };
    }),
  bankList: protectedProcedure.query(async ({ ctx }) => {
    const bankLists = await sudoApi({
      method: "GET",
      url: `/accounts/banks`,
      params: {
        country: "NG",
      },
    });

    if (bankLists.statusCode !== 200) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong",
      });
    }

    return bankLists.data;
  }),
  transactions: protectedProcedure
    .input(
      z.object({
        cursor: z.number().default(0).nullish(),
        limit: z.number().min(1).max(100).default(15),
      })
    )
    .query(async ({ ctx, input }) => {
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
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
      }

      const transaction = await sudoApi({
        method: "GET",
        url: `/accounts/${user.wallet?.sudoWalletID}/transactions`,
        params: {
          page: input.cursor,
          limit: input.limit,
          fromDate: new Date(user.createdAt).toISOString(),
          toDate: new Date().toISOString(),
        },
      });

      if (transaction.statusCode !== 200) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
      }

      // make new array
      const newTransaction = transaction.data.map((transaction: any) => {
        return {
          amount: transaction.amount,
          narration: transaction.narration,
          provider: transaction.provider,
          providerChannel: transaction.providerChannel,
          transactionDate: new Date(
            transaction.transactionDate
          ).toLocaleString(),
          type: transaction.type,
          currency: transaction.account.currencyCode,
        };
      });

      return {
        statusCode: 200,
        data: newTransaction,
        pagination: {
          total: transaction.pagination.total,
          page: transaction.pagination.page,
          limit: transaction.pagination.limit,
          pages: transaction.pagination.pages,
        },
      };
    }),
  verifyBankName: protectedProcedure
    .input(
      z.object({
        bankCode: z.string(),
        accountNumber: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!input) return null;
      const verifyBankName = await sudoApi({
        method: "POST",
        url: `/accounts/transfer/name-enquiry`,
        data: {
          accountNumber: input.accountNumber,
          bankCode: input.bankCode,
        },
      });

      if (verifyBankName.statusCode !== 200) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
      }

      return {
        code: "200",
        accountName: verifyBankName.data.accountName,
        accountNumber: verifyBankName.data.accountNumber,
        bankCode: verifyBankName.data.bankCode,
      };
    }),
});
