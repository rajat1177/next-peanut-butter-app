import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function ensureUserInDb() {
  const user = await currentUser();
  if (!user) return null;

  let dbUser = await prisma.user.findUnique({
    where: { id: user.id }
  });

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        id: user.id,
        email: user.emailAddresses[0].emailAddress,
        name: user.firstName || user.username || "User",
        image: user.imageUrl
      }
    });
  }

  return dbUser;
}
