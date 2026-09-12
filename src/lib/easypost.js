import EasyPostClient from "@easypost/api";

let easypostClient = null;

export function getEasyPost() {
  const apiKey = process.env.EASYPOST_API_KEY;

  if (!apiKey) {
    throw new Error("EASYPOST_API_KEY is not configured.");
  }

  if (!easypostClient) {
    easypostClient = new EasyPostClient(apiKey);
  }

  return easypostClient;
}