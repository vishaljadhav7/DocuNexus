import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { Pool } from 'pg';

const PostgreSqlStore = connectPgSimple(session);

const pool = new Pool({
    connectionString : process.env.DATABASE_URL3,
    ssl: { rejectUnauthorized: false },
    idleTimeoutMillis: 100000, // 30 seconds
    connectionTimeoutMillis: 10000, // 2 seconds
});


pool.connect((err) => {
  if (err) {
    console.error('PostgreSQL connection error:', err.stack);
   
  } else {
    console.log('PostgreSQL connected successfully');
  }
});

const sessionStore = new PostgreSqlStore({
    pool,
    tableName: 'session',
    createTableIfMissing: true,
    pruneSessionInterval: 60 * 60 * 1000, // Clean expired sessions hourly
    
  });


export { sessionStore };