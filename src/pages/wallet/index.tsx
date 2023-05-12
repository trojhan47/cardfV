import InfiniteScroll from "@/components/InfiniteScroll";
import { BvnVerificatonModalState } from "@/recoil/atom";
import type { TransactionProps } from "@/types/interfaces";
import { api } from "@/utils/api";
import { User } from "@prisma/client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import Layout from "../../layout/Layout";
import { requireAuth } from "../api/requireAuth";

export const getServerSideProps = requireAuth(async () => {
  return { props: {} };
});

function Index() {
  const [tab, setTab] = useState<number>(1);

  // format currency in naira
  const formatCurrency = (amount: number) => {
    const formatter = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
    });
    return formatter.format(amount);
  };

  const [wallet, setWallet] = useState<{
    bankName: string;
    accountNumber: number;
    accountName: string;
    currentBalance: number;
  }>();

  const { data: userDataWallet, isLoading: userDataWalletLoading } =
    api.wallet.wallet.useQuery();

  useEffect(() => {
    setWallet(userDataWallet);
  }, [userDataWallet]);

  const [transactions, setTransactions] = useState<
    TransactionProps[] | undefined
  >();
  const {
    data: userCardTransactions,
    isLoading: userCardTransactionsLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage: userCardTransactionsIsFetching,
    // isFetching: userCardTransactionsIsFetching,
  } = api.wallet.transactions.useInfiniteQuery(
    {},
    {
      getNextPageParam: (lastPage) => {
        if (
          parseInt(lastPage.pagination.page) + 1 <
          lastPage.pagination.pages
        ) {
          return parseInt(lastPage.pagination.page) + 1;
        }
        return undefined;
      },
    }
  );

  useEffect(() => {
    setTransactions(userCardTransactions?.pages.flatMap((page) => page.data));
  }, [userCardTransactions]);

  const loadMorePosts = () => {
    if (hasNextPage && !userCardTransactionsIsFetching) {
      fetchNextPage();
    }
  };
  const { data: userData, isLoading: userDataLoading } =
    api.settings.me.useQuery();

  const [user, setUser] = useState<Omit<
    User,
    "pin" | "sudoCustomerID" | "address2" | "createdAt" | "updatedAt"
  > | null>();

  const setBvnVerificationModalState = useSetRecoilState(
    BvnVerificatonModalState
  );

  useEffect(() => {
    setUser(userData);
  }, [userData]);

  return (
    <Layout title="Getly | Wallet">
      <main className="mt-5 mb-10">
        <div className=" flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <h1>Account Balance</h1>
            {userDataWalletLoading ? (
              <div className=" h-4 w-36 animate-pulse rounded bg-gray-200"></div>
            ) : (
              <h1>N{formatCurrency(wallet ? wallet.currentBalance : 0)}</h1>
            )}
          </div>
          <div className="flex justify-between gap-3 md:justify-start">
            <Link
              href="/wallet/withdraw"
              className="flex items-center gap-3 rounded-md border border-getly-primary px-5 py-1 text-sm"
            >
              <svg
                className="h-4 w-4 stroke-getly-black"
                viewBox="0 0 24 25"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21 15.5L21 19.5C21 20.0304 20.7893 20.5391 20.4142 20.9142C20.0391 21.2893 19.5304 21.5 19 21.5L5 21.5C4.46957 21.5 3.96086 21.2893 3.58579 20.9142C3.21071 20.5391 3 20.0304 3 19.5L3 15.5"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M17 8.5L12 3.5L7 8.5"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 3.5L12 15.5"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Withdraw</span>
            </Link>
            <Link
              href="/wallet/fund"
              className="flex items-center gap-3 rounded-md bg-getly-primary px-5 py-1 text-sm"
            >
              <svg
                className="h-4 w-4 stroke-getly-black"
                viewBox="0 0 24 25"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21 15.5L21 19.5C21 20.0304 20.7893 20.5391 20.4142 20.9142C20.0391 21.2893 19.5304 21.5 19 21.5L5 21.5C4.46957 21.5 3.96086 21.2893 3.58579 20.9142C3.21071 20.5391 3 20.0304 3 19.5L3 15.5"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M7 10.5L12 15.5L17 10.5"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 15.5L12 3.5"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              <span>Fund</span>
            </Link>
          </div>
        </div>
        <div className="mt-6 flex gap-5 border-b ">
          <button
            onClick={() => {
              setTab(1);
            }}
            className={`${tab === 1 ? "border-b border-b-getly-primary" : ""}`}
          >
            Transactions
          </button>
          <button
            disabled={userDataLoading}
            onClick={() => {
              if (!userDataLoading && user?.bvnVerified === true) {
                setTab(2);
                return;
              }
              setBvnVerificationModalState(true);
            }}
            className={`${
              tab === 2
                ? "border-b border-b-getly-primary disabled:opacity-40"
                : "disabled:opacity-40"
            }`}
          >
            Bank Details
          </button>
        </div>
        {tab === 1 && (
          <>
            {userCardTransactionsLoading ? (
              <div className=" w-full divide-y">
                <div className="flex justify-between py-3">
                  <div>
                    <p className=" h-6 w-40 animate-pulse rounded bg-gray-200"></p>
                    <p className=" mt-2 h-6 w-20 animate-pulse rounded bg-gray-200"></p>
                  </div>
                  <p className=" h-6 w-20 animate-pulse rounded bg-gray-200"></p>
                </div>
                <div className="flex justify-between py-3">
                  <div>
                    <p className=" h-6 w-40 animate-pulse rounded bg-gray-200"></p>
                    <p className=" mt-2 h-6 w-20 animate-pulse rounded bg-gray-200"></p>
                  </div>
                  <p className=" h-6 w-20 animate-pulse rounded bg-gray-200"></p>
                </div>
                <div className="flex justify-between py-3">
                  <div>
                    <p className=" h-6 w-40 animate-pulse rounded bg-gray-200"></p>
                    <p className=" mt-2 h-6 w-20 animate-pulse rounded bg-gray-200"></p>
                  </div>
                  <p className=" h-6 w-20 animate-pulse rounded bg-gray-200"></p>
                </div>
                <div className="flex justify-between py-3">
                  <div>
                    <p className=" h-6 w-40 animate-pulse rounded bg-gray-200"></p>
                    <p className=" mt-2 h-6 w-20 animate-pulse rounded bg-gray-200"></p>
                  </div>
                  <p className=" h-6 w-20 animate-pulse rounded bg-gray-200"></p>
                </div>
              </div>
            ) : (
              <InfiniteScroll
                loading={userCardTransactionsIsFetching}
                loadMore={loadMorePosts}
                className=" w-full divide-y"
              >
                {transactions?.map((transaction, index) => (
                  <div
                    key={index}
                    className={`flex w-full flex-col justify-between gap-2 py-3 text-sm text-black lg:flex-row`}
                  >
                    <div className="w-full">
                      <p className="w-full   ">
                        {transaction.narration.split("|")[1]}
                        {transaction.narration.split("|")[4]
                          ? ` | ${transaction.narration.split("|")[4]}`
                          : ""}
                      </p>
                      <p className="pt-1 text-xxs">
                        {transaction.transactionDate}
                      </p>
                    </div>
                    <p
                      className={`w-full  ${
                        transaction.type === "Debit"
                          ? "text-getly-red"
                          : "text-getly-green"
                      }`}
                    >
                      {transaction.type === "Debit" ? "-" : "+"}
                      {transaction.currency === "USD" ? "$" : "N"}
                      {formatCurrency(transaction.amount)}
                    </p>
                  </div>
                ))}
              </InfiniteScroll>
            )}
          </>
        )}
        {tab === 2 && (
          <div className="mt-5 flex flex-col gap-4 lg:w-[500px]">
            <div>
              <h1 className="text-sm">Account Name</h1>
              {userDataWalletLoading ? (
                <div className="mt-1 h-9 animate-pulse rounded border bg-gray-200 text-sm"></div>
              ) : (
                <div className="mt-1 rounded border p-2 text-sm">
                  {wallet?.accountName}
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <h1 className="text-sm">Bank Name</h1>
                {userDataWalletLoading ? (
                  <div className="mt-1 h-9 animate-pulse rounded border bg-gray-200 text-sm"></div>
                ) : (
                  <div className="mt-1 rounded border p-2 text-sm">
                    {wallet?.bankName}
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-sm">Account Number</h1>
                {userDataWalletLoading ? (
                  <div className="mt-1 h-9 animate-pulse rounded border bg-gray-200 text-sm"></div>
                ) : (
                  <div className="mt-1 rounded border p-2 text-sm">
                    {wallet?.accountNumber}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </Layout>
  );
}

export default Index;
