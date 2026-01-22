function capitalizeFullName(name) {
  if (!name) return "";

  return name
    .split(" ")
    .filter(word => word.trim() !== "")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function normalizePhone(phone) {
  if (phone === null || phone === undefined) return 0;

  // Convert number to string first
  let phoneStr = phone.toString();

  // Remove spaces (just in case)
  phoneStr = phoneStr.replace(/\s+/g, '');

  // Convert back to integer
  return parseInt(phoneStr, 10);
}

module.exports = { capitalizeFullName, normalizePhone }