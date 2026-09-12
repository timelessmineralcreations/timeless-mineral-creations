import EasyPostClient from "@easypost/api";

const apiKey = process.env.EASYPOST_API_KEY;

if (!apiKey) {
  throw new Error("EASYPOST_API_KEY is not configured.");
}

export const easypost = new EasyPostClient(apiKey);