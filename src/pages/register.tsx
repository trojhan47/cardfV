import { signIn } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "react-toastify";
import { useRecoilState, useRecoilValue } from "recoil";
import LeftSide from "../components/LeftSide";
import StepOne from "../components/SignUp/StepOne";
import StepThree from "../components/SignUp/StepThree";
import StepTwo from "../components/SignUp/StepTwo";
import Logo from "../images/logo.png";
import { OtpState, OtpVerificationState, RegisterState } from "../recoil/atom";
import { api } from "../utils/api";

function Register() {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [data, setData] = useRecoilState(RegisterState);
  const otp = useRecoilValue(OtpState);
  const [otpVerify, setOtpVerify] = useRecoilState(OtpVerificationState);
  const { mutateAsync: verifyOtp, isLoading: verifyOtpLoading } =
    api.register.verifyOtp.useMutation();

  const { mutateAsync: sendOtp, isLoading: sendOtpLoading } =
    api.register.sendOtp.useMutation();

  const isNumber = (n: any) => {
    return (
      (typeof n === "number" || (typeof n === "string" && n.trim() !== "")) &&
      !isNaN(n as number)
    );
  };

  const isEmail = (email: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  return (
    <>
      <Head>
        <title>Getly | Sign up</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className=" flex h-screen font-museo-sans-rounded-500 text-[#494949] lg:overflow-y-hidden">
        <div className="hidden w-[900px] lg:block 2xl:w-[1400px]">
          <LeftSide />
        </div>
        <div className="  mt-8 flex w-full flex-col gap-3 px-5 md:px-32 lg:overflow-y-auto">
          <div className=" mb-8 flex justify-center lg:hidden">
            <Image src={Logo} alt="" className="w-24" />
          </div>
          <h1 className=" font-museo-sans-rounded-700 text-2xl">
            Create Account
          </h1>
          <p className="mb-3">Kindly fill in the details below</p>
          <div className="flex w-full justify-between border-b border-black">
            <button
              className={
                step === 1 ? "border-b-2 border-getly-primary px-2" : "px-2"
              }
            >
              Basic Information
            </button>
            <button
              className={
                step === 2 ? "border-b-2 border-getly-primary px-2" : "px-2"
              }
            >
              Verify Phone
            </button>
            <button
              className={
                step === 3 ? "border-b-2 border-getly-primary px-2" : "px-2"
              }
            >
              Set PIN
            </button>
          </div>
          {step === 1 && (
            <div className="flex flex-col gap-3">
              <StepOne />
              <button
                onClick={() => {
                  const id = toast.loading("Please wait...");
                  if (data.phoneNumber.length != 11) {
                    toast.update(id, {
                      render: "Phone number must be 11 digits",
                      type: "error",
                      isLoading: false,
                      autoClose: 2000,
                    });
                    return;
                  }
                  if (!isNumber(data.phoneNumber)) {
                    toast.update(id, {
                      render: "Phone number must be numbers",
                      type: "error",
                      isLoading: false,
                      autoClose: 2000,
                    });
                    return;
                  }
                  if (data.phoneNumber[0] != "0") {
                    toast.update(id, {
                      render: "Phone number must start with 0",
                      type: "error",
                      isLoading: false,
                      autoClose: 2000,
                    });
                    return;
                  }
                  if (data.state === "Select state") {
                    toast.update(id, {
                      render: "Please select a state",
                      type: "error",
                      isLoading: false,
                      autoClose: 2000,
                    });
                    return;
                  }
                  if (!isEmail(data.email)) {
                    toast.update(id, {
                      render: "Please enter a valid email",
                      type: "error",
                      isLoading: false,
                      autoClose: 2000,
                    });
                    return;
                  }
                  if (data.userType === "COMPANY" && !data.companyName) {
                    toast.update(id, {
                      render: "Please enter a company name",
                      type: "error",
                      isLoading: false,
                      autoClose: 2000,
                    });
                    return;
                  }
                  if (data.userType === "COMPANY" && !data.companyCac) {
                    toast.update(id, {
                      render: "Please enter a company CAC number",
                      type: "error",
                      isLoading: false,
                      autoClose: 2000,
                    });
                    return;
                  }

                  if (data.userType === "COMPANY" && !data.companyCac) {
                    toast.update(id, {
                      render: "Please enter a company CAC number",
                      type: "error",
                      isLoading: false,
                      autoClose: 2000,
                    });
                    return;
                  }

                  if (data.userType === "COMPANY" && !data.companyName) {
                    toast.update(id, {
                      render: "Please enter a company CAC name",
                      type: "error",
                      isLoading: false,
                      autoClose: 2000,
                    });
                    return;
                  }

                  if (data.userType === "COMPANY" && !data.cacVerified) {
                    toast.update(id, {
                      render: "Please verify your CAC",
                      type: "error",
                      isLoading: false,
                      autoClose: 2000,
                    });

                    return;
                  }

                  sendOtp({
                    phoneNumber: data.phoneNumber,
                  })
                    .then((res) => {
                      if (res.status === 200) {
                        toast.update(id, {
                          render: "OTP sent successfully",
                          type: "success",
                          isLoading: false,
                          autoClose: 2000,
                        });
                        setOtpVerify({ ...otpVerify, pinId: res.pinId });
                        setStep(2);
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
                }}
                disabled={
                  !data.firstName ||
                  !data.lastName ||
                  !data.dob ||
                  !data.phoneNumber ||
                  !data.email ||
                  !data.address1 ||
                  !data.country ||
                  !data.city ||
                  !data.postalCode ||
                  !data.state ||
                  sendOtpLoading
                }
                className="my-8 flex w-full items-center justify-center gap-2 rounded-md border bg-getly-primary py-2 disabled:cursor-not-allowed disabled:opacity-30 lg:w-20"
              >
                <p>Next</p>
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
            </div>
          )}
          {step === 2 && (
            <div className="flex flex-col gap-3">
              <StepTwo />
              <button
                onClick={() => {
                  const id = toast.loading("Verifying OTP...");
                  verifyOtp({
                    pin: otp,
                    pin_id: otpVerify.pinId,
                  })
                    .then((res) => {
                      if (res.verified) {
                        toast.update(id, {
                          render: "OTP verified successfully",
                          type: "success",
                          isLoading: false,
                          autoClose: 2000,
                        });
                        setOtpVerify({ ...otpVerify, verified: true });
                        setOtpVerify({ ...otpVerify, error: false });
                        setStep(3);
                        return;
                      }
                    })
                    .catch(() => {
                      toast.update(id, {
                        render: "Invalid OTP",
                        type: "error",
                        isLoading: false,
                        autoClose: 2000,
                      });
                      setOtpVerify({ ...otpVerify, error: true });
                    });
                }}
                disabled={otp.length !== 6 || verifyOtpLoading}
                className="my-8 flex w-full items-center justify-center gap-2 rounded-md border bg-getly-primary py-2 disabled:cursor-not-allowed disabled:opacity-30 lg:w-32"
              >
                <p>Verify</p>
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
            </div>
          )}
          {step === 3 && (
            <div className="flex flex-col gap-3">
              <StepThree />
            </div>
          )}

          <div>
            <p className="flex gap-2 py-3 text-sm">
              Already have an account?
              <Link
                className="flex items-center gap-1 font-bold text-[#4444EE]"
                href={"/"}
              >
                Sign In
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
        </div>
      </main>
    </>
  );
}

export default Register;
