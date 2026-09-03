import { db } from "@/lib/db";
import { getAdSettings } from "@/lib/ads";
import {
  saveAdSettings,
  bulkDeleteAdvertisements,
  setAdStatus,
  setAdPlacementCapacity,
} from "@/app/actions";
import Link from "next/link";
import { AdminAdRow } from "@/components/admin-ad-row";
import { AdminAdPlans } from "@/components/admin-ad-plans";
import { advertisingPlacements } from "@/lib/ad-placement";
export default async function AdsAdmin({
  searchParams,
}: {
  searchParams: Promise<{
    approved?: string;
    password?: string;
    settings?: string;
    archived?: string;
    deleted?: string;
    changesGranted?: string;
    capacitySaved?: string;
    search?: string;
    page?: string;
    emailStatus?: string;
  }>;
}) {
  const q = await searchParams;
  const search = (q.search || "").trim();
  const page = Math.max(1, Number(q.page) || 1);
  const pageSize = 10;
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  await db.advertisement.updateMany({
    where: { status: "ACTIVE", endDate: { lt: today } },
    data: { status: "PAUSED" },
  });
  const activeWhere = {
    status: { not: "EXPIRED" as const },
    ...(search ? { OR: [
      { title: { contains: search, mode: "insensitive" as const } },
      { advertiserName: { contains: search, mode: "insensitive" as const } },
      { email: { contains: search, mode: "insensitive" as const } },
      { phone: { contains: search, mode: "insensitive" as const } },
    ] } : {}),
  };
  const [ads, totalAds, archivedAds, s, plans, approved, placementCapacity, configuredLimits] = await Promise.all([
    db.advertisement.findMany({
      where: activeWhere,
      include: { user: true, category: true },
      orderBy: [{ endDate: "asc" }, { createdAt: "desc" }],
    }),
    db.advertisement.count({ where: activeWhere }),
    db.advertisement.findMany({
      where: { status: "EXPIRED" },
      include: { user: true, category: true },
      orderBy: { updatedAt: "desc" },
    }),
    getAdSettings(),
    db.adPlan.findMany({ orderBy: [{ order: "asc" }, { price: "asc" }] }),
    q.approved ? db.advertisement.findUnique({ where: { id: q.approved } }) : null,
    db.advertisement.groupBy({by:['placement'],where:{status:'ACTIVE',imageUrl:{not:null},startDate:{lte:now},endDate:{gte:today}},_count:{_all:true}}),
    db.adPlacementCapacity.findMany(),
  ]);
  const placementCounts=Object.fromEntries(placementCapacity.map(item=>[item.placement,item._count._all]));
  const placementLimits=Object.fromEntries(configuredLimits.map(item=>[item.placement,item.capacity]));
  const groupedBookings=Array.from(ads.reduce((groups,ad)=>{const key=ad.bookingGroupId||ad.id;const group=groups.get(key)||[];group.push(ad);groups.set(key,group);return groups},new Map<string,typeof ads>()).values());
  const totalBookings=groupedBookings.length;
  const pagedBookings=groupedBookings.slice((page-1)*pageSize,page*pageSize);
  const totalPages = Math.max(1, Math.ceil(totalBookings / pageSize));
  const pageHref = (target: number) => `/admin/advertisements?${new URLSearchParams({ ...(search ? { search } : {}), page: String(target) }).toString()}`;
  const message =
    approved && q.password
      ? `Your advertisement CMS login: ${(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "")}/advertiser/login Email: ${approved.email} Password: ${q.password}`
      : "";
  return (
    <>
      <div className="adminHeader">
        <div>
          <span className="kicker">Revenue & promotions</span>
          <h1>Advertisements</h1>
          <p>
            Open any advertiser to view full details, manage login, placement,
            status or deletion.
          </p>
        </div>
        <Link href="/advertise" target="_blank" className="primary">
          View subscription page
        </Link>
      </div>
      {approved && q.password && (
        <div className="credentialBox">
          <h2>New advertiser password</h2>
          <p>
            <strong>Email:</strong> {approved.email}
            <br />
            <strong>Temporary password:</strong> {q.password}
          </p>
          <div>
            <a
              className="primary"
              target="_blank"
              href={`https://wa.me/91${approved.phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`}
            >
              Send with WhatsApp
            </a>
            <a
              className="secondaryBtn"
              href={`mailto:${approved.email}?subject=${encodeURIComponent("Your advertisement CMS login")}&body=${encodeURIComponent(message)}`}
            >
              Send with email
            </a>
          </div>
          <small>
            {q.emailStatus === "sent"
              ? "Login details were emailed automatically. This password is shown only once."
              : q.emailStatus === "not-configured"
                ? "Automatic email is not configured yet. Use WhatsApp or email above, then add the server email settings."
                : "Automatic email could not be delivered. Use WhatsApp or email above and check the server email settings."}
          </small>
        </div>
      )}
      {q.archived && (
        <div className="success">
          {q.archived} advertisement(s) moved to archive.
        </div>
      )}
      {q.deleted && (
        <div className="success">Advertisement moved to archive.</div>
      )}
      {q.settings && (
        <div className="success">Payment QR and owner settings saved. The QR is now visible on customer payment pages.</div>
      )}
      {q.changesGranted && <div className="success">Advertiser change allowance approved.</div>}
      {q.capacitySaved && <div className="success">Advertisement position capacity updated. Extra advertisements will join the slideshow.</div>}
      <div className="adminCard adCapacityPanel">
        <div className="cardTitle"><div><h2>Advertisement position capacity</h2><p>Default capacity is five. Increase a position when you approve additional clients; every active advertisement joins its slideshow.</p></div><span>Admin-controlled limits</span></div>
        <div className="adCapacityGrid">{advertisingPlacements.map(item=>{const count=placementCounts[item.placement]||0;const limit=placementLimits[item.placement]||5;return <div className={count>=limit?'capacityItem full':'capacityItem'} key={item.placement}><div><strong>{item.name}</strong><small>{item.size}</small></div><b>{count} / {limit}</b><span>{count>=limit?'FULL — increase the limit to approve another client':`${limit-count} position${limit-count===1?'':'s'} available`}</span><form action={setAdPlacementCapacity}><input type="hidden" name="placement" value={item.placement}/><label>Allowed slides<input name="capacity" type="number" min="5" max="20" defaultValue={limit}/></label><button className="secondaryBtn">Save capacity</button></form></div>})}</div>
      </div>
      <AdminAdPlans plans={plans} />
      <div className="adminCard adSettings">
        <h2>Payment and owner settings</h2>
        <form action={saveAdSettings} className="settingsGrid">
          <label>
            Price per day (₹)
            <input
              name="pricePerDay"
              type="number"
              min="1"
              defaultValue={s.pricePerDay}
            />
          </label>
          <label>
            Owner WhatsApp
            <input name="ownerWhatsApp" defaultValue={s.ownerWhatsApp} />
          </label>
          <label>
            Owner email
            <input name="ownerEmail" type="email" defaultValue={s.ownerEmail} />
          </label>
          <label>
            Upload payment QR shown to customers
            <input
              name="paymentQrFile"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
            />
          </label>
          <label>
            Or payment QR URL
            <input
              name="paymentQrUrl"
              type="url"
              defaultValue={s.paymentQrUrl || ""}
            />
          </label>
          <label className="full">
            Payment instructions
            <textarea
              name="paymentInstructions"
              rows={3}
              defaultValue={s.paymentInstructions}
            />
          </label>
          {s.paymentQrUrl && (
            <div><small>Current customer payment QR</small><img className="adminQr" src={s.paymentQrUrl} alt="Current customer payment QR" /></div>
          )}
          <button className="primary">Save payment settings</button>
        </form>
      </div>
      <div className="adminCard">
        <div className="cardTitle">
          <h2>Subscriptions and advertisements</h2>
          <span>{totalBookings} client booking{totalBookings===1?'':'s'} · {totalAds} advertisements</span>
        </div>
        <form className="adminAdSearch" method="get">
          <input name="search" defaultValue={search} placeholder="Search name, title, email or phone" aria-label="Search advertisements" />
          <button className="primary">Search</button>
          {search && <Link className="secondaryBtn" href="/admin/advertisements">Clear</Link>}
        </form>
        <form
          id="bulk-ad-delete"
          action={bulkDeleteAdvertisements}
          className="bulkAdControls"
        >
          <span>
            Select advertisements using the checkboxes, then delete them
            together.
          </span>
          <button className="dangerButton">Delete selected</button>
        </form>
        <div className="adminAdList">
          {pagedBookings.map((creatives) => (
            <AdminAdRow key={creatives[0].bookingGroupId||creatives[0].id} ad={creatives.find(item=>item.creativeNumber===1)||creatives[0]} creatives={creatives} />
          ))}
          {!pagedBookings.length && <p className="emptyHistory">No advertisements match your search.</p>}
        </div>
        {totalPages > 1 && <nav className="adminPagination" aria-label="Advertisement pages">
          {page > 1 && <Link href={pageHref(page - 1)}>← Previous</Link>}
          <span>Page {Math.min(page, totalPages)} of {totalPages}</span>
          {page < totalPages && <Link href={pageHref(page + 1)}>Next →</Link>}
        </nav>}
      </div>
      <div className="adminCard archivedAdminAds">
        <div className="cardTitle">
          <h2>Archived advertisement history</h2>
          <span>{archivedAds.length} archived</span>
        </div>
        {archivedAds.length ? (
          archivedAds.map((ad) => (
            <div className="archivedAdItem" key={ad.id}>
              <div>
                <strong>{ad.title}</strong>
                <small>
                  {ad.advertiserName} · {ad.email}
                </small>
                <small>
                  {ad.placement.replaceAll("_", " ")} · Archived{" "}
                  {ad.updatedAt.toLocaleString()} · Published by{" "}
                  {ad.user?.name || ad.advertiserName}
                </small>
              </div>
              <form action={setAdStatus}>
                <input type="hidden" name="id" value={ad.id} />
                <input type="hidden" name="status" value="ACTIVE" />
                <button className="secondaryBtn">Restore</button>
              </form>
            </div>
          ))
        ) : (
          <p className="emptyHistory">No archived advertisements.</p>
        )}
      </div>
    </>
  );
}
