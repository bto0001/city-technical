import axios from 'axios';

import { Coordinates } from '../../src/models/Coordinates';
import { CoordinatesRepository } from "../../src/repositories/CoordinatesRepository";
import { StreetMapRequest } from '../../src/models/StreetMapRequest';

const mockClient = axios.create({
  baseURL: 'http://localhost'
});

const repo: CoordinatesRepository = new CoordinatesRepository(
  mockClient
);

describe('CoordinatesRepository', () => {
  test('test retrieve coordinates', async () => {
    const mockCoordinates: Coordinates = {
      display_name: 'Gardendale, Jefferson County, Alabama, USA',
      lat: '33',
      lon: '23'
    };

    const streetMapRequest: StreetMapRequest = {
      city: 'Gardendale',
      state: 'Alabama',
      country: 'United States'
    }

    jest.spyOn(mockClient, 'get').mockResolvedValue({
      data: mockCoordinates
    });

    const result = await repo.get(streetMapRequest);

    expect(mockClient.get).toHaveBeenLastCalledWith('/search');
    expect(result).toEqual(mockCoordinates);
  });
})
