"use server";
import bcrypt from "bcryptjs";
import slugify from "slugify";
import { db } from "@/lib/db";
import {
  clearSession,
  createSession,
  requireAdmin,
  requireAdvertiser,
} from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { sendAdvertiserLoginEmail } from "@/lib/email";

const text = (f: FormData, key: string) => String(f.get(key) || "").trim();
async function saveImage(form: FormData, key: string) {
  const file = form.get(key);
  if (!(file instanceof File) || file.size === 0) return null;
  if (file.size > 5 * 1024 * 1024)
    throw new Error("Image must be smaller than 5 MB");
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(file.type))
    throw new Error("Only JPG, PNG, WEBP or GIF images are allowed");
  const image = await db.uploadedImage.create({
    data: {
      mimeType: file.type,
      data: Buffer.from(await file.arrayBuffer()),
    },
  });
  return `/api/images/${image.id}`;
}
export async function loginAction(form: FormData) {
  const email = text(form, "email").toLowerCase();
  const password = text(form, "password");
  const user = await db.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash)))
    redirect("/admin/login?error=1");
  if (!user.active) redirect("/admin/login?error=disabled");
  await createSession(user.id);
  redirect(user.role === "ADVERTISER" ? "/advertiser" : "/admin");
}
export async function logoutAction() {
  await clearSession();
  redirect("/admin/login");
}
export async function saveCategory(form: FormData) {
  await requireAdmin();
  const id = text(form, "id");
  const name = text(form, "name");
  const slug =
    text(form, "slug") || slugify(name, { lower: true, strict: true });
  const parentId = text(form, "parentId") || null;
  if (id && parentId === id)
    throw new Error("A category cannot be its own parent");
  const data = {
    name,
    nameTe: text(form, "nameTe") || null,
    slug,
    description: text(form, "description") || null,
    descriptionTe: text(form, "descriptionTe") || null,
    order: Number(text(form, "order") || 0),
    showInMenu: form.get("showInMenu") === "on",
    parentId,
  };
  if (id) await db.category.update({ where: { id }, data });
  else await db.category.create({ data });
  revalidatePath("/");
  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}
export async function deleteCategory(form: FormData) {
  await requireAdmin();
  await db.category.delete({ where: { id: text(form, "id") } });
  revalidatePath("/admin/categories");
}
export async function savePost(form: FormData) {
  await requireAdmin();
  const id = text(form, "id");
  const title = text(form, "title");
  const status = text(form, "status") === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
  const uploadedImage = await saveImage(form, "imageFile");
  const existing = id
    ? await db.post.findUnique({ where: { id }, select: { imageUrl: true } })
    : null;
  const data = {
    title,
    titleTe: text(form, "titleTe") || null,
    slug: text(form, "slug") || slugify(title, { lower: true, strict: true }),
    excerpt: text(form, "excerpt"),
    excerptTe: text(form, "excerptTe") || null,
    content: text(form, "content"),
    contentTe: text(form, "contentTe") || null,
    imageUrl:
      uploadedImage || text(form, "imageUrl") || existing?.imageUrl || null,
    imageAlt: text(form, "imageAlt") || title,
    categoryId: text(form, "categoryId"),
    display: (["BANNER", "CARDS", "BOTH"].includes(text(form, "display"))
      ? text(form, "display")
      : "BOTH") as "BANNER" | "CARDS" | "BOTH",
    featured: form.get("featured") === "on",
    status: status as "PUBLISHED" | "DRAFT",
    publishedAt:
      status === "PUBLISHED"
        ? new Date(text(form, "publishedAt") || Date.now())
        : null,
  };
  if (id) await db.post.update({ where: { id }, data });
  else await db.post.create({ data });
  revalidatePath("/");
  revalidatePath("/admin/posts");
  revalidatePath(`/news/${data.slug}`);
  redirect("/admin/posts");
}
export async function deletePost(form: FormData) {
  await requireAdmin();
  await db.post.delete({ where: { id: text(form, "id") } });
  revalidatePath("/");
  revalidatePath("/admin/posts");
}
export async function saveSettings(form: FormData) {
  await requireAdmin();
  const keys = [
    "siteName",
    "tagline",
    "logoUrl",
    "heroTitle",
    "heroDescription",
    "contactEmail",
    "facebookUrl",
    "instagramUrl",
    "youtubeUrl",
    "footerText",
  ] as const;
  const data = Object.fromEntries(keys.map((k) => [k, text(form, k) || null]));
  const uploadedLogo = await saveImage(form, "logoFile");
  const translated = {
    ...data,
    logoUrl: uploadedLogo || data.logoUrl,
    taglineTe: text(form, "taglineTe") || null,
    heroTitleTe: text(form, "heroTitleTe") || null,
    heroDescriptionTe: text(form, "heroDescriptionTe") || null,
    footerTextTe: text(form, "footerTextTe") || null,
  };
  await db.siteSetting.upsert({
    where: { id: 1 },
    update: translated,
    create: {
      id: 1,
      ...translated,
      siteName: data.siteName || "HealthPress",
      tagline: data.tagline || "",
      heroTitle: data.heroTitle || "",
      heroDescription: data.heroDescription || "",
      contactEmail: data.contactEmail || "",
      footerText: data.footerText || "",
    },
  });
  revalidatePath("/", "layout");
  redirect("/admin/settings?saved=1");
}

