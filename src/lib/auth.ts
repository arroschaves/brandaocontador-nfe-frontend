import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import bcrypt from "bcryptjs"
import { findUserByEmail, findUserById } from "@/app/api/auth/register/route"

export const authOptions: NextAuthOptions = {
  providers: [
    // Provider de credenciais (email/senha)
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Buscar usuário no "banco de dados"
        const user = findUserByEmail(credentials.email)
        
        if (!user) {
          return null
        }

        // Verificar senha
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
        
        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      }
    }),

    // Provider do Google
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // Provider do Facebook
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.role = user.role || 'user'
      }

      // Para login social (Google/Facebook)
      if (account?.provider === "google" || account?.provider === "facebook") {
        try {
          // Registrar/atualizar usuário no backend
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/social`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              provider: account.provider,
              providerId: account.providerAccountId,
              email: user.email,
              name: user.name,
              image: user.image,
            }),
          })

          if (response.ok) {
            const userData = await response.json()
            token.id = userData.id
          }
        } catch (error) {
          console.error('Erro ao processar login social:', error)
        }
      }

      return token
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },

  pages: {
    signIn: '/auth/login',
    signUp: '/auth/register',
    error: '/auth/error',
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development',
  
  // URL base para callbacks
  url: process.env.NEXTAUTH_URL || (process.env.NODE_ENV === 'production' ? 'https://nfe.brandaocontador.com.br' : 'http://localhost:3000'),

  // Configurações de desenvolvimento
  debug: process.env.NODE_ENV === 'development',
  
  // Configurações de produção
  useSecureCookies: process.env.NODE_ENV === 'production',
}