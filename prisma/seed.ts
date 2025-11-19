import { PrismaClient, UserRole, Texture, OrderStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ---------------------------
  // USERS
  // ---------------------------
  const user = await prisma.user.create({
    data: {
      id: "user_12345_demo", // Clerk ID (use any test ID)
      email: "demo@user.com",
      name: "Demo User",
      image: "https://example.com/avatar.png",
      role: UserRole.USER,
    },
  });

  const admin = await prisma.user.create({
    data: {
      id: "admin_999_demo",
      email: "admin@shop.com",
      name: "Admin",
      role: UserRole.ADMIN,
    },
  });

  // ---------------------------
  // PRODUCTS + VARIANTS
  // ---------------------------

  const classic = await prisma.product.create({
    data: {
      name: "Classic Peanut Butter",
      slug: "classic-peanut-butter",
      description: "Smooth and rich peanut butter made from roasted peanuts.",
      images: [
        "/images/classic1.jpg",
        "/images/classic2.jpg",
      ],
      isFeatured: true,

      variants: {
        create: [
          {
            sku: "CLSC-16OZ-CRMY",
            sizeOz: 16,
            texture: Texture.CREAMY,
            isOrganic: false,
            price: 19900,
            inventory: 50,
          },
          {
            sku: "CLSC-32OZ-CRCH",
            sizeOz: 32,
            texture: Texture.CRUNCHY,
            isOrganic: true,
            price: 34900,
            inventory: 30,
          },
        ],
      },
    },
    include: { variants: true },
  });

  const chocolate = await prisma.product.create({
    data: {
      name: "Chocolate Peanut Butter",
      slug: "chocolate-peanut-butter",
      description: "Peanut butter blended with premium dark chocolate.",
      images: ["/images/choco1.jpg"],
      isFeatured: false,

      variants: {
        create: [
          {
            sku: "CHOC-16OZ-SMTH",
            sizeOz: 16,
            texture: Texture.SMOOTH,
            price: 24900,
            inventory: 60,
          },
        ],
      },
    },
    include: { variants: true },
  });

  // ---------------------------
  // CART ITEMS
  // ---------------------------
  await prisma.cartItem.create({
    data: {
      userId: user.id,
      variantId: classic.variants[0].id,
      quantity: 2,
    },
  });

  // ---------------------------
  // ORDER + ORDER ITEMS
  // ---------------------------
  const order = await prisma.order.create({
    data: {
      userId: user.id,
      amount: 39800,
      status: OrderStatus.PAID,
      currency: "INR",
      paymentId: "razorpay_demo_123",
      shippingAddress: {
        name: "Demo User",
        address: "123 Street",
        city: "Mumbai",
        zip: "400001",
        country: "India",
      },

      orderItems: {
        create: [
          {
            variantId: classic.variants[0].id,
            quantity: 2,
            price: 19900,
          },
        ],
      },
    },
  });

  // ---------------------------
  // REVIEWS
  // ---------------------------
  await prisma.review.create({
    data: {
      userId: user.id,
      productId: classic.id,
      rating: 5,
      title: "AMAZING!",
      content: "Rich, creamy, and perfect! Highly recommended.",
    },
  });

  console.log("🌱 Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
