const toFirstLast = (full?: string) => {
  if (!full) return "";
  const [last, first = ""] = full.split(",").map((s) => s.trim());
  return first ? `${first} ${last}` : full;
};