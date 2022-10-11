import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
import { client } from './../../../services/fauna';
import { query } from "faunadb";

export const authOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  events: {
    async signIn({ user, account, profile }): Promise<boolean> { 
      try {
        const { email, name, image } = user;
        await client.query(
          query.If(
            query.Not(
              query.Match(
                query.Index('user_by_email'), 
                query.Casefold(email)
              )
            ),
            query.Create(
              query.Collection('users'),
              {
                data: {
                  name, 
                  email,
                  image
                }
              }
            ),
            query.Get(
              query.Match(
                query.Index('user_by_name'),
                query.Casefold(email)
              )
            )
          )
        );

        return true;
      } catch {
        return false;
      }
    }
  }
}

export default NextAuth(authOptions)