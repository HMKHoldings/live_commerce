export const httpError = (status, message) =>
  Object.assign(new Error(message), { status });
export const safeUrl = (value) =>
  !value ||
  (typeof value === "string" &&
    ((value.startsWith("/") && !value.startsWith("//")) ||
      /^https?:\/\//.test(value)));
