import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  OtpState,
  OtpVerificationState,
  RegisterState,
} from "../../recoil/atom";
import { api } from "../../utils/api";
import PinInput from "../PinInput";

function StepTwo() {
  const data = useRecoilValue(RegisterState);

  const { mutateAsync: sendOtp, isLoading: sendOtpLoading } =
    api.register.sendOtp.useMutation();
  const [otp, setOtp] = useRecoilState(OtpState);
  const [otpVerify, setOtpVerify] = useRecoilState(OtpVerificationState);

  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const myInterval = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1);
      }
      if (seconds === 0) {
        if (minutes === 0) {
          clearInterval(myInterval);
        } else {
          setMinutes(minutes - 1);
          setSeconds(59);
        }
      }
    }, 1000);
    return () => {
      clearInterval(myInterval);
    };
  }, [minutes, seconds]);

  return (
    <div className=" mt-8 flex flex-col items-center gap-6">
      <h1 className="font-museo-sans-rounded-300">
        Enter the 6-digit code sent to your phone number
      </h1>
      <PinInput Pin={otp} error={otpVerify.error} setPin={setOtp} />
      <div className="flex gap-2">
        <button
          onClick={() => {
            const id = toast.loading("Verifying OTP...");
            sendOtp({
              phoneNumber: data.phoneNumber,
            })
              .then((res) => {
                if (res.status === 200) {
                  toast.update(id, {
                    render: "OTP sent",
                    type: "success",
                    isLoading: false,
                    autoClose: 2000,
                  });
                  setOtp("");
                  setOtpVerify({
                    error: false,
                    pinId: res.pinId,
                    verified: false,
                  });
                  setMinutes(5);
                  return;
                }
                setOtpVerify({ ...otpVerify, error: false });
              })
              .catch(() => {
                toast.update(id, {
                  render: "Something went wrong",
                  type: "error",
                  isLoading: false,
                  autoClose: 2000,
                });
              });
          }}
          disabled={seconds > 0 || minutes > 0 || sendOtpLoading}
          className="disabled:opacity-40"
        >
          Resend OTP{" "}
        </button>
        {(seconds > 0 || minutes > 0) && (
          <p>
            {minutes}:{seconds}
          </p>
        )}
      </div>
    </div>
  );
}

export default StepTwo;
