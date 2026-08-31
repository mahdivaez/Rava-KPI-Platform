/**
 * The client dashboard greeting.
 *
 * Deliberately not customisable per client any more: the admin sets the
 * contact's name and the portal greets them by it, under one shared sentence
 * asking for the monthly evaluation. One sentence to change, everywhere.
 */

export interface GreetingSource {
  contactName: string
  brandName: string
}

/** Shown to every client, under their name. */
export const CLIENT_PROMPT =
  "لطفاً ارزیابی این ماه تیم را تکمیل کنید. نظر شما مستقیماً به بهتر شدن کار آن‌ها کمک می‌کند."

export function resolveClientGreeting(source: GreetingSource) {
  const name = source.contactName.trim()

  return {
    title: name ? `${name} جان، خوش آمدی` : "خوش آمدید",
    message: CLIENT_PROMPT,
  }
}
