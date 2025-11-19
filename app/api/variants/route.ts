import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const variants = await prisma.variant.findMany({ include: { product: true } });
  return NextResponse.json(variants);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.productId || !body.sku) return NextResponse.json({ error: "productId and sku required" }, { status: 400 });
    const variant = await prisma.variant.create({ data: { productId: body.productId, sku: body.sku, sizeOz: body.sizeOz || 16, texture: body.texture || "CREAMY", isOrganic: !!body.isOrganic, price: body.price || 0, inventory: body.inventory || 0 } });
    return NextResponse.json(variant, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
