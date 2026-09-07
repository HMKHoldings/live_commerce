import {httpError,safeUrl} from '../utils/http.mjs';
export function createValidator(get) {
  const validate = (resource, item) => {
    if (!item || typeof item !== "object" || Array.isArray(item))
      throw httpError(400, "Invalid record");
    if (!/^[a-zA-Z0-9_-]{1,100}$/.test(String(item.id)))
      throw httpError(400, "Invalid ID");
    if (resource === "products") {
      if(item.platform && !item.videoUrl) throw httpError(400,"SNS 동영상 URL이 필요합니다.");
      if (!item.name?.trim() || !item.category?.trim())
        throw httpError(400, "상품명과 카테고리는 필수입니다.");
      for (const field of ["price", "stock"])
        if (!Number.isSafeInteger(item[field]) || item[field] < 0)
          throw httpError(400, `${field}: 0 이상의 정수가 필요합니다.`);
      if (
        item.target &&
        (!Number.isSafeInteger(item.target) ||
          item.target < 1 ||
          !Number.isSafeInteger(item.participants) ||
          item.participants < 0 ||
          !Number.isFinite(Date.parse(item.endsAt)))
      )
        throw httpError(400, "공동구매 인원과 종료일을 확인해주세요.");
    }
    for (const field of [
      "image",
      "inset",
      "logo",
      "videoUrl",
      "poster",
      "youtube",
      "instagram",
      "tiktok",
      "naver",
      "link",
    ])
      if (!safeUrl(item[field])) throw httpError(400, `Invalid URL: ${field}`);
    if (resource === "collections" && !Array.isArray(item.products))
      throw httpError(400, "products must be an array");
    if (resource === "categories" && !Array.isArray(item.items))
      throw httpError(400, "items must be an array");
    if (
      resource === "banners" &&
      !["orange", "fresh", "living", "beauty"].includes(item.theme)
    )
      throw httpError(400, "Invalid banner theme");
    if (
      resource === "promos" &&
      !["coupon", "kakao", "green"].includes(item.theme)
    )
      throw httpError(400, "Invalid promo theme");
    if (
      (resource === "reviews" || (resource === "questions" && item.productId)) &&
      !get("products", item.productId)
    )
      throw httpError(400, "상품을 찾을 수 없습니다.");
    if (
      resource === "reviews" &&
      (!Number.isInteger(Number(item.rating)) ||
        item.rating < 1 ||
        item.rating > 5)
    )
      throw httpError(400, "평점은 1–5입니다.");
    if (resource === "settings" && item.id !== "site")
      throw httpError(400, "Only site settings are supported");
    if (
      item.status &&
      ![
        "draft",
        "published",
        "hidden",
        "pending",
        "approved",
        "rejected",
        "new",
        "processing",
        "shipped",
        "completed",
        "cancelled",
      ].includes(item.status)
    )
      throw httpError(400, "Invalid status");
  };

return validate;
}
