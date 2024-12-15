import pg from 'pg';

class Client {
  #client;

  constructor() {
    this.#client = new pg.Client({
      user: process.env.PG_USER_NAME,
      host: '127.0.0.1',
      database: process.env.PG_DB_NAME,
      password: process.env.PG_USER_PASSWORD,
      port: process.env.PG_PORT,
    });
  }
  connect() {
    this.#client.connect();
  }
  end() {
    this.#client.end();
  }
  query(text, value) {
    return this.#client.query(text, value);
  }
}

const client = new Client();
client.connect();

export default client;

export { Client };
