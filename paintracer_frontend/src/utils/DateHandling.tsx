export const formatISO = (iso: string) => {
    const date = new Date(iso);
    // Extract the components
    const day = String(date.getDate()).padStart(2, '0');     // Day with leading zero
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-based, so we add 1, with leading zero
    const year = date.getFullYear();                         // Full year
    const hours = String(date.getHours()).padStart(2, '0');  // 24-hour format, with leading zero
    const minutes = String(date.getMinutes()).padStart(2, '0'); // Minutes with leading zero

    // Format the date and time as dd/mm/yyyy hh:mm
    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

export const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    
    // Calculate hours, minutes, seconds, and remaining milliseconds
    const hours = Math.floor(totalSeconds / 3600);
    const hourStr = String(hours)
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const minuteStr = String(minutes).padStart(2, '0');
    const seconds = totalSeconds % 60;
    const secondsStr = String(seconds).padStart(2, '0');
    const remainingMilliseconds = ms % 1000;
    const msStr = String(remainingMilliseconds).padEnd(3, '0');

    // Format the date and time as dd/mm/yyyy hh:mm
    if (hours > 0){
        return `${hourStr}:${minuteStr}:${secondsStr}.${msStr}`;
    }
    if (minutes > 0){
        return `${minuteStr}:${secondsStr}.${msStr}`;
    }

    return `${secondsStr}.${msStr}`;
}