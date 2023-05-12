/* eslint-disable @typescript-eslint/no-misused-promises */
import { Dialog, Popover, Transition } from "@headlessui/react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { Fragment, useEffect, useState } from "react";
import Logo from "../images/logo.png";
import { api } from "@/utils/api";
import type { User } from "@prisma/client";
import AutoLogout from "./AutoLogOut";
import { BvnVerificatonModalState } from "@/recoil/atom";
import { useSetRecoilState } from "recoil";
import DojahVerificationModal from "@/components/DojahVerificationModal";
type LayoutProps = {
  title?: string;
  children?: React.ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ title, children }) => {
  const setBvnVerificationModalState = useSetRecoilState(
    BvnVerificatonModalState
  );

  const router = useRouter();
  const { data: userData, isLoading: userDataLoading } =
    api.settings.me.useQuery();

  const [user, setUser] = useState<Omit<
    User,
    "pin" | "sudoCustomerID" | "address2" | "createdAt" | "updatedAt"
  > | null>();

  useEffect(() => {
    setUser(userData);
  }, [userData]);

  const [navBarMenu, setNavBarMenu] = useState(false);
  return (
    <AutoLogout>
      <Head>
        <title>{title}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className=" min-h-screen w-screen font-museo-sans-rounded-300">
        {/* the modal for mono bvn verification. the initial verification modal before dojah verification */}
        <DojahVerificationModal />
        <Transition.Root show={navBarMenu} as={Fragment}>
          <Dialog
            onClose={setNavBarMenu}
            className=" fixed inset-0 z-[80] overflow-y-auto lg:hidden "
          >
            <Transition.Child
              enter=" duration-300  ease-out"
              enterFrom=" opacity-0 "
              enterTo=" opacity-100 "
              leave=" duration-200 ease-in"
              leaveFrom=" opacity-100 "
              leaveTo="opacity-0 "
            >
              <Dialog.Overlay className=" fixed inset-0 bg-black/50">
                <div className=" flex h-screen w-[280px] flex-col gap-4 overflow-y-auto bg-white  px-5 text-gray-600">
                  <div className=" flex w-full justify-end">
                    <button
                      onClick={() => {
                        setNavBarMenu(!navBarMenu);
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="mt-4 h-6 w-6 fill-black"
                      >
                        <path fill="none" d="M0 0h24v24H0z" />
                        <path d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z" />
                      </svg>
                    </button>
                  </div>
                  <Link href="/">
                    <div className=" flex cursor-pointer items-center justify-center indent-2 text-lg font-bold text-black">
                      <Image src={Logo} alt="" />
                    </div>
                  </Link>
                  <div className="flex w-full  flex-col divide-y">
                    <div className="flex flex-col gap-2 py-3">
                      <Link href={"/dashboard"}>
                        <div className={`flex cursor-pointer gap-2 p-2 px-4`}>
                          <svg
                            className="h-6 w-6 stroke-getly-black"
                            viewBox="0 0 40 40"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M5 14.9987L20 3.33203L35 14.9987V33.332C35 34.2161 34.6488 35.0639 34.0237 35.6891C33.3986 36.3142 32.5507 36.6654 31.6667 36.6654H8.33333C7.44928 36.6654 6.60143 36.3142 5.97631 35.6891C5.35119 35.0639 5 34.2161 5 33.332V14.9987Z"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M15 36.6667V20H25V36.6667"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>

                          <p className=" font-[400]">Dashboard</p>
                        </div>
                      </Link>
                      <Link href={"/wallet"}>
                        <div className={`flex cursor-pointer gap-2 p-2 px-4`}>
                          <svg
                            className="h-6 w-6 stroke-getly-black"
                            viewBox="0 0 44 44"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M36.6667 12.832H7.33341C5.30837 12.832 3.66675 14.4737 3.66675 16.4987V34.832C3.66675 36.8571 5.30837 38.4987 7.33341 38.4987H36.6667C38.6918 38.4987 40.3334 36.8571 40.3334 34.832V16.4987C40.3334 14.4737 38.6918 12.832 36.6667 12.832Z"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M29.3334 38.5V9.16667C29.3334 8.19421 28.9471 7.26158 28.2595 6.57394C27.5718 5.88631 26.6392 5.5 25.6667 5.5H18.3334C17.361 5.5 16.4283 5.88631 15.7407 6.57394C15.0531 7.26158 14.6667 8.19421 14.6667 9.16667V38.5"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>

                          <p className=" font-[400]">Wallet</p>
                        </div>
                      </Link>
                      <Link href={"/cards"}>
                        <div className={`flex cursor-pointer gap-2 p-2 px-4`}>
                          <svg
                            className="h-6 w-6 stroke-getly-black"
                            viewBox="0 0 44 44"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M38.4999 7.33203H5.49992C3.47487 7.33203 1.83325 8.97365 1.83325 10.9987V32.9987C1.83325 35.0237 3.47487 36.6654 5.49992 36.6654H38.4999C40.525 36.6654 42.1666 35.0237 42.1666 32.9987V10.9987C42.1666 8.97365 40.525 7.33203 38.4999 7.33203Z"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M1.83325 18.332H42.1666"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>

                          <p className=" font-[400]">Cards</p>
                        </div>
                      </Link>
                      <Link href={"/settings"}>
                        <div className={`flex cursor-pointer gap-2 p-2 px-4`}>
                          <svg
                            className="h-6 w-6 stroke-getly-black"
                            viewBox="0 0 44 44"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M22 27.5C25.0376 27.5 27.5 25.0376 27.5 22C27.5 18.9624 25.0376 16.5 22 16.5C18.9624 16.5 16.5 18.9624 16.5 22C16.5 25.0376 18.9624 27.5 22 27.5Z"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M35.5666 27.4987C35.3225 28.0517 35.2497 28.6651 35.3576 29.2598C35.4654 29.8545 35.7489 30.4033 36.1716 30.8354L36.2816 30.9454C36.6225 31.2859 36.8929 31.6903 37.0775 32.1354C37.262 32.5805 37.357 33.0577 37.357 33.5395C37.357 34.0214 37.262 34.4985 37.0775 34.9436C36.8929 35.3888 36.6225 35.7932 36.2816 36.1337C35.9411 36.4746 35.5367 36.7451 35.0915 36.9296C34.6464 37.1141 34.1693 37.2091 33.6874 37.2091C33.2056 37.2091 32.7284 37.1141 32.2833 36.9296C31.8382 36.7451 31.4338 36.4746 31.0932 36.1337L30.9832 36.0237C30.5512 35.601 30.0024 35.3175 29.4077 35.2097C28.8129 35.1019 28.1995 35.1747 27.6466 35.4187C27.1043 35.6511 26.6419 36.037 26.3161 36.5288C25.9904 37.0207 25.8156 37.5971 25.8133 38.187V38.4987C25.8133 39.4712 25.4269 40.4038 24.7393 41.0914C24.0517 41.7791 23.119 42.1654 22.1466 42.1654C21.1741 42.1654 20.2415 41.7791 19.5539 41.0914C18.8662 40.4038 18.4799 39.4712 18.4799 38.4987V38.3337C18.4657 37.7269 18.2693 37.1384 17.9162 36.6446C17.5631 36.1509 17.0696 35.7749 16.4999 35.5654C15.947 35.3213 15.3336 35.2485 14.7388 35.3564C14.1441 35.4642 13.5953 35.7477 13.1633 36.1704L13.0533 36.2804C12.7127 36.6213 12.3083 36.8917 11.8632 37.0762C11.4181 37.2608 10.9409 37.3557 10.4591 37.3557C9.97723 37.3557 9.5001 37.2608 9.05497 37.0762C8.60984 36.8917 8.20545 36.6213 7.86492 36.2804C7.524 35.9398 7.25356 35.5354 7.06903 35.0903C6.88451 34.6452 6.78953 34.1681 6.78953 33.6862C6.78953 33.2043 6.88451 32.7272 7.06903 32.2821C7.25356 31.837 7.524 31.4326 7.86492 31.092L7.97492 30.982C8.39757 30.55 8.68109 30.0012 8.78893 29.4064C8.89676 28.8117 8.82396 28.1983 8.57992 27.6454C8.34752 27.1031 7.96164 26.6407 7.46977 26.3149C6.97791 25.9892 6.40153 25.8144 5.81159 25.812H5.49992C4.52746 25.812 3.59483 25.4257 2.90719 24.7381C2.21956 24.0505 1.83325 23.1178 1.83325 22.1454C1.83325 21.1729 2.21956 20.2403 2.90719 19.5526C3.59483 18.865 4.52746 18.4787 5.49992 18.4787H5.66492C6.27174 18.4645 6.86026 18.2681 7.35397 17.915C7.84767 17.5619 8.22373 17.0684 8.43325 16.4987C8.6773 15.9457 8.75009 15.3323 8.64226 14.7376C8.53443 14.1429 8.2509 13.5941 7.82825 13.162L7.71825 13.052C7.37734 12.7115 7.10689 12.3071 6.92237 11.862C6.73784 11.4169 6.64287 10.9397 6.64287 10.4579C6.64287 9.97601 6.73784 9.49888 6.92237 9.05375C7.10689 8.60862 7.37734 8.20423 7.71825 7.8637C8.05879 7.52278 8.46318 7.25233 8.9083 7.06781C9.35343 6.88329 9.83056 6.78831 10.3124 6.78831C10.7943 6.78831 11.2714 6.88329 11.7165 7.06781C12.1617 7.25233 12.5661 7.52278 12.9066 7.8637L13.0166 7.9737C13.4487 8.39635 13.9974 8.67987 14.5922 8.78771C15.1869 8.89554 15.8003 8.82274 16.3533 8.5787H16.4999C17.0422 8.3463 17.5046 7.96042 17.8304 7.46855C18.1561 6.97669 18.3309 6.40031 18.3333 5.81036V5.4987C18.3333 4.52624 18.7196 3.59361 19.4072 2.90597C20.0948 2.21834 21.0275 1.83203 21.9999 1.83203C22.9724 1.83203 23.905 2.21834 24.5926 2.90597C25.2803 3.59361 25.6666 4.52624 25.6666 5.4987V5.6637C25.6689 6.25364 25.8437 6.83002 26.1695 7.32188C26.4952 7.81375 26.9577 8.19963 27.4999 8.43203C28.0529 8.67608 28.6663 8.74887 29.261 8.64104C29.8557 8.5332 30.4045 8.24968 30.8366 7.82703L30.9466 7.71703C31.2871 7.37612 31.6915 7.10567 32.1366 6.92115C32.5818 6.73662 33.0589 6.64165 33.5408 6.64165C34.0226 6.64165 34.4997 6.73662 34.9449 6.92115C35.39 7.10567 35.7944 7.37612 36.1349 7.71703C36.4758 8.05757 36.7463 8.46196 36.9308 8.90708C37.1153 9.35221 37.2103 9.82934 37.2103 10.3112C37.2103 10.7931 37.1153 11.2702 36.9308 11.7153C36.7463 12.1604 36.4758 12.5648 36.1349 12.9054L36.0249 13.0154C35.6023 13.4474 35.3187 13.9962 35.2109 14.591C35.1031 15.1857 35.1759 15.7991 35.4199 16.352V16.4987C35.6523 17.0409 36.0382 17.5034 36.5301 17.8291C37.0219 18.1549 37.5983 18.3297 38.1883 18.332H38.4999C39.4724 18.332 40.405 18.7183 41.0926 19.406C41.7803 20.0936 42.1666 21.0262 42.1666 21.9987C42.1666 22.9712 41.7803 23.9038 41.0926 24.5914C40.405 25.2791 39.4724 25.6654 38.4999 25.6654H38.3349C37.745 25.6677 37.1686 25.8425 36.6767 26.1683C36.1849 26.494 35.799 26.9565 35.5666 27.4987Z"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>

                          <p className=" font-[400]">Settings</p>
                        </div>
                      </Link>

                      <button
                        onClick={() =>
                          signOut({ callbackUrl: "/" }).catch(() => {
                            console.error("something went wrong");
                          })
                        }
                        className="px-4 py-2"
                      >
                        <div className="flex cursor-pointer gap-2">
                          <svg
                            className="h-6 w-6 "
                            viewBox="0 0 32 32"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M12 28H6.66667C5.95942 28 5.28115 27.719 4.78105 27.219C4.28095 26.7189 4 26.0406 4 25.3333V6.66667C4 5.95942 4.28095 5.28115 4.78105 4.78105C5.28115 4.28095 5.95942 4 6.66667 4H12"
                              stroke="#F30505"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M21.3333 22.6654L28 15.9987L21.3333 9.33203"
                              stroke="#F30505"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M28 16H12"
                              stroke="#F30505"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <p className=" font-[400] text-getly-red">Log out</p>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </Dialog.Overlay>
            </Transition.Child>
          </Dialog>
        </Transition.Root>
        <div className="sticky top-0 z-30 flex h-20 w-full items-center justify-between bg-white px-6 shadow-lg md:px-4 lg:px-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setNavBarMenu(!navBarMenu);
              }}
              className="mt-3 md:hidden"
            >
              {navBarMenu ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="h-6 w-6 duration-500"
                >
                  <path fill="none" d="M0 0H24V24H0z" />
                  <path d="M21 18v2H3v-2h18zM6.596 3.904L8.01 5.318 4.828 8.5l3.182 3.182-1.414 1.414L2 8.5l4.596-4.596zM21 11v2h-9v-2h9zm0-7v2h-9V4h9z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="h-6 w-6 duration-500"
                >
                  <path fill="none" d="M0 0h24v24H0z" />
                  <path d="M3 4h18v2H3V4zm6 7h12v2H9v-2zm-6 7h18v2H3v-2z" />
                </svg>
              )}
            </button>
            <Image src={Logo} alt="logo" className=" w-16" />
          </div>
          <Popover className="relative">
            <Popover.Button className="flex items-center gap-4">
              {userDataLoading ? (
                <div className="h-12 w-12 animate-pulse rounded-full bg-gray-200 "></div>
              ) : (
                <div className=" flex h-9 w-9 items-center justify-center gap-1 rounded-full bg-getly/70 capitalize ring-2 ring-getly">
                  <p>{user?.firstName.slice(0, 1)[0]}</p>
                  <p>{user?.lastName.slice(0, 1)[0]}</p>
                </div>
              )}
              {userDataLoading ? (
                <p className=" hidden h-4 w-32 animate-pulse rounded bg-gray-200 text-sm md:block"></p>
              ) : (
                <p className=" hidden text-sm md:block">
                  {userData?.firstName} {userData?.lastName}
                </p>
              )}
            </Popover.Button>
            <Popover.Panel className="absolute right-[-20%] top-16 z-10 rounded-lg md:hidden">
              <div className="  flex h-full w-full flex-col gap-5 bg-white py-3  shadow-xl ">
                <Link href={"/dashboard"}>
                  <div className={`flex cursor-pointer gap-2 p-2 px-4`}>
                    <svg
                      className="h-6 w-6 stroke-getly-black"
                      viewBox="0 0 40 40"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M5 14.9987L20 3.33203L35 14.9987V33.332C35 34.2161 34.6488 35.0639 34.0237 35.6891C33.3986 36.3142 32.5507 36.6654 31.6667 36.6654H8.33333C7.44928 36.6654 6.60143 36.3142 5.97631 35.6891C5.35119 35.0639 5 34.2161 5 33.332V14.9987Z"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M15 36.6667V20H25V36.6667"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>

                    <p className=" font-[400]">Dashboard</p>
                  </div>
                </Link>
                <Link href={"/wallet"}>
                  <div className={`flex cursor-pointer gap-2 p-2 px-4`}>
                    <svg
                      className="h-6 w-6 stroke-getly-black"
                      viewBox="0 0 44 44"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M36.6667 12.832H7.33341C5.30837 12.832 3.66675 14.4737 3.66675 16.4987V34.832C3.66675 36.8571 5.30837 38.4987 7.33341 38.4987H36.6667C38.6918 38.4987 40.3334 36.8571 40.3334 34.832V16.4987C40.3334 14.4737 38.6918 12.832 36.6667 12.832Z"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M29.3334 38.5V9.16667C29.3334 8.19421 28.9471 7.26158 28.2595 6.57394C27.5718 5.88631 26.6392 5.5 25.6667 5.5H18.3334C17.361 5.5 16.4283 5.88631 15.7407 6.57394C15.0531 7.26158 14.6667 8.19421 14.6667 9.16667V38.5"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <p className=" font-[400]">Wallet</p>
                  </div>
                </Link>
                <Link href={"/cards"}>
                  <div className={`flex cursor-pointer gap-2 p-2 px-4`}>
                    <svg
                      className="h-6 w-6 stroke-getly-black"
                      viewBox="0 0 44 44"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M38.4999 7.33203H5.49992C3.47487 7.33203 1.83325 8.97365 1.83325 10.9987V32.9987C1.83325 35.0237 3.47487 36.6654 5.49992 36.6654H38.4999C40.525 36.6654 42.1666 35.0237 42.1666 32.9987V10.9987C42.1666 8.97365 40.525 7.33203 38.4999 7.33203Z"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M1.83325 18.332H42.1666"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <p className=" font-[400]">Cards</p>
                  </div>
                </Link>
                <Link href={"/settings"}>
                  <div className={`flex cursor-pointer gap-2 p-2 px-4`}>
                    <svg
                      className="h-6 w-6 stroke-getly-black"
                      viewBox="0 0 44 44"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M22 27.5C25.0376 27.5 27.5 25.0376 27.5 22C27.5 18.9624 25.0376 16.5 22 16.5C18.9624 16.5 16.5 18.9624 16.5 22C16.5 25.0376 18.9624 27.5 22 27.5Z"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M35.5666 27.4987C35.3225 28.0517 35.2497 28.6651 35.3576 29.2598C35.4654 29.8545 35.7489 30.4033 36.1716 30.8354L36.2816 30.9454C36.6225 31.2859 36.8929 31.6903 37.0775 32.1354C37.262 32.5805 37.357 33.0577 37.357 33.5395C37.357 34.0214 37.262 34.4985 37.0775 34.9436C36.8929 35.3888 36.6225 35.7932 36.2816 36.1337C35.9411 36.4746 35.5367 36.7451 35.0915 36.9296C34.6464 37.1141 34.1693 37.2091 33.6874 37.2091C33.2056 37.2091 32.7284 37.1141 32.2833 36.9296C31.8382 36.7451 31.4338 36.4746 31.0932 36.1337L30.9832 36.0237C30.5512 35.601 30.0024 35.3175 29.4077 35.2097C28.8129 35.1019 28.1995 35.1747 27.6466 35.4187C27.1043 35.6511 26.6419 36.037 26.3161 36.5288C25.9904 37.0207 25.8156 37.5971 25.8133 38.187V38.4987C25.8133 39.4712 25.4269 40.4038 24.7393 41.0914C24.0517 41.7791 23.119 42.1654 22.1466 42.1654C21.1741 42.1654 20.2415 41.7791 19.5539 41.0914C18.8662 40.4038 18.4799 39.4712 18.4799 38.4987V38.3337C18.4657 37.7269 18.2693 37.1384 17.9162 36.6446C17.5631 36.1509 17.0696 35.7749 16.4999 35.5654C15.947 35.3213 15.3336 35.2485 14.7388 35.3564C14.1441 35.4642 13.5953 35.7477 13.1633 36.1704L13.0533 36.2804C12.7127 36.6213 12.3083 36.8917 11.8632 37.0762C11.4181 37.2608 10.9409 37.3557 10.4591 37.3557C9.97723 37.3557 9.5001 37.2608 9.05497 37.0762C8.60984 36.8917 8.20545 36.6213 7.86492 36.2804C7.524 35.9398 7.25356 35.5354 7.06903 35.0903C6.88451 34.6452 6.78953 34.1681 6.78953 33.6862C6.78953 33.2043 6.88451 32.7272 7.06903 32.2821C7.25356 31.837 7.524 31.4326 7.86492 31.092L7.97492 30.982C8.39757 30.55 8.68109 30.0012 8.78893 29.4064C8.89676 28.8117 8.82396 28.1983 8.57992 27.6454C8.34752 27.1031 7.96164 26.6407 7.46977 26.3149C6.97791 25.9892 6.40153 25.8144 5.81159 25.812H5.49992C4.52746 25.812 3.59483 25.4257 2.90719 24.7381C2.21956 24.0505 1.83325 23.1178 1.83325 22.1454C1.83325 21.1729 2.21956 20.2403 2.90719 19.5526C3.59483 18.865 4.52746 18.4787 5.49992 18.4787H5.66492C6.27174 18.4645 6.86026 18.2681 7.35397 17.915C7.84767 17.5619 8.22373 17.0684 8.43325 16.4987C8.6773 15.9457 8.75009 15.3323 8.64226 14.7376C8.53443 14.1429 8.2509 13.5941 7.82825 13.162L7.71825 13.052C7.37734 12.7115 7.10689 12.3071 6.92237 11.862C6.73784 11.4169 6.64287 10.9397 6.64287 10.4579C6.64287 9.97601 6.73784 9.49888 6.92237 9.05375C7.10689 8.60862 7.37734 8.20423 7.71825 7.8637C8.05879 7.52278 8.46318 7.25233 8.9083 7.06781C9.35343 6.88329 9.83056 6.78831 10.3124 6.78831C10.7943 6.78831 11.2714 6.88329 11.7165 7.06781C12.1617 7.25233 12.5661 7.52278 12.9066 7.8637L13.0166 7.9737C13.4487 8.39635 13.9974 8.67987 14.5922 8.78771C15.1869 8.89554 15.8003 8.82274 16.3533 8.5787H16.4999C17.0422 8.3463 17.5046 7.96042 17.8304 7.46855C18.1561 6.97669 18.3309 6.40031 18.3333 5.81036V5.4987C18.3333 4.52624 18.7196 3.59361 19.4072 2.90597C20.0948 2.21834 21.0275 1.83203 21.9999 1.83203C22.9724 1.83203 23.905 2.21834 24.5926 2.90597C25.2803 3.59361 25.6666 4.52624 25.6666 5.4987V5.6637C25.6689 6.25364 25.8437 6.83002 26.1695 7.32188C26.4952 7.81375 26.9577 8.19963 27.4999 8.43203C28.0529 8.67608 28.6663 8.74887 29.261 8.64104C29.8557 8.5332 30.4045 8.24968 30.8366 7.82703L30.9466 7.71703C31.2871 7.37612 31.6915 7.10567 32.1366 6.92115C32.5818 6.73662 33.0589 6.64165 33.5408 6.64165C34.0226 6.64165 34.4997 6.73662 34.9449 6.92115C35.39 7.10567 35.7944 7.37612 36.1349 7.71703C36.4758 8.05757 36.7463 8.46196 36.9308 8.90708C37.1153 9.35221 37.2103 9.82934 37.2103 10.3112C37.2103 10.7931 37.1153 11.2702 36.9308 11.7153C36.7463 12.1604 36.4758 12.5648 36.1349 12.9054L36.0249 13.0154C35.6023 13.4474 35.3187 13.9962 35.2109 14.591C35.1031 15.1857 35.1759 15.7991 35.4199 16.352V16.4987C35.6523 17.0409 36.0382 17.5034 36.5301 17.8291C37.0219 18.1549 37.5983 18.3297 38.1883 18.332H38.4999C39.4724 18.332 40.405 18.7183 41.0926 19.406C41.7803 20.0936 42.1666 21.0262 42.1666 21.9987C42.1666 22.9712 41.7803 23.9038 41.0926 24.5914C40.405 25.2791 39.4724 25.6654 38.4999 25.6654H38.3349C37.745 25.6677 37.1686 25.8425 36.6767 26.1683C36.1849 26.494 35.799 26.9565 35.5666 27.4987Z"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <p className=" font-[400]">Settings</p>
                  </div>
                </Link>

                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="px-4 py-2"
                >
                  <div className="flex cursor-pointer gap-2">
                    <svg
                      className="h-6 w-6 "
                      viewBox="0 0 32 32"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 28H6.66667C5.95942 28 5.28115 27.719 4.78105 27.219C4.28095 26.7189 4 26.0406 4 25.3333V6.66667C4 5.95942 4.28095 5.28115 4.78105 4.78105C5.28115 4.28095 5.95942 4 6.66667 4H12"
                        stroke="#F30505"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M21.3333 22.6654L28 15.9987L21.3333 9.33203"
                        stroke="#F30505"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M28 16H12"
                        stroke="#F30505"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <p className=" font-[400] text-getly-red">Log out</p>
                  </div>
                </button>
              </div>
            </Popover.Panel>
          </Popover>
        </div>
        <div className=" flex h-[calc(100vh-80px)] w-full">
          <div className=" hidden h-full flex-col gap-5 bg-getly/10 pt-6 md:flex md:w-56 xl:w-80">
            <Link href={"/dashboard"}>
              <div
                className={`flex cursor-pointer gap-2 p-2 px-10 ${
                  router.pathname === "/dashboard" && "text-getly-blue"
                }`}
              >
                <svg
                  className={`h-6 w-6 ${
                    router.pathname === "/dashboard"
                      ? "stroke-getly-blue"
                      : "stroke-getly-black "
                  }`}
                  viewBox="0 0 40 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 14.9987L20 3.33203L35 14.9987V33.332C35 34.2161 34.6488 35.0639 34.0237 35.6891C33.3986 36.3142 32.5507 36.6654 31.6667 36.6654H8.33333C7.44928 36.6654 6.60143 36.3142 5.97631 35.6891C5.35119 35.0639 5 34.2161 5 33.332V14.9987Z"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M15 36.6667V20H25V36.6667"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                <p className=" font-[400]">Dashboard</p>
              </div>
            </Link>
            <Link href={"/wallet"}>
              <div
                className={`flex cursor-pointer gap-2 p-2 px-10 ${
                  !!router.pathname.startsWith("/wallet") && "text-getly-blue"
                }`}
              >
                <svg
                  className={`h-6 w-6 ${
                    !!router.pathname.startsWith("/wallet")
                      ? "stroke-getly-blue"
                      : "stroke-getly-black "
                  }`}
                  viewBox="0 0 44 44"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M36.6667 12.832H7.33341C5.30837 12.832 3.66675 14.4737 3.66675 16.4987V34.832C3.66675 36.8571 5.30837 38.4987 7.33341 38.4987H36.6667C38.6918 38.4987 40.3334 36.8571 40.3334 34.832V16.4987C40.3334 14.4737 38.6918 12.832 36.6667 12.832Z"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M29.3334 38.5V9.16667C29.3334 8.19421 28.9471 7.26158 28.2595 6.57394C27.5718 5.88631 26.6392 5.5 25.6667 5.5H18.3334C17.361 5.5 16.4283 5.88631 15.7407 6.57394C15.0531 7.26158 14.6667 8.19421 14.6667 9.16667V38.5"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className=" font-[400]">Wallet</p>
              </div>
            </Link>
            <Link href={"/cards"}>
              <div
                className={`flex cursor-pointer gap-2 p-2 px-10 ${
                  !!router.pathname.startsWith("/cards") && "text-getly-blue"
                }`}
              >
                <svg
                  className={`h-6 w-6 ${
                    !!router.pathname.startsWith("/cards")
                      ? "stroke-getly-blue"
                      : "stroke-getly-black "
                  }`}
                  viewBox="0 0 44 44"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M38.4999 7.33203H5.49992C3.47487 7.33203 1.83325 8.97365 1.83325 10.9987V32.9987C1.83325 35.0237 3.47487 36.6654 5.49992 36.6654H38.4999C40.525 36.6654 42.1666 35.0237 42.1666 32.9987V10.9987C42.1666 8.97365 40.525 7.33203 38.4999 7.33203Z"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M1.83325 18.332H42.1666"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className=" font-[400]">Cards</p>
              </div>
            </Link>
            <Link href={"/settings"}>
              <div
                className={`flex cursor-pointer gap-2 p-2 px-10 ${
                  !!router.pathname.startsWith("/settings") && "text-getly-blue"
                }`}
              >
                <svg
                  className={`h-6 w-6 ${
                    !!router.pathname.startsWith("/settings")
                      ? "stroke-getly-blue"
                      : "stroke-getly-black "
                  }`}
                  viewBox="0 0 44 44"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M22 27.5C25.0376 27.5 27.5 25.0376 27.5 22C27.5 18.9624 25.0376 16.5 22 16.5C18.9624 16.5 16.5 18.9624 16.5 22C16.5 25.0376 18.9624 27.5 22 27.5Z"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M35.5666 27.4987C35.3225 28.0517 35.2497 28.6651 35.3576 29.2598C35.4654 29.8545 35.7489 30.4033 36.1716 30.8354L36.2816 30.9454C36.6225 31.2859 36.8929 31.6903 37.0775 32.1354C37.262 32.5805 37.357 33.0577 37.357 33.5395C37.357 34.0214 37.262 34.4985 37.0775 34.9436C36.8929 35.3888 36.6225 35.7932 36.2816 36.1337C35.9411 36.4746 35.5367 36.7451 35.0915 36.9296C34.6464 37.1141 34.1693 37.2091 33.6874 37.2091C33.2056 37.2091 32.7284 37.1141 32.2833 36.9296C31.8382 36.7451 31.4338 36.4746 31.0932 36.1337L30.9832 36.0237C30.5512 35.601 30.0024 35.3175 29.4077 35.2097C28.8129 35.1019 28.1995 35.1747 27.6466 35.4187C27.1043 35.6511 26.6419 36.037 26.3161 36.5288C25.9904 37.0207 25.8156 37.5971 25.8133 38.187V38.4987C25.8133 39.4712 25.4269 40.4038 24.7393 41.0914C24.0517 41.7791 23.119 42.1654 22.1466 42.1654C21.1741 42.1654 20.2415 41.7791 19.5539 41.0914C18.8662 40.4038 18.4799 39.4712 18.4799 38.4987V38.3337C18.4657 37.7269 18.2693 37.1384 17.9162 36.6446C17.5631 36.1509 17.0696 35.7749 16.4999 35.5654C15.947 35.3213 15.3336 35.2485 14.7388 35.3564C14.1441 35.4642 13.5953 35.7477 13.1633 36.1704L13.0533 36.2804C12.7127 36.6213 12.3083 36.8917 11.8632 37.0762C11.4181 37.2608 10.9409 37.3557 10.4591 37.3557C9.97723 37.3557 9.5001 37.2608 9.05497 37.0762C8.60984 36.8917 8.20545 36.6213 7.86492 36.2804C7.524 35.9398 7.25356 35.5354 7.06903 35.0903C6.88451 34.6452 6.78953 34.1681 6.78953 33.6862C6.78953 33.2043 6.88451 32.7272 7.06903 32.2821C7.25356 31.837 7.524 31.4326 7.86492 31.092L7.97492 30.982C8.39757 30.55 8.68109 30.0012 8.78893 29.4064C8.89676 28.8117 8.82396 28.1983 8.57992 27.6454C8.34752 27.1031 7.96164 26.6407 7.46977 26.3149C6.97791 25.9892 6.40153 25.8144 5.81159 25.812H5.49992C4.52746 25.812 3.59483 25.4257 2.90719 24.7381C2.21956 24.0505 1.83325 23.1178 1.83325 22.1454C1.83325 21.1729 2.21956 20.2403 2.90719 19.5526C3.59483 18.865 4.52746 18.4787 5.49992 18.4787H5.66492C6.27174 18.4645 6.86026 18.2681 7.35397 17.915C7.84767 17.5619 8.22373 17.0684 8.43325 16.4987C8.6773 15.9457 8.75009 15.3323 8.64226 14.7376C8.53443 14.1429 8.2509 13.5941 7.82825 13.162L7.71825 13.052C7.37734 12.7115 7.10689 12.3071 6.92237 11.862C6.73784 11.4169 6.64287 10.9397 6.64287 10.4579C6.64287 9.97601 6.73784 9.49888 6.92237 9.05375C7.10689 8.60862 7.37734 8.20423 7.71825 7.8637C8.05879 7.52278 8.46318 7.25233 8.9083 7.06781C9.35343 6.88329 9.83056 6.78831 10.3124 6.78831C10.7943 6.78831 11.2714 6.88329 11.7165 7.06781C12.1617 7.25233 12.5661 7.52278 12.9066 7.8637L13.0166 7.9737C13.4487 8.39635 13.9974 8.67987 14.5922 8.78771C15.1869 8.89554 15.8003 8.82274 16.3533 8.5787H16.4999C17.0422 8.3463 17.5046 7.96042 17.8304 7.46855C18.1561 6.97669 18.3309 6.40031 18.3333 5.81036V5.4987C18.3333 4.52624 18.7196 3.59361 19.4072 2.90597C20.0948 2.21834 21.0275 1.83203 21.9999 1.83203C22.9724 1.83203 23.905 2.21834 24.5926 2.90597C25.2803 3.59361 25.6666 4.52624 25.6666 5.4987V5.6637C25.6689 6.25364 25.8437 6.83002 26.1695 7.32188C26.4952 7.81375 26.9577 8.19963 27.4999 8.43203C28.0529 8.67608 28.6663 8.74887 29.261 8.64104C29.8557 8.5332 30.4045 8.24968 30.8366 7.82703L30.9466 7.71703C31.2871 7.37612 31.6915 7.10567 32.1366 6.92115C32.5818 6.73662 33.0589 6.64165 33.5408 6.64165C34.0226 6.64165 34.4997 6.73662 34.9449 6.92115C35.39 7.10567 35.7944 7.37612 36.1349 7.71703C36.4758 8.05757 36.7463 8.46196 36.9308 8.90708C37.1153 9.35221 37.2103 9.82934 37.2103 10.3112C37.2103 10.7931 37.1153 11.2702 36.9308 11.7153C36.7463 12.1604 36.4758 12.5648 36.1349 12.9054L36.0249 13.0154C35.6023 13.4474 35.3187 13.9962 35.2109 14.591C35.1031 15.1857 35.1759 15.7991 35.4199 16.352V16.4987C35.6523 17.0409 36.0382 17.5034 36.5301 17.8291C37.0219 18.1549 37.5983 18.3297 38.1883 18.332H38.4999C39.4724 18.332 40.405 18.7183 41.0926 19.406C41.7803 20.0936 42.1666 21.0262 42.1666 21.9987C42.1666 22.9712 41.7803 23.9038 41.0926 24.5914C40.405 25.2791 39.4724 25.6654 38.4999 25.6654H38.3349C37.745 25.6677 37.1686 25.8425 36.6767 26.1683C36.1849 26.494 35.799 26.9565 35.5666 27.4987Z"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className=" font-[400]">Settings</p>
              </div>
            </Link>

            <button
              onClick={() =>
                signOut({ callbackUrl: "/" }).catch(() => {
                  console.error("something went wrong");
                })
              }
              className="px-10 py-2"
            >
              <div className="flex cursor-pointer gap-2">
                <svg
                  className="h-6 w-6 "
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 28H6.66667C5.95942 28 5.28115 27.719 4.78105 27.219C4.28095 26.7189 4 26.0406 4 25.3333V6.66667C4 5.95942 4.28095 5.28115 4.78105 4.78105C5.28115 4.28095 5.95942 4 6.66667 4H12"
                    stroke="#F30505"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M21.3333 22.6654L28 15.9987L21.3333 9.33203"
                    stroke="#F30505"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M28 16H12"
                    stroke="#F30505"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className=" font-[400] text-getly-red">Log out</p>
              </div>
            </button>
          </div>
          <div className="flex h-full w-full flex-col overflow-y-auto px-5 pt-6 md:px-10">
            {user?.bvnVerified === false && (
              <div className="flex flex-col rounded-md bg-getly-red/10 lg:flex-row ">
                <p className="w-full p-4 text-sm font-[400] text-getly-red">
                  Kindly verify your BVN to enable you create cards and make
                  transactions on the platform
                </p>
                <button
                  type="button"
                  onClick={() => setBvnVerificationModalState(true)}
                  className=" border-t border-getly-red p-2 lg:border-t-0 lg:border-l  lg:px-5"
                >
                  Verify
                </button>
                {/* <a
                  href="https://identity.dojah.io?widget_id=642d78332c989d00346bc0f6"
                  //href="https://identity.dojah.io?widget_id=6426c95707663a00337751a5"
                  target="_blank"
                  rel="noreferrer"
                  className=" border-t border-getly-red p-2 lg:border-t-0 lg:border-l  lg:px-5"
                >
                  Verify
                </a> */}
              </div>
            )}
            {children}
          </div>
        </div>
      </div>
    </AutoLogout>
  );
};
export default Layout;
