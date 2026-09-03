/**
 * Every word the client portal shows a client, other than the Rava wordmark.
 *
 * Three name fields, because the portal says a client's name in three places
 * that want three different forms: the brand headline («کلینیک گیتا»), the
 * contact line under it («دکتر بیتا مجیدزاده»), and the greeting, where a
 * short first name plus «جان» is the whole point («بیتا جان، خوش آمدی»).
 *
 * Title and message are admin-authored templates. Whatever the admin writes is
 * what the client reads; leaving a field empty falls back to the default
 * sentence, so an account nobody has customised still greets properly.
 */

export interface GreetingSource {
  contactName: string
  brandName: string
  greetingName?: string | null
  welcomeTitle?: string | null
  welcomeMessage?: string | null
}

/** Default headline. `{name}` is the greeting name, or the contact name. */
export const DEFAULT_WELCOME_TITLE = "{name} جان، خوش آمدی"

/** Default sentence under the headline. */
export const DEFAULT_WELCOME_MESSAGE =
  "لطفاً ارزیابی این ماه تیم را تکمیل کنید. نظر شما مستقیماً به بهتر شدن کار آن‌ها کمک می‌کند."

/** The tokens an admin may write, documented once for the dialog to show. */
export const GREETING_TOKENS = [
  { token: "{name}", label: "نام خودمانی (یا نام مخاطب)" },
  { token: "{contact}", label: "نام کامل مخاطب" },
  { token: "{brand}", label: "نام برند" },
] as const

/** The name the greeting uses: the warm form when set, else the full one. */
export function greetingNameOf(source: GreetingSource) {
  return (source.greetingName ?? "").trim() || source.contactName.trim()
}

/** Substitute `{name}`, `{contact}` and `{brand}` into an authored sentence. */
export function renderGreetingTemplate(template: string, source: GreetingSource) {
  const replacements: Record<string, string> = {
    "{name}": greetingNameOf(source),
    "{contact}": source.contactName.trim(),
    "{brand}": source.brandName.trim(),
  }

  return template
    .replace(/\{name\}|\{contact\}|\{brand\}/g, (token) => replacements[token] ?? token)
    .trim()
}

/** The headline and sentence this client sees on their dashboard. */
export function resolveClientGreeting(source: GreetingSource) {
  const authoredTitle = (source.welcomeTitle ?? "").trim()
  const authoredMessage = (source.welcomeMessage ?? "").trim()

  const title = renderGreetingTemplate(authoredTitle || DEFAULT_WELCOME_TITLE, source)
  const message = renderGreetingTemplate(
    authoredMessage || DEFAULT_WELCOME_MESSAGE,
    source
  )

  return {
    // A template of nothing but «{name}» with no name behind it would render
    // empty; the portal should still say something.
    title: title || "خوش آمدید",
    message,
    /** Nothing authored — the admin list flags these so they stand out. */
    isDefault: !authoredTitle && !authoredMessage,
  }
}
