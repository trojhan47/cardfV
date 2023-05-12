import { api } from "@/utils/api";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Layout from "../../layout/Layout";
import { requireBvn } from "../api/requireBvn";

export const getServerSideProps = requireBvn(async () => {
  return { props: {} };
});

function Withdraw() {
  const [data, setData] = useState({
    bankCode: "",
    accountNumber: "",
    accountName: "",
    amount: "",
  });

  const onchange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  const [bankList, setBankList] = useState<
    { name: string; routingKey: string; bankCode: string }[] | undefined
  >();

  const { data: banks, isLoading: banksLoading } =
    api.wallet.bankList.useQuery();
  const { mutateAsync: verifyName, isLoading: verifyNameLoading } =
    api.wallet.verifyBankName.useMutation();

  useEffect(() => {
    setBankList(banks);
  }, [banks]);

  useEffect(() => {
    if (data.accountNumber.length > 9) {
      verifyName({
        accountNumber: data.accountNumber,
        bankCode: data.bankCode,
      })
        .then((res) => {
          setData({
            ...data,
            accountName: res?.accountName,
          });
        })
        .catch(() => {
          setData({
            ...data,
            accountName: "",
          });
          toast.error("Invalid account number");
        });
    }
  }, [data.accountNumber]);

  const { mutateAsync, isLoading } = api.wallet.withdraw.useMutation();

  const handleSubmit = async () => {
    await mutateAsync(data)
      .then((res) => {
        toast.success("Withdrawal successful");
        setData({
          bankCode: "",
          accountNumber: "",
          accountName: "",
          amount: "",
        });
      })
      .catch((err) => {
        toast.error(
          err.message === "Insufficient funds"
            ? "Insufficient funds"
            : "Withdrawal failed"
        );
      });
  };

  return (
    <Layout title="Getly | Withdrawal">
      <main className=" ">
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
            Withdraw from Wallet
          </h1>
          <p className=" text-xs">
            Kindly fill in the details below to make a transfer to any bank
            account.
          </p>
          <div className="mt-5 flex w-full flex-col gap-4 lg:w-[400px]">
            <div className="text-sm">
              <h1 className="mb-1">Beneficiary Bank</h1>
              <select
                className="w-full rounded-md border py-2 px-2 text-sm"
                name="bankCode"
                onChange={onchange}
              >
                <option value="">Select bank</option>
                {bankList?.map((bank, index: number) => (
                  <option key={index} value={bank.bankCode}>
                    {bank.name}
                  </option>
                ))}
                {banksLoading && <option value="">Loading...</option>}
              </select>
            </div>
            <div className="text-sm">
              <h1 className="mb-1">Beneficiary Account Number</h1>
              <input
                disabled={!data.bankCode}
                className="w-full rounded-md border py-2 px-2 text-sm disabled:opacity-50"
                type="text"
                maxLength={10}
                placeholder="0123456789"
                name="accountNumber"
                onChange={onchange}
                value={data.accountNumber}
              />
            </div>
            <div className="text-sm">
              <h1 className="mb-1">Beneficiary Account Name</h1>
              <div className="w-full rounded-md border py-2 px-2 text-sm">
                {data.accountName}.
              </div>
            </div>
            <div className="text-sm">
              <h1 className="mb-1">Amount</h1>
              <input
                className="w-full rounded-md border py-2 px-2 text-sm disabled:opacity-50"
                type="tel"
                placeholder=""
                name="amount"
                onChange={onchange}
                value={data.amount}
              />
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={
              verifyNameLoading ||
              banksLoading ||
              !data.accountName ||
              !data.accountNumber ||
              !data.bankCode ||
              !data.amount ||
              isLoading ||
              !data.amount.match(/^[0-9]*$/)
            }
            className="mt-6 w-full rounded-md bg-getly-primary py-2 px-5 disabled:opacity-50 lg:w-auto"
          >
            Withdraw
          </button>
        </div>
      </main>
    </Layout>
  );
}

export default Withdraw;
