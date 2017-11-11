START TRANSACTION;

CREATE TABLE Users (
  id serial primary key,
  first_name text default null,
  last_name text default null,
  email text not null
);

CREATE TABLE Crypto_Types (
  id serial primary key,
  symbol text not null,
  name text not null
);

CREATE TABLE Transactions (
  id serial primary key,
  crypto_type_id integer references Crypto_Types(id),
  usd_invested float8 not null,
  coin_purchased float8 not null,
  exchange_rate float8 not null,
  created_at timestamp,
  updated_at timestamp
);

COMMIT;
