const isoTimeformate = (dateTime)=>{
    const date = new Date(dateTime);
    const localtime = date.toLocaleTimeString('en-US',{
        hour:'2-digit',
        minute:'2-digit',
        hour12:'true',
    });
    return localtime;
}
export default isoTimeformate