import { Logger } from '@aws-lambda-powertools/logger';

import { Coordinates } from './models/Coordinates';
import { LocationItem } from './models/LocationItem';
import { LocationRequest } from './models/LocationRequest';
import { CoordinatesRepository } from './repositories/CoordinatesRepository';
import { LocationRepository } from "./repositories/LocationRepository";
import { createLocationId, parseLocationDisplayName } from './utils';

const log = new Logger();

export class LocationService {
  constructor(
    private readonly coordinatesRepo: CoordinatesRepository,
    private readonly locationRepo: LocationRepository
  ) {}

  public async createLocation(request: LocationRequest): Promise<LocationItem> {
    const coordinates: Coordinates | null = await this.coordinatesRepo.get({
      city: request.city,
      state: request.state,
      country: request.country
    });

    if (!coordinates) {
      throw new Error('Coordinates not found');
    }

    const [ city, _, state, country ] = parseLocationDisplayName(coordinates.display_name);

    const locationItem: LocationItem = {
      Id: createLocationId(city, state, country),
      Name: request.name,
      City: request.city,
      State: request.state,
      Country: request.country,
      Latitude: coordinates.lat,
      Longitude: coordinates.lon
    };

    return this.locationRepo.create(locationItem);
  }

  public async getLocation(id: string): Promise<LocationItem> {
    return this.locationRepo.get(id);
  }

  public async getAllLocations(): Promise<LocationItem[]> {
    return this.locationRepo.getAll();
  }

  public async updateLocation(incomingId: string, incomingLocation: Partial<LocationRequest>): Promise<LocationItem> {
    // Query for id
    const storedLocation: LocationItem = await this.locationRepo.get(incomingId);

    if (!storedLocation) {
      return {} as LocationItem;
    }

    // if property not set in incomingLocation, use storedLocation value
    const name = incomingLocation.name ?? storedLocation.Name;
    const city = incomingLocation.city ?? storedLocation.City;
    const state = incomingLocation.state ?? storedLocation.State;
    const country = incomingLocation.country ?? storedLocation.Country;

    // if values are different from what's already stored...
    if (name !== storedLocation.Name || city !== storedLocation.City || state !== storedLocation.State || country !== storedLocation.Country) {
      const coords = await this.coordinatesRepo.get({
        city,
        state,
        country
      });

      if (!coords) {
        throw new Error('coordinates not found');
      }

      const [ pkCity, _, pkState, pkCountry ] = parseLocationDisplayName(coords.display_name);

      const newId = createLocationId(pkCity, pkState, pkCountry);

      if (incomingId === newId) {
        return this.locationRepo.update(incomingId, {
          Name: name
        })
      }

      // Remove item with old key
      const removeSuccessful = await this.locationRepo.delete(incomingId);
      if (!removeSuccessful) {
        throw new Error('unable to remove old location');
      }

      return this.locationRepo.create({
        Id: newId,
        Name: name,
        City: city,
        State: state,
        Country: country,
        Latitude: coords.lat,
        Longitude: coords.lon
      });
    }

    // no update made because name, city, state, and country values match an existing entry
    return {} as LocationItem;
  }
}
