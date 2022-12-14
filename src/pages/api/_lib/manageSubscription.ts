import { query as q } from 'faunadb';
import { client } from "../../../services/fauna";
import { stripe } from '../../../services/stripe';

export async function saveSubscription(
  subscriptionId: string,
  customerId: string,
  createAction: boolean
) {
  const userRef = await client.query(
    q.Select(
      "ref",
      q.Get(
        q.Match(
          q.Index('user_by_stripe_customer_id'),
          customerId
        )
      )
    )
  );

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const subscriptionData = {
    id: subscription.id,
    userId: userRef,
    status: subscription.status,
    price_id: subscription.items.data[0].price.id,
  }

  if (createAction) {
    await client.query(
      q.Create(
        q.Collection('subscriptions'),
        { data: subscriptionData }
      )
    );
  } else {
    await client.query(
      q.Replace(
        q.Select(
          "ref",
          q.Get(
            q.Match(
              q.Index("subscription_by_id"),
              subscription.id
            )
          ),
        ),
        { data: subscriptionData }
      )
    );
  }
}

export async function getUserActiveSubscription(
  email: string
) {
  try {
    const userActiveSubscription = await client.query(
      q.Get(
        q.Intersection([
          q.Match(
            q.Index("subscription_by_user_ref"),
            q.Select(
              "ref",
              q.Get(
                q.Match(
                  q.Index("user_by_email"),
                  q.Casefold(email) 
                )
              )
            )
          ),
          q.Match(
            q.Index("subscription_by_status"),
            "active"
          )
        ])
      )
    )

    return userActiveSubscription;
  } catch {
    return null
  } 
}