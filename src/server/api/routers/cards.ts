/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { env } from "@/env.mjs";
import { sudoApi } from "@/server/utils/sudoApiHelper";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

interface cardProps {
  _id: string;
  brand: string;
  expiryMonth: string;
  expiryYear: string;
  maskedPan: string;
  currency: string;
  metadata: {
    cardColor: string;
    textColor: string;
    bglogoColor: string;
    logoColor: string;
  };
  customer: { name: string };
  status: string;
}

export const cardsRouter = createTRPCRouter({
  getAllCards: protectedProcedure
    .input(
      z.object({
        cursor: z.number().default(0).nullish(),
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: {
          id: ctx.session.user.id,
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

      // get all cards
      const sudoCustomerCards = await sudoApi({
        method: "GET",
        url: `/cards/customer/${user.sudoCustomerID}`,
        params: {
          page: input.cursor,
          limit: input.limit,
        },
      });

      if (sudoCustomerCards.statusCode !== 200) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
      }

      // make new array of cards
      const cards = sudoCustomerCards.data.map((card: cardProps) => {
        return {
          id: card._id,
          maskedPan: card.maskedPan,
          brand: card.brand,
          expiryMonth: card.expiryMonth,
          expiryYear: card.expiryYear,
          currency: card.currency,
          cardColor: card.metadata.cardColor,
          textColor: card.metadata.textColor,
          bglogoColor: card.metadata.bglogoColor,
          logoColor: card.metadata.logoColor,
          status: card.status,
          name: card.customer.name,
        };
      });

      // filter canceled cards
      const filteredCards = cards.filter(
        (card: cardProps) => card.status !== "canceled"
      );

      return {
        statusCode: 200,
        data: filteredCards,
        pagination: {
          total: sudoCustomerCards.pagination.total,
          page: sudoCustomerCards.pagination.page,
          limit: sudoCustomerCards.pagination.limit,
          pages: sudoCustomerCards.pagination.pages,
        },
      };
    }),

  getCard: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: {
          id: ctx.session.user.id,
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
      const card = await sudoApi({
        method: "GET",
        url: `/cards/${input.id}`,
        params: {
          reveal: false,
        },
      });

      if (card.statusCode !== 200) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Something went wrong",
        });
      }

      return {
        id: card.data._id,
        name: card.data.customer.name,
        status: card.data.status,
        maskedPan: card.data.maskedPan,
        brand: card.data.brand,
        expiryMonth: card.data.expiryMonth,
        expiryYear: card.data.expiryYear,
        currency: card.data.currency,
        cardColor: card.data.metadata.cardColor,
        textColor: card.data.metadata.textColor,
        bglogoColor: card.data.metadata.bglogoColor,
        logoColor: card.data.metadata.logoColor,
        billingAddress:
          card.data.currency === "USD"
            ? card.data.billingAddress
            : card.data.customer.billingAddress,
        accountId: card.data.account._id,
      };
    }),

  getCardToken: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: {
          id: ctx.session.user.id,
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
      const cardToken = await sudoApi({
        method: "GET",
        url: `/cards/${input.id}/token`,
      });

      if (cardToken.statusCode !== 200) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Something went wrong",
        });
      }

      return cardToken;
    }),

  getCardTransactions: protectedProcedure
    .input(
      z.object({
        id: z.string().nullish(),
        cursor: z.number().default(0).nullish(),
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .query(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: {
          id: ctx.session.user.id,
        },
        select: {
          createdAt: true,
          bvnVerified: true,
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
      const cardTransactions = await sudoApi({
        method: "GET",
        url: `/cards/${input.id}/transactions`,
        params: {
          page: input.cursor,
          limit: input.limit,
          fromDate: new Date(user.createdAt).toISOString(),
          toDate: new Date().toISOString(),
        },
      });

      if (cardTransactions.statusCode !== 200) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Something went wrong",
        });
      }

      // make new array of card transactions
      const transactions = cardTransactions.data.map((transaction: any) => {
        return {
          id: transaction._id,
          amount: transaction.amount,
          merchantName: transaction.merchant.name,
          merchantId: transaction.merchant.merchantId,
          merchantCountry: transaction.merchant.country,
          fee: transaction?.authorization?.fee,
          vat: transaction?.authorization?.vat,
          currency: transaction.currency,
          status: transaction?.authorization?.status,
          createdAt: new Date(transaction.createdAt).toLocaleString(),
          updatedAt: new Date(transaction.updatedAt).toLocaleString(),
          cardId: transaction?.authorization?.card,
          accountId: transaction?.authorization?.account,
          customerId: transaction?.authorization?.customer,
          channel: transaction.transactionMetadata.channel,
          transactionType: transaction.transactionMetadata.type,
        };
      });

      return {
        statusCode: 200,
        data: transactions,
        pagination: {
          total: cardTransactions.pagination.total,
          page: cardTransactions.pagination.page,
          limit: cardTransactions.pagination.limit,
          pages: cardTransactions.pagination.pages,
        },
      };
    }),
  createCard: protectedProcedure
    .input(
      z.object({
        amount: z.string(),
        currency: z.string(),
        cardMeta: z.object({
          id: z.number(),
          cardColor: z.string(),
          textColor: z.string(),
          bglogoColor: z.string(),
          logoColor: z.string(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // get user sudo wallet id
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

      //   get user sudo wallet balance
      const sudoCustomerBalance = await sudoApi({
        method: "GET",
        url: `/accounts/${user.wallet?.sudoWalletID}/balance`,
      });

      if (sudoCustomerBalance.statusCode !== 200) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Something went wrong",
        });
      }

      // creation of dollar card
      // if (input.currency === "USD") {
        // check if amount is upto minimum
        if (parseInt(input.amount) < parseInt(env.MINIMUM_DEPOSIT_DOLLAR)) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Minimum amount to create a card is $${env.MINIMUM_DEPOSIT_DOLLAR}`,
          });
        }

        // Fetch exchange rate
        const sudoExchangeRate = await sudoApi({
          method: "GET",
          url: `/accounts/transfer/rate/USDNGN`,
        });

        if (sudoExchangeRate.statusCode !== 200)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Something went wrong",
          });

        // convert amount to naira
        const convertedAmount =
          parseInt(input.amount) * parseInt(sudoExchangeRate.data.rate);

        // convert percentage to naira
        const convertedPercentage = (
          (parseInt(env.FUNDING_FEE_PERCENTAGE_DOLLAR) / 100) *
          parseInt(input.amount)
        ).toFixed(2);

        // convert fee to naira
        const convertFee =
          parseInt(env.FUNDING_FEE_DOLLAR) *
          parseInt(sudoExchangeRate.data.rate);

        const convertedPercentageToNaira =
          parseFloat(convertedPercentage) *
          parseInt(sudoExchangeRate.data.rate);

        const totalAmount =
          convertedAmount + convertedPercentageToNaira + convertFee;

        // check if user has enough balance
        if (sudoCustomerBalance.data.currentBalance < totalAmount) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Insufficient funds",
          });
        }

        // debit user naira balance
        const sudoDebitCustomerBalance = await sudoApi({
          method: "POST",
          url: "/accounts/transfer",
          data: {
            debitAccountId: user.wallet?.sudoWalletID,
            creditAccountId: env.SUDO_NGN_ACCOUNT_ID,
            amount: totalAmount,
            narration: "Card creation",
            paymentReference: `${Math.floor(Math.random() * 10000000000)}`,
          },
        });

        if (sudoDebitCustomerBalance.statusCode !== 200) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Something went wrong",
          });
        }

        // create card
        const sudoCreateCard = await sudoApi({
          method: "POST",
          url: "/cards",
          data: {
            customerId: user.sudoCustomerID,
            debitAccountId: env.SUDO_NGN_ACCOUNT_ID,
            issuerCountry: "USA",
            type: "virtual",
            currency: "USD",
            status: "active",
            metadata: {
              cardColor: input.cardMeta.cardColor,
              textColor: input.cardMeta.textColor,
              bglogoColor: input.cardMeta.bglogoColor,
              logoColor: input.cardMeta.logoColor,
            },
            brand: "MasterCard",
            amount: parseInt(input.amount),
          },
        });

        if (sudoCreateCard.statusCode !== 200) {
          // refund user debited amount
          await sudoApi({
            method: "POST",
            url: "/accounts/transfer",
            data: {
              debitAccountId: env.SUDO_NGN_ACCOUNT_ID,
              creditAccountId: user.wallet?.sudoWalletID,
              amount: totalAmount,
              narration: "Reversal for fail Card creation",
              paymentReference: `${Math.floor(Math.random() * 10000000000)}`,
            },
          });
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Card creation failed",
          });
        }

        return {
          statusCode: 200,
          message: "Card created successfully.",
          id: sudoCreateCard.data._id,
        };
      // }

      // creation of naira card

      // check if user has enough balance
      // if (
      //   sudoCustomerBalance.data.currentBalance <
      //   parseInt(input.amount) + 50
      // ) {
      //   throw new TRPCError({
      //     code: "INTERNAL_SERVER_ERROR",
      //     message: "Insufficient funds",
      //   });
      // }

      // // debit user naira balance
      // const sudoDebitCustomerBalance = await sudoApi({
      //   method: "POST",
      //   url: "/accounts/transfer",
      //   data: {
      //     debitAccountId: user.wallet?.sudoWalletID,
      //     creditAccountId: env.SUDO_NGN_ACCOUNT_ID,
      //     amount: parseInt(input.amount) + 50,
      //     narration: "Card creation",
      //     paymentReference: `${Math.floor(Math.random() * 10000000000)}`,
      //   },
      // });

      // if (sudoDebitCustomerBalance.statusCode !== 200) {
      //   throw new TRPCError({
      //     code: "INTERNAL_SERVER_ERROR",
      //     message: "Something went wrong",
      //   });
      // }

      // // create card
      // const sudoCreateCard = await sudoApi({
      //   method: "POST",
      //   url: "/cards",
      //   data: {
      //     customerId: user.sudoCustomerID,
      //     debitAccountId: env.SUDO_NGN_ACCOUNT_ID,
      //     issuerCountry: "NGA",
      //     type: "virtual",
      //     currency: "NGN",
      //     status: "active",
      //     metadata: {
      //       cardColor: input.cardMeta.cardColor,
      //       textColor: input.cardMeta.textColor,
      //       bglogoColor: input.cardMeta.bglogoColor,
      //       logoColor: input.cardMeta.logoColor,
      //     },
      //     brand: "Verve",
      //   },
      // });

      // if (sudoCreateCard.statusCode !== 200) {
      //   // refund user debited amount
      //   await sudoApi({
      //     method: "POST",
      //     url: "/accounts/transfer",
      //     data: {
      //       debitAccountId: env.SUDO_NGN_ACCOUNT_ID,
      //       creditAccountId: user.wallet?.sudoWalletID,
      //       amount: parseInt(input.amount) + 50,
      //       narration: "Reversal for fail Card creation",
      //       paymentReference: `${Math.floor(Math.random() * 10000000000)}`,
      //     },
      //   });
      //   throw new TRPCError({
      //     code: "INTERNAL_SERVER_ERROR",
      //     message: "Card creation failed",
      //   });
      // }

      // const userAmountDeposit = await sudoApi({
      //   method: "POST",
      //   url: "/accounts/transfer",
      //   data: {
      //     debitAccountId: env.SUDO_NGN_ACCOUNT_ID,
      //     creditAccountId: sudoCreateCard.data.account,
      //     amount: parseInt(input.amount),
      //     narration: "Fund card",
      //     paymentReference: `${Math.floor(Math.random() * 10000000000)}`,
      //   },
      // });

      // if (userAmountDeposit.statusCode !== 200) {
      //   throw new TRPCError({
      //     code: "INTERNAL_SERVER_ERROR",
      //     message: "Something went wrong",
      //   });
      // }

      // return {
      //   statusCode: 200,
      //   message: "Card created successfully.",
      //   id: sudoCreateCard.data._id,
      // };
    }),
  updateCard: protectedProcedure
    .input(
      z.object({
        id: z.string().nullish(),
        status: z.enum(["active", "inactive", "canceled"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: {
          id: ctx.session.user.id,
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
      const cardUpdate = await sudoApi({
        method: "put",
        url: `/cards/${input.id}`,
        data: {
          status: input.status,
        },
      });

      if (cardUpdate.statusCode !== 200) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
      }

      return {
        statusCode: 200,
        message: "Card updated successfully.",
        currentCardStatus: cardUpdate.data.status,
      };
    }),
  deleteCard: protectedProcedure
    .input(
      z.object({
        id: z.string().nullish(),
        reason: z.enum(["lost", "stolen"]).default("lost").nullish(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // get user sudo wallet id
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
      // get card details
      const cardDetails = await sudoApi({
        method: "GET",
        url: `/cards/${input.id}`,
      });

      if (cardDetails.statusCode !== 200) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Something went wrong",
        });
      }

      // get card balance
      const cardBalance = await sudoApi({
        method: "GET",
        url: `/accounts/${cardDetails.data.account._id}/balance`,
      });

      if (cardBalance.statusCode !== 200) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
      }

      // check that user do not have a balance before terminating card
      if (cardBalance.data.currentBalance === 0) {
        const terminateCard = await sudoApi({
          method: "PUT",
          url: `/cards/${input.id}`,
          data: {
            creditAccountId: user.wallet?.sudoWalletID,
            cancellationReason: input.reason,
            status: "canceled",
          },
        });

        if (terminateCard.statusCode !== 200) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "card termination failed",
          });
        }

        return {
          statusCode: 200,
          message: "Card terminated successfully.",
        };
      }
      // check if card was a naira card
      if (cardDetails.data.currency === "NGN") {
        // transfer card balance to user wallet
        const sudoDebitCustomerBalance = await sudoApi({
          method: "POST",
          url: "/accounts/transfer",
          data: {
            debitAccountId: cardDetails.data.account._id,
            creditAccountId: user.wallet?.sudoWalletID,
            amount: cardBalance.data.currentBalance,
            narration: "Refund remaining card balance before card termination",
            paymentReference: `${Math.floor(Math.random() * 10000000000)}`,
          },
        });

        if (sudoDebitCustomerBalance.statusCode !== 200) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Something went wrong",
          });
        }

        // credit user naira balance
        const terminateCard = await sudoApi({
          method: "PUT",
          url: `/cards/${input.id}`,
          data: {
            creditAccountId: user.wallet?.sudoWalletID,
            cancellationReason: input.reason,
            status: "canceled",
          },
        });

        if (terminateCard.statusCode !== 200) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "card termination failed",
          });
        }

        return {
          statusCode: 200,
          message: "Card terminated successfully.",
        };
      }

      // check if card was a dollar card

      // Fetch exchange rate
      const sudoExchangeRate = await sudoApi({
        method: "GET",
        url: "/accounts/transfer/rate/USDNGN",
      });

      if (sudoExchangeRate.statusCode !== 200)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });

      // convert user dollar amount to naira
      const newRate =
        parseInt(sudoExchangeRate.data.sell) -
        parseInt(env.WITHDRAWAL_FEE_DOLLAR);

      const nairaAmount = cardBalance.data.currentBalance * newRate;

      const totalAmount = nairaAmount;

      // transfer card balance to our dollar wallet
      const sudoDebitCustomerCardBalance = await sudoApi({
        method: "POST",
        url: "/accounts/transfer",
        data: {
          debitAccountId: cardDetails.data.account._id,
          creditAccountId: env.SUDO_NGN_ACCOUNT_ID,
          amount: cardBalance.data.currentBalance,
          narration: "Refund remaining card balance before card termination",
          paymentReference: `${Math.floor(Math.random() * 10000000000)}`,
        },
      });

      if (sudoDebitCustomerCardBalance.statusCode !== 200) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
      }

      // credit user naira balance

      const sudoDebitCustomerBalance = await sudoApi({
        method: "POST",
        url: "/accounts/transfer",
        data: {
          debitAccountId: env.SUDO_NGN_ACCOUNT_ID,
          creditAccountId: user.wallet?.sudoWalletID,
          amount: totalAmount,
          narration: "Refund remaining card balance before card termination",
          paymentReference: `${Math.floor(Math.random() * 10000000000)}`,
        },
      });

      if (sudoDebitCustomerBalance.statusCode !== 200) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
      }

      const terminateCard = await sudoApi({
        method: "PUT",
        url: `/cards/${input.id}`,
        data: {
          creditAccountId: user.wallet?.sudoWalletID,
          cancellationReason: input.reason,
          status: "canceled",
        },
      });

      if (terminateCard.statusCode !== 200) {
        // refund user debited amount
        await sudoApi({
          method: "POST",
          url: "/accounts/transfer",
          data: {
            debitAccountId: env.SUDO_NGN_ACCOUNT_ID,
            creditAccountId: user.wallet?.sudoWalletID,
            amount: totalAmount,
            narration: "Reversal for fail Card creation",
            paymentReference: `${Math.floor(Math.random() * 10000000000)}`,
          },
        });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Card termination failed",
        });
      }

      return {
        statusCode: 200,
        message: "Card terminated successfully.",
      };
    }),
  withdrawFromCard: protectedProcedure
    .input(
      z.object({
        id: z.string().nullish(),
        amount: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // get user sudo wallet id
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
      // get card details
      const cardDetails = await sudoApi({
        method: "GET",
        url: `/cards/${input.id}`,
      });

      if (cardDetails.statusCode !== 200) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Something went wrong",
        });
      }

      // get card balance
      const cardBalance = await sudoApi({
        method: "GET",
        url: `/accounts/${cardDetails.data.account._id}/balance`,
      });

      if (cardBalance.statusCode !== 200) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
      }

      // check if card was a naira card
      if (cardDetails.data.currency === "NGN") {
        // check if user has enough balance
        if (cardBalance.data.currentBalance < parseInt(input.amount)) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Insufficient funds",
          });
        }
        // debit user
        const sudoDebitCustomerBalance = await sudoApi({
          method: "POST",
          url: "/accounts/transfer",
          data: {
            debitAccountId: cardDetails.data.account._id,
            creditAccountId: user.wallet?.sudoWalletID,
            amount: parseInt(input.amount),
            narration: "Withdrawal from card to wallet",
            paymentReference: `${Math.floor(Math.random() * 10000000000)}`,
          },
        });

        if (sudoDebitCustomerBalance.statusCode !== 200) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Something went wrong",
          });
        }

        return {
          statusCode: 200,
          message: "Card withdrawal successfully.",
        };
      }

      // Fetch exchange rate
      const sudoExchangeRate = await sudoApi({
        method: "GET",
        url: "/accounts/transfer/rate/USDNGN",
      });

      if (sudoExchangeRate.statusCode !== 200)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });

      // convert user dollar amount to naira
      const newRate =
        parseInt(sudoExchangeRate.data.sell) -
        parseInt(env.WITHDRAWAL_FEE_DOLLAR);
      const nairaAmount = parseInt(input.amount) * newRate;

      const totalAmount = nairaAmount;

      // convert card balance to naira
      const cardBalanceInNaira =
        cardBalance.data.currentBalance * parseInt(sudoExchangeRate.data.sell);

      // check if user has enough balance

      if (cardBalanceInNaira < totalAmount) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Insufficient funds",
        });
      }

      if (
        cardBalanceInNaira - totalAmount <
        parseInt(sudoExchangeRate.data.rate)
      ) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "You must have a minimum balance of 1$ before or after withdrawal",
        });
      }

      // debit user dollar balance
      const sudoDebitCustomerBalance = await sudoApi({
        method: "POST",
        url: "/accounts/transfer",
        data: {
          debitAccountId: cardDetails.data.account._id,
          creditAccountId: env.SUDO_NGN_ACCOUNT_ID,
          amount: parseInt(input.amount),
          narration: "Withdrawal from card to wallet",
          paymentReference: `${Math.floor(Math.random() * 10000000000)}`,
        },
      });

      if (sudoDebitCustomerBalance.statusCode !== 200) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
      }

      // credit user naira wallet balance
      const sudoCreditCustomerWalletBalance = await sudoApi({
        method: "POST",
        url: "/accounts/transfer",
        data: {
          debitAccountId: env.SUDO_NGN_ACCOUNT_ID,
          creditAccountId: user.wallet?.sudoWalletID,
          amount: totalAmount,
          narration: "Withdrawal from card to wallet",
          paymentReference: `${Math.floor(Math.random() * 10000000000)}`,
        },
      });

      if (sudoCreditCustomerWalletBalance.statusCode !== 200) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
      }

      return {
        statusCode: 200,
        message: "Card withdrawal successfully.",
      };
    }),
  fundCard: protectedProcedure
    .input(
      z.object({
        id: z.string().nullish(),
        amount: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // get user sudo wallet id
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
      // get card details
      const cardDetails = await sudoApi({
        method: "GET",
        url: `/cards/${input.id}`,
      });

      if (cardDetails.statusCode !== 200) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Something went wrong",
        });
      }

      // get card balance
      const cardBalance = await sudoApi({
        method: "GET",
        url: `/accounts/${user.wallet?.sudoWalletID}/balance`,
      });

      if (cardBalance.statusCode !== 200) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
      }

      // check if card was a naira card
      if (cardDetails.data.currency === "NGN") {
        // check if user has enough balance
        if (cardBalance.data.currentBalance < parseInt(input.amount)) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Insufficient funds",
          });
        }
        // debit user
        const sudoDebitCustomerBalance = await sudoApi({
          method: "POST",
          url: "/accounts/transfer",
          data: {
            debitAccountId: user.wallet?.sudoWalletID,
            creditAccountId: cardDetails.data.account._id,
            amount: parseInt(input.amount),
            narration: "Fund card from wallet",
            paymentReference: `${Math.floor(Math.random() * 10000000000)}`,
          },
        });

        if (sudoDebitCustomerBalance.statusCode !== 200) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Something went wrong",
          });
        }

        return {
          statusCode: 200,
          message: "Card funding successfully.",
        };
      }

      // check if amount is upto minimum
      if (parseInt(input.amount) < parseInt(env.MINIMUM_DEPOSIT_DOLLAR)) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Minimum amount to fund from card is $${env.MINIMUM_DEPOSIT_DOLLAR}`,
        });
      }

      // Fetch exchange rate
      const sudoExchangeRate = await sudoApi({
        method: "GET",
        url: `/accounts/transfer/rate/${cardDetails.data.currency}NGN`,
      });

      if (sudoExchangeRate.statusCode !== 200)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });

      // convert amount to naira
      const convertedAmount =
        parseInt(input.amount) * parseInt(sudoExchangeRate.data.rate);

      // convert percentage to naira
      const convertedPercentage = (
        (parseInt(env.FUNDING_FEE_PERCENTAGE_DOLLAR) / 100) *
        parseInt(input.amount)
      ).toFixed(2);

      // convert fee to naira
      const convertFee =
        parseInt(env.FUNDING_FEE_DOLLAR) * parseInt(sudoExchangeRate.data.rate);

      const convertedPercentageToNaira =
        parseFloat(convertedPercentage) * parseInt(sudoExchangeRate.data.rate);

      const totalAmount =
        convertedAmount + convertedPercentageToNaira + convertFee;

      // check if user has enough balance
      if (cardBalance.data.currentBalance < totalAmount) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Insufficient funds",
        });
      }

      // transfer user naira to our naira wallet
      const sudoDebitCustomerCardBalance = await sudoApi({
        method: "POST",
        url: "/accounts/transfer",
        data: {
          debitAccountId: user.wallet?.sudoWalletID,
          creditAccountId: env.SUDO_NGN_ACCOUNT_ID,
          amount: totalAmount,
          narration: "Fund card from wallet",
          paymentReference: `${Math.floor(Math.random() * 10000000000)}`,
        },
      });

      if (sudoDebitCustomerCardBalance.statusCode !== 200) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
      }

      // credit user dollar card balance
      const sudoDebitCustomerBalance = await sudoApi({
        method: "POST",
        url: "/accounts/transfer",
        data: {
          debitAccountId: env.SUDO_NGN_ACCOUNT_ID,
          creditAccountId: cardDetails.data.account._id,
          amount: parseInt(input.amount),
          narration: "Fund card from wallet",
          paymentReference: `${Math.floor(Math.random() * 10000000000)}`,
        },
      });

      if (sudoDebitCustomerBalance.statusCode !== 200) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
      }

      return {
        statusCode: 200,
        message: "Card funding successfully.",
      };
    }),
});
