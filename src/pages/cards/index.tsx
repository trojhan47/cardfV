import MaskedCard from "@/components/Cards/MaskedCard";
import InfiniteScroll from "@/components/InfiniteScroll";
import { BvnVerificatonModalState } from "@/recoil/atom";
import type { CardProps } from "@/types/interfaces";
import { api } from "@/utils/api";
import { Transition, Dialog } from "@headlessui/react";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { Fragment, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRecoilState, useSetRecoilState } from "recoil";
import Layout from "../../layout/Layout";
import { requireAuth } from "../api/requireAuth";

export const getServerSideProps = requireAuth(async () => {
  return { props: {} };
});

function Index() {
  const [cards, setCards] = useState<CardProps[] | undefined>();
  const router = useRouter();
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

  const setBvnVerificationModalState = useSetRecoilState(
    BvnVerificatonModalState
  );

  const { data: userLinkedBvndata, isLoading: userLinkedBvnisLoading } =
    api.user.userLinkedBvn.useQuery();

  return (
    <Layout title="Getly | Cards">
      <main className="mb-6">
        <div className=" mt-4 flex items-end justify-between border-b-2 pb-2">
          <h1 className=" font-museo-sans-rounded-500">Virtual Cards</h1>
          <button
            disabled={userLinkedBvnisLoading}
            onClick={async () => {
              if (userLinkedBvndata?.bvnVerified === false) {
                toast.error("You must link your BVN before creating a card");
                setBvnVerificationModalState(true);
                return;
              }
              router.push("/cards/create");
            }}
            className="flex items-center gap-3 rounded-md bg-getly py-1 px-4 font-museo-sans-rounded-500 disabled:opacity-40"
          >
            <svg
              className="h-6 w-6 stroke-getly-black"
              viewBox="0 0 23 23"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16.5884 11.5021H5.52947"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M11.059 5.97266V17.0316"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p>Create Card</p>
          </button>
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
            className="mt-10 grid grid-cols-1 gap-9 xl:grid-cols-2 2xl:grid-cols-3"
          >
            {cards?.map((card, index) => (
              <MaskedCard key={index} {...card} />
            ))}
          </InfiniteScroll>
        )}
      </main>
    </Layout>
  );
}

export default Index;
