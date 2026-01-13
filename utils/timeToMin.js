function timeToMin(time) {
  // "09:30 AM"
  const [t, meridian] = time.split(" ")
  let [hours, minutes] = t.split(":").map(Number)

  if (meridian === "PM" && hours !== 12) hours += 12
  if (meridian === "AM" && hours === 12) hours = 0

  return hours * 60 + minutes
}

module.exports={timeToMin}