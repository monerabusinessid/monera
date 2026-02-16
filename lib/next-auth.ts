import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { db } from './db';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        // Check if user exists with this Google ID
        const existingUser = await db.user.findUnique({
          where: { googleId: account.providerAccountId },
        });

        if (!existingUser) {
          // Create new user with Google ID
          await db.user.create({
            data: {
              email: user.email!,
              googleId: account.providerAccountId,
              isVerified: true, // Google accounts are pre-verified
              role: 'CANDIDATE', // Default role, can be changed later
            },
          });
        }
      }
      return true;
    },
    async session({ session, user }) {
      const dbUser = await db.user.findUnique({
        where: { email: session.user.email! },
        include: {
          candidateProfile: true,
          recruiterProfile: true,
        },
      });

      if (dbUser) {
        session.user.id = dbUser.id;
        session.user.role = dbUser.role;
        session.user.isVerified = dbUser.isVerified;
      }

      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
};