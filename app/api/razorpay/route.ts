import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";


export const dynamic = "force-dynamic"; 
export const runtime = "nodejs";        // ensures raw body works

export async function POST(req: Request) {
  // Razorpay sends RAW request body → we must read as text
  const rawBody = await req.text();
  const razorpaySignature = req.headers.get("x-razorpay-signature");

  const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;
  if (!secret) {
    return NextResponse.json(
      { error: "Webhook secret missing in environment" },
      { status: 500 }
    );
  }

  // 1️⃣ Validate signature
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    return NextResponse.json(
      { error: "Invalid Razorpay signature" },
      { status: 400 }
    );
  }

  // Parse JSON after verification
  const payload = JSON.parse(rawBody);
  const event = payload.event;

  console.log("🔔 Razorpay Webhook Event:", event);

  // PAYMENT CAPTURED SUCCESS
  if (event === "payment.captured") {
    const payment = payload.payload.payment.entity;

    await prisma.order.updateMany({
      where: { razorpayOrderId: payment.order_id },
      data: {
        status: "PAID",
        paymentId: payment.id,
      },
    });

    console.log("✅ Order updated to PAID for", payment.order_id);
  }

  // PAYMENT FAILED
  if (event === "payment.failed") {
    const payment = payload.payload.payment.entity;

    await prisma.order.updateMany({
      where: { razorpayOrderId: payment.order_id },
      data: {
        status: "FAILED",
        paymentId: payment.id,
      },
    });

    console.log("❌ Order updated to FAILED for", payment.order_id);
  }

  // OPTIONAL: ORDER PAID EVENT
  if (event === "order.paid") {
    const order = payload.payload.order.entity;

    await prisma.order.updateMany({
      where: { razorpayOrderId: order.id },
      data: {
        status: "PAID",
      },
    });

    console.log("🟢 Order marked PAID from order.paid webhook");
  }

  return NextResponse.json({ status: "ok" });
}
