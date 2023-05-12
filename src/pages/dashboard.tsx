import MaskedCard from "@/components/Cards/MaskedCard";
import InfiniteScroll from "@/components/InfiniteScroll";
import type { CardProps } from "@/types/interfaces";
import { api } from "@/utils/api";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Layout from "../layout/Layout";
import { requireAuth } from "./api/requireAuth";

export const getServerSideProps = requireAuth(async () => {
  return { props: {} };
});

function Dashboard() {
  const [wallet, setWallet] = useState<{
    bankName: string;
    accountNumber: number;
    accountName: string;
    currentBalance: string;
  }>();

  const { data: userDataBalance, isLoading: userDataBalanceLoading } =
    api.wallet.wallet.useQuery();

  useEffect(() => {
    setWallet(userDataBalance);
  }, [userDataBalance]);

  const [user, setUser] = useState<{
    firstName: string;
  } | null>();

  const { data: userData, isLoading: userDataLoading } =
    api.settings.me.useQuery();
  useEffect(() => {
    setUser(userData);
  }, [userData]);

  const [cards, setCards] = useState<CardProps[] | undefined>();

  const {
    data: userCards,
    isLoading: userCardsLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage: userCardsIsFetching,
  } = api.cards.getAllCards.useInfiniteQuery(
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
    setCards(userCards?.pages.flatMap((page) => page.data));
  }, [userCards]);

  const loadMorePosts = () => {
    if (hasNextPage && !userCardsIsFetching) {
      fetchNextPage();
    }
  };

  return (
    <Layout title="Getly | Dashboard">
      <main className=" mb-10">
        <div className="flex w-full flex-col justify-between lg:flex-row ">
          <div className=" w-full border-b py-7 lg:border-b-0 lg:border-r lg:px-8">
            {userDataLoading ? (
              <div className="h-4 w-48 animate-pulse rounded bg-gray-200"></div>
            ) : (
              <h1>
                Good day {user?.firstName}! <br />
                Let’s hit those goals today!
              </h1>
            )}
            
          </div>
          <div className="flex w-full items-center gap-4 border-b py-7 lg:border-b-0 lg:border-r lg:px-8">
            <div className="rounded-full bg-[#FFEBA6] p-[10px]">
              <svg
                className="h-6 w-6 stroke-getly-black"
                viewBox="0 0 26 26"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.7499 4.33203H3.24992C2.0533 4.33203 1.08325 5.30208 1.08325 6.4987V19.4987C1.08325 20.6953 2.0533 21.6654 3.24992 21.6654H22.7499C23.9465 21.6654 24.9166 20.6953 24.9166 19.4987V6.4987C24.9166 5.30208 23.9465 4.33203 22.7499 4.33203Z"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M1.08325 10.832H24.9166"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="flex flex-col gap-1">
              {userDataBalanceLoading ? (
                <div className="h-4 w-36 animate-pulse rounded bg-gray-200"></div>
              ) : (
                <h1>{cards ? cards.length : "0"}</h1>
              )}
              <span className="">Number of active cards</span>
            </div>
          </div>
 
        </div>
        {userCardsLoading ? (
          <div className="mt-10 grid grid-cols-1 gap-9 lg:grid-cols-2 lg:px-10 2xl:grid-cols-3">
            <div className="h-[220px] w-full animate-pulse rounded-xl bg-gray-200"></div>
            <div className="h-[220px] w-full animate-pulse rounded-xl bg-gray-200"></div>
            <div className="h-[220px] w-full animate-pulse rounded-xl bg-gray-200"></div>
            <div className="h-[220px] w-full animate-pulse rounded-xl bg-gray-200"></div>
            <div className="h-[220px] w-full animate-pulse rounded-xl bg-gray-200"></div>
          </div>
        ) : (
          <InfiniteScroll
            loading={userCardsIsFetching}
            loadMore={loadMorePosts}
            className="mt-10 grid grid-cols-1 gap-9 xl:grid-cols-2 lg:px-10 2xl:grid-cols-3"
          >
            {cards?.length ? (
              cards.map((card, index) => <MaskedCard key={index} {...card} />)
            ) : (
              <div>
                <h1>Dollar Cards</h1>
                <Link
                  href={"/cards/create"}
                  className="mt-4 flex items-center justify-center gap-3 rounded-lg border border-[#171744] py-24"
                >
                  <svg
                    className="h-6 w-6 stroke-getly-black"
                    viewBox="0 0 28 28"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M19.4999 13.9709H8.44097"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M13.9705 8.44141V19.5004"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    <circle cx="14" cy="14" r="13" strokeWidth="2" />
                  </svg>
                  <h1>Create a Dollar Card</h1>
                </Link>
              </div>
            )}
          </InfiniteScroll>
        )}
      </main>
    </Layout>
  );
}

export default Dashboard;
