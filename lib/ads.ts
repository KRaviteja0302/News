import { db } from "./db";
export async function getAdSettings() {
  return db.adSetting.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });
}
export async function getAdPlans() {
  let plans = await db.adPlan.findMany({
    where: { active: true },
    orderBy: [{ order: "asc" }, { price: "asc" }],
  });
  if (!plans.length) {
    await db.adPlan.createMany({
      data: [
        {
          name: "Basic",
          days: 7,
          price: 1400,
          billingLabel: "week",
          note: "A focused one-week campaign",
          features:
            "Sidebar or content-card placement\n7 days duration\nEmail support",
          theme: "slate",
          order: 1,
        },
        {
          name: "Standard",
          days: 30,
          price: 6000,
          billingLabel: "month",
          note: "Best for regular promotion",
          features:
            "Homepage advertisement placement\n30 days duration\nPriority support",
          theme: "red",
          popular: true,
          order: 2,
        },
        {
          name: "Premium",
          days: 90,
          price: 18000,
          billingLabel: "3 months",
          note: "Maximum multi-placement reach",
          features:
            "Header, homepage or sidebar placement\n90 days duration\nPriority support",
          theme: "orange",
          order: 3,
        },
      ],
    });
    plans = await db.adPlan.findMany({
      where: { active: true },
      orderBy: [{ order: "asc" }, { price: "asc" }],
    });
  }
  return plans;
}
function activeDateFilter() {
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  return { startDate: { lte: now }, endDate: { gte: today } };
}
export async function getActiveAd() {
  return db.advertisement.findFirst({
    where: {
      status: "ACTIVE",
      ...activeDateFilter(),
      imageUrl: { not: null },
      placement: { in: ["HEADER", "ALL_PAGES"] },
    },
    orderBy: { updatedAt: "desc" },
  });
}
export async function getHeaderAds() {
  return db.advertisement.findMany({
    where: {
      status: "ACTIVE",
      ...activeDateFilter(),
      imageUrl: { not: null },
      placement: "HEADER",
    },
    orderBy: { updatedAt: "desc" },
    take: 20,
  });
}
export async function getHomeBannerAds() {
  return db.advertisement.findMany({
    where: {
      status: "ACTIVE",
      ...activeDateFilter(),
      imageUrl: { not: null },
      placement: "HOME_BANNER",
    },
    orderBy: { updatedAt: "desc" },
    take: 20,
  });
}
export async function getInlineAds(
  placement: "HOME_CARDS" | "CATEGORY_CARDS",
  categoryId?: string,
) {
  return db.advertisement.findMany({
    where: {
      status: "ACTIVE",
      ...activeDateFilter(),
      imageUrl: { not: null },
      OR: categoryId
        ? [
            { placement: "ALL_PAGES" },
            { placement: "CATEGORY_CARDS", categoryId },
          ]
        : [{ placement: "ALL_PAGES" }, { placement }],
    },
    orderBy: { updatedAt: "desc" },
    take: 20,
  });
}
export async function getRailAds(placement: "LEFT_RAIL" | "LEFT_RAIL_BOTTOM" | "RIGHT_RAIL" | "RIGHT_RAIL_BOTTOM") {
  return db.advertisement.findMany({
    where: {
      status: "ACTIVE",
      ...activeDateFilter(),
      imageUrl: { not: null },
      placement,
    },
    orderBy: { updatedAt: "desc" },
    take: 20,
  });
}
