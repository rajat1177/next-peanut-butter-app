"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import { useUser } from "@clerk/nextjs";


// Helper to load the Razorpay script dynamically
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CheckoutPage() {
  const { user } = useUser();
 
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  async function loadCart() {
    try {
      const res = await fetch("/api/cart");
      const data = await res.json();
      const cartItems = Array.isArray(data) ? data : data.items || [];
      setItems(cartItems);
    } catch (error) {
      console.error("Failed to load cart", error);
    } finally {
      console.log("Cart items loaded:", user);
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCart();
  }, []);

  // Calculate total in PAISE (assuming variant.price is in paise)
  const total = items.reduce(
    (sum: number, item: any) => sum + item.quantity * item.variant.price,
    0
  );

  // -------------------------
  // Razorpay Checkout Function
  // -------------------------
async function handlePayment() {
  setPaying(true);

  // 1. Load Razorpay script
  const isScriptLoaded = await loadRazorpayScript();
  if (!isScriptLoaded) {
    alert("Razorpay SDK failed to load.");
    setPaying(false);
    return;
  }
const payloadItems = items.map((item: any) => ({
    variantId: item.variant.id,     // IMPORTANT: variantId per your schema
    quantity: item.quantity,
    price: item.variant.price,     // unit price in paise
  }));

  // total is already computed as paise in your code; send amount in paise
  const orderRes = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: payloadItems,
      amount: total, // paise
      shippingAddress: {
        line1: "Test",
        city: "Test",
        zip: "000000",
      },
    }),
  });
   const orderData = await orderRes.json();

  if (!orderRes.ok) {
    alert("Error creating order: " + (orderData.error || JSON.stringify(orderData.amount)));
    setPaying(false);
    return;
  }
    // 3. Initialize Razorpay Options
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Public Key
      amount: orderData.amount,
      currency: "INR",
      name: "Peanut Butter Shop",
      description: "Order Payment",
      order_id: orderData.id, // The Order ID from Backend
      
      // Handler for successful payment
      handler: async function (response: any) {
        // 4. Verify Payment on Backend
        const verifyRes = await fetch("/api/razorpay/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          }),
        });

        const verifyData = await verifyRes.json();

        if (verifyData.success) {
          window.location.href = "/success";
        } else {
          alert("Payment verification failed!");
        }
      },
      prefill: {
  name: user?.fullName || user?.firstName || "Guest User",
  email: user?.primaryEmailAddress?.emailAddress || "no-email@example.com",
  contact: user?.primaryPhoneNumber?.phoneNumber || "9999999999",
},

      theme: {
        color: "#FF6A00",
      },
    };

    const paymentObject = new (window as any).Razorpay(options);
    paymentObject.open();
    
    // Handle if user closes the modal
    paymentObject.on("payment.failed", function (response: any) {
      alert("Payment Failed: " + response.error.description);
      setPaying(false);
    });
    
    setPaying(false); // Reset loading state once modal opens
  }

  if (loading)
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center text-xl">
        Loading Checkout...
      </div>
    );

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black text-white px-6 py-12">
        <h1 className="text-3xl font-bold mb-6 text-center">Checkout</h1>
          <div className="flex justify-center mb-6">
   
  </div>

        <div className="max-w-3xl mx-auto bg-[#0A0A0A] p-8 border border-gray-700">
           <img 
      src="/checkout.jpeg" 
      alt="Checkout" 
      className="m-auto w-max h-60 object-cover border-gray-700 shadow-lg"
    />
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

          <div className="space-y-4">
            {items.map((item: any) => (
              <div
                key={item.id}
                className="flex justify-between border-b border-gray-700 pb-3"
              >
                <div>
                  <p className="text-lg">{item.variant.product.name}</p>
                  <p className="text-gray-400 text-sm">
                    {item.variant.sizeOz}oz • {item.variant.texture}
                  </p>
                </div>
                {/* Display Price: Divide by 100 for Rupees */}
                <p className="font-bold text-orange-500">
                  ₹{(item.variant.price * item.quantity) / 100}
                </p>
              </div>
            ))}
          </div>

          <div className="flex justify-between text-xl mt-6">
            <span>Total:</span>
            <span className="font-bold text-orange-500">₹{total / 100}</span>
          </div>

          <button
            onClick={handlePayment}
            disabled={paying}
            className="w-full bg-orange-600 hover:bg-orange-700 text-lg font-bold py-3 mt-6 disabled:bg-gray-600 transition-colors"
          >
            {paying ? "Processing..." : "Pay Now →"}
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
}

