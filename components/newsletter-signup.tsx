import { subscribeNewsletter } from '@/app/actions';

export function NewsletterSignup(){return <section className="shell newsletterSignup" id="subscribe"><h2>Stay Connected with Your Roots 🌍</h2><p>Get the most important community stories delivered directly to your inbox.</p><form action={subscribeNewsletter}><input name="email" type="email" placeholder="Enter your email" aria-label="Email address" required/><button>Subscribe Free</button></form></section>}
