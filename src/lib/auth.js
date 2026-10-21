import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";

const providers = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

providers.push(
  CredentialsProvider({
    id: "credentials",
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      apiKey: { label: "API Key", type: "password" },
    },
    async authorize(credentials) {
      const adminEmails = (process.env.ADMIN_EMAILS || "xihicihak43@gmail.com").split(",").map(e => e.trim().toLowerCase());

      // 1. Direct Email Sign In
      if (credentials?.email && credentials.email.trim().includes("@")) {
        const email = credentials.email.trim().toLowerCase();
        const isAdminEmail = adminEmails.includes(email);

        // Security Guard: in production, require ADMIN_SECRET for direct admin login
        if (isAdminEmail && process.env.NODE_ENV === "production" && process.env.ADMIN_SECRET) {
          if (credentials.apiKey !== process.env.ADMIN_SECRET) {
            throw new Error("Admin authentication requires a valid Admin Secret key in production.");
          }
        }

        let dbUser = await prisma.user.findUnique({
          where: { email }
        });

        if (!dbUser) {
          const role = adminEmails.includes(email) ? "ADMIN" : "USER";
          dbUser = await prisma.user.create({
            data: {
              name: email.split("@")[0],
              email,
              credits: 30,
              role,
            }
          });
        }

        return {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          image: dbUser.image || null,
          credits: dbUser.credits,
          role: dbUser.role || (adminEmails.includes(email) ? "ADMIN" : "USER"),
        };
      }

      // 2. Custom API Key Sign In
      if (credentials?.apiKey) {
        const apiKey = credentials.apiKey.trim();
        if (apiKey.length < 5) {
          throw new Error("Invalid API key format");
        }

        const dummyEmail = `apikey_${apiKey.slice(-8)}@pornmake.local`;
        let dbUser = await prisma.user.findFirst({
          where: {
            OR: [
              { customApiKey: apiKey },
              { email: dummyEmail }
            ]
          }
        });

        if (!dbUser) {
          dbUser = await prisma.user.create({
            data: {
              name: "API Key User",
              email: dummyEmail,
              customApiKey: apiKey,
              credits: 30,
            }
          });
        } else if (!dbUser.customApiKey) {
          dbUser = await prisma.user.update({
            where: { id: dbUser.id },
            data: { customApiKey: apiKey }
          });
        }

        return {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          image: dbUser.image || null,
          credits: dbUser.credits,
          customApiKey: dbUser.customApiKey || apiKey,
          isApiKeyUser: true,
          role: dbUser.role || "USER",
        };
      }

      throw new Error("Please enter a valid email address or API Key");
    }
  })
);

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers,
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      const adminEmails = (process.env.ADMIN_EMAILS || "xihicihak43@gmail.com").split(",").map(e => e.trim().toLowerCase());
      if (user) {
        token.id = user.id;
        token.credits = user.credits;
        token.customApiKey = user.customApiKey;
        token.isApiKeyUser = user.isApiKeyUser || false;
        token.role = (user.email && adminEmails.includes(user.email.toLowerCase())) ? "ADMIN" : (user.role || "USER");
      }
      if (trigger === "update" && session) {
        if (session.customApiKey !== undefined) token.customApiKey = session.customApiKey;
        if (session.credits !== undefined) token.credits = session.credits;
        if (session.role !== undefined) token.role = session.role;
      }
      const userId = token.id || token.sub;
      if (userId) {
        token.id = userId;
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { credits: true, customApiKey: true, role: true, email: true }
          });
          if (dbUser) {
            token.credits = dbUser.credits;
            token.customApiKey = dbUser.customApiKey;
            token.role = (dbUser.email && adminEmails.includes(dbUser.email.toLowerCase())) ? "ADMIN" : (dbUser.role || "USER");
          }
        } catch (err) {}
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id || token.sub;
        session.user.credits = token.credits;
        session.user.customApiKey = token.customApiKey;
        session.user.isApiKeyUser = Boolean(token.customApiKey);
        session.user.role = token.role || "USER";
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
};

export default authOptions;
