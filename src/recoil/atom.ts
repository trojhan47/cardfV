import { atom } from "recoil";
import type { RegisterProps } from "../types/interfaces";

export const RegisterState = atom<RegisterProps>({
  key: "register",
  default: {
    userType: "INDIVIDUAL",
    companyName: "",
    companyCac: "",
    firstName: "",
    lastName: "",
    dob: "",
    phoneNumber: "",
    email: "",
    address1: "",
    address2: "",
    city: "",
    postalCode: "",
    state: "",
    country: "Nigeria",
    bvn: "",
    pin: "",
    cacVerified: false,
    storePersonalData: false,
  recieveCommunications: false,
  },
});
export const OtpState = atom<string>({
  key: "otp",
  default: "",
});
export const BvnVerificatonModalState = atom<boolean>({
  key: "bvnverificationmodal",
  default: false,
});

export const OtpVerificationState = atom<{
  pinId: string;
  verified: boolean;
  error: boolean;
}>({
  key: "otpverification",
  default: {
    pinId: "",
    verified: false,
    error: false,
  },
});
