# City Technical API

I took heavy inspiration from https://medium.com/@leejamesgilmore/serverless-aws-cdk-pipeline-best-practices-patterns-part-1-ab80962f109d

## Deployment

1. Create a GitHub access token that will be used to run the pipeline
2. Create a secret in Secrets Manager, using the name: `city-technical-location-api/pipeline/github-access-token`
3. Create an AWS profile credentials file, if one does not already exist
4. If using an AWS profile other than "default", set the `AWS_PROFILE` environment variable
5. Ensure you have the correct version of Node installed. See `./.npmrc`.
6. Use nvm to set your Node version to the project's Node version:
```bash
nvm use
```
7. Install dependencies:
```bash
npm install
```
8. To deploy, execute:
```bash
npm run deploy:dev
```

- To deploy the pipeline, you can run:
```bash
npm run deploy:pipeline
```

## Design Considerations

### Database Design

The Location table is a DynamoDB table with the following schema:

- Id (String): Partition Key consisting of 'country_state_city' with spaces removed to prevent duplication of records
- Name (String): a user-friendly name chosen, does not need to be unique
- City (String)
- State (String)
- Country (String)
- Latitude (String)
- Longitude (String)

Latitude and Longitude are provided via an external API call to  https://nominatim.openstreetmap.org.

### API Design

I decided to use the route 'locations/' as the main route, using the HTTP verbs to denote what the endpoint does. Here are the routes:

- GET   - locations/: retrieve all locations
- GET   - locations/{id}: retrieve one location with a given id
- POST  - locations/: create a new location
- PATCH - locations/{id}: update a location with a given id in the path parameter. Currently, this API only allows for location name, latitude, and longitude to be overwritten. I misread the instructions and realize now that I should've accepted location name, city, state, and country, instead of allowing for latitude an longitude. To prevent duplication, I would need to have this endpoint see if the location id exists, if it does, and the city, state, and/or country properties have been changed, then I need to call the coordinates api for the new lat/long and store that in the Location table. I would also need to delete the previous location id, as it would no longer be valid.

Perhaps a more DDD approach would've been to create separate endpoints, for example:

- POST  - location/create
- PATCH - location/update
- GET   - location/get
- GET   - location/get-all

## Improvements

- Add integration, E2E testing, and smoke/verification testing
- Add more unit tests
- Use a Global Table (multi-region replication) instead of the one, regional table
- Add pagination for results to the getAll functionality
- Change the Latitude and Longitude properties to Number in DynamoDB
- More error handling and custom errors
- Add request validation
- Consider using Edge Optimized endpoints for geographically distributed clients
- Configure WAF to protect the endpoints
- Consider using a DI library
- Create pipelines for other environments (test, pre-prod, prod) in separate accounts, including a separate account for the pipeline itself
- Add metrics and tracing
- Consider adding a milddleware layer, specifically for error handling
- Add in a linter
- Add in husky for pre-commit linting/code correction
- Add static code analysis to pipeline

## Default CDK README

The `cdk.json` file tells the CDK Toolkit how to execute your app.

### Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template
