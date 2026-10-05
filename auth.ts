import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { isOwnerEmail, verifiedOwnerProfile } from './lib/auth-policy';

export const { handlers, auth } = NextAuth({
  providers: [Google],
  session: { strategy: 'jwt' },
  callbacks: {
    signIn({ account, profile }) {
      return account?.provider === 'google' && verifiedOwnerProfile(profile);
    },
    jwt({ token, account, profile }) {
      if (account) token.ownerVerified = account.provider === 'google' && verifiedOwnerProfile(profile);
      return token;
    },
    session({ session, token }) {
      if (!token.ownerVerified || !isOwnerEmail(token.email)) {
        session.user = { ...session.user, email: '' };
      }
      return session;
    },
  },
});
