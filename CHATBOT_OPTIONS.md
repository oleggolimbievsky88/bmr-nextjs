# Chatbot Options for BMR Suspension

This doc outlines effort and options for adding chatbots to your site: one for **customers** (tracking, quick product questions) and one for **dealers** (inquiries).

---

## How much work to get a chatbot working just for your site?

It depends on the type:

### 1. **Rule-based / FAQ chatbot (low effort – ~1–2 days)**

- **What it does:** Answers a fixed set of questions using your data (e.g. “Track my order”, “Does part X include hardware?”, “What vehicles does part X fit?”).
- **How it works:** User picks a topic or types a short phrase; the app looks up the answer from your DB (orders, products, bodies/vehicles) or a small FAQ list.
- **Effort:** Low. No AI API. You build:
  - A small chat-style UI (message list + input).
  - API routes that:
    - **Tracking:** Accept order number + email (or phone), look up order in your DB, return status and tracking number.
    - **Vehicle fit:** Accept part number or product ID, query `products` + `bodies`/`vehicles`, return “Fits: 2020–2024 Mustang”, etc.
    - **Hardware / details:** Accept part number, return product fields (Hardware, Grease, etc.) from `products`.
  - Optional: simple keyword matching (“tracking”, “track order”, “hardware”, “vehicle fit”) to route to the right handler.
- **Result:** A “chatbot” that feels like chat but is really structured lookups. Good for “track my order” and “what vehicle does it fit?” / “does it include hardware?”.

### 2. **LLM-based chatbot (medium effort – ~3–5 days + API costs)**

- **What it does:** Answers open-ended questions in natural language using your product/order data as context.
- **How it works:** You send the user message plus a “context” string (e.g. product details, vehicle list, or order status) to an API (OpenAI, Anthropic, etc.); the model returns an answer.
- **Effort:** Medium. You need:
  - An API key and a server-side route that calls the LLM (never expose the key in the browser).
  - Logic to fetch the right context (e.g. product by part number, vehicles for a body, or order by number + email).
  - Prompt design so the model sticks to your data and doesn’t invent info.
  - Error handling and (optional) rate limiting.
- **Result:** More flexible answers and follow-up questions, but higher cost and you must keep prompts and context in check.

---

## Recommended path

1. **Start with a rule-based “quick answers” flow** (customers and optionally dealers):
   - **Customers:** “Track my order” (order number + email → lookup → return tracking/status); “What vehicles does this fit?” and “Does it include hardware?” (part number → product + bodies → short answer).
   - **Dealers:** Same product/vehicle/hardware lookups, plus optional “Contact us” or link to dealer support.
2. **Reuse the same UI** for both customer and dealer; only the entry point (e.g. main site vs Dealer Portal) and maybe one or two dealer-only options differ.
3. **Add an LLM later** if you want natural-language follow-ups and more open-ended questions; the same “context” (product, order, vehicles) can be fed into the LLM.

---

## What you’d need to build for the simple (rule-based) chatbot

| Piece | Description |
|-------|-------------|
| **Chat UI** | A small widget (e.g. bottom-right bubble) that opens a panel with message history and an input. |
| **API: tracking** | Route that takes order number + email, checks `invoice`/`new_orders` (or your order table), returns status and tracking number. |
| **API: product info** | Route that takes part number or product ID, returns product name, Hardware (Y/N or details), Grease, AngleFinder, and a short “Fits: [platforms/vehicles]” from `bodies`/`vehicles`. |
| **Router** | Optional: detect “track”, “tracking”, “order” → tracking flow; “vehicle”, “fit”, “fits” → vehicle fit; “hardware” → product hardware; else show a short menu or “Contact us”. |

Once the APIs and routing exist, wiring them into the chat UI is straightforward. The **bulk of the work** is the tracking and product/vehicle lookup logic; the chat shell is a small amount of React state and a few API calls.
