import { env } from "@/env.mjs";
import { api } from "@/utils/api";
import { c } from "@/utils/html-class";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { toast } from "react-toastify";
import Layout from "../../layout/Layout";
import { requireBvn } from "../api/requireBvn";

export const getServerSideProps = requireBvn(async () => {
  return { props: {} };
});

function Create() {
  const router = useRouter();
  const { data: exchangeRate } = api.wallet.rates.useQuery();
  const { mutateAsync, isLoading } = api.cards.createCard.useMutation();

  const [data, setData] = useState({
    currency: "USD",
    cardMeta: {
      id: 0,
      cardColor: "",
      textColor: "",
      bglogoColor: "",
      logoColor: "",
    },
    amount: "",
  });
  const handleSubmit = async () => {
    if (
      data.currency === "USD" &&
      parseInt(data.amount) < parseInt(env.NEXT_PUBLIC_MINIMUM_DEPOSIT_DOLLAR)
    ) {
      toast.error(
        `Minimum amount to fund card is $${env.NEXT_PUBLIC_MINIMUM_DEPOSIT_DOLLAR}`
      );
      return;
    }

    if (
      data.currency === "NGN" &&
      parseInt(data.amount) < parseInt(env.NEXT_PUBLIC_MINIMUM_DEPOSIT_NAIRA)
    ) {
      toast.error(
        `Minimum amount to fund card is N${formatCurrency(
          parseInt(env.NEXT_PUBLIC_MINIMUM_DEPOSIT_NAIRA)
        )}`
      );
      return;
    }

    if (data.cardMeta.id === 0) {
      toast.error("Please select a card colour");
      return;
    }

    const id = toast.loading("Creating card...");
    mutateAsync({
      ...data,
    })
      .then((res) => {
        if (res.statusCode === 200) {
          toast.update(id, {
            render: "Card created successfully",
            type: "success",
            isLoading: false,
            autoClose: 3000,
          });
          setData({
            currency: "USD",
            cardMeta: {
              id: 0,
              cardColor: "",
              textColor: "",
              bglogoColor: "",
              logoColor: "",
            },
            amount: "",
          });
          router.push(`/cards/${res.id}`);
        }
      })
      .catch((err) => {
        toast.update(id, {
          render:
            err.message === "Insufficient funds"
              ? "Insufficient funds"
              : "Card creation failed",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      });
  };

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  const cardBrand = [
    { id: 1, name: "Mastercard", currency: "USD" },
    // { id: 2, name: "Verve", currency: "NGN" },
  ];
  const cardColor = [
    {
      id: 1,
      cardColor: "#4444EE",
      textColor: "#FFFFFF",
      bglogoColor: "#171744",
      logoColor: "#F7C148",
    },
    {
      id: 2,
      cardColor: "#F7C148",
      textColor: "#14143F",
      bglogoColor: "#F79E1B",
      logoColor: "#14143F",
    },
    {
      id: 3,
      cardColor: "#FE758B",
      textColor: "#14143F",
      bglogoColor: "#FFB992",
      logoColor: "#14143F",
    },
    {
      id: 4,
      cardColor: "#F79E1B",
      textColor: "#14143F",
      bglogoColor: "#FFB5C1",
      logoColor: "#14143F",
    },
  ];

  const formatCurrency = (amount: number) => {
    const formatter = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
    });
    return formatter.format(amount);
  };
  const total = () => {
    if (!data.amount) return "0";
    if (data.currency === "USD") {
      const convertedAmount =
        (data.amount ? parseInt(data.amount) : 0) *
        (exchangeRate ? parseInt(exchangeRate.rate) : 0);

      const convertedPercentage = (
        (parseInt(env.NEXT_PUBLIC_FUNDING_FEE_PERCENTAGE_DOLLAR) / 100) *
        (data.amount ? parseInt(data.amount) : 0)
      ).toFixed(2);

      const convertFee =
        parseInt(env.NEXT_PUBLIC_FUNDING_FEE_DOLLAR) *
        (exchangeRate ? parseInt(exchangeRate.rate) : 0);

      const convertedPercentageToNaira =
        parseFloat(convertedPercentage) *
        (exchangeRate ? parseInt(exchangeRate.rate) : 0);

      if (
        isNaN(convertedAmount) ||
        isNaN(parseInt(convertedPercentage)) ||
        isNaN(convertFee) ||
        isNaN(convertedPercentageToNaira)
      )
        return formatCurrency(0);

      return formatCurrency(
        convertedAmount + convertedPercentageToNaira + convertFee
      );
    } else {
      return formatCurrency(parseInt(data.amount ? data.amount : "0") + 50);
    }
  };

  return (
    <Layout title="Getly | Create Card">
      <main className="">
        <h1 className="my-3 border-b-2 font-museo-sans-rounded-500">
          Create Card
        </h1>
        <p className=" text-xs">Kindly fill in the details below.</p>
        <div className="my-5 w-full lg:w-[300px]">
          <h1 className="mb-3 font-museo-sans-rounded-500">Card Information</h1>
          <div className="text-sm">
            <h1 className="mb-1">Card Brand</h1>
            <select
              className="w-full rounded-md border py-2 px-2 text-sm lg:w-[200px]"
              name="currency"
              onChange={onChange}
            >
              {cardBrand.map((brand, index: number) => (
                <option key={index} value={brand.currency}>
                  {brand.name} {brand.currency}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-3 text-sm">
            <h1 className="mb-1">Choose card colour</h1>
            <div className="flex w-full justify-between gap-5">
              {cardColor.map((color, index: number) => (
                <button
                  style={{
                    backgroundColor: color ? color.cardColor : "black",
                  }}
                  key={index}
                  onClick={() => {
                    setData({
                      ...data,
                      cardMeta: color,
                    });
                  }}
                  className={c(
                    "w-full rounded-md py-8 lg:h-10 lg:w-14 lg:py-1",
                    data.cardMeta.id === color.id &&
                      "ring-2 ring-getly-green ring-offset-4"
                  )}
                ></button>
              ))}
            </div>
          </div>
        </div>
        <div className="my-5 mt-10 w-full lg:w-[300px]">
          <h1 className="mb-3 font-museo-sans-rounded-500">Fund Card</h1>
          <div className="text-sm">
            <h1 className="mb-1">Amount to Fund ({data.currency})</h1>
            <div className="relative  flex h-10 items-center rounded border bg-[#F8F5F5] pl-4">
              <input
                onChange={onChange}
                value={data.amount}
                name="amount"
                required
                type="tel"
                placeholder="1500"
                className="h-full w-[80%] bg-transparent focus:border-0 focus:outline-0 focus:ring-0"
              />
              <p className="absolute right-0 mr-4 bg-transparent font-museo-sans-rounded-300 text-sm">
                {data.currency}
              </p>
            </div>
          </div>
          <div className=" mt-1 flex flex-col">
            <p className=" pt-1 text-xs text-[#696F8C]">
              You can only fund a minimum of{" "}
              {data.currency === "USD"
                ? `$${env.NEXT_PUBLIC_MINIMUM_DEPOSIT_DOLLAR}`
                : `N${formatCurrency(
                    parseInt(env.NEXT_PUBLIC_MINIMUM_DEPOSIT_NAIRA)
                  )}`}
            </p>
            {data.currency === "USD" && (
              <p className=" pt-1 text-xs text-[#696F8C]">
                Exchange rate: $1 = N {exchangeRate ? exchangeRate.rate : "0"}
              </p>
            )}
            {data.currency === "USD" && (
              <p className=" pt-1 text-xs text-[#696F8C]">
                Funding fee:{" "}
                {`(${env.NEXT_PUBLIC_FUNDING_FEE_PERCENTAGE_DOLLAR}% + $${env.NEXT_PUBLIC_FUNDING_FEE_DOLLAR})`}
              </p>
            )}
            {data.currency === "USD" && (
              <p className=" mt-1 text-xs text-[#696F8C]">
                Amount to fund in naira: N
                {isNaN(parseInt(data.amount ? data.amount : "0"))
                  ? 0
                  : formatCurrency(
                      parseInt(data.amount ? data.amount : "0") *
                        (exchangeRate ? parseInt(exchangeRate.rate) : 0)
                    )}
              </p>
            )}
          </div>
          <div className="mt-4 text-sm">
            <h1 className="mb-1">Amount to debit wallet (NGN)</h1>
            <div className="relative  flex items-center rounded border bg-[#F8F5F5] py-2 pl-4">
              <div className="h-full w-[80%] bg-transparent focus:border-0 focus:outline-0 focus:ring-0">
                {total()}
              </div>
              <p className="absolute right-0 mr-4 bg-transparent font-museo-sans-rounded-300 text-sm">
                NGN
              </p>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={
              isLoading ||
              !data.cardMeta.cardColor ||
              !data.amount ||
              !exchangeRate ||
              !data.currency ||
              !data.amount.match(/^[0-9]*$/)
            }
            className="mt-6 w-full rounded-md bg-getly-primary py-2 px-5 font-museo-sans-rounded-500 disabled:cursor-wait disabled:opacity-50 lg:w-auto"
          >
            Create Card
          </button>
        </div>
      </main>
    </Layout>
  );
}

export default Create;
