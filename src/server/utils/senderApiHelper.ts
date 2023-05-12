import type { Method } from "axios";
import axios from "axios";
import { env } from "../../env.mjs";

interface senderApi {
  data: object;
}

export const senderHelper = async ({ data }: senderApi) => {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: "Bearer " + env.SENDER_APP_KEY,
  };

  const response = await axios({
    method: "post",
    maxBodyLength: Infinity,
    url: "https://api.sender.net/v2/subscribers",
    data: JSON.stringify(data),
    headers: headers,
  })
    .then((response) => {
      return response;
    })
    .catch((err) => {
      return err;
    });

  return response;
};
