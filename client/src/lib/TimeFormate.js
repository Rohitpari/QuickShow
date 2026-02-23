const timeformate = (minute)=>{
    const hours = Math.floor(minute/60);
    const minuteRemaider = minute % 60;
    return`${hours}h ${minuteRemaider}m `
}
export default timeformate;