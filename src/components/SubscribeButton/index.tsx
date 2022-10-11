import styles from "./styles.module.scss";
import { useSession } from 'next-auth/react';
import { signIn } from 'next-auth/react';
import { api } from './../../services/api';
import { getStripeJs } from "../../services/stripe-js";

interface SubscribeButtonProps {
  priceId: string;
}

export function SubscribeButton ({ priceId }: SubscribeButtonProps) {  
  const { data: session } = useSession();
  
  async function handleSubscribe() {
    if (!session) {
      signIn('github');
      return;
    }

    const response = await api.post('/subscribe')

    const { stripeSessionId } = response.data;
    const stripe = await getStripeJs();

    try {
      stripe.redirectToCheckout({
        sessionId: stripeSessionId
      })
    } catch (err) {
      alert(err.message);
    }

  }

  return (
    <button 
      type="button" 
      className={styles.subscribeButton}
      onClick={handleSubscribe}
    >
      Subscribe now
    </button>
  )
}