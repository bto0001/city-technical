import { AxiosInstance } from 'axios';
import { Logger } from '@aws-lambda-powertools/logger';

import { Coordinates } from '../models/Coordinates';
import { ReadOne } from './interfaces/ReadOne';
import { StreetMapRequest } from '../models/StreetMapRequest';
import { log } from '../config/middleware';

export class CoordinatesRepository implements ReadOne<StreetMapRequest, Coordinates> {
  constructor(private client: AxiosInstance) {}

  public async get(request: StreetMapRequest): Promise<Coordinates | null> {
    const params = {
      ...request,
      format: 'json'
    };

    log.debug(`Calling ${this.client.getUri()}`, params);
    const { data } = await this.client.get<Coordinates[]>('/search', {
      params: params
    });
    log.debug(`${this.client.getUri()} call complete`, { data });

    if (!data || data.length === 0) {
      return null;
    }

    return data[0];
  }
}
