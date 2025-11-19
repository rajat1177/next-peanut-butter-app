"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Hero() {
  const router = useRouter();

  return (
    <section className="pt-28 pb-18 px-7 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-10">

      {/* LEFT CONTENT */}
      <div>
        <p className="text-orange-500 font-semibold tracking-wide mb-3 animate-pulse">
          PURE • ORGANIC • HANDCRAFTED
        </p>

        <h1 className="text-6xl font-extrabold text-orange-600 leading-tight">
          TASTE ORGANIC
        </h1>

        <p className="text-lg mt-4 text-white max-w-xl">
          Healthy, organic, delicious. Experience the best vegan meals made with love.
          Our peanut butter is crafted from premium roasted peanuts.
        </p>

        <ul className="mt-6 space-y-2 text-white text-base max-w-xl">
          <li>• 100% natural ingredients</li>
          <li>• Zero preservatives or added oils</li>
          <li>• High-protein energy booster</li>
          <li>• Perfect for smoothies, toast & desserts</li>
        </ul>

        <button
          onClick={() => router.push("/products")}
          className="mt-8 px-8 py-4 bg-orange-600 text-white font-semibold hover:bg-orange-700"
        >
          ORDER NOW !
        </button>
      </div>

      {/* RIGHT IMAGE — hidden on mobile */}
      <div className="hidden md:flex justify-center">
        <Image
          src="/hero.jpeg"
          alt="Peanut butter hero"
          width={450}
          height={450}
          className="rounded-2xl object-cover drop-shadow-xl"
        />
      </div>

    </section>
  );
}


