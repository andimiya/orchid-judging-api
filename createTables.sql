START TRANSACTION;

CREATE TABLE Users (
  id serial primary key,
  first_name text default null,
  last_name text default null,
  email text not null UNIQUE
);

COMMIT;
