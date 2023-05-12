import { type NextPage } from "next";
import { signIn } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "react-toastify";
import LeftSide from "../components/LeftSide";
import Logo from "../images/logo.png";

const Home: NextPage = () => {
  const router = useRouter();
  const [data, setData] = useState<{
    email: string;
    pin: string;
  }>({
    email: "",
    pin: "",
  });
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const id = toast.loading("Signing in...");
      await signIn("credentials", {
        redirect: false,
        ...data,
      }).then((res) => {
        if (res?.error) {
          toast.update(id, {
            render: "email or pin is incorrect",
            type: "error",
            isLoading: false,
            autoClose: 3000,
          });
        } else {
          toast.update(id, {
            render: "Signed in successfully",
            type: "success",
            isLoading: false,
            autoClose: 3000,
          });
          router.push("/dashboard");
        }
      });
    } catch (err) {
      toast.error("something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Getly | Login</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className=" flex h-screen overflow-y-hidden font-museo-sans-rounded-500 text-[#494949]">
        <div className="hidden w-[900px] lg:block 2xl:w-[1400px]">
          <LeftSide />
        </div>
        <form className="  flex w-full flex-col gap-3 px-5 pt-20 md:px-32 lg:justify-center lg:pt-0">
          <div className=" mb-8 flex justify-center lg:hidden">
            <Image src={Logo} alt="" className="w-24" />
          </div>
          <h1 className=" font-museo-sans-rounded-700 text-2xl">Sign In</h1>
          <p className="mb-3">Sign in to access your dashboard</p>
          <label htmlFor="email">
            <p className=" pb-1 font-museo-sans-rounded-300 text-sm">Email</p>
            <input
              onChange={onChange}
              value={data.email}
              name="email"
              required
              type="email"
              placeholder="johndosunmi@abcmail.com"
              className="w-full rounded border border-[#A7A6A6] bg-[#F8F5F5] p-2 md:w-[300px]"
            />
          </label>
          <div className="h-1"></div>
          <label htmlFor="pin">
            <p className=" pb-1 font-museo-sans-rounded-300 text-sm">Pin</p>
            <input
              onChange={onChange}
              value={data.pin}
              name="pin"
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
            onClick={handleSubmit}
            disabled={
              isLoading ||
              !data.email ||
              !data.pin ||
              data.pin.length !== 6 ||
              !data.pin.match(/^[0-9]*$/)
            }
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-md border bg-getly-primary py-2 disabled:cursor-not-allowed disabled:opacity-30 md:w-[120px]"
          >
            <p>Sign in</p>
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
              Forgot your pin?{" "}
              <Link className="ml-1 font-bold text-[#4444EE]" href={"/reset"}>
                Reset pin
              </Link>
            </p>
            <p className="flex gap-1 pt-5 text-sm">
              Don’t have an account?{" "}
              <Link
                className="ml-1 flex items-center gap-2 font-bold text-[#4444EE]"
                href={"/register"}
              >
                Create One{" "}
                <svg
                  className=" h-4 w-4 stroke-[#4444EE]"
                  viewBox="0 0 16 17"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3.33331 8.5H12.6666"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8 3.83203L12.6667 8.4987L8 13.1654"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </p>
          </div>
        </form>
      </main>
    </>
  );
};

export default Home;
