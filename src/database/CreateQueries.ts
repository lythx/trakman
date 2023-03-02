export const createQueries = [
  `CREATE TABLE IF NOT EXISTS map_ids(
  id INT4 GENERATED ALWAYS AS IDENTITY,
  uid VARCHAR(27) NOT NULL UNIQUE,
  PRIMARY KEY(id)
  );`,

  `CREATE TABLE IF NOT EXISTS maps(
  id INT4 NOT NULL,
  name VARCHAR(60) NOT NULL,
  filename VARCHAR(255) NOT NULL UNIQUE,
  author VARCHAR(40) NOT NULL,
  environment INT2 NOT NULL,
  mood INT2 NOT NULL,
  bronze_time INT4 NOT NULL,
  silver_time INT4 NOT NULL,
  gold_time INT4 NOT NULL,
  author_time INT4 NOT NULL,
  copper_price INT4 NOT NULL,
  is_lap_race BOOLEAN NOT NULL,
  add_date TIMESTAMP NOT NULL,
  leaderboard_rating INT4,
  awards INT2,
  laps_amount INT2,
  checkpoints_amount INT2,
  PRIMARY KEY(id),
  CONSTRAINT fk_map_id
    FOREIGN KEY(id) 
	    REFERENCES map_ids(id)
  );`,

  `CREATE TABLE IF NOT EXISTS players(
    id INT4 GENERATED ALWAYS AS IDENTITY,
    login VARCHAR(40) NOT NULL UNIQUE,
    nickname VARCHAR(45) NOT NULL,
    region VARCHAR(58) NOT NULL,
    wins INT4 NOT NULL,
    time_played INT4 NOT NULL,
    visits INT4 NOT NULL,
    is_united BOOLEAN NOT NULL,
    average REAL NOT NULL,
    last_online TIMESTAMP,
    PRIMARY KEY(id)
  );`,

  `CREATE TABLE IF NOT EXISTS privileges(
    login VARCHAR(40) NOT NULL,
    privilege INT2 NOT NULL,
    PRIMARY KEY(login)
  );`,

  `CREATE TABLE IF NOT EXISTS records(
    map_id INT4 NOT NULL,
    player_id INT4 NOT NULL,
    time INT4 NOT NULL,
    checkpoints INT4[] NOT NULL,
    date TIMESTAMP NOT NULL,
    PRIMARY KEY(map_id, player_id),
    CONSTRAINT fk_player_id
      FOREIGN KEY(player_id) 
        REFERENCES players(id),
    CONSTRAINT fk_map_id
      FOREIGN KEY(map_id)
        REFERENCES map_ids(id)
  );`,

  `CREATE TABLE IF NOT EXISTS records_multilap(
    map_id INT4 NOT NULL,
    player_id INT4 NOT NULL,
    time INT4 NOT NULL,
    checkpoints INT4[] NOT NULL,
    date TIMESTAMP NOT NULL,
    laps INT2 NOT NULL,
    PRIMARY KEY(map_id, player_id, laps),
    CONSTRAINT fk_player_id
      FOREIGN KEY(player_id) 
        REFERENCES players(id),
    CONSTRAINT fk_map_id
      FOREIGN KEY(map_id)
        REFERENCES map_ids(id)
  );`,

  `CREATE TABLE IF NOT EXISTS votes(
    map_id INT4 NOT NULL,
    player_id INT4 NOT NULL,
    vote INT2 NOT NULL,
    date TIMESTAMP NOT NULL,
    PRIMARY KEY(map_id, player_id),
    CONSTRAINT fk_player_id
      FOREIGN KEY(player_id) 
        REFERENCES players(id),
    CONSTRAINT fk_map_id
      FOREIGN KEY(map_id)
        REFERENCES map_ids(id)
  );`,

  `CREATE TABLE IF NOT EXISTS chat(
      player_id INT4 NOT NULL,
      message VARCHAR(150) NOT NULL,
      date TIMESTAMP NOT NULL,
      PRIMARY KEY(player_id, date),
      CONSTRAINT fk_player_id
        FOREIGN KEY(player_id) 
	        REFERENCES players(id) 
  );`,

  `CREATE TABLE IF NOT EXISTS banlist(
    ip VARCHAR(16) NOT NULL,
    login VARCHAR(25) NOT NULL,
    date TIMESTAMP NOT NULL,
    caller_id INT4 NOT NULL,
    reason VARCHAR(150),
    expires TIMESTAMP,
    PRIMARY KEY(ip, login),
    CONSTRAINT fk_caller_id
      FOREIGN KEY(caller_id)
	      REFERENCES players(id)
  );`,

  `CREATE TABLE IF NOT EXISTS blacklist(
    login VARCHAR(25) NOT NULL,
    date TIMESTAMP NOT NULL,
    caller_id INT4 NOT NULL,
    reason VARCHAR(150),
    expires TIMESTAMP,
    PRIMARY KEY(login),
    CONSTRAINT fk_caller_id
      FOREIGN KEY(caller_id)
	      REFERENCES players(id)
  );`,

  `CREATE TABLE IF NOT EXISTS mutelist(
    login VARCHAR(25) NOT NULL,
    date TIMESTAMP NOT NULL,
    caller_id INT4 NOT NULL,
    reason VARCHAR(150),
    expires TIMESTAMP,
    PRIMARY KEY(login),
    CONSTRAINT fk_caller_id
      FOREIGN KEY(caller_id)
	      REFERENCES players(id)
  );`,

  `CREATE TABLE IF NOT EXISTS guestlist(
    login VARCHAR(25) NOT NULL,
    date TIMESTAMP NOT NULL,
    caller_id INT4 NOT NULL,
    PRIMARY KEY(login),
    CONSTRAINT fk_caller_id
      FOREIGN KEY(caller_id)
	      REFERENCES players(id)
  );`
]