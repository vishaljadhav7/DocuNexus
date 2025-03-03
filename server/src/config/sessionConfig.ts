import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { Pool } from 'pg';

const PostgreSqlStore = connectPgSimple(session);

const pool = new Pool({
    connectionString : process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

const sessionStore = new PostgreSqlStore({
    pool,
    tableName: 'session',
    createTableIfMissing: true,
    pruneSessionInterval: 60 * 60, // Clean expired sessions hourly
  });


export { sessionStore };