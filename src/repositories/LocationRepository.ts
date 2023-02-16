import {
  AttributeValue,
  DynamoDBClient,
  GetItemCommand,
  GetItemCommandOutput,
  ScanCommand,
  ScanCommandOutput,
  PutItemCommand,
  PutItemCommandOutput,
  UpdateItemCommand,
  UpdateItemCommandOutput
} from '@aws-sdk/client-dynamodb';
import { Logger } from '@aws-lambda-powertools/logger';

import { UpdateLocationRequest } from '../models/locationRequests';
import { LocationItem } from '../models/LocationItem';
import { ReadAll } from './interfaces/ReadAll';
import { ReadOne } from './interfaces/ReadOne';
import { Write } from './interfaces/Write';

const log = new Logger();

export class LocationRepository implements ReadAll<LocationItem>, ReadOne<string, LocationItem>, Write<LocationItem, UpdateLocationRequest> {
  constructor(
    private readonly tableName: string,
    private readonly client: DynamoDBClient
  ) {}

  public async getAll(): Promise<LocationItem[]> {
    const cmd: ScanCommand = new ScanCommand({
      TableName: this.tableName
    });

    log.debug('ScanCommand', { input: JSON.stringify(cmd.input) }, { tableName: cmd.input.TableName});
    const response: ScanCommandOutput = await this.client.send(cmd);
    log.debug('ScanCommandOutput', JSON.stringify(response));

    if (!response.Items) {
      return [];
    }

    const locations = new Array<LocationItem>();

    for (const item of response.Items) {
      locations.push(
        {
          Id: item.Id.S!,
          Name: item.Name.S!,
          City: item.City.S!,
          State: item.State.S!,
          Country: item.Country.S!,
          Latitude: item.Latitude.S!,
          Longitude: item.Longitude.S!
        }
      );
    }

    return locations;
  }

  public async create(location: LocationItem): Promise<LocationItem> {
    const cmd: PutItemCommand = new PutItemCommand({
      TableName: this.tableName,
      Item: {
        Id: {
          S: location.Id
        },
        Name: {
          S: location.Name
        },
        City: {
          S: location.City
        },
        State: {
          S: location.State
        },
        Country: {
          S: location.Country
        },
        Latitude: {
          S: location.Latitude
        },
        Longitude: {
          S: location.Longitude
        },
      }
    });

    log.debug('PutItemCommand', { input: JSON.stringify(cmd.input) }, { tableName: cmd.input.TableName, Key: JSON.stringify(cmd.input.Item)});
    const response: PutItemCommandOutput = await this.client.send(cmd);
    log.debug('PutItemCommandOutput', JSON.stringify(response));

    if (response.$metadata.httpStatusCode === 200) {
      return location;
    }

    return {} as LocationItem;
  }

  public async get(id: string): Promise<LocationItem> {
    const cmd: GetItemCommand = new GetItemCommand({
      TableName: this.tableName,
      Key: { Id: { S: id }}
    });

    log.debug('GetItemCommand', { input: JSON.stringify(cmd.input) }, { tableName: cmd.input.TableName, Key: JSON.stringify(cmd.input.Key)});
    const response: GetItemCommandOutput = await this.client.send(cmd);
    const item: Record<string, AttributeValue> | undefined = response.Item;
    log.debug('GetItemCommandOutput', JSON.stringify(response));

    if (!item) {
      return {} as LocationItem;
    }

    return {
      Id: item.Id.S!,
      Name: item.Name.S!,
      City: item.City.S!,
      State: item.State.S!,
      Country: item.Country.S!,
      Latitude: item.Latitude.S!,
      Longitude: item.Longitude.S!
    };
  }

  public async update(id: string, location: UpdateLocationRequest): Promise<LocationItem> {
    let updateExpression = 'SET ';
    let expressionAttributeNames: Record<string, string> = {};
    let expressionAttributeValues: Record<string, AttributeValue> = {};
    if (location.name) {
      updateExpression += '#name = :name,';
      expressionAttributeNames['#name'] = 'Name';
      expressionAttributeValues[':name'] = { S: location.name };
    }
    if (location.latitude) {
      updateExpression += '#latitude = :latitude,';
      expressionAttributeNames['#latitude'] = 'Latitude'
      expressionAttributeValues[':latitude'] = { S: location.latitude };
    }
    if (location.longitude) {
      updateExpression += '#longitude = :longitude,';
      expressionAttributeNames['#longitude'] = 'Longitude';
      expressionAttributeValues[':longitude'] = { S: location.longitude };
    }
    updateExpression = updateExpression.substring(0, updateExpression.length-1);  // remove trailing comma
    const cmd: UpdateItemCommand = new UpdateItemCommand({
      TableName: this.tableName,
      Key: {
        Id: {
          S: id
        }
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ConditionExpression: 'attribute_exists(Id)',
      ReturnValues: 'ALL_NEW'
    });

    log.debug('UpdateItemCommand', { input: JSON.stringify(cmd.input) }, { tableName: cmd.input.TableName, Key: JSON.stringify(cmd.input.Key)});
    const response: UpdateItemCommandOutput = await this.client.send(cmd);
    log.debug('UpdateItemCommandOutput', JSON.stringify(response));

    if (response.$metadata.httpStatusCode === 200) {
      return {
        Id: response.Attributes?.Id.S,
        Name: response.Attributes?.Name.S,
        City: response.Attributes?.City.S,
        State: response.Attributes?.State.S,
        Country: response.Attributes?.Country.S,
        Latitude: response.Attributes?.Latitude.S,
        Longitude: response.Attributes?.Longitude.S
      } as LocationItem;
    }
    return {} as LocationItem;
  }

  public async delete(id: string): Promise<boolean> {
    return true;
  }
}
