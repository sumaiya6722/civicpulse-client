"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    async function fetchMessage() {
      try {
        const response = await fetch(
          "http://localhost:5000/api/test"
        );
        const data = await response.json();
        setMessage(data.message);
      } 
      catch (error) {
        console.error("API error:", error);
        setMessage("Could not connect to backend.");
      }
    }
    fetchMessage();
  }, []);

  return (
    <main className="p-10">
      <h1 className="text-2xl font-bold">
        CivicPulse
      </h1>

      <p className="mt-4">{message}</p>
    </main>
  );
}
