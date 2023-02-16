import { Logger } from '@aws-lambda-powertools/logger';

import { Coordinates } from './models/Coordinates';
import { LocationItem } from './models/LocationItem';
import { CreateLocationRequest, UpdateLocationRequest } from './models/locationRequests';
import { CoordinatesRepository } from './repositories/CoordinatesRepository';
import { LocationRepository } from "./repositories/LocationRepository";

const log = new Logger();

export class LocationService {
  constructor(
    private readonly coordinatesRepo: CoordinatesRepository,
    private readonly locationRepo: LocationRepository
  ) {}

  public async createLocation(request: CreateLocationRequest): Promise<LocationItem> {
    const coordinates: Coordinates | null = await this.coordinatesRepo.get({
      city: request.city,
      state: request.state,
      country: request.country
    });

    if (!coordinates) {
      throw new Error('Coordinates not found');
    }

    const [ city, _, state, country ] = coordinates.display_name.replaceAll(' ', '').split(',');

    const locationItem: LocationItem = {
      Id: `${country}_${state}_${city}`,
      Name: request.name,
      City: city,
      State: state,
      Country: country,
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

  public async updateLocation(id: string, location: UpdateLocationRequest): Promise<LocationItem> {
    return this.locationRepo.update(id, location)
  }
}
