# City Technical API

## Deployment

1. Create a GitHub access token that will be used to run the pipeline
2. Create a secret in Secrets Manager, using the name: `dev/city-technical-location-api/pipeline/github-access-token`
3. Create an AWS profile credentials file
4. If using an AWS profile other than "default", set the `AWS_PROFILE` environment variable
5. Execute the following:
```bash
npm run deploy:dev
```

## Design Considerations

### API Design

I decided to use the route 'locations/' as the main route, using the HTTP verbs to denote what the endpoint does. Here are the routes:

- GET   - locations/: retrieve all locations
- GET   - locations/{id}: retrieve one location with a given id
- POST  - locations/: create a new location
- PATCH - locations/{id}: update a location with a given id in the path parameter

Perhaps a more DDD approach would've been to create separate endpoints, for example:

- POST  - location/create
- PATCH - location/update
- GET   - location/get
- GET   - location/get-all

### Database Design

The Location table is a DynamoDB table with the following schema:

- Id (String): Partition Key consisting of 'city#state#country' to prevent duplication of records
- Name (String): a user-friendly name chosen, does not need to be unique
- City (String)
- State (String)
- Country (String)
- Latitude (Number)
- Longitude (Number)

Latitude and Longitude are provided via an external API call to  https://nominatim.openstreetmap.org.

City, State, and Country values will be parsed from the openstreetmap.org call and stored as opposed to using the user-provided values to prevent duplication.

## Improvements

- Add integration, E2E testing, and smoke/verification testing
- Add more unit tests
- Use a Global Table (multi-region replication) instead of the one, regional table
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

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template
