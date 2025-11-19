import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      variants: true,
      reviews: true,
    },
  });

  if (!product) {
    console.log("Product not found for slug:", slug);
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(product);
}
