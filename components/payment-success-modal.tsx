"use client";

import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function PaymentSuccessModal() {
  const router = useRouter();

  useEffect(() => {
    const redirectTimer = window.setTimeout(() => router.replace("/"), 2500);
    return () => window.clearTimeout(redirectTimer);
  }, [router]);

  return (
    <div className="paymentSuccessOverlay" role="dialog" aria-modal="true" aria-labelledby="payment-success-title">
      <div className="paymentSuccessModal">
        <div className="paymentSuccessIcon" aria-hidden="true"><Check /></div>
        <h2 id="payment-success-title">Payment successful!</h2>
        <p>Your payment details have been submitted successfully.</p>
        <small>Redirecting you to the home page…</small>
        <span className="paymentRedirectBar" aria-hidden="true" />
      </div>
    </div>
  );
}
