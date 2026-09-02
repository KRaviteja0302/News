import type { AdPlan } from "@prisma/client";
import { deleteAdPlan, saveAdPlan } from "@/app/actions";
function PlanFields({ plan }: { plan?: AdPlan }) {
  return (
    <>
      <input type="hidden" name="id" value={plan?.id || ""} />
      <label>
        Plan name
        <input name="name" defaultValue={plan?.name || ""} required />
      </label>
      <label>
        Duration (days)
        <input
          name="days"
          type="number"
          min="1"
          defaultValue={plan?.days || 7}
          required
        />
      </label>
      <label>
        Plan price (₹)
        <input
          name="price"
          type="number"
          min="1"
          defaultValue={plan?.price || 1400}
          required
        />
      </label>
      <label>
        Price suffix
        <input
          name="billingLabel"
          defaultValue={plan?.billingLabel || "week"}
          placeholder="week / month / campaign"
        />
      </label>
      <label>
        Short description
        <input name="note" defaultValue={plan?.note || ""} />
      </label>
      <label>
        Card color
        <select name="theme" defaultValue={plan?.theme || "slate"}>
          <option value="slate">Slate</option>
          <option value="red">Red</option>
          <option value="orange">Orange</option>
          <option value="green">Green</option>
          <option value="blue">Blue</option>
        </select>
      </label>
      <label>
        Display order
        <input name="order" type="number" defaultValue={plan?.order || 0} />
      </label>
      <label className="full">
        Features (one per line)
        <textarea
          name="features"
          rows={5}
          defaultValue={plan?.features || ""}
          required
        />
      </label>
      <label className="check">
        <input name="popular" type="checkbox" defaultChecked={plan?.popular} />{" "}
        Most Popular badge
      </label>
      <label className="check">
        <input
          name="active"
          type="checkbox"
          defaultChecked={plan?.active ?? true}
        />{" "}
        Show this plan publicly
      </label>
    </>
  );
}
export function AdminAdPlans({ plans }: { plans: AdPlan[] }) {
  return (
    <section className="adminCard adPlanManager">
      <div className="cardTitle">
        <div>
          <h2>Advertising subscription plans</h2>
          <p>Control every public plan, price, feature and display style.</p>
        </div>
        <span>{plans.length} plans</span>
      </div>
      <details className="categoryEditor">
        <summary>
          <span>
            <strong>Add advertising plan</strong>
            <small>Create a new public subscription card</small>
          </span>
          <span>Open form</span>
        </summary>
        <form action={saveAdPlan} className="settingsGrid">
          <PlanFields />
          <button className="primary">Create plan</button>
        </form>
      </details>
      <div className="categoryEditors">
        {plans.map((plan) => (
          <details className="categoryEditor" key={plan.id}>
            <summary>
              <span>
                <strong>
                  {plan.name} · ₹{plan.price}
                </strong>
                <small>
                  {plan.days} days · {plan.active ? "Visible" : "Hidden"}
                  {plan.popular ? " · Most Popular" : ""}
                </small>
              </span>
              <span>Edit</span>
            </summary>
            <form action={saveAdPlan} className="settingsGrid">
              <PlanFields plan={plan} />
              <button className="primary">Save plan</button>
              <button className="dangerButton" formAction={deleteAdPlan}>
                Delete plan
              </button>
            </form>
          </details>
        ))}
      </div>
    </section>
  );
}
