
### Running Locally

1. Create a local SQL db
1. Copy the `.env.example` file and rename to `.env`
1. Update the variables in `.env` to your own SQL db credentials
1. Copy the contents of `createTables.sql` and run the script in your SQL instance to create the tables

Run the API Locally:
- Dependencies: `node 7.10`
- Update `.env`
- `docker run --env-file .env -p 8080:8080 -d andimiya/crypto-api`

Hosted EC2 API Endpoint:
`TBD`

Hosted EC2 Postgres:
`TBD`

API Deployment:

- Build from local
  - `docker build --no-cache -t andimiya/orchid-judging-api .`
- Push from local to Docker
  - `docker push andimiya/orchid-judging-api`
- ssh into EC2 instance
  - `ssh ec2-user@TBD -i ~/.ssh/AndreaWestKeyPair.pem`
- Stop the running docker container
  - Pull down the latest docker image (`docker pull andimiya/orchid-judging-api`)
  - Run `docker run --env-file .env -p 8080:8080 -d andimiya/orchid-judging-api`
