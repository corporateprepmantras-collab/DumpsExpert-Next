// lib/auth/authOptions.js
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import { connectMongoDB, clientPromise } from '@/lib/mongo';
import UserInfo from '@/models/userInfoSchema';
import bcrypt from 'bcryptjs';

export const authOptions = {
  adapter: MongoDBAdapter(clientPromise, { collections: { Users: 'authUsers', Accounts: 'accounts', Sessions: 'sessions' } }),
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Email OTP',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Email and password are required');
          }

          await connectMongoDB();
          const user = await UserInfo.findOne({ email: credentials.email }).select('+password');
          if (!user) {
            throw new Error('User not found. Please sign up with OTP.');
          }

          if (!user.isVerified) {
            throw new Error('Email not verified. Please verify your email.');
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          if (!isPasswordValid) {
            throw new Error('Invalid password');
          }

          const adapter = MongoDBAdapter(clientPromise, { collections: { Users: 'authUsers' } });
          let authUser = await adapter.getUserByEmail(credentials.email);
          if (!authUser) {
            authUser = await adapter.createUser({
              email: user.email,
              name: user.name || user.email.split('@')[0],
              image: user.profileImage || '',
            });
            await UserInfo.updateOne(
              { email: credentials.email },
              { authUserId: authUser.id },
              { upsert: true }
            );
          } else if (!user.authUserId || !user.authUserId.equals(authUser.id)) {
            await UserInfo.updateOne(
              { email: credentials.email },
              { authUserId: authUser.id }
            );
          }

          return {
            id: authUser.id.toString(),
            email: user.email,
            name: user.name,
            role: user.role || 'guest',
            subscription: user.subscription || 'no',
            provider: user.provider || 'credentials',
            providerId: user.providerId,
            isVerified: user.isVerified,
            phone: user.phone,
            address: user.address,
            dob: user.dob,
            gender: user.gender,
            bio: user.bio,
            profileImage: user.profileImage,
            createdAt: user.createdAt,
          };
        } catch (error) {
          console.error('Authorize error:', error.message);
          throw error;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        await connectMongoDB();
        const adapter = MongoDBAdapter(clientPromise, { collections: { Users: 'authUsers', Accounts: 'accounts', Sessions: 'sessions' } });
        const email = user.email;

        if (account?.provider === 'google' || account?.provider === 'facebook') {
          let authUser = await adapter.getUserByEmail(email);
          let userInfo = await UserInfo.findOne({ email });

          // Create authUser if it doesn't exist
          if (!authUser) {
            authUser = await adapter.createUser({
              email,
              name: user.name || email.split('@')[0],
              image: user.image || '',
            });
          }

          // Link account to authUser
          const accountDoc = await clientPromise.then(client =>
            client.db().collection('accounts').findOne({ provider: account.provider, providerAccountId: account.providerAccountId })
          );
          if (!accountDoc || accountDoc.userId.toString() !== authUser.id.toString()) {
            await clientPromise.then(client =>
              client.db().collection('accounts').deleteMany({ provider: account.provider, providerAccountId: account.providerAccountId })
            );
            await adapter.linkAccount({
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              type: account.type,
              access_token: account.access_token,
              expires_at: account.expires_at,
              refresh_token: account.refresh_token,
              scope: account.scope,
              token_type: account.token_type,
              id_token: account.id_token,
              userId: authUser.id.toString(),
            });
          }

          // Create or update UserInfo
          if (!userInfo) {
            userInfo = new UserInfo({
              authUserId: authUser.id,
              email,
              name: user.name || email.split('@')[0],
              provider: account.provider,
              providerId: account.providerAccountId,
              isVerified: true,
              role: 'guest', // Default role
              subscription: 'no', // Default subscription
              phone: '',
              address: '',
              bio: '',
              profileImage: user.image || '',
              createdAt: new Date(),
            });
            await userInfo.save();
          } else {
            await UserInfo.updateOne(
              { email },
              {
                authUserId: authUser.id,
                provider: account.provider,
                providerId: account.providerAccountId,
                isVerified: true,
                name: userInfo.name || user.name || email.split('@')[0],
                profileImage: userInfo.profileImage || user.image || '',
                // Preserve existing role and subscription unless explicitly updated
              }
            );
          }

          // Update user object with UserInfo data
          user.id = authUser.id.toString();
          user.role = userInfo.role || 'guest';
          user.subscription = userInfo.subscription || 'no';
          user.provider = userInfo.provider || account.provider;
          user.providerId = userInfo.providerId || account.providerAccountId;
          user.isVerified = userInfo.isVerified;
          user.phone = userInfo.phone;
          user.address = userInfo.address;
          user.dob = userInfo.dob;
          user.gender = userInfo.gender;
          user.bio = userInfo.bio;
          user.profileImage = userInfo.profileImage;
          user.createdAt = userInfo.createdAt;

          return true;
        }

        // Credentials provider
        return true;
      } catch (error) {
        console.error('SignIn callback error:', error.message);
        return false;
      }
    },
    async jwt({ token, user, account }) {
      try {
        // Initial sign-in: populate token with user data
        if (user) {
          token.id = user.id;
          token.email = user.email;
          token.name = user.name;
          token.role = user.role || 'guest';
          token.subscription = user.subscription || 'no';
          token.provider = user.provider || account?.provider || 'credentials';
          token.providerId = user.providerId;
          token.isVerified = user.isVerified ?? false;
          token.phone = user.phone;
          token.address = user.address;
          token.dob = user.dob;
          token.gender = user.gender;
          token.bio = user.bio;
          token.profileImage = user.profileImage;
          token.createdAt = user.createdAt;
          token.accessToken = account?.access_token;
        } else {
          // Refresh token with latest UserInfo data
          await connectMongoDB();
          const userInfo = await UserInfo.findOne({ email: token.email }).select(
            'role subscription name email provider providerId isVerified phone address dob gender bio profileImage createdAt'
          );
          if (userInfo) {
            token.role = userInfo.role || 'guest';
            token.subscription = userInfo.subscription || 'no';
            token.name = userInfo.name;
            token.email = userInfo.email;
            token.provider = userInfo.provider;
            token.providerId = userInfo.providerId;
            token.isVerified = userInfo.isVerified;
            token.phone = userInfo.phone;
            token.address = userInfo.address;
            token.dob = userInfo.dob;
            token.gender = userInfo.gender;
            token.bio = userInfo.bio;
            token.profileImage = userInfo.profileImage;
            token.createdAt = userInfo.createdAt;
          }
        }

        // Always set iat/exp
        token.iat = Math.floor(Date.now() / 1000);
        token.exp = Math.floor(Date.now() / 1000) + 24 * 60 * 60;
        return token;
      } catch (error) {
        console.error('JWT callback error:', error.message);
        return token; // Return original token to avoid breaking session
      }
    },
    async session({ session, token }) {
      try {
        session.user = session.user || {};
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.role = token.role;
        session.user.subscription = token.subscription;
        session.user.provider = token.provider;
        session.user.providerId = token.providerId;
        session.user.isVerified = token.isVerified;
        session.user.phone = token.phone;
        session.user.address = token.address;
        session.user.dob = token.dob;
        session.user.gender = token.gender;
        session.user.bio = token.bio;
        session.user.profileImage = token.profileImage;
        session.user.createdAt = token.createdAt;
        session.accessToken = token.accessToken;
        session.expires = new Date(token.exp * 1000).toISOString();
        return session;
      } catch (error) {
        console.error('Session callback error:', error.message);
        return session; // Return original session to avoid breaking session
      }
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    signOut: '/auth/signout',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV !== 'production', // Disable debug in production
  cookies: {
    sessionToken: {
      // Set both legacy and __Secure- prefixed cookie names for edge compatibility
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60, // 24 hours
        domain: process.env.NODE_ENV === 'production' ? '.dumpsxpert-next.vercel.app' : undefined,
      },
    },
    callbackUrl: {
      name: 'next-auth.callback-url',
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? '.dumpsxpert-next.vercel.app' : undefined,
      },
    },
    csrfToken: {
      name: 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? '.dumpsxpert-next.vercel.app' : undefined,
      },
    },
    state: {
      name: 'next-auth.state',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 900,
        domain: process.env.NODE_ENV === 'production' ? '.dumpsxpert-next.vercel.app' : undefined,
      },
    },
    pkceCodeVerifier: {
      name: 'next-auth.pkce.code_verifier',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 900,
        domain: process.env.NODE_ENV === 'production' ? '.dumpsxpert-next.vercel.app' : undefined,
      },
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);