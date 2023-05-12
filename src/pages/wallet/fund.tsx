import { api } from "@/utils/api";
import React, { useEffect, useState } from "react";
import Layout from "../../layout/Layout";
import { requireBvn } from "../api/requireBvn";

export const getServerSideProps = requireBvn(async () => {
  return { props: {} };
});

function Fund() {
  const [wallet, setWallet] = useState<{
    bankName: string;
    accountNumber: number;
    accountName: string;
    currentBalance: string;
  }>();

 
  const { data: userDataWallet, isLoading: userDataWalletLoading } =
    api.wallet.wallet.useQuery();

  useEffect(() => {
    setWallet(userDataWallet);
  }, [userDataWallet]);

  return (
    <Layout title="Getly | Fund Wallet">
      <main className="">
        <button
          onClick={() => {
            window.history.back();
          }}
          className=" flex items-center gap-2 pt-2 pb-3"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="h-4 w-4 fill-black"
          >
            <path fill="none" d="M0 0h24v24H0z" />
            <path d="M7.828 11H20v2H7.828l5.364 5.364-1.414 1.414L4 12l7.778-7.778 1.414 1.414z" />
          </svg>
          <p className=" text-xs">Back</p>
        </button>
        <div>
          <h1 className="my-3 border-b-2 font-museo-sans-rounded-500">
            Fund Wallet
          </h1>
          <p className=" text-xs">
            Kindly transfer any amount to the account below to fund your wallet.
          </p>
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
        </div>
      </main>
    </Layout>
  );
}

export default Fund;
