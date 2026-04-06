export const SITE_URL = "https://nurture.org.in";

/** Build an absolute canonical URL. Strips trailing slash (except root). */
export function getCanonicalUrl(path: string = "/"): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const normalized = cleanPath === "/" ? "" : cleanPath.replace(/\/+$/, "");
  return `${SITE_URL}${normalized}`;
}
