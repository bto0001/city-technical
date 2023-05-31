import { log } from './config/middleware';

export const createLocationId = (city: string, state: string, country: string): string => {
  const locationId = `${country}_${state}_${city}`;
  log.debug(locationId);
  return locationId;
}

export const parseLocationDisplayName = (locationDisplayName: string): string[] => {
  log.debug(locationDisplayName); 
  return locationDisplayName.replaceAll(' ', '').split(',');
}
