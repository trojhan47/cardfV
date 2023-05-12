import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRecoilState } from "recoil";
import { RegisterState } from "../../recoil/atom";
import { api } from "../../utils/api";
import PinInput from "../PinInput";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";

function StepThree() {
  const [data, setData] = useRecoilState(RegisterState);
  const [Pin, setPin] = useState("");
  useEffect(() => {
    setData({ ...data, pin: Pin });
  }, [Pin]);

  const { mutateAsync, isLoading } = api.register.signUp.useMutation();
  const { mutate: mailSubscription } = api.register.subSender.useMutation();

  const router = useRouter();

  return (
    <div className=" mt-8 flex flex-col items-center gap-6">
      <h1 className="font-museo-sans-rounded-300">
        Set a 6 digit account security PIN
      </h1>
      <PinInput Pin={Pin} setPin={setPin} />
      <button
        onClick={() => {
          const id = toast.loading("Creating account...");
          mutateAsync({ ...data })
            .then((res) => {
              if (res.code === 200) {
                mailSubscription({
                  email: data.email,
                  firstname: data.firstName,
                  lastname: data.lastName,
                  recieveCommunications: data.recieveCommunications,
                  storePersonalData: data.storePersonalData,
                });
                signIn("credentials", {
                  email: data.email,
                  pin: data.pin,
                  redirect: false,
                })
                  .then((res) => {
                    if (res?.error) {
                      toast.update(id, {
                        render: "Something went wrong",
                        type: "error",
                        isLoading: false,
                        autoClose: 2000,
                      });
                    } else {
                      toast.update(id, {
                        render: "Account created",
                        type: "success",
                        isLoading: false,
                        autoClose: 2000,
                      });
                      router.push("/dashboard");
                    }
                  })
                  .catch((err) => {
                    toast.update(id, {
                      render: "Something went wrong",
                      type: "error",
                      isLoading: false,
                      autoClose: 2000,
                    });
                  });
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
        disabled={data.pin?.length < 6 || isLoading}
        className="my-8 flex w-full items-center justify-center gap-2 rounded-md border bg-getly-primary py-2 disabled:cursor-not-allowed disabled:opacity-30 lg:w-48"
      >
        <p>Create Account</p>
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
  );
}

export default StepThree;
