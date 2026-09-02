import { requireAdvertiser } from "@/lib/auth";
function adExpired(endDate: Date) {
  const paidEnd = new Date(endDate);
  paidEnd.setHours(23, 59, 59, 999);
  return new Date() > paidEnd;
}
function adLocked(status: string, endDate: Date) {
  return adExpired(endDate) || !["ACTIVE", "PAUSED"].includes(status);
}
import { db } from "@/lib/db";
import {
  advertiserSaveAd,
  requestAdChangePermission,
  renewAdvertisement,
  logoutAction,
} from "@/app/actions";
import { AdPlacementFields } from "@/components/ad-placement-fields";
import Link from "next/link";
import { getAdPlans } from "@/lib/ads";
export default async function AdvertiserDashboard({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; ad?: string; requested?: string }>;
}) {
  const session = await requireAdvertiser();
  const capacityNow=new Date();
  const capacityToday=new Date(capacityNow);capacityToday.setHours(0,0,0,0);
  const [ads, history, categories, plans, q, placementCapacity, configuredLimits] = await Promise.all([
    db.advertisement.findMany({
      where: { userId: session.userId, status: { not: "EXPIRED" } },
      orderBy: { createdAt: "desc" },
    }),
    db.advertisement.findMany({
      where: { userId: session.userId, status: "EXPIRED" },
      orderBy: { updatedAt: "desc" },
    }),
    db.category.findMany({
      include: { parent: true },
      orderBy: { order: "asc" },
    }),
    getAdPlans(),
    searchParams,
    db.advertisement.groupBy({by:['placement'],where:{status:'ACTIVE',imageUrl:{not:null},startDate:{lte:capacityNow},endDate:{gte:capacityToday}},_count:{_all:true}}),
    db.adPlacementCapacity.findMany(),
  ]);
  const placementCounts=Object.fromEntries(placementCapacity.map(item=>[item.placement,item._count._all]));
  const placementLimits=Object.fromEntries(configuredLimits.map(item=>[item.placement,item.capacity]));
  const selectedAd = ads.find((ad) => ad.id === q.ad) || ads[0];
  return (
    <main className="advertiserPage">
      <div className="advertiserTop">
        <div>
          <span className="kicker">Advertisement CMS</span>
          <h1>Welcome, {session.user.name}</h1>
          <p>
            Upload all advertisement content and choose the website placement.
            Dates and payment status remain owner-controlled.
          </p>
        </div>
        <form action={logoutAction}>
          <Link className="secondaryBtn" href="/advertiser/analytics">View click analytics</Link>
          <button className="secondaryBtn">Sign out</button>
        </form>
      </div>
      {q.saved && (
        <div className="success">
          Advertisement saved and updated on the website.
        </div>
      )}
      {q.requested && <div className="success">Change request sent to the administrator. Image and placement will unlock after approval.</div>}
      {ads.length > 1 && <nav className="advertiserTabs" aria-label="Advertisements">
        {ads.map((ad, index) => <Link key={ad.id} href={`/advertiser?ad=${ad.id}`} className={selectedAd?.id === ad.id ? "active" : ""}>
          Advertisement {index + 1}
          <small>{adExpired(ad.endDate) ? "Expired" : ad.status.replaceAll("_", " ")}</small>
        </Link>)}
      </nav>}
      {selectedAd && [selectedAd].map((ad) => (
        <form
          action={advertiserSaveAd}
          className="advertiserEditor"
          key={ad.id}
        >
          <input type="hidden" name="id" value={ad.id} />
          {adExpired(ad.endDate) && (
            <div className="expiredPlanNotice">
              <strong>Subscription expired</strong>
              <span>
                This advertisement is no longer clickable or shown on the website. Renew it to publish again.
              </span>
              <div className="renewalForm">
                <label>Renew for
                  <select name="planId" required defaultValue="">
                    <option value="" disabled>Choose number of days</option>
                    {plans.map(plan => <option value={plan.id} key={plan.id}>{plan.days} days — ₹{plan.price.toLocaleString("en-IN")}</option>)}
                  </select>
                </label>
                <button className="primary" formAction={renewAdvertisement}>Continue to payment QR</button>
              </div>
            </div>
          )}
          {!adExpired(ad.endDate) && adLocked(ad.status, ad.endDate) && (
            <div className="expiredPlanNotice">
              <strong>Renewal payment pending</strong>
              <span>This advertisement stays hidden and locked until the payment is approved.</span>
            </div>
          )}
          <fieldset
            className="advertiserFields"
            disabled={adLocked(ad.status, ad.endDate)}
          >
            <div className="adminCard stack">
              <h2>Advertisement content</h2>
              <label>
                English title
                <input name="title" defaultValue={ad.title} required />
              </label>
              <label>
                Telugu title
                <input name="titleTe" defaultValue={ad.titleTe || ""} />
              </label>
              <label>
                Short English description
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={ad.description || ""}
                  placeholder="Shown on advertisement cards"
                />
              </label>
              <label>
                Short Telugu description
                <textarea
                  name="descriptionTe"
                  rows={3}
                  defaultValue={ad.descriptionTe || ""}
                  placeholder="Shown on advertisement cards"
                />
              </label>
              <label>
                Full English advertisement information
                <textarea
                  name="longDescription"
                  rows={10}
                  defaultValue={ad.longDescription || ""}
                  placeholder="Complete information shown after readers click Learn more"
                />
              </label>
              <label>
                Full Telugu advertisement information
                <textarea
                  name="longDescriptionTe"
                  rows={10}
                  defaultValue={ad.longDescriptionTe || ""}
                  placeholder="Complete information shown after readers click Learn more"
                />
              </label>
              <label>
                Click destination URL
                <input
                  name="linkUrl"
                  type="url"
                  defaultValue={ad.linkUrl || ""}
                />
              </label>
              <fieldset className="changeControlledFields" disabled={Boolean(ad.imageUrl) && ad.changeCredits < 1}>
                <legend>Image and placement</legend>
                <AdPlacementFields
                  initialPlacement={ad.placement}
                  initialCategoryId={ad.categoryId || ""}
                  initialHomeSlot={ad.homeSlot}
                  categories={categories}
                  placementCounts={placementCounts}
                  placementLimits={placementLimits}
                />
                <label>
                  Upload advertisement image
                  <input name="imageFile" type="file" accept="image/jpeg,image/png,image/webp,image/gif" />
                </label>
                <div className="orDivider">OR USE AN IMAGE URL</div>
                <label>
                  Image URL
                  <input name="imageUrl" type="url" defaultValue={ad.imageUrl || ""} />
                </label>
              </fieldset>
              {ad.imageUrl && <div className={`changePermissionNotice ${ad.changeCredits ? "approved" : "locked"}`}>
                <strong>{ad.changeCredits ? `${ad.changeCredits} approved change${ad.changeCredits === 1 ? "" : "s"} remaining` : "Image and placement are locked"}</strong>
                <span>{ad.changeCredits ? "Each image or placement update uses one approved change." : ad.changeRequestPending ? "Your permission request is waiting for admin approval." : "Request admin permission if you need to change the image or placement."}</span>
                {!ad.changeCredits && !ad.changeRequestPending && <button className="secondaryBtn" formAction={requestAdChangePermission}>Request change permission</button>}
              </div>}
              {ad.imageUrl && (
                <img
                  className="adPreview"
                  src={ad.imageUrl}
                  alt="Advertisement preview"
                />
              )}
              <button className="primary">
                Update and publish advertisement
              </button>
            </div>
          </fieldset>
          <aside className="adminCard">
              <h3>{ads.length > 1 ? `Advertisement ${ads.findIndex(item => item.id === ad.id) + 1}` : "Advertisement"}</h3>
            <div
              className={
                adExpired(ad.endDate) ? "planDeadline expired" : "planDeadline"
              }
            >
              <strong>
                {ad.days}-day subscription · {ad.creativeCount} advertisement
                {ad.creativeCount > 1 ? "s" : ""}
              </strong>
              <span>
                {adExpired(ad.endDate)
                  ? "Expired — renew to edit or publish"
                  : "Upload and publish before " + ad.endDate.toLocaleString()}
              </span>
            </div>
            <p>
              <strong>Status:</strong> {ad.status.replaceAll("_", " ")}
            </p>
            <p>
              <strong>Dates:</strong>
              <br />
              {ad.startDate.toLocaleDateString()} –{" "}
              {ad.endDate.toLocaleDateString()}
            </p>
            <p>
              <strong>Paid plan:</strong>
              <br />
              {ad.days} days · ₹{ad.amount}
            </p>
            <p>
              <strong>Placement:</strong>
              <br />
              {ad.placement.replaceAll("_", " ")}
            </p>
            <small>
              Your ad displays only while active and within the paid date range.
            </small>
            <div className="adHistory">
              <h3>Publishing history</h3>
              <p>
                <strong>Created:</strong>
                <br />
                {ad.createdAt.toLocaleString()}
              </p>
              <p>
                <strong>Last published / updated:</strong>
                <br />
                {ad.updatedAt.toLocaleString()}
              </p>
              <p>
                <strong>Published by:</strong>
                <br />
                {session.user.name} ({session.user.email})
              </p>
              <p>
                <strong>Live period:</strong>
                <br />
                {ad.startDate.toLocaleDateString()} –{" "}
                {ad.endDate.toLocaleDateString()}
              </p>
              <span className={"status " + ad.status.toLowerCase()}>
                {ad.status.replaceAll("_", " ")}
              </span>
            </div>
            <div className="advertiserActions">
              <button className="primary" disabled={adLocked(ad.status, ad.endDate)}>
                Edit advertisement
              </button>
            </div>
          </aside>
        </form>
      ))}
      <section className="archivedAdHistory">
        <div className="cardTitle">
          <h2>Advertisement history</h2>
          <span>{history.length} archived</span>
        </div>
        {history.length ? (
          history.map((ad) => (
            <article className="archivedAdItem" key={ad.id}>
              <div>
                <strong>{ad.title}</strong>
                <small>
                  {ad.placement.replaceAll("_", " ")} ·{" "}
                  {ad.startDate.toLocaleDateString()} –{" "}
                  {ad.endDate.toLocaleDateString()}
                </small>
                <small>
                  Published by {session.user.name} · Created{" "}
                  {ad.createdAt.toLocaleString()} · Archived{" "}
                  {ad.updatedAt.toLocaleString()}
                </small>
              </div>
              <span className="status expired">ARCHIVED</span>
            </article>
          ))
        ) : (
          <p className="emptyHistory">No archived advertisements yet.</p>
        )}
      </section>
    </main>
  );
}
