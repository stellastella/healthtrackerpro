// Timezone utility functions for accurate local time handling
export const getCurrentLocalDateTime = () => {
  // Get the current date and time
  const now = new Date();
  
  // Format the date in YYYY-MM-DD format
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const date = `${year}-${month}-${day}`;
  
  // Format the time in HH:MM format
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const time = `${hours}:${minutes}`;
  
  return {
    date,
    time,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    fullDateTime: now
  };
};

export const formatLocalDateTime = (date: string, time: string) => {
  try {
    const dateTime = new Date(`${date}T${time}`);
    if (isNaN(dateTime.getTime())) {
      throw new Error('Invalid date/time');
    }
    
    return dateTime.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  } catch (error) {
    console.error('Error formatting date/time:', error);
    return 'Invalid date/time format';
  }
};

export const getUserTimezone = () => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

export const getCurrentTimezoneOffset = () => {
  const now = new Date();
  return now.getTimezoneOffset();
};

export const isValidLocalDateTime = (date: string, time: string): boolean => {
  try {
    const selectedDateTime = new Date(`${date}T${time}`);
    if (isNaN(selectedDateTime.getTime())) {
      return false;
    }
    
    const currentDateTime = new Date();
    
    // Check if it's a future date
    if (selectedDateTime > currentDateTime) {
      return false;
    }
    
    // Check if it's too far in the past (more than 5 years)
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
    
    if (selectedDateTime < fiveYearsAgo) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error validating date/time:', error);
    return false;
  }
};