"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import Navbar from "@/app/components/Navbar";
import SalesBanner from "@/app/components/SalesBanner";
import Footer from "@/app/components/Footer";

export default function ProductsShowcase() {
  const [products, setProducts] = useState<any[]>([]);
  const [adding, setAdding] = useState<string | null>(null);
  
  // Store quantities for each product
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});

  async function loadProducts() {
    const res = await fetch("/api/products/list");
    const data = await res.json();
    setProducts(data);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const handleQuantityChange = (productId: string, change: number) => {
    setQuantities((prev) => {
      const currentQty = prev[productId] || 1;
      const newQty = Math.max(1, currentQty + change);
      return { ...prev, [productId]: newQty };
    });
  };

  async function addToCart(variantId: string, productId: string) {
    try {
      setAdding(variantId);

      const quantity = quantities[productId] || 1;

      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId, quantity }),
      });

      if (!res.ok) {
        const err = await res.json();
        console.error(err.error);
        return;
      }

      window.location.reload();
    } catch (error) {
      console.error(error);
    } finally {
      setAdding(null);
    }
  }

  return (
    <div className="bg-black min-h-screen">
      <Navbar />
      <SalesBanner />

      <div className="pt-24 max-w-7xl mx-auto px-6 py-14">

        {products.length === 0 && (
          <p className="text-center text-white">No products found.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
          {products.map((product) => {
            const lowestPrice =
              product.variants?.length > 0
                ? Math.min(...product.variants.map((v: any) => v.price)) / 100
                : null;

            const defaultVariantId = product.variants?.[0]?.id || null;
            const currentQty = quantities[product.id] || 1;

            return (
              <div
                key={product.id}
                className="bg-[#0A0A0A] border border-white overflow-hidden shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 flex flex-col"
              >
                <Link href={`/products/${product.slug}`}>
                  <div className="w-full h-64 bg-black overflow-hidden">
                    <img
                      src={product.images?.[0] || "/placeholder.png"}
                      alt={product.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </Link>

                <div className="p-5 flex flex-col gap-3 flex-grow">
                  <Link href={`/products/${product.slug}`}>
                    <h2 className="text-xl font-semibold text-white hover:text-orange-400 transition">
                      {product.name}
                    </h2>
                  </Link>

                  <p className="text-white/70 text-sm line-clamp-2">
                    {product.description}
                  </p>

                  {lowestPrice !== null && (
                    <p className="text-lg font-bold text-orange-500">
                      ₹{lowestPrice}
                    </p>
                  )}
                </div>

                <div className="px-5 pb-5 space-y-3">
                  {defaultVariantId && (
                    <div className="flex items-center justify-between bg-white/5 border border-white/20 rounded p-1">
                      <span className="text-white/60 text-sm pl-2">Qty:</span>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => handleQuantityChange(product.id, -1)}
                          className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/10 rounded transition"
                        >
                          -
                        </button>
                        <span className="text-white font-mono w-4 text-center">{currentQty}</span>
                        <button 
                          onClick={() => handleQuantityChange(product.id, 1)}
                          className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/10 rounded transition"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}

                  {defaultVariantId && (
                    <button
                      onClick={() => addToCart(defaultVariantId, product.id)}
                      className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold transition disabled:opacity-50"
                      disabled={adding === defaultVariantId}
                    >
                      {adding === defaultVariantId ? "Adding..." : "Add to Cart"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Footer />
    </div>
  );
}
