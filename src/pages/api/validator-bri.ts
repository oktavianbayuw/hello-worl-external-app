import { createToken } from "@/lib/auth";
import { BASE_URL, BRI_URL } from "@/lib/constants";
import validateKeyPair from "@/lib/validate-key-pair";
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { public_key, referer } = req.body;

    if (!public_key) {
      return res.status(400).json({ error: "Missing public key" });
    }

    if (!referer) {
      return res.status(400).json({ error: "Missing referer" });
    }

    console.log(`referer: ${referer}`);

    if (!BRI_URL.includes(referer)) {
      return res.status(400).json({ error: "Invalid referer" });
    }

    const isValidKeyPair = validateKeyPair(public_key);
    if (!isValidKeyPair) {
      return res.status(400).json({ error: "Invalid key pair" });
    }

    const token = createToken({ username: "superadmin" });

    return res
      .status(200)
      .json({ access_token: token, loginPath: `${BASE_URL}/api/bri-login` });
  }
  // Block method except than POST
  res.setHeader("Allow", ["POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
