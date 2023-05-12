import { env } from "@/env.mjs";
import { api } from "@/utils/api";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import CardBg from "~images/cardbg.png";

interface CardProps {
  brand: string;
  expiryMonth: string;
  expiryYear: string;
  currency: string;
  cardColor: string;
  textColor: string;
  bglogoColor: string;
  logoColor: string;
  name: string;
  cardId: string;
}

function RevealedCard({
  cardId,
  brand,
  currency,
  cardColor,
  bglogoColor,
  logoColor,
  name,
  textColor,
  expiryMonth,
  expiryYear,
}: CardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const cardNumberRef = useRef<HTMLDivElement | null>(null);
  const cardCvvRef = useRef<HTMLDivElement | null>(null);
  const cardPinRef = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { data } = api.cards.getCardToken.useQuery({
    id: cardId,
  });

  useEffect(() => {
    if (!data) return;
    try {
      const show = window.VGSShow.create(env.NEXT_PUBLIC_SUDO_VAULT_ID);
      const headers = { Authorization: "Bearer " + data.data.token };

      const cardNumber = show.request({
        name: "cardNoIframe",
        method: "GET",
        headers,
        path: "/cards/" + cardId + "/secure-data/number",
        htmlWrapper: "text",
        jsonPathSelector: "data.number",
        serializers: [
          show.SERIALIZERS.replace(
            "(\\d{4})(\\d{4})(\\d{4})(\\d{4})",
            "$1 $2 $3 $4"
          ),
        ],
      });

      cardNumber.render(cardNumberRef.current, {
        "font-family": "popins",
        "@font-face": {
          "font-family": "popins",
          "font-style": "normal",
          "font-weight": "400",
          "font-display": "swap",
          src: 'local("popins"), local("popins-Regular")          url(https://fonts.gstatic.com/s/popins/v11/8QIJdijAiM7o-qnZuIgOq7jk.woff2) format("woff2")',
          "unicode-range": "U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116",
        },
        width: "100%",
        height: "100%",
        "letter-spacing": "0.1em",
        color: textColor,
      });

      cardNumber.on("revealSuccess", () => {
        setIsLoading(false);
      });

      const cardCvv = show.request({
        name: "cardCvvIframe",
        method: "GET",
        headers,
        path: "/cards/" + cardId + "/secure-data/cvv2",
        htmlWrapper: "text",
        jsonPathSelector: "data.cvv2",
      });

      cardCvv.render(cardCvvRef.current, {
        "font-family": "popins",
        "@font-face": {
          "font-family": "popins",
          "font-style": "normal",
          "font-weight": "400",
          "font-display": "swap",
          src: 'local("popins"), local("popins-Regular")          url(https://fonts.gstatic.com/s/popins/v11/8QIJdijAiM7o-qnZuIgOq7jk.woff2) format("woff2")',
          "unicode-range": "U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116",
        },
        width: "100%",
        height: "100%",
        "letter-spacing": "0.1em",
        // color: cardColor,
        // color: cardColor ? cardColor : "black",
        color: textColor,
      });
      const cardPin = show.request({
        name: "cardPinIframe",
        method: "GET",
        headers,
        path: "/cards/" + cardId + "/secure-data/defaultPin",
        htmlWrapper: "text",
        jsonPathSelector: "data.defaultPin",
      });

      cardPin.render(cardPinRef.current, {
        "font-family": "popins",
        "@font-face": {
          "font-family": "popins",
          "font-style": "normal",
          "font-weight": "400",
          "font-display": "swap",
          src: 'local("popins"), local("popins-Regular")          url(https://fonts.gstatic.com/s/popins/v11/8QIJdijAiM7o-qnZuIgOq7jk.woff2) format("woff2")',
          "unicode-range": "U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116",
        },
        width: "100%",
        height: "100%",
        "letter-spacing": "0.1em",
        color: textColor,
      });
    } catch (error) {
      console.error("failed to load card");
    }
  }, [data]);

  return (
    <div className="">
      <button
        className="font-museo-sans-rounded-500 "
        onClick={() => {
          setIsFlipped(!isFlipped);
        }}
      >
        Flip card
      </button>
      <div className=" h-[250px] w-auto bg-transparent [perspective:1000px] ">
        <div
          className={`relative h-full w-full rounded-xl shadow-2xl transition-all duration-500 [transform-style:preserve-3d] ${
            isFlipped && "[transform:rotateY(180deg)]"
          } `}
        >
          {/* front */}
          <div
            style={{
              backgroundColor: cardColor ? cardColor : "black",
              color: textColor ? textColor : "whitesmoke",
            }}
            className=" absolute inset-0 overflow-hidden rounded-xl px-5 py-6"
          >
            <svg
              style={{ fill: logoColor ? logoColor : "whitesmoke" }}
              className="h-10 w-16 fill-getly-yellow"
              viewBox="0 0 67 39"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M15.3612 17.9833L13.4359 31.2011C13.0524 33.7929 12.2334 35.6647 10.979 36.8166C9.72392 37.9684 7.94702 38.5443 5.64828 38.5443C4.67024 38.5357 3.69818 38.3903 2.76024 38.1124C1.80499 37.8464 0.891119 37.4491 0.0446777 36.9317L1.42401 34.1672C2.87965 34.9736 4.25901 35.3767 5.56208 35.3767C6.59654 35.3767 7.44906 35.1223 8.11962 34.6136C8.78993 34.1047 9.23055 33.1304 9.44148 31.6907L9.67134 30.1069C9.14333 30.718 8.51083 31.23 7.80351 31.6187C7.11572 31.9926 6.3446 32.1858 5.56212 32.1802C3.99105 32.1802 2.76975 31.6475 1.89822 30.582C1.02622 29.5165 0.590386 28.0911 0.59072 26.3056C0.592785 24.721 0.900128 23.1516 1.49588 21.6837C2.08536 20.195 3.07511 18.8992 4.35519 17.9402C5.65771 16.9516 7.31484 16.4573 9.32659 16.4571C11.4338 16.4523 13.5086 16.9771 15.3612 17.9833ZM6.71156 20.4599C6.01829 21.1902 5.51496 22.0803 5.24594 23.0516C4.9406 24.0796 4.78572 25.1466 4.78613 26.2192C4.78613 28.1392 5.45668 29.0991 6.79776 29.099C7.87042 29.099 8.95282 28.3406 10.045 26.824L11.1369 19.7688C10.5317 19.5363 9.88849 19.4191 9.24034 19.4232C8.77004 19.41 8.30218 19.4954 7.86672 19.674C7.43126 19.8525 7.03781 20.1202 6.71156 20.4599Z" />
              <path d="M27.8742 24.8226C26.0827 25.7152 23.7119 26.3056 20.7619 26.5936C20.8576 28.5712 21.8059 29.5599 23.6069 29.5597C24.2642 29.562 24.9165 29.4449 25.5322 29.2141C26.2398 28.9341 26.9144 28.5768 27.5437 28.1486L29.0381 30.6251C27.1796 31.9691 25.2063 32.6411 23.1183 32.641C21.03 32.641 19.4351 32.0698 18.3337 30.9275C17.2319 29.7855 16.6811 28.2257 16.6814 26.248C16.6854 24.691 16.9777 23.1482 17.5435 21.6981C18.1035 20.2206 19.0578 18.9257 20.3021 17.9545C21.5666 16.9565 23.1759 16.4573 25.1299 16.457C26.8541 16.457 28.1903 16.8458 29.1386 17.6233C30.087 18.4008 30.5611 19.3847 30.5611 20.575C30.5611 22.5143 29.6655 23.9301 27.8742 24.8226ZM25.1442 22.922C26.0351 22.3559 26.4806 21.6312 26.4806 20.7478C26.4882 20.3652 26.3494 19.9943 26.0926 19.7111C25.834 19.4231 25.4173 19.2791 24.8425 19.2792C24.3321 19.2653 23.8265 19.3823 23.3739 19.6192C22.9213 19.8561 22.5366 20.2049 22.2563 20.6327C21.6241 21.5353 21.193 22.6584 20.9631 24.0019C22.8597 23.8485 24.2534 23.4885 25.1442 22.922Z" />
              <path d="M37.1703 27.3692C37.1316 27.7535 37.1125 27.9935 37.1128 28.0891C37.1128 28.5499 37.2086 28.8763 37.4001 29.0683C37.5915 29.2604 37.8789 29.3564 38.2623 29.3562C38.7602 29.3562 39.3732 29.1835 40.1014 28.8379L41.1933 31.516C40.5896 31.8852 39.9365 32.1664 39.2536 32.3511C38.5942 32.5373 37.9128 32.6342 37.2277 32.6391C35.8673 32.6391 34.828 32.2792 34.1099 31.5592C33.3915 30.8393 33.0322 29.8074 33.0322 28.4636C33.0345 28.0876 33.0633 27.7123 33.1184 27.3404L34.1817 19.8244H31.9402L32.3425 16.9159H34.7564L35.7047 13.0859H39.1243L38.6071 16.9159H42.113L41.2795 19.8244H38.2047L37.1703 27.3692Z" />
              <path d="M47.1992 28.3484L47.1705 28.6651C47.1705 29.1259 47.3908 29.3563 47.8314 29.3563C48.1056 29.352 48.3773 29.3034 48.636 29.2123L49.182 32.092C48.3265 32.4514 47.4085 32.6374 46.4808 32.6392C45.3888 32.6392 44.5506 32.356 43.9663 31.7896C43.3817 31.2236 43.0896 30.3933 43.0898 29.2987C43.0917 28.9705 43.1205 28.6431 43.176 28.3196L45.6474 11.7383H49.6993L47.1992 28.3484Z" />
              <path d="M58.9524 32.2667C58.0904 34.1862 56.9218 35.6692 55.4467 36.7158C53.9712 37.762 52.1033 38.362 49.843 38.5156L49.728 35.5784C51.203 35.3863 52.3238 35.0407 53.0903 34.5417C53.8562 34.0422 54.5459 33.2551 55.1592 32.1804C54.7576 32.1804 54.369 32.0377 54.0624 31.7777C53.7558 31.5178 53.551 31.1573 53.4845 30.7604L51.1649 16.918H55.3892L56.6536 29.4447L61.5389 16.918H65.7632L58.9524 32.2667Z" />
              <path d="M62.203 7.43627C60.858 8.05207 59.7768 9.12923 59.1544 10.4735C58.5322 9.1291 57.4509 8.05188 56.1057 7.43627C57.4506 6.81988 58.5317 5.74262 59.1544 4.39844C59.7772 5.7425 60.8583 6.81971 62.203 7.43627Z" />
              <path d="M59.1544 14.6251C57.4993 14.6242 55.8953 14.0499 54.6143 12.9995C53.3333 11.9492 52.454 10.4874 52.1253 8.86178C51.7967 7.23617 52.0389 5.54668 52.8109 4.07952C53.5829 2.61236 54.8373 1.45773 56.3616 0.811246C58.1134 0.0767018 60.0843 0.0679002 61.8426 0.786769C63.6008 1.50564 65.0031 2.89357 65.7421 4.6465C66.4811 6.39943 66.4967 8.37444 65.7854 10.1389C65.0741 11.9033 63.694 13.3133 61.9473 14.0599C61.0638 14.4347 60.1139 14.6269 59.1544 14.6251ZM59.1544 1.5385C57.9906 1.5385 56.8528 1.88435 55.8851 2.53233C54.9173 3.18031 54.1631 4.10131 53.7177 5.17885C53.2723 6.2564 53.1557 7.44211 53.3828 8.58603C53.6099 9.72995 54.1703 10.7807 54.9933 11.6054C56.0969 12.7113 57.5937 13.3326 59.1544 13.3326C60.7152 13.3326 62.212 12.7113 63.3156 11.6054C64.4191 10.4995 65.0391 8.99957 65.0391 7.43556C65.0391 5.87156 64.4191 4.37162 63.3156 3.26571C62.7704 2.71639 62.1219 2.2809 61.4076 1.98442C60.6934 1.68794 59.9275 1.53638 59.1544 1.5385Z" />
            </svg>
            <svg
              className="mt-5 h-8 w-10"
              viewBox="0 0 45 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="1.1582"
                y="31.3672"
                width="30.8955"
                height="42.4813"
                rx="4"
                transform="rotate(-89.8398 1.1582 31.3672)"
                fill="url(#paint0_linear_4268_3302)"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M29.4166 -0.0916227L22.6457 6.19289L15.9102 -0.15584L15.3564 0.358793L22.2534 6.86024L22.2436 10.3612L15.9952 10.3315L15.2142 10.3278L-1.96877 10.2461L-1.97081 10.9767L15.2121 11.0584L15.1835 21.2865L-1.9994 21.2048L-2.00145 21.9354L15.1815 22.0171L15.9625 22.0208L22.2109 22.0505L22.2011 25.5522L15.268 31.9874L15.8189 32.5067L22.5898 26.2219L29.3253 32.571L29.8791 32.0569L22.9821 25.5559L22.9919 22.0542L29.2403 22.0839L30.0213 22.0876L47.2043 22.1693L47.2063 21.4388L30.0234 21.3571L30.052 11.1289L47.2349 11.2106L47.2369 10.48L29.6635 10.3965C29.4478 10.3954 29.2725 10.5581 29.2719 10.7599L29.2423 21.3533L22.6035 21.3218L15.9646 21.2902L15.9932 11.0621L22.632 11.0936C22.8478 11.0947 23.023 10.932 23.0236 10.7302L23.0344 6.86395L29.9675 0.428263L29.4166 -0.0916227Z"
                fill="#47453F"
              />
              <rect
                x="1.1582"
                y="31.3672"
                width="30.8955"
                height="42.4813"
                rx="4"
                transform="rotate(-89.8398 1.1582 31.3672)"
                stroke="#47453F"
                strokeWidth="0.6"
              />
              <defs>
                <linearGradient
                  id="paint0_linear_4268_3302"
                  x1="1.40736"
                  y1="31.3672"
                  x2="52.5573"
                  y2="76.0166"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#F8ECC1" />
                  <stop offset="1" stopColor="#C8AC48" />
                </linearGradient>
                <clipPath id="clip0_4268_3302">
                  <rect
                    x="1.1582"
                    y="31.3672"
                    width="30.8955"
                    height="42.4813"
                    rx="4"
                    transform="rotate(-89.8398 1.1582 31.3672)"
                    fill="white"
                  />
                </clipPath>
              </defs>
            </svg>
            {isLoading && (
              <div
                style={{
                  backgroundColor: textColor,
                }}
                className=" absolute left-4 top-[58%] h-5 w-56 animate-pulse rounded-md"
              ></div>
            )}
            <div
              ref={cardNumberRef}
              className=" absolute left-0 top-[35%] w-full"
            ></div>
            <div className="mt-20 flex max-w-[80%] gap-4 text-sm lg:text-base">
              <h1 className="">{name}</h1>
              <h1>
                {expiryMonth}/{expiryYear}
              </h1>
            </div>
            <div
              className={` absolute bottom-5 right-4 ${!isFlipped && "z-10"} `}
            >
              <div className=" flex flex-col items-center justify-center text-xs">
                {currency === "USD" ? (
                  <svg
                    className="h-10 w-10"
                    version="1.1"
                    id="Layer_1"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                    viewBox="0 0 291.791 291.791"
                    xmlSpace="preserve"
                  >
                    <path
                      fill="#E2574C"
                      d="M182.298,145.895c0,50.366-40.801,91.176-91.149,91.176S0,196.252,0,145.895
                  s40.811-91.176,91.149-91.176S182.298,95.538,182.298,145.895z"
                    />
                    <path
                      fill="#F4B459"
                      d="M200.616,54.719c-20.442,0-39.261,6.811-54.469,18.181l0.073,0.009
                  c2.991,2.89,6.291,4.924,8.835,8.251l-18.965,0.301c-2.972,3-5.68,6.264-8.233,9.656H161.3c2.544,3.054,4.896,5.708,7.03,9.081
                  h-46.536c-1.705,2.936-3.282,5.954-4.659,9.09h56.493c1.477,3.127,2.799,5.489,3.921,8.799h-63.76
                  c-1.012,3.146-1.878,6.364-2.535,9.646h68.966c0.675,3.155,1.194,6.072,1.55,9.045h-71.884c-0.301,3-0.456,6.045-0.456,9.118
                  h72.859c0,3.228-0.228,6.218-0.556,9.118h-71.847c0.31,3.091,0.766,6.127,1.368,9.118h68.856c-0.711,2.954-1.532,5.926-2.562,9.008
                  h-63.969c0.966,3.118,2.143,6.145,3.428,9.099h56.621c-1.568,3.319-3.346,5.972-5.306,9.081h-46.691
                  c1.842,3.191,3.875,6.236,6.081,9.154l33.589,0.501c-2.863,3.437-6.537,5.507-9.884,8.516c0.182,0.146-5.352-0.018-16.248-0.191
                  c16.576,17.105,39.744,27.772,65.446,27.772c50.357,0,91.176-40.82,91.176-91.176S250.981,54.719,200.616,54.719z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-10 w-10"
                    viewBox="0 -139.5 750 750"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                  >
                    <g id="verve" fillRule="nonzero">
                      <rect
                        id="Rectangle-path"
                        fill="#00425F"
                        x="0"
                        y="0"
                        width="750"
                        height="471"
                        rx="40"
                      ></rect>
                      <circle
                        id="Oval"
                        fill="#EE312A"
                        cx="156.26347"
                        cy="215.5"
                        r="115.26347"
                      ></circle>
                      <path
                        d="M156.26347,264.87251 C130.48369,206.43174 111.57857,151.84021 111.57857,151.84021 L72.05384,151.84021 C72.05384,151.84021 96.11071,221.91184 140.79561,309.54065 L171.73134,309.54065 C216.41624,221.91184 240.47311,151.84021 240.47311,151.84021 L200.94837,151.84021 C200.94837,151.84021 182.04325,206.43174 156.26347,264.87251 Z"
                        id="Shape"
                        fill="#FFFFFF"
                      ></path>
                      <path
                        d="M708.04515,257.60566 L630.71641,257.60566 C630.71641,257.60566 632.43441,283.3869 666.80307,283.3869 C683.98685,283.3869 701.17192,278.22677 701.17192,278.22677 L704.60925,305.72097 C704.60925,305.72097 687.42418,312.59491 663.36588,312.59491 C628.99845,312.59491 598.06688,295.41041 598.06688,247.29525 C598.06688,209.48978 622.12375,185.4322 656.4926,185.4322 C708.04515,185.4322 711.48248,236.98469 708.04515,257.60566 Z M654.77471,209.48978 C632.43436,209.48978 630.71641,233.54736 630.71641,233.54736 L678.83158,233.54736 C678.83158,233.54736 677.11363,209.48978 654.77471,209.48978 Z"
                        id="Shape"
                        fill="#FFFFFF"
                      ></path>
                      <path
                        d="M442.3337,216.74823 L447.48884,189.25332 C447.48884,189.25332 407.67636,177.17202 375.31538,199.56388 L375.31538,309.54067 L409.68552,309.54067 L409.68281,220.18485 C423.42925,209.87443 442.3337,216.74823 442.3337,216.74823 Z"
                        id="Shape"
                        fill="#FFFFFF"
                      ></path>
                      <path
                        d="M348.41613,257.60566 L271.08739,257.60566 C271.08739,257.60566 272.80539,283.3869 307.17405,283.3869 C324.35783,283.3869 341.54148,278.22677 341.54148,278.22677 L344.97881,305.72097 C344.97881,305.72097 327.79517,312.59491 303.73687,312.59491 C269.36802,312.59491 238.43649,295.41041 238.43649,247.29525 C238.43649,209.48978 262.49479,185.4322 296.86364,185.4322 C348.41613,185.4322 351.852,236.98469 348.41613,257.60566 Z M295.14426,209.48978 C272.80534,209.48978 271.08739,233.54736 271.08739,233.54736 L319.20256,233.54736 C319.20256,233.54736 317.4846,209.48978 295.14426,209.48978 Z"
                        id="Shape"
                        fill="#FFFFFF"
                      ></path>
                      <path
                        d="M525.80355,268.32373 C515.12048,242.341853 506.501709,215.55843 500.02729,188.22223 L465.66129,188.22677 C465.66129,188.22677 482.845,254.57171 512.05993,309.5462 L539.54717,309.5462 C568.76212,254.57171 585.94581,188.239 585.94581,188.239 L551.57981,188.239 C545.103957,215.569341 536.48521,242.34708 525.80355,268.32373 Z"
                        id="Shape"
                        fill="#FFFFFF"
                      ></path>
                    </g>
                  </svg>
                )}
                {currency === "USD" && <h1 className="">{brand}</h1>}
              </div>
            </div>
            <svg
              style={{ fill: bglogoColor ? bglogoColor : "whitesmoke" }}
              className=" absolute top-[20%] -right-[67px] h-[60%] fill-black"
              viewBox="0 0 324 325"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M231.012 162.33C200.61 176.249 176.172 200.595 162.105 230.979C148.042 200.592 123.602 176.245 93.1973 162.33C123.594 148.398 148.03 124.05 162.104 93.668C176.183 124.047 200.617 148.395 231.012 162.33Z" />
              <path d="M162.105 324.825C124.694 324.803 88.4412 311.822 59.4873 288.082C30.5333 264.342 10.6586 231.302 3.23008 194.559C-4.19846 157.816 1.2759 119.629 18.7257 86.468C36.1755 53.3067 64.5278 27.2094 98.9798 12.5972C138.575 -4.00525 183.122 -4.20419 222.863 12.044C262.604 28.2922 294.298 59.6627 311.002 99.2831C327.706 138.904 328.058 183.544 311.981 223.424C295.905 263.304 264.709 295.173 225.23 312.049C205.26 320.52 183.79 324.865 162.105 324.825ZM162.105 29.0348C135.798 29.0348 110.082 36.852 88.2093 51.4979C66.3362 66.1438 49.2881 86.9605 39.2211 111.316C29.154 135.671 26.52 162.471 31.6522 188.326C36.7844 214.181 49.4521 237.931 68.0537 256.572C92.9976 281.568 126.829 295.611 162.105 295.611C197.381 295.611 231.212 281.568 256.156 256.572C281.1 231.575 295.113 197.673 295.113 162.323C295.113 126.973 281.1 93.0703 256.156 68.074C243.834 55.6582 229.177 45.8149 213.033 39.1138C196.889 32.4127 179.579 28.9869 162.105 29.0348Z" />
            </svg>
          </div>
          {/* back */}
          <div
            style={{
              backgroundColor: cardColor ? cardColor : "black",
              color: textColor ? textColor : "whitesmoke",
            }}
            className="absolute inset-0 flex flex-col gap-3 rounded-xl bg-gray-300 [transform:rotateY(180deg)] [backface-visibility:hidden]"
          >
            <div
              style={{
                backgroundColor: textColor ? textColor : "whitesmoke",
              }}
              className=" mt-6 bg-black py-6"
            ></div>
            <div
              style={{
                opacity: 0.5,
                backgroundColor: textColor ? textColor : "whitesmoke",
                color: cardColor ? cardColor : "black",
              }}
              className=" relative ml-4 h-10 w-[70%] rounded  pr-4 text-end"
            >
              <div className=" absolute top-[23%] right-[30%]">Cvv: </div>
              {isLoading && (
                <div
                  style={{
                    backgroundColor: cardColor,
                  }}
                  className=" absolute top-[20%] left-[74%] h-6 w-12 animate-pulse rounded-md"
                ></div>
              )}
              <div
                ref={cardCvvRef}
                className=" absolute -top-[120%] right-[30%]"
              ></div>
            </div>
            <div className=" relative ml-4 h-10 w-[70%] rounded pr-4 text-end">
              <div
                className={`${
                  currency === "USD" && "hidden"
                } absolute -bottom-[70%] right-[30%]`}
              >
                Default PIN:{" "}
              </div>
              {isLoading && currency === "NGN" && (
                <div
                  style={{
                    backgroundColor: textColor,
                  }}
                  className=" absolute top-[100%] left-[73%] h-6 w-12 animate-pulse rounded-md"
                ></div>
              )}
              <div
                ref={cardPinRef}
                className={`absolute -top-[30%] right-[30%]`}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RevealedCard;
