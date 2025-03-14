import { Client as PGClient, type QueryResult as PGQueryResult } from 'pg';

type QueryResult<R> = PGQueryResult<R>
type QueryResponse<R> = Promise<QueryResult<R>>
type QueryMethod<I, R> = (input: I) => QueryResponse<R>

class Client {
  #client: PGClient;

  constructor() {
    this.#client = new PGClient({
      user: process.env.PG_USER_NAME,
      host: '127.0.0.1',
      database: process.env.PG_DB_NAME,
      password: process.env.PG_USER_PASSWORD,
      port: parseInt(process.env.PG_PORT),
    });
  }
  connect() {
    this.#client.connect();
  }
  end() {
    this.#client.end();
  }
  query<R>(text: string, value?: string[]): QueryResponse<R> {
    return this.#client.query(text, value);
  }
}

const client = new Client();
client.connect();

export default client;

export { Client };
export type { QueryResponse, QueryResult, QueryMethod }
