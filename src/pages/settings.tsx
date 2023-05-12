import { BvnVerificatonModalState } from "@/recoil/atom";
import { api } from "@/utils/api";
import type { User } from "@prisma/client";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useSetRecoilState } from "recoil";
import Layout from "../layout/Layout";
import { requireAuth } from "./api/requireAuth";

export const getServerSideProps = requireAuth(async () => {
  return { props: {} };
});

function Settings() {
  const { data: userData, isLoading: userDataLoading } =
  api.settings.me.useQuery();
  const setBvnVerificationModalState = useSetRecoilState(
    BvnVerificatonModalState
    );
    const [user, setUser] = useState<User | null>();
    
    useEffect(() => {
      // @ts-ignore
    setUser(userData);
  }, [userData]);
  
  const [tab, setTab] = useState(!userDataLoading && user?.bvnVerified === true ? 1 : 3);

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

  const { mutateAsync: updatePin, isLoading: updatePinLoading } =
    api.settings.updatePin.useMutation();

  const [data, setData] = useState<{
    oldPin: string;
    newPin: string;
  }>({
    oldPin: "",
    newPin: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };
  const handleSubmit = async () => {
    const id = toast.loading("Updating pin...");
    await updatePin({
      ...data,
    })
      .then((res) => {
        if (res.statusCode === 200) {
          toast.update(id, {
            render: "Pin updated successfully",
            type: "success",
            isLoading: false,
            autoClose: 2000,
          });
          setData({ oldPin: "", newPin: "" });
        }
      })
      .catch((err) => {
        toast.update(id, {
          render: err.message,
          type: "error",
          isLoading: false,
          autoClose: 2000,
        });
      });
  };

  return (
    <Layout title="Getly | Settings">
      <main className="">
        <div className="mt-6 flex gap-5 border-b md:gap-16 lg:gap-24 ">
          {!userDataLoading && user?.bvnVerified === true &&<button
            disabled={userDataLoading}
            onClick={() => {
              if (!userDataLoading && user?.bvnVerified === true) {
                setTab(1);
                return;
              }
              setBvnVerificationModalState(true);
            }}
            className={`${tab === 1 ? "border-b border-b-getly-primary" : ""}`}
          >
            Bank Details
          </button>}
          <button
            onClick={() => {
              setTab(2);
            }}
            className={`${tab === 2 ? "border-b border-b-getly-primary" : ""}`}
          >
            Change PIN
          </button>

          <button
            onClick={() => {
              setTab(4);
            }}
            className={`${tab === 3 ? "border-b border-b-getly-primary" : ""}`}
          >
            Profile
          </button>
        </div>
        {tab === 1 && !userDataLoading && user?.bvnVerified === true && (
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
        {tab === 2 && (
          <div className="mt-5 flex flex-col gap-4 lg:w-[500px]">
            <div>
              <h1 className="text-sm">Old Pin</h1>
              <input
                className="w-full rounded-md border py-2 px-2 text-sm"
                type="password"
                placeholder="* * * * * *"
                name="oldPin"
                maxLength={6}
                value={data.oldPin}
                onChange={handleChange}
              />
            </div>
            <div>
              <h1 className="text-sm">New Pin</h1>
              <input
                className="w-full rounded-md border py-2 px-2 text-sm"
                type="password"
                placeholder="* * * * * *"
                name="newPin"
                maxLength={6}
                value={data.newPin}
                onChange={handleChange}
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={
                updatePinLoading ||
                data.oldPin === "" ||
                data.newPin === "" ||
                !data.newPin.match(/^[0-9]*$/) ||
                !data.oldPin.match(/^[0-9]*$/)
              }
              className="mt-6 w-full rounded-md bg-getly-primary py-2 px-5 disabled:opacity-50 lg:w-auto"
            >
              Change pin
            </button>
          </div>
        )}
        
        {tab === 3 && (
          <div>
            {userDataLoading ? (
              <div className=" my-5 flex w-full flex-col gap-5">
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="h-9 w-full animate-pulse rounded bg-gray-200"></div>
                  <div className="h-9 w-full animate-pulse rounded bg-gray-200"></div>
                  <div className="h-9 w-full animate-pulse rounded bg-gray-200"></div>
                  <div className="h-9 w-full animate-pulse rounded bg-gray-200"></div>
                  <div className="h-9 w-full animate-pulse rounded bg-gray-200"></div>
                  <div className="h-9 w-full animate-pulse rounded bg-gray-200"></div>
                </div>
              </div>
            ) : (
              <div className=" my-5 flex w-full flex-col gap-5">
                {user?.customerType === "COMPANY" && (
                  <div className="grid gap-4 lg:grid-cols-2 ">
                    <label htmlFor="companyName">
                      <p className=" pb-1 font-museo-sans-rounded-300 text-sm">
                        Company Name
                      </p>

                      <div className="w-full rounded border border-[#A7A6A6] bg-[#F8F5F5] p-2">
                        {user?.customerType}
                      </div>
                    </label>
                  </div>
                )}
                <div className="grid gap-4 lg:grid-cols-2">
                  <label htmlFor="firstName">
                    <p className=" pb-1 font-museo-sans-rounded-300 text-sm">
                      {user?.customerType === "INDIVIDUAL"
                        ? "First Name"
                        : "Staff First Name"}
                    </p>

                    <div className="w-full rounded border border-[#A7A6A6] bg-[#F8F5F5] p-2">
                      {user?.firstName}
                    </div>
                  </label>
                  <label htmlFor="lastName">
                    <p className=" pb-1 font-museo-sans-rounded-300 text-sm">
                      {user?.customerType === "INDIVIDUAL"
                        ? "Last Name"
                        : "Staff Last Name"}
                    </p>
                    <div className="w-full rounded border border-[#A7A6A6] bg-[#F8F5F5] p-2">
                      {user?.lastName}
                    </div>
                  </label>
                  <label htmlFor="dob">
                    <p className=" pb-1 font-museo-sans-rounded-300 text-sm">
                      {user?.customerType === "INDIVIDUAL"
                        ? "Date of Birth"
                        : "Staff Date of Birth"}
                    </p>
                    <div className="w-full rounded border border-[#A7A6A6] bg-[#F8F5F5] p-2">
                      {user?.dob.toDateString()}
                    </div>
                  </label>
                  <label htmlFor="phoneNumber">
                    <p className=" pb-1 font-museo-sans-rounded-300 text-sm">
                      Phone number
                    </p>
                    <div className="w-full rounded border border-[#A7A6A6] bg-[#F8F5F5] p-2">
                      {user?.phoneNumber}
                    </div>
                  </label>
                </div>
                <label htmlFor="email">
                  <p className=" pb-1 font-museo-sans-rounded-300 text-sm">
                    Email
                  </p>
                  <div className="w-full rounded border border-[#A7A6A6] bg-[#F8F5F5] p-2">
                    {user?.email}
                  </div>
                </label>
                <label htmlFor="address1">
                  <p className=" pb-1 font-museo-sans-rounded-300 text-sm">
                    Street Address
                  </p>
                  <div className="w-full rounded border border-[#A7A6A6] bg-[#F8F5F5] p-2">
                    {user?.address1}
                  </div>
                </label>
                <div className="grid gap-4 lg:grid-cols-3 ">
                  <label htmlFor="state">
                    <p className=" pb-1 font-museo-sans-rounded-300 text-sm">
                      State
                    </p>
                    <div className="w-full rounded border border-[#A7A6A6] bg-[#F8F5F5] p-2">
                      {user?.state}
                    </div>
                  </label>
                  <label htmlFor="city">
                    <p className=" pb-1 font-museo-sans-rounded-300 text-sm">
                      City
                    </p>
                    <div className="w-full rounded border border-[#A7A6A6] bg-[#F8F5F5] p-2">
                      {user?.city}
                    </div>
                  </label>
                  <label htmlFor="postalCode">
                    <p className=" pb-1 font-museo-sans-rounded-300 text-sm">
                      Postal Code
                    </p>
                    <div className="w-full rounded border border-[#A7A6A6] bg-[#F8F5F5] p-2">
                      {user?.postalCode}
                    </div>
                  </label>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </Layout>
  );
}

export default Settings;
