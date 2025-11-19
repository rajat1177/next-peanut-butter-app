import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q") || undefined;

  const where = q
    ? {
        OR: [
          { name: { contains: q } },
          { slug: { contains: q } },
          { description: { contains: q } }
        ]
      }
    : undefined;

  const products = await prisma.product.findMany({
    where,
    include: { variants: true }
  });

  return NextResponse.json(products);
}


export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Minimal validation
    if (!body.name || !body.slug) return NextResponse.json({ error: "name and slug required" }, { status: 400 });

    const product = await prisma.product.create({ data: { name: body.name, slug: body.slug, description: body.description || null, images: body.images || [], isFeatured: !!body.isFeatured } });
    return NextResponse.json(product, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
