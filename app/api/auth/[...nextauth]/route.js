// app/api/auth/[...nextauth]/route.js
// NextAuth.js configuration for App Router

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import {
  getUserByEmail,
  getUserById,
  verifyPassword,
  createUser,
  getOAuthAccount,
  createOrUpdateOAuthAccount,
} from "@/lib/auth";
import { getEffectiveDealerDiscount } from "@/lib/queries";
import pool from "@/lib/db";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await getUserByEmail(credentials.email);

        if (!user || !user.password) {
          return null;
        }

        const isValid = await verifyPassword(
          credentials.password,
          user.password,
        );

        if (!isValid) {
          return null;
        }

        // Require email verification except in dev / when explicitly skipped
        const skipVerification =
          process.env.NODE_ENV === "development" ||
          process.env.SKIP_EMAIL_VERIFICATION === "true";
        if (!skipVerification && !user.emailVerified) {
          throw new Error("Please verify your email before logging in");
        }

        return {
          id: user.CustomerID.toString(),
          email: user.email,
          name: `${user.firstname} ${user.lastname}`,
          role: user.role || "customer",
          dealerTier: user.dealerTier || 0,
          dealerDiscount: user.dealerDiscount || 0,
          image: user.image,
        };
      },
    }),
    // OAuth providers disabled for now - uncomment to enable
    // GoogleProvider({
    // 	clientId: process.env.GOOGLE_CLIENT_ID,
    // 	clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    // }),
    // FacebookProvider({
    // 	clientId: process.env.FACEBOOK_CLIENT_ID,
    // 	clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    // }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account.provider === "credentials") {
        return true;
      }

      // Handle OAuth providers
      if (account.provider === "google" || account.provider === "facebook") {
        try {
          // Check if account already exists
          const existingAccount = await getOAuthAccount(
            account.provider,
            account.providerAccountId,
          );

          if (existingAccount) {
            return true;
          }

          // Check if user with this email exists
          const existingUser = await getUserByEmail(user.email);

          if (existingUser) {
            // Link OAuth account to existing user
            await createOrUpdateOAuthAccount({
              customerId: existingUser.CustomerID,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              accessToken: account.access_token,
              refreshToken: account.refresh_token,
              expiresAt: account.expires_at
                ? Math.floor(account.expires_at)
                : null,
              tokenType: account.token_type,
              scope: account.scope,
              idToken: account.id_token,
            });

            // Auto-verify email for OAuth users
            if (!existingUser.emailVerified) {
              await pool.query(
                "UPDATE customers SET emailVerified = NOW() WHERE CustomerID = ?",
                [existingUser.CustomerID],
              );
            }
          } else {
            // Create new user from OAuth
            const [result] = await pool.query(
              `INSERT INTO customers
							(email, firstname, lastname, emailVerified, role, datecreated, address2, shippingaddress2)
							VALUES (?, ?, ?, NOW(), 'customer', NOW(), '', '')`,
              [
                user.email,
                profile?.given_name || user.name?.split(" ")[0] || "",
                profile?.family_name ||
                  user.name?.split(" ").slice(1).join(" ") ||
                  "",
              ],
            );

            const customerId = result.insertId;

            // Create OAuth account
            await createOrUpdateOAuthAccount({
              customerId,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              accessToken: account.access_token,
              refreshToken: account.refresh_token,
              expiresAt: account.expires_at
                ? Math.floor(account.expires_at)
                : null,
              tokenType: account.token_type,
              scope: account.scope,
              idToken: account.id_token,
            });

            // Update user image if available
            if (user.image) {
              await pool.query(
                "UPDATE customers SET image = ? WHERE CustomerID = ?",
                [user.image, customerId],
              );
            }
          }

          return true;
        } catch (error) {
          console.error("Error in OAuth sign in:", error);
          return false;
        }
      }

      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.dealerTier = token.dealerTier;
        session.user.dealerDiscount = token.dealerDiscount;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.dealerTier = user.dealerTier;
        // Resolve dealer discount from tier config on first sign-in too
        token.dealerDiscount = await getEffectiveDealerDiscount(
          user.dealerTier,
          user.dealerDiscount,
        );
      }

      // Refresh user data from database
      if (token.id) {
        const dbUser = await getUserById(parseInt(token.id));
        if (dbUser) {
          token.role = dbUser.role;
          token.dealerTier = dbUser.dealerTier;
          // Resolve dealer discount from tier config (1-8) or customer override
          token.dealerDiscount = await getEffectiveDealerDiscount(
            dbUser.dealerTier,
            dbUser.dealerDiscount,
          );
        }
      }

      return token;
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 6 * 60 * 60, // 6 hours (21600 seconds)
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
