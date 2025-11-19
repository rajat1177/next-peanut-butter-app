"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import SalesBanner from "../components/SalesBanner";
import Footer from "../components/Footer";
import Link from "next/link";

export default function CartPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  async function loadCart() {
    setLoading(true);
    const res = await fetch("/api/cart");
    const data = await res.json();
    setItems(data);
    setLoading(false);
  }

  useEffect(() => {
    loadCart();
  }, []);

  async function updateQty(variantId: string, amount: number) {
    setUpdating(true);

    await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variantId, quantity: amount }),
    });

    await loadCart();
    setUpdating(false);
  }

  async function removeItem(variantId: string) {
    setUpdating(true);

    await fetch(`/api/cart?variantId=${variantId}`, { method: "DELETE" });
    await loadCart();

    setUpdating(false);
  }

  const total = items.reduce(
    (sum: any, item: any) => sum + item.quantity * item.variant.price,
    0
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white text-xl">
        Loading your cart...
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <SalesBanner />

      {/* More margin & padding on mobile */}
      <div className="min-h-screen bg-black text-white px-5 py-12 sm:px-6 sm:py-14">

        {items.length === 0 && (
          <p className="text-gray-500 text-center text-xl mt-20">
            Your cart is empty.
          </p>
        )}

        {/* Cart Items */}
        <div className="space-y-8 max-w-3xl mx-auto mt-6">
          {items.map((item: any) => (
            <div
              key={item.id}
              className="bg-[#0A0A0A] p-5 sm:p-6 border border-gray-700 shadow-md flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6"
            >
              {/* LEFT: Product info */}
              <div className="flex items-center gap-4">
                <img
                  src={item.variant.product.images[0] || "/placeholder.png"}
                  alt={item.variant.product.name}
                  className="w-24 h-24 object-cover rounded-xl border border-gray-700"
                />

                <div>
                  <h2 className="text-lg sm:text-xl font-semibold">
                    {item.variant.product.name}
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">
                    {item.variant.sizeOz}oz • {item.variant.texture}
                  </p>
                  <p className="text-orange-400 font-bold mt-2">
                    ₹{item.variant.price / 100}
                  </p>
                </div>
              </div>

              {/* RIGHT: Quantity Controls */}
              <div className="flex items-center gap-3 self-end sm:self-auto">
                <button
                  onClick={() => updateQty(item.variantId, -1)}
                  disabled={updating}
                  className="px-3 py-1 text-xl bg-gray-800 rounded-lg"
                >
                  -
                </button>

                <p className="text-lg">{item.quantity}</p>

                <button
                  onClick={() => updateQty(item.variantId, +1)}
                  disabled={updating}
                  className="px-3 py-1 text-xl bg-orange-600 hover:bg-orange-700 rounded-lg"
                >
                  +
                </button>

                <button
                  onClick={() => removeItem(item.variantId)}
                  className="text-sm text-red-500 hover:text-red-400"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* TOTAL SECTION */}
        {items.length > 0 && (
          <div className="max-w-3xl mx-auto mt-12 border-t border-gray-700 pt-6">
            <div className="flex justify-between text-xl mb-6">
              <span>Total</span>
              <span className="font-bold text-orange-500">₹{total / 100}</span>
            </div>

            <Link href="/checkout">
              <button className="w-full bg-orange-600 hover:bg-orange-700 text-lg font-bold py-4 shadow-lg">
                Checkout →
              </button>
            </Link>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}
