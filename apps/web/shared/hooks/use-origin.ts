export const useOrigin = () => {
  if (typeof window === "undefined") return "";
  const origin =
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : "";
  return origin;
};
