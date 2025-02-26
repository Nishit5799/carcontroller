import React, { Suspense } from "react";
import Experience from "@/components/Experience";
import Loading from "./loading"; // Import the loading component

export default function Home() {
  return (
    <div className="w-full h-screen fixed bg-black">
      <Suspense fallback={<Loading />}>
        <Experience />
      </Suspense>
    </div>
  );
}
