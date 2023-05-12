import type { KeyboardEvent } from "react";
import React, { useEffect, useRef, useState } from "react";
import { c } from "../utils/html-class";

type PinInputProps = {
  Pin: string;
  hidden?: boolean;
  setPin(data: string): void;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  //
};

const PinInput: React.FC<PinInputProps> = ({
  setPin,
  hidden,
  disabled,
  error,
  className,
}) => {
  const pinRef1 = useRef<HTMLInputElement>(null);
  const pinRef2 = useRef<HTMLInputElement>(null);
  const pinRef3 = useRef<HTMLInputElement>(null);
  const pinRef4 = useRef<HTMLInputElement>(null);
  const pinRef5 = useRef<HTMLInputElement>(null);
  const pinRef6 = useRef<HTMLInputElement>(null);

  const [pin1, setPin1] = useState("");
  const [pin2, setPin2] = useState("");
  const [pin3, setPin3] = useState("");
  const [pin4, setPin4] = useState("");
  const [pin5, setPin5] = useState("");
  const [pin6, setPin6] = useState("");
  const [Error, setError] = useState(false);

  useEffect(() => {
    if (error) {
      setError(true);
      return;
    }
    setError(false);
  }, [error]);

  useEffect(() => {
    if (pin1 && pin2 && pin3 && pin4 && pin5 && pin6) {
      const pin = pin1 + pin2 + pin3 + pin4 + pin5 + pin6;
      setPin(pin);
      return;
    }
    setPin("");
  }, [pin1, pin2, pin3, pin4, pin5, pin6, setPin]);

  return (
    <div
      className={`flex w-full justify-center text-sm lg:text-base ${className}`}
    >
      <input
        placeholder="-"
        disabled={disabled}
        autoFocus
        maxLength={1}
        value={!hidden ? pin1 : "●".repeat(pin1.length)}
        ref={pinRef1}
        type="tel"
        inputMode="numeric"
        className={c(
          " mr-3 aspect-square h-11 w-11 rounded-lg border text-center placeholder:text-center focus:border-getly-blue focus:outline-0 focus:ring-0 disabled:cursor-none disabled:opacity-50 lg:h-14 lg:w-14",
          Error && "border border-getly-red"
        )}
        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
          if (e.key === "Backspace") {
            setPin1("");
          }
        }}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          if (pin1) {
            return;
          }
          setPin1(e.target.value);
          pinRef2.current?.focus();
        }}
      />
      <input
        placeholder="-"
        disabled={disabled}
        type="tel"
        maxLength={1}
        ref={pinRef2}
        value={!hidden ? pin2 : "●".repeat(pin2.length)}
        // value={pin2}
        inputMode="numeric"
        className={c(
          " mr-3 aspect-square h-11 w-11 rounded-lg border text-center placeholder:text-center focus:border-getly-blue focus:outline-0 focus:ring-0 disabled:cursor-none disabled:opacity-50 lg:h-14 lg:w-14",
          Error && "border border-getly-red"
        )}
        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
          if (e.key === "Backspace") {
            setPin2("");
            pinRef1.current?.focus();
          }
        }}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          if (pin2) {
            return;
          }
          setPin2(e.target.value);
          pinRef3.current?.focus();
        }}
      />
      <input
        placeholder="-"
        disabled={disabled}
        type="tel"
        maxLength={1}
        ref={pinRef3}
        value={!hidden ? pin3 : "●".repeat(pin3.length)}
        inputMode="numeric"
        className={c(
          " mr-3 aspect-square h-11 w-11 rounded-lg border text-center placeholder:text-center focus:border-getly-blue focus:outline-0 focus:ring-0 disabled:cursor-none disabled:opacity-50 lg:h-14 lg:w-14",
          Error && "border border-getly-red"
        )}
        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
          if (e.key === "Backspace") {
            setPin3("");
            pinRef2.current?.focus();
          }
        }}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          if (pin3) {
            return;
          }
          setPin3(e.target.value);
          pinRef4.current?.focus();
        }}
      />
      <input
        placeholder="-"
        disabled={disabled}
        type="tel"
        maxLength={1}
        ref={pinRef4}
        value={!hidden ? pin4 : "●".repeat(pin4.length)}
        inputMode="numeric"
        className={c(
          " mr-3 aspect-square h-11 w-11 rounded-lg border text-center placeholder:text-center focus:border-getly-blue focus:outline-0 focus:ring-0 disabled:cursor-none disabled:opacity-50 lg:h-14 lg:w-14",
          Error && "border border-getly-red"
        )}
        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
          if (e.key === "Backspace") {
            setPin4("");
            pinRef3.current?.focus();
          }
        }}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          if (pin4) {
            return;
          }
          setPin4(e.target.value);
          pinRef5.current?.focus();
        }}
      />
      <input
        placeholder="-"
        disabled={disabled}
        type="tel"
        maxLength={1}
        ref={pinRef5}
        value={!hidden ? pin5 : "●".repeat(pin5.length)}
        inputMode="numeric"
        className={c(
          " mr-3 aspect-square h-11 w-11 rounded-lg border text-center placeholder:text-center focus:border-getly-blue focus:outline-0 focus:ring-0 disabled:cursor-none disabled:opacity-50 lg:h-14 lg:w-14",
          Error && "border border-getly-red"
        )}
        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
          if (e.key === "Backspace") {
            setPin5("");
            pinRef4.current?.focus();
          }
        }}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          if (pin5) {
            return;
          }
          setPin5(e.target.value);
          pinRef6.current?.focus();
        }}
      />
      <input
        placeholder="-"
        disabled={disabled}
        type="tel"
        maxLength={1}
        ref={pinRef6}
        value={!hidden ? pin6 : "●".repeat(pin6.length)}
        inputMode="numeric"
        className={c(
          " mr-3 aspect-square h-11 w-11 rounded-lg border text-center placeholder:text-center focus:border-getly-blue focus:outline-0 focus:ring-0 disabled:cursor-none disabled:opacity-50 lg:h-14 lg:w-14",
          Error && "border border-getly-red"
        )}
        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
          if (e.key === "Backspace") {
            setPin6("");
            pinRef5.current?.focus();
          }
        }}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          if (pin6) {
            return;
          }
          setPin6(e.target.value);
        }}
      />
    </div>
  );
};
export default PinInput;
