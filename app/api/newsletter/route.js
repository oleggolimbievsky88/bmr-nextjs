import * as queries from "@/lib/queries";
import { sendNewsletterConfirmationEmail } from "@/lib/email";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const buildJsonResponse = (payload, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });

const getQueryFunction = (name) => {
  if (typeof queries[name] === "function") {
    return queries[name];
  }

  const fallback = queries?.default?.[name];
  if (typeof fallback === "function") {
    return fallback;
  }

  return null;
};

export async function POST(req) {
  try {
    const ensureNewsletterSubscribersTableExists = getQueryFunction(
      "ensureNewsletterSubscribersTableExists"
    );
    const getNewsletterSubscriberByEmail = getQueryFunction(
      "getNewsletterSubscriberByEmail"
    );
    const createNewsletterSubscriber = getQueryFunction(
      "createNewsletterSubscriber"
    );

    if (
      !ensureNewsletterSubscribersTableExists ||
      !getNewsletterSubscriberByEmail ||
      !createNewsletterSubscriber
    ) {
      console.error("Newsletter query helpers are unavailable", {
        availableExports: Object.keys(queries || {}),
      });
      return buildJsonResponse(
        { error: "Newsletter subscription is unavailable." },
        500
      );
    }

    const { email } = await req.json();
    const normalizedEmail = (email || "").trim().toLowerCase();

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      return buildJsonResponse({ error: "Invalid email address." }, 400);
    }

    const isReady = await ensureNewsletterSubscribersTableExists();
    if (!isReady) {
      return buildJsonResponse(
        { error: "Newsletter subscription is unavailable." },
        500
      );
    }

    const existing = await getNewsletterSubscriberByEmail(normalizedEmail);
    if (existing) {
      return buildJsonResponse({ status: "exists" }, 200);
    }

    await createNewsletterSubscriber(normalizedEmail);

    // Send confirmation email (don't fail the request if email fails)
    const emailResult = await sendNewsletterConfirmationEmail(normalizedEmail);
    if (!emailResult.success) {
      console.warn(
        "Newsletter confirmation email failed to send:",
        emailResult.error
      );
    }

    return buildJsonResponse({ status: "subscribed" }, 201);
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return buildJsonResponse({ error: "Failed to subscribe." }, 500);
  }
}
