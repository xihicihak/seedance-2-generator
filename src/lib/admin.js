import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function getAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const adminEmails = (process.env.ADMIN_EMAILS || "xihicihak43@gmail.com")
    .split(",")
    .map((e) => e.trim().toLowerCase());

  const userEmail = session.user.email ? session.user.email.toLowerCase() : "";
  const isAdmin =
    session.user.role === "ADMIN" ||
    (userEmail && adminEmails.includes(userEmail));

  if (!isAdmin) return null;
  return session;
}
