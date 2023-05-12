import type { Method } from "axios";
import axios from "axios";
import { env } from "../../env.mjs";

interface SudoApi {
  url: string;
  method: Method;
  data?: object;
  params?: object;
}
export const sudoApi = async ({ url, method, data, params }: SudoApi) => {
  const base_url =
    env.SUDO_LIVE === "null"
      ? "https://api.sandbox.sudo.cards"
      : "https://api.sudo.africa";
  const headers = {
    Authorization: "Bearer " + env.SUDO_APIKEY,
    "Content-Type": "application/json",
  };

  const response = await axios({
    method: method,
    url: base_url + url,
    maxBodyLength: Infinity,
    headers: headers,
    data: JSON.stringify(data),
    params: params,
  }).then((response) => {
    return response.data;
  })
  .catch((error) => {
    console.error(error.response.data, new Date());
  });
  if(response.statusCode > 299) {
    console.error(`${response.message} at ${url}`, new Date());
  }

  return response;
};
