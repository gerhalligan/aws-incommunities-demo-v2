type TimePeriod = 'month' | 'quarter' | 'year';

export const adjustValueForTimePeriod = (value: string, timePeriod: TimePeriod): string => {
  if (!value) return '0';
  
  // Handle monetary values (with € and M/K suffixes)
  if (value.includes('€')) {
    const numericPart = value.replace(/[€,]/g, '');
    let baseValue = parseFloat(numericPart);
    
    // Convert M to actual value
    if (value.includes('M')) {
      baseValue *= 1000000;
    }
    // Convert K to actual value
    if (value.includes('K')) {
      baseValue *= 1000;
    }

    // Adjust based on time period
    const adjustedValue = baseValue * getTimeMultiplier(timePeriod);

    // Format back to original style (M/K)
    if (adjustedValue >= 1000000) {
      return `€${(adjustedValue / 1000000).toFixed(1)}M`;
    }
    if (adjustedValue >= 1000) {
      return `€${(adjustedValue / 1000).toFixed(1)}K`;
    }
    return `€${Math.round(adjustedValue).toLocaleString()}`;
  }

  // Handle numeric values with commas
  const numValue = parseInt(value.replace(/[^0-9.-]+/g, ''));
  if (isNaN(numValue)) return '0';
  
  const adjustedValue = Math.round(numValue * getTimeMultiplier(timePeriod));
  return adjustedValue.toLocaleString();
};

export const getTimeMultiplier = (timePeriod: TimePeriod): number => {
  switch (timePeriod) {
    case 'month':
      return 1/12;
    case 'quarter':
      return 1/4;
    case 'year':
      return 1;
  }
};