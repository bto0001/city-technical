import axios, { AxiosInstance } from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { Coordinates } from '../../src/models/Coordinates';
import { CoordinatesRepository } from "../../src/repositories/CoordinatesRepository";
import { StreetMapRequest } from '../../src/models/StreetMapRequest';

// Create axios mock client
const axiosMocker = new MockAdapter(axios);
const mockClient: AxiosInstance = axios.create({
  baseURL: 'http://localhost'
});

const repo: CoordinatesRepository = new CoordinatesRepository(
  mockClient
);

describe('CoordinatesRepository', () => {
  test('test retrieve coordinates', async () => {
    // GIVEN
    const mockCoordinates: Coordinates = {
      display_name: 'Gardendale, Jefferson County, Alabama, USA',
      lat: '33',
      lon: '23'
    };
    const streetMapRequest: StreetMapRequest = {
      city: 'Gardendale',
      state: 'Alabama',
      country: 'United States'
    };
    axiosMocker.onGet('/search').reply(200, [mockCoordinates]);

    // WHEN
    const result = await repo.get(streetMapRequest);

    // THEN
    expect(axiosMocker.history.get).toHaveLength(1);
    expect(result).toEqual(mockCoordinates);
  });
})
