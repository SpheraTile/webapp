import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('=== AUTH ATTEMPT ===')
        console.log('Email:', credentials?.email)

        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials')
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        console.log('User found:', !!user)

        if (!user) {
          console.log('User not found')
          return null
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
        console.log('Password valid:', isPasswordValid)

        if (!isPasswordValid) {
          console.log('Invalid password')
          return null
        }

        console.log('Auth successful for:', user.email)
        return {
          id: user.id,
          email: user.email,
          name: user.nombre,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role
        session.user.id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
}
