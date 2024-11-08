import { Inter } from "next/font/google";
import { LampContainer } from "@/components/ui/lamp";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { SUPERADMIN_CREDENTIALS } from "@/lib/constants";
import { deleteTokenCookie } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const router = useRouter();
  const { code } = router.query;
  const [data, setData] = useState<{
    email: string;
    name: string;
    createdAt: Date;
  } | null>(null);
  const fetchData = async () => {
    try {
      const response = await fetch("/api/bri-login", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });
      if (response.ok) {
        const data = await response.json();
        let credData = null
        if (data.data.email === SUPERADMIN_CREDENTIALS.email) {
          credData = {
            ...SUPERADMIN_CREDENTIALS,
            createdAt: new Date(),
          }
          setData(credData)
        }else{
          credData = data.data
          setData(data.data);
        }
        localStorage.setItem("data", JSON.stringify(credData));
        // Remove query code from url
        router.push({ pathname: router.pathname, query: {} }, undefined, {
          shallow: true,
        });
      } else {
        console.error("Failed to fetch data");
        // Redirect to https://bridev.qore.run
        router.push("http://localhost:5173");
      }
    } catch (error) {
      console.error(error);
    }
  };
   const deleteCookie = async() => {
    try {
      await deleteTokenCookie()
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    const getUserfromLocalStorage = localStorage.getItem("data")
      ? JSON.parse(localStorage.getItem("data") as string)
      : null;
  
    if (!getUserfromLocalStorage) {
      deleteCookie() 
    } 
  
    setData(getUserfromLocalStorage);
  }, []);

  useEffect(() => {
    if (router.query.code) {
      fetchData();
    }
  }, [router.query.code]);
  return (
    <LampContainer>
      <motion.h1
        initial={{ opacity: 0.5, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="mt-8 bg-gradient-to-br from-slate-300 to-slate-500 py-4 bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl"
      >
        {data?.name ? `Hi, ${data?.name}` : "Welcome to APP Hello World !"}
      </motion.h1>
    </LampContainer>
  );
}
