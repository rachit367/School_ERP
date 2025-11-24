function capitalizeFullName(name) {
  if (!name) return "";
  
  return name
    .split(" ")
    .filter(word => word.trim() !== "")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

const normalizePhone = (phone) => phone.replace(/\s+/g, "");

module.exports={capitalizeFullName,normalizePhone}