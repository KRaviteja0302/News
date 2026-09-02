"use client";
import { useState } from "react";
import { submitAdRequest } from "@/app/actions";

type Plan = { id: string; name: string; days: number; note: string };
const plans: Plan[] = [
  { id: "daily", name: "Daily", days: 1, note: "Try it for one day" },
  { id: "weekly", name: "Weekly", days: 7, note: "7 days visibility" },
  { id: "monthly", name: "Monthly", days: 30, note: "30 days visibility" },
  { id: "quarterly", name: "Quarterly", days: 90, note: "3 months visibility" },
  {
    id: "half-yearly",
    name: "Half-Yearly",
    days: 180,
    note: "6 months visibility",
  },
  { id: "yearly", name: "Yearly", days: 365, note: "12 months visibility" },
  { id: "custom", name: "Custom Days", days: 1, note: "Choose your duration" },
];

export function AdSubscriptionForm({
  pricePerDay,
  categories,
  today,
}: {
  pricePerDay: number;
  categories: { id: string; name: string; nameTe: string | null }[];
  today: string;
}) {
  const [selected, setSelected] = useState<Plan | null>(null);
  const [customDays, setCustomDays] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const days = selected?.id === "custom" ? customDays : selected?.days || 1;
  const total = pricePerDay * days * quantity;
  return (
    <div className="subscriptionFlow">
      <div className="planIntro">
        <span>STEP 1 OF 2</span>
        <h2>Choose your subscription</h2>
        <p>Select a package to continue with your advertisement details.</p>
      </div>
      <div className="planGrid">
        {plans.map((plan) => (
          <label
            className={`planOption ${selected?.id === plan.id ? "selected" : ""}`}
            key={plan.id}
          >
            <input
              type="radio"
              name="subscriptionPlan"
              value={plan.id}
              checked={selected?.id === plan.id}
              onChange={() => setSelected(plan)}
            />
            <span className="planRadio" />
            <strong>{plan.name}</strong>
            <small>{plan.note}</small>
            <b>₹{(pricePerDay * plan.days).toLocaleString("en-IN")}</b>
          </label>
        ))}
      </div>
      {selected && (
        <form action={submitAdRequest} className="adSignup subscriptionDetails">
          <div className="chosenPlan">
            <span>SELECTED PACKAGE</span>
            <strong>{selected.name}</strong>
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
            {selected.id === "custom" ? (
              <label>
                Number of days
                <input
                  name="days"
                  type="number"
                  min="1"
                  max="365"
                  value={customDays}
                  onChange={(e) =>
                    setCustomDays(
                      Math.max(1, Math.min(365, Number(e.target.value) || 1)),
                    )
                  }
                  required
                />
              </label>
            ) : (
              <label>
                Duration
                <input value={`${days} days`} readOnly />
                <input name="days" type="hidden" value={days} />
              </label>
            )}
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
            Total: ₹{pricePerDay.toLocaleString("en-IN")} × {days} days ×{" "}
            {quantity} advertisement{quantity > 1 ? "s" : ""} = ₹
            {total.toLocaleString("en-IN")}
          </div>
          <button className="primary">Continue to payment QR</button>
        </form>
      )}
    </div>
  );
}
