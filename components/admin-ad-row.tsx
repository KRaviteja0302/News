import type { Advertisement, Category, User } from "@prisma/client";
import {
  approveAdvertiser,
  setAdStatus,
  manageAdPassword,
  deleteAdvertisement,
  grantAdChangeCredits,
} from "@/app/actions";
import { AdSelectionCheckbox } from "@/components/ad-selection-checkbox";
import { AdminCreativeTabs } from "@/components/admin-creative-tabs";
type FullAd = Advertisement & { user: User | null; category?: Category | null };
export function AdminAdRow({ ad, creatives=[ad] }: { ad: FullAd; creatives?: FullAd[] }) {
  const expiry = new Date(ad.endDate);
  expiry.setHours(23, 59, 59, 999);
  const dateExpired = new Date() > expiry;
  return (
    <details className={`adminAdItem${dateExpired ? " dateExpired" : ""}`}>
      <summary>
        <AdSelectionCheckbox id={ad.id} />
        <div>
          <strong>{ad.title}</strong>
          <small>
            {ad.advertiserName} · {ad.phone} · {ad.email}
          </small>
          <small>
            {ad.startDate.toLocaleDateString()} –{" "}
            {ad.endDate.toLocaleDateString()} · {ad.days} days ·{" "}
            {ad.creativeCount} advertisement{ad.creativeCount > 1 ? "s" : ""} ·
            Total ₹{ad.amount}
          </small>
        </div>
        <span className={`status ${dateExpired ? "expired" : ad.status.toLowerCase()}`}>
          {dateExpired ? "EXPIRED · INACTIVE" : ad.status.replaceAll("_", " ")}
        </span>
        <span className="manageLabel">Manage</span>
      </summary>
      {dateExpired && <div className="automaticInactiveNotice"><strong>Automatically inactive</strong><span>The paid period ended on {ad.endDate.toLocaleDateString()}. This advertisement is no longer displayed or clickable. The client must renew it before it can be enabled again.</span></div>}
      {ad.changeRequestPending && <div className="adChangeRequest"><strong>Advertiser requested image or placement changes</strong><span>Choose how many changes this advertiser may make. Each image or placement update uses one credit.</span><form action={grantAdChangeCredits}><input type="hidden" name="id" value={ad.id}/><label>Allowed changes<input name="changeCredits" type="number" min="1" max="5" defaultValue="2" required/></label><button className="primary">Approve changes</button></form></div>}
      {creatives.length>1&&<AdminCreativeTabs creatives={creatives.sort((a,b)=>a.creativeNumber-b.creativeNumber).map(item=>({id:item.id,number:item.creativeNumber,title:item.title,placement:item.placement,status:item.status,imageUrl:item.imageUrl,updatedAt:item.updatedAt.toISOString()}))}/>} 
      <div className="adminAdDetails">
        <section>
          <h3>Advertiser information</h3>
          <dl>
            <dt>Name</dt>
            <dd>{ad.advertiserName}</dd>
            <dt>Email/login</dt>
            <dd>{ad.email}</dd>
            <dt>Mobile</dt>
            <dd>{ad.phone}</dd>
            <dt>Account</dt>
            <dd>
              {ad.user
                ? `${ad.user.active ? "Active" : "Disabled"} advertiser CMS user`
                : "Not created yet"}
            </dd>
            <dt>Payment reference</dt>
            <dd>{ad.paymentReference || "Not submitted"}</dd>
          </dl>
        </section>
        <section>
          <h3>Advertisement details</h3>
          <dl>
            <dt>Placement</dt>
            <dd>{ad.placement.replaceAll("_", " ")}</dd>
            <dt>Category</dt>
            <dd>{ad.category?.name || "Not category-specific"}</dd>
            <dt>English title</dt>
            <dd>{ad.title}</dd>
            <dt>Telugu title</dt>
            <dd>{ad.titleTe || "Not added"}</dd>
            <dt>Destination</dt>
            <dd>{ad.linkUrl || "Not added"}</dd>
            <dt>Created</dt>
            <dd>{ad.createdAt.toLocaleString()}</dd>
            <dt>Last published / updated</dt>
            <dd>{ad.updatedAt.toLocaleString()}</dd>
            <dt>Approved changes remaining</dt>
            <dd>{ad.changeCredits}</dd>
            <dt>Published by</dt>
            <dd>
              {ad.user
                ? ad.user.name + " (" + ad.user.email + ")"
                : "Not approved or published yet"}
            </dd>
          </dl>
        </section>
      </div>
      <div className="adControlBar">
        {ad.status === "PENDING_APPROVAL" && (
          <form action={approveAdvertiser}>
            <input type="hidden" name="id" value={ad.id} />
            <button className="primary">Approve payment & create login</button>
          </form>
        )}
        {ad.status === "ACTIVE" && (
          <form action={setAdStatus}>
            <input type="hidden" name="id" value={ad.id} />
            <input type="hidden" name="status" value="PAUSED" />
            <button className="secondaryBtn">Pause advertisement</button>
          </form>
        )}
        {!dateExpired && (ad.status === "PAUSED" || ad.status === "EXPIRED") && (
          <form action={setAdStatus}>
            <input type="hidden" name="id" value={ad.id} />
            <input type="hidden" name="status" value="ACTIVE" />
            <button className="primary">Enable advertisement</button>
          </form>
        )}
        {ad.user && (
          <form action={manageAdPassword} className="passwordControls">
            <input type="hidden" name="adId" value={ad.id} />
            <input
              name="newPassword"
              placeholder="Custom password (optional)"
              minLength={8}
            />
            <button className="secondaryBtn">Set/reset password</button>
          </form>
        )}
        <form action={setAdStatus}>
          <input type="hidden" name="id" value={ad.id} />
          <input type="hidden" name="status" value="EXPIRED" />
          <button className="dangerText">Stop</button>
        </form>
      </div>
      <form action={deleteAdvertisement} className="deleteAdForm">
        <input type="hidden" name="adId" value={ad.id} />
        <label className="check">
          <input type="checkbox" name="deleteAccount" /> Also deactivate
          advertiser login when this is their last active advertisement
        </label>
        <button className="dangerButton">Archive advertisement</button>
      </form>
    </details>
  );
}
