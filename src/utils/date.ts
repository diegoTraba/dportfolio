export const formatDateSafe = (dateString: string, includeTime: boolean = false): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Fecha inválida";
    
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    
    let formatted = `${day}/${month}/${year}`;
    
    if (includeTime) {
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      formatted += ` ${hours}:${minutes}`;
    }
    
    return formatted;
  } catch (error) {
    console.error("Error formateando fecha:", dateString, error);
    return "Fecha inválida";
  }
};