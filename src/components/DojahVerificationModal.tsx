/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { BvnVerificatonModalState } from "@/recoil/atom";
import { api } from "@/utils/api";
import { Transition, Dialog } from "@headlessui/react";
import { useRouter } from "next/router";
import React, { Fragment, useState } from "react";
import { toast } from "react-toastify";
import { useRecoilState } from "recoil";
import { signOut } from "next-auth/react";
import WebcamMode from "./WebCam";

function DojahVerificationModal() {
  const [bvnVerificationModalState, setBvnVerificationModalState] =
    useRecoilState(BvnVerificatonModalState);

  const [bvnVerificationStep, setBvnVerificationStep] = useState(0);
  const router = useRouter();

  const [bvn, setbvn] = useState<string>("");
  const [selfie, setselfie] = useState<string>("");
  const {
    // using mutateasync so that we can await response and do something with it in the handle submit function.
    mutateAsync: BVNMutate,
    error: BVNError,
  } = api.dojah.bvnselfie.useMutation();

  const handleSubmit = async () => {
    // console.log(selfie);
    const selfie_image = selfie.replace(/^data:image\/jpeg;base64,/, "");
    const data = {
      bvn,
      selfie_image,
    };
    const id = toast.loading("verifying, please wait...");
    // console.log(data);

    await BVNMutate(data)
      .then((res) => {
        toast.update(id, {
          render: "verification successful",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        setbvn("");
        setselfie("");
        setBvnVerificationModalState(false);
        setBvnVerificationStep(0);
      })
      .catch((error) => {
        toast.update(id, {
          render: "verification failed, please try again",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
        setbvn("");
        setselfie("");
        setBvnVerificationStep(0);
      });
  };

  // if()

  return (
    <>
      <Transition.Root appear show={bvnVerificationModalState} as={Fragment}>
        <Dialog
          onClose={setBvnVerificationModalState}
          className=" fixed inset-0 z-[60] overflow-y-auto "
        >
          <Transition.Child
            enter=" duration-1000 "
            enterFrom=" opacity-0  duration-1000  "
            enterTo=" opacity-100  "
            leave="  duration-500   "
            leaveFrom=" opacity-100  "
            leaveTo="opacity-0   "
          >
            <Dialog.Overlay className="fixed inset-0 flex place-content-center items-center backdrop-blur">
              <div
                // className="fixed bottom-0 w-full  lg:top-[25%] lg:w-[500px]"
                className="fixed top-[50%] w-full translate-y-[-50%] md:w-[500px]"
              >
                <div
                  className={`relative flex flex-col rounded-t-2xl border-2 bg-getly-background p-4 lg:rounded-xl ${
                    bvnVerificationStep === 0 && " h-[250px] lg:h-[260px]"
                  }`}
                >
                  <div className=" flex w-full justify-end pt-3 lg:py-4">
                    <button
                      onClick={() => {
                        setBvnVerificationModalState(false);
                        setBvnVerificationStep(0);
                        setbvn("");
                        setselfie("");
                      }}
                      className=" "
                    >
                      <svg
                        className="mr-5 h-6 w-6 fill-current"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                      >
                        <path fill="none" d="M0 0h24v24H0z" />
                        <path d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z" />
                      </svg>
                    </button>
                  </div>
                  {bvnVerificationStep === 0 && (
                    <div className="flex flex-col">
                      <span className=" text-center">BVN verification</span>
                      <div className="mt-4 flex flex-col gap-1">
                        <p className="font-museo-sans-rounded-300 text-sm">
                          BVN
                        </p>
                        <input
                          name="bvn"
                          value={bvn}
                          onChange={(e) => setbvn(e.target.value)}
                          type="tel"
                          className=" rounded border py-1 px-4 focus:outline-none"
                        />
                      </div>
                      <button
                        disabled={
                          bvn === "" ||
                          bvn.length < 11 ||
                          bvn.length > 11 ||
                          !bvn.match(/^[0-9]*$/)
                        }
                        onClick={() => setBvnVerificationStep(1)}
                        className="mt-4 rounded-lg bg-getly py-2 disabled:opacity-40 "
                      >
                        Take Selfie
                      </button>
                    </div>
                  )}

                  {bvnVerificationStep === 1 && (
                    <div className="flex flex-col">
                      {/* <span className=" text-center">Take Selfie</span> */}
                      <WebcamMode
                        setselfie={setselfie}
                        setPage={setBvnVerificationStep}
                      />
                    </div>
                  )}
                  {bvnVerificationStep === 2 && (
                    <div className="flex flex-col">
                      <span className=" text-center">Confirm </span>

                      <p className="my-4 font-semibold ">Bvn: {bvn}</p>
                      <img src={selfie} className="" />

                      <button
                        onClick={handleSubmit}
                        className="mt-4 w-full rounded-lg bg-getly py-2 disabled:opacity-40"
                      >
                        Submit
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </Dialog.Overlay>
          </Transition.Child>
        </Dialog>
      </Transition.Root>
    </>
  );
}

export default DojahVerificationModal;
