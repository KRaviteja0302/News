import { db } from "@/lib/db";
import { getAdSettings } from "@/lib/ads";
import { notFound } from "next/navigation";
import { submitPaymentReference } from "@/app/actions";
export const dynamic = "force-dynamic";
export default async function Payment({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ submitted?: string }>;
}) {
  const { id } = await params;
  const [ad, s, q] = await Promise.all([
    db.advertisement.findUnique({ where: { id } }),
    getAdSettings(),
    searchParams,
  ]);
  if (!ad) notFound();
  return (
    <section className="paymentPage">
      <div className="paymentCard">
        <span className="kicker">Advertisement payment</span>
        <h1>Pay ₹{ad.amount}</h1>
        <p>
          {ad.days} day{ad.days > 1 ? "s" : ""} · {ad.creativeCount}{" "}
          advertisement{ad.creativeCount > 1 ? "s" : ""}
        </p>
        {s.paymentQrUrl ? (
          <img
            className="paymentQr"
            src={s.paymentQrUrl}
            alt="Payment QR code"
          />
        ) : (
          <div className="qrPlaceholder">
            <div>QR</div>
            <strong>Owner will upload payment QR here</strong>
          </div>
        )}
        {q.submitted ? (
          <div className="success">
            <strong>Payment details received.</strong>
            <br />
            The owner will review them. Your advertiser CMS login will normally
            be provided within 30 minutes.
          </div>
        ) : (
          <form action={submitPaymentReference} className="stack">
            <input type="hidden" name="id" value={ad.id} />
            <label>
              Payment reference / UTR number
              <input name="paymentReference" required />
            </label>
            <button className="primary">Submit payment details</button>
          </form>
        )}
        <small>
          Owner support: {s.ownerWhatsApp} · {s.ownerEmail}
        </small>
      </div>
    </section>
  );
}
