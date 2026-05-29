export function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const segment = token.split(".")[1];
    if (!segment) return null;
    const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(normalized);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function getAdminIdFromToken(token: string): string | undefined {
  const payload = parseJwtPayload(token);
  if (!payload) return undefined;
  const id =
    payload.identifier ??
    payload.sub ??
    payload.nameid ??
    payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
  return typeof id === "string" ? id : undefined;
}
