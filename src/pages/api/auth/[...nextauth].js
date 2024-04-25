import NextAuth from "next-auth"
import EmailProvider from "next-auth/providers/email"

export const authOptions = {
  // Configure one or more authentication providers
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
      // maxAge: 24 * 60 * 60, // How long email links are valid for (default 24h)
    }),
  ],
}
export default NextAuth(authOptions)