export async function submitAdRequest(form: FormData) {
  const plan = await db.adPlan.findFirst({
    where: { id: text(form, "planId"), active: true },
  });
  if (!plan) throw new Error("Choose an available advertising plan");
  const days = plan.days;
  const creativeCount = Number(text(form, "quantity") || 1);
  if (!Number.isInteger(creativeCount) || creativeCount < 1 || creativeCount > 5)
    throw new Error("You can purchase a maximum of 5 advertisements at a time");
  const startDate = new Date(`${text(form, "startDate")}T00:00:00`);
  if (Number.isNaN(startDate.getTime()))
    throw new Error("Choose a valid start date");
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + days - 1);
  endDate.setHours(23, 59, 59, 999);
  const ad = await db.advertisement.create({
    data: {
      advertiserName: text(form, "advertiserName"),
      email: text(form, "email").toLowerCase(),
      phone: text(form, "phone"),
      title: text(form, "title") || "Advertisement",
      placement: "HOME_CARDS",
      categoryId: null,
      startDate,
      endDate,
      days,
      amount: plan.price * creativeCount,
      creativeCount,
      creativeNumber: 1,
      status: "PENDING_PAYMENT",
    },
  });
  await db.advertisement.update({
    where: { id: ad.id },
    data: { bookingGroupId: ad.id },
  });
  redirect(`/advertise/payment/${ad.id}`);
}
export async function submitPaymentReference(form: FormData) {
  const id = text(form, "id");
  const paymentReference = text(form, "paymentReference");
  await db.advertisement.update({
    where: { id },
    data: { paymentReference, status: "PENDING_APPROVAL" },
  });
  revalidatePath("/admin/advertisements");
  redirect(`/advertise/payment/${id}?submitted=1`);
}
export async function approveAdvertiser(form: FormData) {
  await requireAdmin();
  const id = text(form, "id");
  const ad = await db.advertisement.findUnique({ where: { id } });
  if (!ad) throw new Error("Advertisement request not found");
  let user = await db.user.findUnique({ where: { email: ad.email } });
  const tempPassword = `Ad@${Math.floor(100000 + Math.random() * 900000)}`;
  if (!user)
    user = await db.user.create({
      data: {
        name: ad.advertiserName,
        email: ad.email,
        phone: ad.phone,
        passwordHash: await bcrypt.hash(tempPassword, 12),
        role: "ADVERTISER",
      },
    });
  else
    await db.user.update({
      where: { id: user.id },
      data: {
        active: true,
        role: "ADVERTISER",
        phone: ad.phone,
        passwordHash: await bcrypt.hash(tempPassword, 12),
      },
    });
  const bookingGroupId = ad.bookingGroupId || ad.id;
  const existingCreatives = await db.advertisement.findMany({
    where: { bookingGroupId },
    select: { creativeNumber: true },
  });
  const existingNumbers = new Set(
    existingCreatives.map((creative) => creative.creativeNumber),
  );
  await db.$transaction([
    db.advertisement.update({
      where: { id },
      data: { userId: user.id, status: "ACTIVE", bookingGroupId },
    }),
    ...Array.from({ length: ad.creativeCount }, (_, index) => index + 1)
      .filter(
        (creativeNumber) =>
          creativeNumber > 1 && !existingNumbers.has(creativeNumber),
      )
      .map((creativeNumber) =>
        db.advertisement.create({
          data: {
            advertiserName: ad.advertiserName,
            email: ad.email,
            phone: ad.phone,
            title: `${ad.title} — Advertisement ${creativeNumber}`,
            placement: "HOME_CARDS",
            startDate: ad.startDate,
            endDate: ad.endDate,
            days: ad.days,
            amount: ad.amount,
            paymentReference: ad.paymentReference,
            status: "ACTIVE",
            userId: user.id,
            creativeCount: ad.creativeCount,
            creativeNumber,
            bookingGroupId,
          },
        }),
      ),
  ]);
  revalidatePath("/admin/advertisements");
  revalidatePath("/");
  const emailResult = await sendAdvertiserLoginEmail({
    name: ad.advertiserName,
    email: ad.email,
    password: tempPassword,
  });
  redirect(
    `/admin/advertisements?approved=${id}&password=${encodeURIComponent(tempPassword)}&emailStatus=${emailResult.sent ? "sent" : emailResult.reason}`,
  );
}
export async function setAdStatus(form: FormData) {
  await requireAdmin();
  const id = text(form, "id");
  const status = text(form, "status") as "ACTIVE" | "PAUSED" | "EXPIRED";
  await db.advertisement.update({ where: { id }, data: { status } });
  revalidatePath("/");
  revalidatePath("/admin/advertisements");
}
export async function saveAdSettings(form: FormData) {
  await requireAdmin();
  const uploadedQr = await saveImage(form, "paymentQrFile");
  const existing = await db.adSetting.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });
  await db.adSetting.update({
    where: { id: 1 },
    data: {
      pricePerDay: Math.max(1, Number(text(form, "pricePerDay") || 200)),
      ownerEmail: text(form, "ownerEmail"),
      ownerWhatsApp: text(form, "ownerWhatsApp"),
      paymentQrUrl:
        uploadedQr || text(form, "paymentQrUrl") || existing.paymentQrUrl,
      paymentInstructions: text(form, "paymentInstructions"),
    },
  });
  revalidatePath("/advertise", "layout");
  revalidatePath("/advertise/payment/[id]", "page");
  redirect("/admin/advertisements?settings=1");
}
export async function saveAdPlan(form: FormData) {
  await requireAdmin();
  const id = text(form, "id");
  const data = {
    name: text(form, "name"),
    days: Math.max(1, Number(text(form, "days") || 1)),
    price: Math.max(1, Number(text(form, "price") || 1)),
    billingLabel: text(form, "billingLabel") || "plan",
    note: text(form, "note") || null,
    features: text(form, "features"),
    theme: text(form, "theme") || "slate",
    popular: form.get("popular") === "on",
    active: form.get("active") === "on",
    order: Number(text(form, "order") || 0),
  };
  if (id) await db.adPlan.update({ where: { id }, data });
  else await db.adPlan.create({ data });
  revalidatePath("/advertise");
  revalidatePath("/admin/advertisements");
  redirect("/admin/advertisements?planSaved=1");
}
export async function deleteAdPlan(form: FormData) {
  await requireAdmin();
  await db.adPlan.delete({ where: { id: text(form, "id") } });
  revalidatePath("/advertise");
  revalidatePath("/admin/advertisements");
  redirect("/admin/advertisements?planDeleted=1");
}
export async function advertiserSaveAd(form: FormData) {
  const session = await requireAdvertiser();
  const id = text(form, "id");
  const ad = await db.advertisement.findFirst({
    where: { id, userId: session.userId },
  });
  if (!ad) throw new Error("Advertisement not found");
  const endDate = new Date(ad.endDate);
  endDate.setHours(23, 59, 59, 999);
  if (new Date() > endDate)
    throw new Error(
      "Your advertisement subscription has expired. Renew the plan before editing or publishing.",
    );
  const submittedPlacement = text(form, "placement");
  const placement = (submittedPlacement || ad.placement) as
    | "HEADER"
    | "HOME_BANNER"
    | "HOME_CARDS"
    | "CATEGORY_CARDS"
    | "ALL_PAGES"
    | "LEFT_RAIL"
    | "LEFT_RAIL_BOTTOM"
    | "RIGHT_RAIL"
    | "RIGHT_RAIL_BOTTOM";
  const categoryId =
    placement === "CATEGORY_CARDS"
      ? text(form, "categoryId") || ad.categoryId || ""
      : "";
  if (placement === "CATEGORY_CARDS" && !categoryId)
    throw new Error("Choose a category for category-card placement");
  const homeSlot =
    placement === "HOME_CARDS"
      ? text(form, "homeSlot") === "RIGHT"
        ? "RIGHT"
        : text(form, "homeSlot") === "LEFT"
          ? "LEFT"
          : ad.homeSlot || "LEFT"
      : null;
  const imageFile = form.get("imageFile");
  const hasImageUpload = imageFile instanceof File && imageFile.size > 0;
  const submittedImageUrl = text(form, "imageUrl");
  const imageChanging =
    hasImageUpload || Boolean(submittedImageUrl && submittedImageUrl !== ad.imageUrl);
  const placementChanging =
    placement !== ad.placement ||
    homeSlot !== ad.homeSlot ||
    (placement === "CATEGORY_CARDS" ? categoryId || null : null) !== ad.categoryId;
  const controlledChange = Boolean(ad.imageUrl) && (imageChanging || placementChanging);
  if (controlledChange && ad.changeCredits < 1)
    throw new Error("Ask the administrator for permission before changing the image or placement");
  if (!ad.imageUrl || placementChanging) {
    const capacityNow = new Date();
    const capacityToday = new Date(capacityNow);
    capacityToday.setHours(0, 0, 0, 0);
    const activeInPosition = await db.advertisement.count({
      where: {
        id: { not: ad.id },
        placement,
        status: "ACTIVE",
        imageUrl: { not: null },
        startDate: { lte: capacityNow },
        endDate: { gte: capacityToday },
      },
    });
    const configuredCapacity = await db.adPlacementCapacity.findUnique({ where: { placement } });
    const positionLimit = configuredCapacity?.capacity || 5;
    if (activeInPosition >= positionLimit)
      throw new Error(`This position already has ${positionLimit} active advertisements. Choose another position or ask the administrator to increase capacity`);
  }
  const uploaded = await saveImage(form, "imageFile");
  const imageUrl = uploaded || text(form, "imageUrl") || ad.imageUrl;
  if (!imageUrl)
    throw new Error("Upload an advertisement image or enter an image URL");
  await db.advertisement.update({
    where: { id },
    data: {
      title: text(form, "title"),
      titleTe: text(form, "titleTe") || null,
      description: text(form, "description") || null,
      descriptionTe: text(form, "descriptionTe") || null,
      longDescription: text(form, "longDescription") || null,
      longDescriptionTe: text(form, "longDescriptionTe") || null,
      linkUrl: text(form, "linkUrl") || null,
      imageUrl,
      placement,
      homeSlot,
      categoryId: categoryId || null,
      ...(controlledChange
        ? { changeCredits: { decrement: 1 }, changeRequestPending: false }
        : {}),
      endDate,
      status: ad.status === "PAUSED" ? "PAUSED" : "ACTIVE",
    },
  });
  revalidatePath("/", "layout");
  redirect("/advertiser?saved=1");
}
export async function requestAdChangePermission(form: FormData) {
  const session = await requireAdvertiser();
  const id = text(form, "id");
  const ad = await db.advertisement.findFirst({ where: { id, userId: session.userId } });
  if (!ad) throw new Error("Advertisement not found");
  if (!ad.imageUrl) throw new Error("Publish the advertisement once before requesting changes");
  await db.advertisement.update({ where: { id }, data: { changeRequestPending: true } });
  revalidatePath("/admin/advertisements");
  redirect(`/advertiser?ad=${id}&requested=1`);
}
export async function grantAdChangeCredits(form: FormData) {
  await requireAdmin();
  const id = text(form, "id");
  const credits = Number(text(form, "changeCredits"));
  if (!Number.isInteger(credits) || credits < 1 || credits > 5)
    throw new Error("Grant between 1 and 5 advertisement changes");
  await db.advertisement.update({
    where: { id },
    data: { changeCredits: credits, changeRequestPending: false },
  });
  revalidatePath("/advertiser");
  revalidatePath("/admin/advertisements");
  redirect("/admin/advertisements?changesGranted=1");
}
export async function setAdPlacementCapacity(form: FormData) {
  await requireAdmin();
  const placement = text(form, "placement") as
    | "HEADER" | "HOME_BANNER" | "HOME_CARDS" | "CATEGORY_CARDS"
    | "ALL_PAGES" | "LEFT_RAIL" | "LEFT_RAIL_BOTTOM"
    | "RIGHT_RAIL" | "RIGHT_RAIL_BOTTOM";
  const capacity = Number(text(form, "capacity"));
  if (!Number.isInteger(capacity) || capacity < 5 || capacity > 20)
    throw new Error("Advertisement capacity must be between 5 and 20");
  await db.adPlacementCapacity.upsert({
    where: { placement },
    update: { capacity },
    create: { placement, capacity },
  });
  revalidatePath("/advertiser");
  revalidatePath("/admin/advertisements");
  redirect("/admin/advertisements?capacitySaved=1");
}
export async function renewAdvertisement(form: FormData) {
  const session = await requireAdvertiser();
  const id = text(form, "id");
  const [ad, plan] = await Promise.all([
    db.advertisement.findFirst({ where: { id, userId: session.userId } }),
    db.adPlan.findFirst({ where: { id: text(form, "planId"), active: true } }),
  ]);
  if (!ad) throw new Error("Advertisement not found");
  if (!plan) throw new Error("Choose an available advertising plan");
  const currentEnd = new Date(ad.endDate);
  currentEnd.setHours(23, 59, 59, 999);
  if (new Date() <= currentEnd)
    throw new Error("This advertisement is still active and does not need renewal yet");
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + plan.days - 1);
  endDate.setHours(23, 59, 59, 999);
  await db.advertisement.update({
    where: { id: ad.id },
    data: {
      startDate,
      endDate,
      days: plan.days,
      amount: plan.price,
      paymentReference: null,
      status: "PENDING_PAYMENT",
      creativeCount: 1,
      creativeNumber: 1,
      bookingGroupId: ad.id,
    },
  });
  revalidatePath("/advertiser");
  redirect(`/advertise/payment/${ad.id}?renewal=1`);
}
export async function advertiserDeleteAd(form: FormData) {
  const session = await requireAdvertiser();
  const id = text(form, "id");
  const ad = await db.advertisement.findFirst({
    where: { id, userId: session.userId },
  });
  if (!ad) throw new Error("Advertisement not found");
  await db.advertisement.update({
    where: { id: ad.id },
    data: { status: "EXPIRED" },
  });
  revalidatePath("/", "layout");
  redirect("/advertiser?deleted=1");
}
export async function resetAdvertiserPassword(form: FormData) {
  await requireAdmin();
  const userId = text(form, "userId");
  const user = await db.user.findFirst({
    where: { id: userId, role: "ADVERTISER" },
  });
  if (!user) throw new Error("Advertiser account not found");
  const tempPassword = `Ad@${Math.floor(100000 + Math.random() * 900000)}`;
  await db.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(tempPassword, 12), active: true },
  });
  redirect(
    `/admin/advertiser-accounts?user=${user.id}&password=${encodeURIComponent(tempPassword)}`,
  );
}
export async function manageAdPassword(form: FormData) {
  await requireAdmin();
  const adId = text(form, "adId");
  const ad = await db.advertisement.findUnique({
    where: { id: adId },
    include: { user: true },
  });
  if (!ad?.user) throw new Error("Approve the advertiser account first");
  const requested = text(form, "newPassword");
  const password =
    requested || `Ad@${Math.floor(100000 + Math.random() * 900000)}`;
  if (password.length < 8)
    throw new Error("Password must contain at least 8 characters");
  await db.user.update({
    where: { id: ad.user.id },
    data: { passwordHash: await bcrypt.hash(password, 12), active: true },
  });
  redirect(
    `/admin/advertisements?approved=${ad.id}&password=${encodeURIComponent(password)}&reset=1`,
  );
}
export async function deleteAdvertisement(form: FormData) {
  await requireAdmin();
  const adId = text(form, "adId");
  const ad = await db.advertisement.findUnique({ where: { id: adId } });
  if (!ad) return;
  await db.advertisement.update({
    where: { id: adId },
    data: { status: "EXPIRED" },
  });
  if (form.get("deleteAccount") === "on" && ad.userId) {
    const remaining = await db.advertisement.count({
      where: { userId: ad.userId, status: { not: "EXPIRED" } },
    });
    if (remaining === 0) await db.user.delete({ where: { id: ad.userId } });
  }
  revalidatePath("/");
  redirect("/admin/advertisements?deleted=1");
}
export async function bulkDeleteAdvertisements(form: FormData) {
  await requireAdmin();
  const ids = form.getAll("adIds").map(String).filter(Boolean);
  if (ids.length)
    await db.advertisement.updateMany({
      where: { id: { in: ids } },
      data: { status: "EXPIRED" },
    });
  revalidatePath("/", "layout");
  redirect(`/admin/advertisements?archived=${ids.length}`);
}
export async function subscribeNewsletter(form: FormData) {
  const email = text(form, "email").toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email))
    throw new Error("Enter a valid email address");
  await db.subscriber.upsert({
    where: { email },
    update: { active: true },
    create: { email },
  });
  redirect("/?subscribed=1#subscribe");
}
