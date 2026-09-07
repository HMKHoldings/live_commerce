// Vite supplies '/' locally and '/live_commerce/' for GitHub Pages builds.
export const assetPath = path => `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
