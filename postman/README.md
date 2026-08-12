# Postman collection

Import both files into Postman:

1. Import `game-of-thrones-api.postman_collection.json`.
2. Import and select `game-of-thrones-api.postman_environment.json`.
3. Start the API with `npm run enterprise:api` (or run the production container) and send the requests under **Health & discovery**, **realm API**, or **Database Explorer**.

The local environment targets `http://localhost:8080`. Change `baseUrl` for a deployed API. The collection contains every current REST route, including the paginated, allowlisted database explorer. Database requests are read-only by design: the service never accepts arbitrary SQL or exposes database credentials.
