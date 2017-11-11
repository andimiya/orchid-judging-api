
### Running Locally

1. Create a local SQL db
1. Copy the `.env.example` file and rename to `.env`
1. Update the variables in `.env` to your own SQL db credentials
1. Copy the contents of `createTables.sql` and run the script in your SQL instance to create the tables
1. Seed all of the crypto types. Run the `seed-Crypto_Types.sql` query in your SQL instance

Run the Project:  
- Dependencies: `node 7.10`
- Run `npm install`
- Run `nodemon server.js`

Table Relations:
![image](https://user-images.githubusercontent.com/20802421/32694605-4cde01b8-c6e8-11e7-801b-807c15001905.png)
