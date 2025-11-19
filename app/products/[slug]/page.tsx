"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export default function ProductBySlugPage() {
  const { slug } = useParams();  // IMPORTANT: use slug
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  async function loadProduct() {
    try {
      const res = await fetch(`/api/products/${slug}`); // USE SLUG
      const data = await res.json();
      setProduct(data);

      if (data.variants?.length > 0) {
        setSelectedVariant(data.variants[0]);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (slug) loadProduct();
  }, [slug]);

  async function addToCart() {
    if (!selectedVariant) return;

    setAdding(true);

    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        variantId: selectedVariant.id,
        quantity: qty,
      }),
    });

    setAdding(false);

    if (res.ok) window.location.assign("/cart");
  }

  if (loading)
    return (
      <div className="min-h-screen bg-black text-white flex justify-center items-center text-xl">
        Loading Product...
      </div>
    );

  if (!product)
    return (
      <div className="min-h-screen bg-black text-white flex justify-center items-center text-xl">
        Product Not Found
      </div>
    );

  return (
    <div className="bg-black text-white min-h-screen">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-2 gap-12">
        
        {/* IMAGE */}
        <div>
          <img
            src={product.images?.[0] || "/placeholder.png"}
            alt={product.name}
            className="w-full h-[420px] object-cover rounded-lg border border-white/20 shadow-xl"
          />
        </div>

        {/* PRODUCT DETAILS */}
        <div>
          <h1 className="text-4xl font-bold">{product.name}</h1>

          <p className="text-white/70 mt-3 leading-relaxed">{product.description}</p>

          {/* PRICE */}
          {selectedVariant && (
            <p className="text-3xl font-bold text-orange-500 mt-4">
              ₹{selectedVariant.price / 100}
            </p>
          )}

          {/* VARIANTS */}
          {product.variants?.length > 0 && (
            <div className="mt-6 space-y-2">
              <p className="text-white/50 text-sm">Choose Variant:</p>
              <div className="flex gap-3 flex-wrap">
                {product.variants.map((variant: any) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    className={`px-4 py-2 rounded border transition ${
                      selectedVariant?.id === variant.id
                        ? "border-orange-500 bg-orange-500/10"
                        : "border-white/20 hover:bg-white/10"
                    }`}
                  >
                    {variant.sizeOz}oz • {variant.texture}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* QUANTITY */}
          <div className="mt-6 flex items-center gap-5">
            <p className="text-white/60 text-sm">Quantity:</p>

            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="px-3 py-2 bg-white/10 rounded hover:bg-white/20 transition"
            >
              -
            </button>

            <span className="font-mono text-lg">{qty}</span>

            <button
              onClick={() => setQty(qty + 1)}
              className="px-3 py-2 bg-white/10 rounded hover:bg-white/20 transition"
            >
              +
            </button>
          </div>

          {/* ADD TO CART BUTTON */}
          <button
            onClick={addToCart}
            disabled={adding}
            className="w-full bg-orange-600 hover:bg-orange-700 text-lg font-bold py-4 mt-10 disabled:bg-gray-600 transition"
          >
            {adding ? "Adding..." : "Add to Cart"}
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
