function timeToMin(time) {
    if (!time || typeof time !== 'string') {
        throw new Error("Invalid time format");
    }
    
    const parts = time.trim().split(" ");
    if (parts.length !== 2) {
        throw new Error("Invalid time format. Expected 'HH:MM AM/PM'");
    }
    
    const [t, meridian] = parts;
    const timeParts = t.split(":");
    
    if (timeParts.length !== 2) {
        throw new Error("Invalid time format");
    }
    
    let [hours, minutes] = timeParts.map(Number);
    
    if (isNaN(hours) || isNaN(minutes)) {
        throw new Error("Invalid time values");
    }
    
    const upperMeridian = meridian.toUpperCase();
    if (upperMeridian !== "AM" && upperMeridian !== "PM") {
        throw new Error("Invalid meridian. Expected AM or PM");
    }
    
    if (upperMeridian === "PM" && hours !== 12) hours += 12;
    if (upperMeridian === "AM" && hours === 12) hours = 0;
    
    return hours * 60 + minutes;
}

module.exports={timeToMin}