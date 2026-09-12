"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function CheckoutSuccessPage() {
  const { clearItems } = useCart();

  const didClearCart =
    useRef(false);

  useEffect(() => {
    if (didClearCart.current) {
      return;
    }

    const params =
      new URLSearchParams(
        window.location.search
      );

    const sessionId =
      params.get("session_id");

    if (!sessionId) {
      return;
    }

    didClearCart.current = true;

    clearItems();

    /*
     * Remove the Stripe session marker
     * after clearing so refreshing this
     * page later cannot clear a new cart.
     */
    window.history.replaceState(
      {},
      "",
      "/checkout/success"
    );
  }, [clearItems]);

  return (
    <main
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "70px 20px",
      }}
    >
      <div
        style={{
          textAlign: "center",
          border:
            "1px solid rgba(255,255,255,.12)",
          borderRadius: "24px",
          background:
            "rgba(255,255,255,.05)",
          padding: "60px 40px",
        }}
      >
        <div
          style={{
            fontSize: "70px",
            marginBottom: "20px",
          }}
        >
          ✅
        </div>

        <h1
          style={{
            fontSize: "46px",
            marginBottom: "18px",
          }}
        >
          Thank You For Your Order!
        </h1>

        <p
          style={{
            fontSize: "20px",
            opacity: 0.85,
            lineHeight: 1.8,
            maxWidth: "700px",
            margin: "0 auto",
          }}
        >
          Thank you for trusting Timeless
          Mineral Creations with something
          so meaningful. Your handcrafted
          memorial piece has officially
          been reserved.
        </p>

        <div
          style={{
            marginTop: "45px",
            padding: "30px",
            borderRadius: "18px",
            background:
              "rgba(255,255,255,.04)",
            textAlign: "left",
          }}
        >
          <h2>What Happens Next?</h2>

          <p>
            ✅ Your payment has been
            received.
          </p>

          <p>
            ✅ You'll receive an email
            with memorial material shipping
            instructions.
          </p>

          <p>
            ✅ Once your memorial materials
            arrive, your handcrafted
            memorial piece will enter
            production.
          </p>

          <p>
            ✅ Estimated completion time is
            approximately{" "}
            <strong>
              2â€“10 weeks.
            </strong>
          </p>
        </div>

        <div
          style={{
            marginTop: "40px",
            display: "flex",
            justifyContent: "center",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/collections"
            style={{
              padding: "14px 24px",
              borderRadius: "12px",
              textDecoration: "none",
              background:
                "linear-gradient(135deg,rgb(233,192,84),rgb(184,134,11))",
              color: "#111",
              fontWeight: 700,
            }}
          >
            Continue Shopping
          </Link>

          <Link
            href="/"
            style={{
              padding: "14px 24px",
              borderRadius: "12px",
              textDecoration: "none",
              border:
                "1px solid rgba(255,255,255,.18)",
              color: "white",
            }}
          >
            Return Home
          </Link>
        </div>
      </div>
    </main>
  );
}
