import { api } from "@/utils/api";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "react-toastify";
import LeftSide from "../components/LeftSide";
import Logo from "../images/logo.png";

function Reset() {
  const router = useRouter();
  const [tab, setTab] = useState<number>(1);
  const [data, setData] = useState<{
    email: string;
    otp: string;
    newPin: string;
    auth: string | undefined;
  }>({
    email: "",
    otp: "",
    newPin: "",
    auth: "",
  });
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const { mutateAsync, isLoading } = api.register.forgotPin.useMutation();

  return (
    <>
      <Head>
        <title>Getly | Pin Reset</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className=" flex h-screen overflow-y-hidden font-museo-sans-rounded-500 text-[#494949]">
        <div className="hidden w-[900px] lg:block 2xl:w-[1400px]">
          <LeftSide />
        </div>
        {tab === 1 && (
          <form className="  flex w-full flex-col gap-3 px-5 pt-20 md:px-32 lg:justify-center lg:pt-0">
            <div className=" mb-8 flex justify-center lg:hidden">
              <Image src={Logo} alt="" className="w-24" />
            </div>
            <h1 className=" font-museo-sans-rounded-700 text-2xl">Reset pin</h1>
            <p className="mb-3">
              Enter your email address to receive a pin reset link.
            </p>
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

            <button
              type="submit"
              onClick={async (e: React.FormEvent<HTMLButtonElement>) => {
                e.preventDefault();
                const id = toast.loading("Sending OTP...");
                mutateAsync({
                  email: data.email,
                  type: "OTP",
                })
                  .then((res) => {
                    if (res.statusCode === 200) {
                      toast.update(id, {
                        render: "OTP sent successfully",
                        type: "success",
                        isLoading: false,
                        autoClose: 2000,
                      });
                      setData({
                        ...data,
                        auth: res.authToken,
                      });
                      setTab(2);
                    }
                  })
                  .catch((e) => {
                    toast.update(id, {
                      render: e.message ? e.message : "An error occured",
                      type: "error",
                      isLoading: false,
                      autoClose: 2000,
                    });
                  });
              }}
              disabled={isLoading || !data.email}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-md border bg-getly-primary py-2 disabled:cursor-not-allowed disabled:opacity-30 lg:w-[220px]"
            >
              <p>Send Reset Otp</p>
              <svg
                className=" h-4 w-4"
                viewBox="0 0 16 17"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3.33331 8.5H12.6666"
                  stroke="black"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8 3.83203L12.6667 8.4987L8 13.1654"
                  stroke="black"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div>
              <p className="pt-3 text-sm">
                Remember your pin?{" "}
                <Link className="font-semibold text-[#4444EE]" href={"/"}>
                  Log In
                </Link>
              </p>
            </div>
          </form>
        )}
        {tab === 2 && (
          <form
            autoComplete="off"
            className="  flex w-full flex-col gap-3 px-5 pt-20 md:px-32 lg:justify-center lg:pt-0"
          >
            <div className=" mb-8 flex justify-center lg:hidden">
              <Image src={Logo} alt="" className="w-24" />
            </div>
            <h1 className=" font-museo-sans-rounded-700 text-2xl">Reset pin</h1>
            <p className="mb-3">
              Enter your email address to receive a pin reset link.
            </p>
            <label htmlFor="otp">
              <p className=" pb-1 font-museo-sans-rounded-300 text-sm">Otp</p>
              <input
                onChange={onChange}
                value={data.otp}
                name="otp"
                required
                type="text"
                maxLength={6}
                inputMode="tel"
                placeholder="- - - - - -"
                className=" w-full rounded border border-[#A7A6A6] bg-[#F8F5F5] p-2 text-center md:w-[300px]"
              />
            </label>
            <label htmlFor="newPin">
              <p className=" pb-1 font-museo-sans-rounded-300 text-sm">
                New pin
              </p>
              <input
                onChange={onChange}
                value={data.newPin}
                name="newPin"
                required
                type="password"
                maxLength={6}
                inputMode="tel"
                placeholder="- - - - - -"
                className=" w-full rounded border border-[#A7A6A6] bg-[#F8F5F5] p-2 text-center md:w-[300px]"
              />
            </label>

            <button
              type="submit"
              onClick={async (e: React.FormEvent<HTMLButtonElement>) => {
                e.preventDefault();
                const id = toast.loading("validating...");
                mutateAsync({
                  email: data.email,
                  type: "RESET",
                  authToken: data.auth,
                  newPin: data.newPin,
                  otp: data.otp,
                })
                  .then((res) => {
                    if (res.statusCode === 200) {
                      toast.update(id, {
                        render: "Pin changed successfully",
                        type: "success",
                        isLoading: false,
                        autoClose: 2000,
                      });
                      router.push("/");
                    }
                  })
                  .catch((err) => {
                    toast.update(id, {
                      render: err.message,
                      type: "error",
                      isLoading: false,
                      autoClose: 2000,
                    });
                    if (err.message === "Expired token") {
                      setTab(1);
                    }
                  });
              }}
              disabled={
                isLoading ||
                !data.newPin.match(/^[0-9]*$/) ||
                !data.otp.match(/^[0-9]*$/)
              }
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-md border bg-getly-primary py-2 disabled:cursor-not-allowed disabled:opacity-30 lg:w-[120px]"
            >
              <p>Reset Pin</p>
              <svg
                className=" h-4 w-4"
                viewBox="0 0 16 17"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3.33331 8.5H12.6666"
                  stroke="black"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8 3.83203L12.6667 8.4987L8 13.1654"
                  stroke="black"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div>
              <p className="pt-3 text-sm">
                Remember your pin?{" "}
                <Link className="font-semibold text-[#4444EE]" href={"/"}>
                  Log In
                </Link>
              </p>
            </div>
          </form>
        )}
      </main>
    </>
  );
}

export default Reset;
