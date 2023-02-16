export const createLocationId = (city: string, state: string, country: string): string => {
  return `${country}_${state}_${city}`;
}

export const parseLocationDisplayName = (locationDisplayName: string): string[] => {
  return locationDisplayName.replaceAll(' ', '').split(',');
}
