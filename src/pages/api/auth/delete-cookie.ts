import { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    res.setHeader(
      "Set-Cookie",
      serialize("token", "", {
        maxAge: -1,
        path: "/",
      })
    );

    res.status(200).json({ message: "Cookie deleted" });
  }else{
    res.status(405).json({ message: "Method not allowed" });
  }
}
