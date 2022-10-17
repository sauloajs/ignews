import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
import { client } from './../../../services/fauna';
import { query as q } from "faunadb";

export const authOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  events: {
    async signIn({ user, account, profile }): Promise<void> { 
      try {
        const { email, name, image } = user;
        await client.query(
          q.If(
            q.Not(
              q.Match(
                q.Index('user_by_email'), 
                q.Casefold(email)
              )
            ),
            q.Create(
              q.Collection('users'),
              {
                data: {
                  name, 
                  email,
                  image
                }
              }
            ),
            q.Get(
              q.Match(
                q.Index('user_by_name'),
                q.Casefold(email)
              )
            )
          )
        );
      } catch {
      }
    }
  }
}

export default NextAuth(authOptions)