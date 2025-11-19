"use client";

import { useEffect, useState } from "react";
import { SignInButton, SignedOut, SignedIn, UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";

export default function Navbar() {
  const [cartCount, setCartCount] = useState(0);
  const { isSignedIn } = useUser();

  // Fetch cart count
  async function loadCartCount() {
    try {
      const res = await fetch("/api/cart");
      const data = await res.json();

      // Sum quantities of items
      const totalQty = data.reduce((sum: number, item: any) => sum + item.quantity, 0);
      setCartCount(totalQty);
    } catch (err) {
      console.error("Error loading cart:", err);
    }
  }

  useEffect(() => {
    if (isSignedIn) {
      loadCartCount();
    }
  }, [isSignedIn]);

  return (
    <nav className="w-full py-4 px-8 flex items-center justify-between sticky top-0 z-50 bg-white/30 backdrop-blur-sm border-b border-white/10">

      <Link  href="/"><h2 className="text-2xl font-bold">PeanutButter.</h2></Link>

      <div className="flex items-center gap-5">
        {/* Cart button */}
        <a
          href="/cart"
          aria-label="View cart"
          className="relative inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition"
          title="Cart"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-slate-800">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .96.33 1.09.82l1.517 6.068a2.25 2.25 0 002.196 1.66h7.294a2.25 2.25 0 002.196-1.66l1.386-5.538A1.125 1.125 0 0019.386 3H5.25" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 18.75a.75.75 0 100 1.5.75.75 0 000-1.5zM17.25 18.75a.75.75 0 100 1.5.75.75 0 000-1.5z" />
          </svg>

          {/* dynamic badge */}
          {isSignedIn && (
            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-semibold leading-none text-white bg-orange-600 rounded-full">
              {cartCount}
            </span>
          )}
        </a>

        {/* If signed in → show user */}
        <SignedIn>
          <div className="flex items-center gap-3 scale-145">
            <UserButton />
          </div>
        </SignedIn>

        {/* If NOT logged in → show login button */}
        <SignedOut>
          <SignInButton mode="modal">
            <button className="px-4 py-2 bg-orange-600 text-white rounded-full hover:bg-orange-700 font-semibold">
              Login
            </button>
          </SignInButton>
        </SignedOut>
      </div>
    </nav>
  );
}
