import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"

export const authOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  events: {
    async signIn(message) { console.log(message) },
    async signOut(message) { console.log(message) },
    async session(message) { console.log(message) },
  }
}

export default NextAuth(authOptions)