export const runtime = "nodejs";

import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // parse body
    const body = await req.json();
    const { items, amount, shippingAddress } = body;

    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.log("Invalid items payload:", body);
      return NextResponse.json({ error: "Invalid items" }, { status: 400 });
    }
    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Initialize Razorpay (keys loaded from env)
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    // Create Razorpay order — Razorpay expects amount in paise
    const razorpayOrder = await razorpay.orders.create({
      amount: amount, // amount already in paise
      currency: "INR",
    });

    // Create DB order using Prisma — Order.amount is smallest currency unit (paise)
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        amount: amount, // paise
        currency: "INR",
        razorpayOrderId: razorpayOrder.id,
        shippingAddress: shippingAddress ?? {},
        orderItems: {
          create: items.map((item: any) => {
            // validate each item shape on server-side
            if (!item.variantId || typeof item.quantity !== "number" || typeof item.price !== "number") {
              throw new Error("Invalid item format, expected variantId, quantity, price");
            }
            return {
              variantId: item.variantId,
              quantity: item.quantity,
              price: item.price, // unit price in paise
            };
          }),
        },
      },
      include: { orderItems: true }, // optional: return created order items
    });

    return NextResponse.json({
      razorpayOrder,
      orderId: order.id,
    });
  } catch (err: any) {
    console.error("Order creation error:", err);
    const message = err?.message || "Order creation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
