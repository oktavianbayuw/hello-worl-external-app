import { setToken, verifyToken } from "@/lib/auth";
import { decryptData } from "@/lib/decryptor";
import validateKeyPair from "@/lib/validate-key-pair";
import { NextApiRequest, NextApiResponse } from "next";
import { ALLOWED_EMAIL_USERS, BRI_URL } from "@/lib/constants";

const privateKey = process.env.PRIVATE_KEY;
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { public_key: publicKey } = req.body;

    // Access custom headers
    const userEmail = req.headers["x-user-email"] as string;
    const authorization = req.headers["authorization"] as string;
    const referer = req.headers["referer"] as string;

    // Extract the Bearer token if needed
    const bearerToken = authorization?.startsWith("Bearer ")
      ? authorization.substring(7)
      : null;

    // Validate the key pair
    const isValidKeyPair = validateKeyPair(publicKey);
    if (!isValidKeyPair) {
      return res.status(400).json({ error: "Invalid key pair" });
    }

    // Verify token
    const isTokenValid = verifyToken(bearerToken || "", publicKey);
    if (!isTokenValid) {
      return res.status(400).json({ error: "Invalid token" });
    }

    // Log or use the token
    setToken(bearerToken || "");

    return res.status(200).json({ success: true });
  } else if (req.method === "PATCH") {
    const { code } = req.body;

    if (!code || typeof code !== "string") {
      return res.status(400).send({ message: "Invalid or missing code" });
    }

    if (!privateKey) {
      return res.status(400).send({ message: "Missing private key" });
    }

    try {
      const { email, name, createdAt, referer, accessToken, publicKey } =
        decryptData(code, privateKey as string);

      if (!email || !name || !createdAt || !referer) {
        return res.status(400).send({ message: "Invalid data" });
      }

      if (!BRI_URL.includes(referer)) {
        return res.status(400).send({ message: "Invalid referer" });
      }

      if (!accessToken) {
        return res.status(400).send({ message: "Missing access token" });
      }

      if (!ALLOWED_EMAIL_USERS.includes(email)) {
        return res.status(400).send({ message: "Invalid email" });
      }

      const checkPublicKey = validateKeyPair(publicKey as string);
      if (!checkPublicKey) {
        return res.status(400).send({ message: "Invalid public key" });
      }

      // Verify token
      const isTokenValid = verifyToken(accessToken || "", publicKey as string);
      if (!isTokenValid || isTokenValid.username !== "superadmin") {
        return res.status(400).json({ error: "Invalid token" });
      }

      res.setHeader("Set-Cookie", `token=${accessToken}; Path=/; HttpOnly`);
      res.status(200).send({
        message: "valid",
        data: { email, name, createdAt },
        code: "BRIDevStud10_Success",
      });
    } catch (error: any) {
      console.error("Verification error:", error);
      res.status(401).send({ message: error.message });
    }
  } else {
    // Block method except than POST
    res.setHeader("Allow", ["POST", "PATCH"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
