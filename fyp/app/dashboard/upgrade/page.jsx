// app/dashboard/upgrade/page.jsx
"use client";

import { useEffect, useState } from "react";

const PLANS = [
  {
    id: "pro",
    name: "Pro",
    description: "Best for active students. Faster AI and more flexibility.",
    price: "$9.99 / month",
    features: [
      "Unlimited generations while active",
      "Faster AI model",
      "Priority queue",
      "Bonus 50 credits on subscribe",
    ],
  },
  {
    id: "unlimited",
    name: "Unlimited",
    description: "For power users, creators, and exam season.",
    price: "$19.99 / month",
    features: [
      "Unlimited generations forever",
      "Fastest AI model",
      "Highest priority",
      "Best support",
    ],
  },
];

const PACKS = [
  { id: "basic", label: "Basic Pack", credits: 20, price: "$4.99" },
  { id: "pro", label: "Pro Pack", credits: 50, price: "$9.99" },
  { id: "ultimate", label: "Ultimate Pack", credits: 150, price: "$19.99" },
];

export default function UpgradePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load subscription data from /api/me
  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/me");
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error("Failed loading user:", err);
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  const subscribe = async (planId) => {
    const res = await fetch("/api/upgrade/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId }),
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Subscription failed");
      return;
    }

    alert(data.message);
    window.location.reload();
  };

  const buyPack = async (packId) => {
    const res = await fetch("/api/upgrade/credits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packId }),
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Purchase failed");
      return;
    }

    alert(data.message);
    window.location.reload();
  };

  if (loading)
    return <p className="p-6 text-gray-700">Loading upgrade options…</p>;

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 space-y-10">
      {/* Header Section */}
      <section>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
          Upgrade your AI-Learn account
        </h1>

        <p className="mt-2 text-sm text-gray-600">
          Choose a subscription or buy a credits pack.
        </p>

        <p className="mt-3 text-sm font-semibold text-gray-800">
          Current Plan:{" "}
          <span className="uppercase text-gray-900">
            {user?.subscriptionTier || "FREE"}
          </span>
        </p>
      </section>

      {/* Subscription Plans */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Subscriptions</h2>

        <div className="grid gap-4 md:grid-cols-2">
          {PLANS.map((plan) => {
            const isActive = user?.subscriptionTier === plan.id;

            return (
              <div
                key={plan.id}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <h3 className="text-xl font-semibold text-gray-900">
                  {plan.name}
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  {plan.description}
                </p>

                <p className="mt-3 text-lg font-bold text-gray-900">
                  {plan.price}
                </p>

                <ul className="mt-3 space-y-1 text-sm text-gray-700 list-disc pl-5">
                  {plan.features.map((f, idx) => (
                    <li key={idx}>{f}</li>
                  ))}
                </ul>

                <button
                  disabled={isActive}
                  onClick={() => subscribe(plan.id)}
                  className={`mt-4 w-full rounded-lg px-4 py-2 text-sm font-semibold transition 
                    ${
                      isActive
                        ? "bg-gray-300 text-gray-700 cursor-not-allowed"
                        : "bg-gray-900 text-white hover:bg-black"
                    }`}
                >
                  {isActive ? "Already Subscribed" : `Subscribe to ${plan.name}`}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Credit Packs */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Credit Packs</h2>

        <div className="grid gap-4 md:grid-cols-3">
          {PACKS.map((pack) => (
            <div
              key={pack.id}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <h3 className="text-base font-semibold text-gray-900">
                {pack.label}
              </h3>

              <p className="mt-1 text-sm text-gray-600">
                {pack.credits} additional credits
              </p>

              <p className="mt-3 text-lg font-bold text-gray-900">
                {pack.price}
              </p>

              <button
                onClick={() => buyPack(pack.id)}
                className="mt-4 w-full rounded-lg border border-gray-900 bg-white px-4 py-2 text-sm font-semibold text-gray-900 transition hover:bg-gray-900 hover:text-white"
              >
                Buy Pack
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
