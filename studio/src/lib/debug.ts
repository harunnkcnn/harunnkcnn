/** STUDIO_DEBUG=1 iken sunucu günlüğüne olay yazar. Anahtar, şifre ve istek gövdesi asla yazılmaz. */
export const debug = (event: string, data?: Record<string, unknown>) => {
  if (process.env.STUDIO_DEBUG !== "1") return;
  console.log(`[studio ${new Date().toISOString().slice(11, 23)}] ${event}`, data ? JSON.stringify(data) : "");
};
