"use client";
import { useState } from "react";
import { submitAdRequest } from "@/app/actions";
export type PublicAdPlan = {
  id: string;
  name: string;
  days: number;
  price: number;
  billingLabel: string;
  note: string | null;
  features: string;
  theme: string;
  popular: boolean;
};
export function ManagedAdSubscriptionForm({
  plans,
  today,
}: {
  plans: PublicAdPlan[];
  today: string;
}) {
  const [selected, setSelected] = useState<PublicAdPlan | null>(null);
  const [quantity, setQuantity] = useState(1);
  const total = (selected?.price || 0) * quantity;
  return (
    <div className="subscriptionFlow">
      <div className="planIntro">
        <span>ADVERTISING PACKAGES</span>
        <h2>Choose Your Advertising Plan</h2>
        <p>Every plan and feature below is managed from the admin CMS.</p>
      </div>
      <div className="planGrid managedPlanGrid">
        {plans.map((plan) => (
          <label
            className={`planOption managedPlan ${plan.theme} ${selected?.id === plan.id ? "selected" : ""}`}
            key={plan.id}
          >
            <input
              type="radio"
              checked={selected?.id === plan.id}
              onChange={() => setSelected(plan)}
            />
            {plan.popular && <span className="popularPlan">MOST POPULAR</span>}
            <div className="managedPlanHead">
              <strong>{plan.name}</strong>
              <b>
                ₹{plan.price.toLocaleString("en-IN")}
                <small>/{plan.billingLabel}</small>
              </b>
            </div>
            {plan.note && <p>{plan.note}</p>}
            <ul>
              {plan.features
                .split("\n")
                .filter(Boolean)
                .map((feature) => (
                  <li key={feature}>
                    ✓ <span>{feature}</span>
                  </li>
                ))}
            </ul>
            <span className="choosePlan">Choose {plan.name}</span>
          </label>
        ))}
      </div>
      {!plans.length && (
        <div className="empty">
          No advertising plans are currently available.
        </div>
      )}
      {selected && (
        <form action={submitAdRequest} className="adSignup subscriptionDetails">
          <input type="hidden" name="planId" value={selected.id} />
          <div className="chosenPlan">
            <span>SELECTED PACKAGE</span>
            <strong>
              {selected.name} · {selected.days} days
            </strong>
            <b>₹{total.toLocaleString("en-IN")}</b>
          </div>
          <h2>Advertisement details</h2>
          <label>
            Your name
            <input name="advertiserName" required />
          </label>
          <label>
            Mobile number
            <input name="phone" inputMode="tel" required />
          </label>
          <label>
            Email address
            <input name="email" type="email" required />
          </label>
          <label>
            Business / advertisement title
            <input name="title" required />
          </label>
          <div className="twoFields">
            <label>
              Start date
              <input
                name="startDate"
                type="date"
                min={today}
                defaultValue={today}
                required
              />
            </label>
            <label>
              Duration
              <input value={`${selected.days} days`} readOnly />
            </label>
          </div>
          <label>
            Number of advertisements
            <input
              name="quantity"
              type="number"
              min="1"
              max="5"
              value={quantity}
              onChange={(event) =>
                setQuantity(
                  Math.max(1, Math.min(5, Number(event.target.value) || 1)),
                )
              }
              required
            />
            <small>
              Maximum 5. Each advertisement receives a separate CMS editor and placement.
            </small>
          </label>
          <div className="priceNote">
            Total: ₹{selected.price.toLocaleString("en-IN")} × {quantity}{" "}
            advertisement{quantity > 1 ? "s" : ""} = ₹
            {total.toLocaleString("en-IN")}
          </div>
          <button className="primary">Continue to payment QR</button>
        </form>
      )}
    </div>
  );
}
