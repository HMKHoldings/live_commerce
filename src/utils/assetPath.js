const apiOrigin = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
export const assetPath = (path) => {
  if (!path || /^https?:\/\//.test(path)) return path;
  if (path.startsWith("/uploads/")) return apiOrigin + path;
  if (
    path.startsWith(import.meta.env.BASE_URL) &&
    import.meta.env.BASE_URL !== "/"
  )
    return path;
  return import.meta.env.BASE_URL + path.replace(/^\//, "");
};
