/**
 * The admin-authored greeting shown on a client's dashboard.
 *
 * Admins write free text per client and may drop `{name}` / `{brand}` into it,
 * so one saved sentence stays correct if the contact person is renamed later.
 * Empty fields fall back to a neutral default rather than rendering a blank
 * header.
 */

export interface GreetingSource {
  contactName: string
  brandName: string
  welcomeTitle?: string | null
  welcomeMessage?: string | null
}

export const GREETING_TOKENS = ["{name}", "{brand}"] as const

export const DEFAULT_WELCOME_TITLE = "{name} جان، خوش آمدی به بخش ارزیابی"
export const DEFAULT_WELCOME_MESSAGE =
  "نظر شما درباره تیمی که روی «{brand}» کار می‌کند، مستقیماً به بهتر شدن کار آن‌ها کمک می‌کند."

/** Substitute `{name}` and `{brand}` in an admin-authored template. */
export function renderGreetingTemplate(
  template: string,
  source: Pick<GreetingSource, "contactName" | "brandName">
): string {
  return template
    .replaceAll("{name}", source.contactName)
    .replaceAll("{brand}", source.brandName)
}

export function resolveClientGreeting(source: GreetingSource) {
  const title = source.welcomeTitle?.trim() || DEFAULT_WELCOME_TITLE
  const message = source.welcomeMessage?.trim() || DEFAULT_WELCOME_MESSAGE

  return {
    title: renderGreetingTemplate(title, source),
    message: renderGreetingTemplate(message, source),
    /** True when the admin has not customised this client's greeting yet. */
    isDefault: !source.welcomeTitle?.trim() && !source.welcomeMessage?.trim(),
  }
}
