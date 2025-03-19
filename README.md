# Food4You

This project is a menu for Chabad house, with order flow, charging and kichen prints.

# Development

Please create a `.env` flie in the root folder.
In the `.env`, put the next lines:

```
JWT_SECRET=<secret-value>
EXPIRES_IN=24h
PORT=3311
ADMIN_NAME=<your-admin-name>
ADMIN_PASSWORD=<your-admin-password>
ADMIN_ROLE=<your-admin-role>
RESET_DB=<true/false>
DB_PATH=app.db
AWS_REGION=<region>
AWS_ACCESS_KEY_ID=<your-aws-access-id>
AWS_SECRET_ACCESS_KEY=<your-aws-secret-key>
AWS_S3_BUCKET=<name-of-your-s3-bucket>
```

## Server

The server uses `NodeJS` and the `DB` is `sqlite3`, there for, to run the BE for local development, please run the command:

```bash
npm run start
```

**If you having errors about the creating tables, try the next command:**

```bash
node app.js
```

In a new terminal:

```bash
node createAdmin.js && node createTables.js
```

Now, you should have a BE running with your admin user and some mocked items.

### serve static website

You can run:

```bash
npm run build
```

Then, you can run the server and it will serve your latest changes in the frontend.

Once the server is running, open your browser and navigate to `http://localhost:3311/` or `http://localhost:<port-in-your-env>/`.

You can test the API using Curl or Postman with the suffix `/api/<tested-api>`

## Client

To start a local frontend development server, run:

```bash
npm run start:front
```

**Running the frontend with the server will give you the mocked data from the database and will save you time, you can also mock the data in the code if you need.**

Once running, open your browser and navigate to `http://localhost:12345/`. The application will automatically reload whenever you modify any of the source files.
