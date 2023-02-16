export interface CreateLocationRequest {
  name: string;
  city: string;
  state: string;
  country: string;
}

export interface UpdateLocationRequest {
  name?: string;
  latitude?: string;
  longitude: string;
}
