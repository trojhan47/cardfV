import { state } from "@/data/State";
import React, { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { RegisterState } from "../../recoil/atom";
import { api } from "../../utils/api";

function StepOne() {
  const [data, setData] = useRecoilState(RegisterState);
  const {
    isLoading: cacLoading,
    mutateAsync: cacMutateAsync,
    data: cacData,
    error: cacError,
  } = api.register.verifyCac.useMutation();

  const handlePersonalData = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({
      ...data,
      [e.target.name]: e.target.checked,
    });
  };

  const onChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <div className=" flex gap-5 py-5 text-sm lg:text-base">
        <button
          onClick={() => {
            if (data.userType === "COMPANY") {
              setData({ ...data, companyName: "" });
              setData({ ...data, userType: "INDIVIDUAL" });
              return;
            }
            setData({ ...data, userType: "INDIVIDUAL" });
          }}
          className={
            " flex w-full items-center justify-center gap-3 rounded border p-4 lg:w-auto lg:justify-start" +
            (data.userType === "INDIVIDUAL"
              ? " border-getly-primary"
              : " border-gray-300")
          }
        >
          <p>For Individual</p>
          <svg
            className={
              "h-6 w-6 lg:h-8 lg:w-8" +
              (data.userType === "INDIVIDUAL"
                ? " stroke-getly-primary"
                : " stroke-[#494949]")
            }
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M26.6667 28V25.3333C26.6667 23.9188 26.1048 22.5623 25.1046 21.5621C24.1044 20.5619 22.7478 20 21.3333 20H10.6667C9.25219 20 7.89563 20.5619 6.89544 21.5621C5.89525 22.5623 5.33334 23.9188 5.33334 25.3333V28"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16 14.6667C18.9455 14.6667 21.3333 12.2789 21.3333 9.33333C21.3333 6.38781 18.9455 4 16 4C13.0545 4 10.6667 6.38781 10.6667 9.33333C10.6667 12.2789 13.0545 14.6667 16 14.6667Z"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          onClick={() => {
            setData({ ...data, userType: "COMPANY" });
          }}
          className={
            "flex w-full items-center justify-center gap-3 rounded border p-4 lg:w-auto lg:justify-start" +
            (data.userType === "COMPANY"
              ? " border-getly-primary"
              : " border-gray-300")
          }
        >
          <p className="">For Company</p>
          <svg
            className={
              "h-6 w-6 lg:h-8 lg:w-8 " +
              (data.userType === "COMPANY"
                ? " stroke-getly-primary"
                : " stroke-[#494949]")
            }
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22.6667 28V25.3333C22.6667 23.9188 22.1048 22.5623 21.1046 21.5621C20.1044 20.5619 18.7478 20 17.3333 20H6.66668C5.25219 20 3.89563 20.5619 2.89544 21.5621C1.89525 22.5623 1.33334 23.9188 1.33334 25.3333V28"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 14.6667C14.9455 14.6667 17.3333 12.2789 17.3333 9.33333C17.3333 6.38781 14.9455 4 12 4C9.05447 4 6.66666 6.38781 6.66666 9.33333C6.66666 12.2789 9.05447 14.6667 12 14.6667Z"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M30.6667 27.9985V25.3319C30.6658 24.1502 30.2725 23.0022 29.5485 22.0683C28.8245 21.1344 27.8108 20.4673 26.6667 20.1719"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M21.3333 4.17188C22.4805 4.46561 23.4974 5.13281 24.2235 6.06829C24.9496 7.00377 25.3438 8.15431 25.3438 9.33854C25.3438 10.5228 24.9496 11.6733 24.2235 12.6088C23.4974 13.5443 22.4805 14.2115 21.3333 14.5052"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      <div className=" flex w-full flex-col gap-5">
        {data.userType === "COMPANY" && (
          <div className="grid gap-4 lg:grid-cols-2 ">
            <label htmlFor="companyName">
              <p className=" pb-1 font-museo-sans-rounded-300 text-sm">
                Company Name
              </p>
              <input
                disabled={data.cacVerified}
                onChange={onChange}
                value={data.companyName}
                name="companyName"
                required={data.userType === "COMPANY"}
                type="text"
                placeholder=""
                className="w-full rounded border border-[#A7A6A6] bg-[#F8F5F5] p-2 disabled:opacity-50"
              />
            </label>
            <div className="flex w-full flex-col">
              <div className=" flex w-full items-end justify-between gap-3">
                <div className="w-full">
                  <p className=" pb-1 font-museo-sans-rounded-300 text-sm">
                    Company CAC
                  </p>
                  <input
                    onChange={onChange}
                    value={data.companyCac}
                    disabled={data.cacVerified}
                    name="companyCac"
                    required={data.userType === "COMPANY"}
                    type="tel"
                    inputMode="numeric"
                    placeholder=""
                    className="w-full rounded border border-[#A7A6A6] bg-[#F8F5F5] p-2 disabled:cursor-none disabled:opacity-50"
                  />
                </div>
                {!data.cacVerified && !cacLoading && (
                  <button
                    disabled={
                      cacLoading ||
                      data.companyName === "" ||
                      !data.companyCac.match(/^[0-9]*$/)
                    }
                    className="rounded bg-getly-primary p-[10px] text-sm text-black disabled:opacity-50 "
                    onClick={() => {
                      cacMutateAsync({
                        companyName: data.companyName,
                        companyCac: data.companyCac,
                      })
                        .then(() => {
                          setData({ ...data, cacVerified: true });
                        })
                        .catch(() => {
                          console.error("something went wrong");
                        });
                    }}
                  >
                    Verify
                  </button>
                )}
              </div>
              {cacLoading && (
                <p className=" pt-1 text-xs text-[#696F8C]">
                  verifing your cac
                </p>
              )}
              {!cacLoading && (
                <p
                  className={`pt-1 text-xs ${
                    data.cacVerified ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {cacData === true && "CAC verified"}
                  {cacError &&
                    "Error! CAC not verified kindly check your Company Name and CAC Number"}
                </p>
              )}
            </div>
          </div>
        )}
        <div className="grid gap-4 lg:grid-cols-2">
          <label htmlFor="firstName">
            <p className=" pb-1 font-museo-sans-rounded-300 text-sm">
              {data.userType === "INDIVIDUAL"
                ? "First Name"
                : "Staff First Name"}
            </p>
            <input
              onChange={onChange}
              value={data.firstName}
              name="firstName"
              required
              type="text"
              placeholder="John"
              className="w-full rounded border border-[#A7A6A6] bg-[#F8F5F5] p-2 disabled:cursor-none disabled:opacity-50"
            />
          </label>
          <label htmlFor="lastName">
            <p className=" pb-1 font-museo-sans-rounded-300 text-sm">
              {data.userType === "INDIVIDUAL" ? "Last Name" : "Staff Last Name"}
            </p>
            <input
              onChange={onChange}
              value={data.lastName}
              name="lastName"
              required
              type="text"
              placeholder="Dosunmi"
              className="w-full rounded border border-[#A7A6A6] bg-[#F8F5F5] p-2 disabled:cursor-none disabled:opacity-50"
            />
          </label>
          <label htmlFor="dob">
            <p className=" pb-1 font-museo-sans-rounded-300 text-sm">
              {data.userType === "INDIVIDUAL"
                ? "Date of Birth"
                : "Staff Date of Birth"}
            </p>
            <input
              onChange={onChange}
              value={data.dob}
              name="dob"
              required
              type="date"
              placeholder="01/12/2000"
              className="w-full rounded border border-[#A7A6A6] bg-[#F8F5F5] p-2"
            />
          </label>
          <label htmlFor="phoneNumber">
            <p className=" pb-1 font-museo-sans-rounded-300 text-sm">
              Phone number
            </p>
            <input
              onChange={onChange}
              value={data.phoneNumber}
              name="phoneNumber"
              required
              maxLength={11}
              type="tel"
              placeholder="08020980987"
              className="w-full rounded border border-[#A7A6A6] bg-[#F8F5F5] p-2 disabled:cursor-none disabled:opacity-50"
            />
          </label>
        </div>
        <label htmlFor="email">
          <p className=" pb-1 font-museo-sans-rounded-300 text-sm">Email</p>
          <input
            onChange={onChange}
            value={data.email}
            name="email"
            required
            type="email"
            placeholder="johndosunmi@abcmail.com"
            className="w-full rounded border border-[#A7A6A6] bg-[#F8F5F5] p-2"
          />
        </label>

        <label htmlFor="address1">
          <p className=" pb-1 font-museo-sans-rounded-300 text-sm">
            Street Address
          </p>
          <input
            onChange={onChange}
            value={data.address1}
            name="address1"
            required
            type="text"
            placeholder=""
            className="w-full rounded border border-[#A7A6A6] bg-[#F8F5F5] p-2"
          />
        </label>
        <div className="grid gap-4 lg:grid-cols-3 ">
          <label htmlFor="state">
            <p className=" pb-1 font-museo-sans-rounded-300 text-sm">State</p>
            <select
              required
              name="state"
              value={data.state}
              onChange={onChange}
              className="w-full rounded border border-[#A7A6A6] bg-[#F8F5F5] p-2 focus:outline-0 focus:ring-0 disabled:opacity-50"
            >
              <option> Select state</option>
              {!state?.length && <option disabled> Loading ....</option>}
              {state?.map((state, index: number) => (
                <option key={index} value={state.name}>
                  {state.name}
                </option>
              ))}
            </select>
          </label>
          <label htmlFor="city">
            <p className=" pb-1 font-museo-sans-rounded-300 text-sm">City</p>
            <input
              type="text"
              name="city"
              value={data.city}
              onChange={onChange}
              required
              placeholder="Wuse"
              className="w-full rounded border border-[#A7A6A6] bg-[#F8F5F5] p-2"
            />
          </label>
          <label htmlFor="postalCode">
            <p className=" pb-1 font-museo-sans-rounded-300 text-sm">
              Postal Code
            </p>
            <input
              name="postalCode"
              onChange={onChange}
              value={data.postalCode}
              type="text"
              required
              placeholder="100001"
              className="w-full rounded border border-[#A7A6A6] bg-[#F8F5F5] p-2"
            />
          </label>
        </div>
        <>
          <label className=" pb-1 font-museo-sans-rounded-300 text-xs">
            <p>
              Getly is committed to protecting and respecting your privacy, and
              we'll only use your personal information to administer your
              account and to provide the products and services you requested
              from us. From time to time, we would like to contact you about our
              products and service, as well as other content that may be of
              interest to you. If you consent to us contacting you for this
              purpose, please tick the boxes below.
            </p>
          </label>
          <label className="flex items-start gap-4">
            <input
              className="m-1"
              name="storePersonalData"
              onChange={handlePersonalData}
              type="checkbox"
            />
            <p className=" pb-1 font-museo-sans-rounded-300 text-xs">
              <strong>
                {" "}
                I agree to allow Getly to store and process my personal data.*{" "}
                <br />
              </strong>
              In order to provide you the content requested, we need to store
              and process your personal data. If you consent to us storing your
              personal data for this purpose, please tick the checkbox below.
            </p>
          </label>
          <label className="flex items-start gap-4">
            <input
              className="m-1"
              name="recieveCommunications"
              onChange={handlePersonalData}
              type="checkbox"
            />
            <p className=" pb-1 font-museo-sans-rounded-300 text-xs">
              <strong>
                {" "}
                I agree to recieve other communications from Getly.
              </strong>{" "}
              <br />
              You can unsunbscribe from these communications at any time.
            </p>
          </label>
        </>
      </div>
    </div>
  );
}

export default StepOne;
