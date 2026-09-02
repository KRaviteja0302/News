import { getAdPlans, getAdSettings } from "@/lib/ads";
import { Megaphone, CheckCircle } from "lucide-react";
import { ManagedAdSubscriptionForm } from "@/components/managed-ad-subscription-form";
export const dynamic = "force-dynamic";
export default async function Advertise() {
  const [s, plans] = await Promise.all([getAdSettings(), getAdPlans()]);
  const today = new Date().toISOString().slice(0, 10);
  return (
    <section className="advertisePage">
      <div className="shell advertiseOffer">
        <div className="advertiseCopy">
          <span className="eyebrow">
            <Megaphone /> ADVERTISE WITH US
          </span>
          <h1>Put your business in front of our community</h1>
          <p>
            Choose a subscription first. After selection, enter your
            advertisement details and choose the exact website position.
          </p>
          <div className="adPrice">
            <strong>₹{s.pricePerDay}</strong>
            <span>per day</span>
          </div>
          <ul>
            <li>
              <CheckCircle />
              Daily to yearly subscription packages
            </li>
            <li>
              <CheckCircle />
              Left side, right side, header or content placement
            </li>
            <li>
              <CheckCircle />
              Image upload and bilingual content
            </li>
            <li>
              <CheckCircle />
              Approval normally within 30 minutes
            </li>
          </ul>
        </div>
        <ManagedAdSubscriptionForm plans={plans} today={today} />
      </div>
    </section>
  );
}
