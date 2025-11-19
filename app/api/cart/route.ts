import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ensureUserInDb } from "@/lib/ensureUser";

export async function GET() {
  const user = await ensureUserInDb();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const items = await prisma.cartItem.findMany({
    where: { userId: user.id },
    include: { variant: { include: { product: true } } }
  });

  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const user = await ensureUserInDb();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  if (!body.variantId)
    return NextResponse.json({ error: "variantId required" }, { status: 400 });

  // Upsert cart item
  const existing = await prisma.cartItem.findUnique({
    where: {
      userId_variantId: {
        userId: user.id,
        variantId: body.variantId
      }
    }
  });

  if (existing) {
    const updated = await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + (body.quantity || 1) },
    });

    return NextResponse.json(updated);
  }

  const created = await prisma.cartItem.create({
    data: {
      userId: user.id,
      variantId: body.variantId,
      quantity: body.quantity || 1,
    }
  });

  return NextResponse.json(created, { status: 201 });
}

export async function DELETE(request: Request) {
  const user = await ensureUserInDb();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const variantId = url.searchParams.get("variantId");

  if (!variantId)
    return NextResponse.json({ error: "variantId required" }, { status: 400 });

  await prisma.cartItem.deleteMany({
    where: { userId: user.id, variantId }
  });

  return NextResponse.json({ ok: true });
}
