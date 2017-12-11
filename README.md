
### Running Locally

1. Create a local SQL db
1. Copy the `.env.example` file and rename to `.env`
1. Update the variables in `.env` to your own SQL db credentials
1. Copy the contents of `createTables.sql` and run the script in your SQL instance to create the tables
1. Seed all of the crypto types. Run the `seed-Crypto_Types.sql` query in your SQL instance

Run the API Locally:
- Dependencies: `node 7.10`
- Update `.env`
- `docker run --env-file .env -p 8080:8080 -d andimiya/crypto-api`

RDS Endpoint:
`crypto-db.cutd8mmjjtp3.us-east-1.rds.amazonaws.com:5432`

Hosted EC2 API Endpoint:
`ec2-34-238-43-66.compute-1.amazonaws.com:8080`

Deployment:
- Push from local to Docker
  - `docker push andimiya/crypto-api`
- ssh into EC2 instance
  - `ssh -i "AndreaKeyPair.pem" ec2-user@ec2-34-238-43-66.compute-1.amazonaws.com`
  - Stop the running docker container
  - Run `docker run --env-file .env -p 8080:8080 -d andimiya/crypto-api`
  - Pull down the latest docker image (`docker pull andimiya/crypto-api`)


Table Relations:  

![image](https://user-images.githubusercontent.com/20802421/32694620-b92874de-c6e8-11e7-89a6-c8d395f7b39e.png)
