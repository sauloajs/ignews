import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { stripe } from './../../services/stripe';
import { client } from './../../services/fauna';
import { query } from 'faunadb';

const host = process.env.APP_HOST || 'http://localhost:3000';

type User = {
  ref: {
    id: string;
  },
  data: {
    stripe_custome_id: string;
  }
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method != "POST") {
    res.setHeader('Allow', 'POST');
    return res.status(405).send('Method not allowed');
  }

  const session = await getSession({ req });

  const user = await client.query<User>(
    query.Get(
      query.Match(
        query.Index('user_by_email'),
        query.Casefold(session.user.email)
      )
    )
  );

  let stripeCustomerId = user.data.stripe_custome_id;

  if (!stripeCustomerId) {
    const stripeUser = await stripe.customers.create({
      email: session.user.email,
    })

    await client.query(
      query.Update(
        query.Ref(
          query.Collection('users'),
          user.ref.id
        ),
        {
          data: {
            stripe_customer_id: stripeUser.id
          }
        }
      )
    );

    stripeCustomerId = stripeUser.id;
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    payment_method_types: ["card"],
    billing_address_collection: 'required',
    line_items: [
      { price: 'price_1Lr1UdIgVe24F61GfjGK8O87', quantity: 1 }
    ],
    mode: 'subscription',
    allow_promotion_codes: true,
    success_url: `${host}/posts`,
    cancel_url: host
  });

  return res.status(200).json({
    stripeSessionId: checkoutSession.id
  })
}