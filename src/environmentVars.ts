export interface Environment {
  LOCATION_TABLE_NAME: string;
  OPENSTEETMAP_URL: string;
}

export const envVars: Environment = {
  LOCATION_TABLE_NAME: process.env.LOCATION_TABLE_NAME as string,
  OPENSTEETMAP_URL: process.env.OPENSTEETMAP_URL as string
}
