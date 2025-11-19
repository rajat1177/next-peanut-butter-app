import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export async function GET() {
  const reviews = await prisma.review.findMany({ include: { product: true, user: true } });
  return NextResponse.json(reviews);
}

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  if (!body.productId || !body.rating) return NextResponse.json({ error: "productId and rating required" }, { status: 400 });

  try {
    const review = await prisma.review.create({ data: { productId: body.productId, userId: user.id, rating: body.rating, title: body.title || null, content: body.content || null } });
    return NextResponse.json(review, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
