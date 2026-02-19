// lib/db.js
// Uses only process.env.DATABASE_URL (e.g. mysql://user:password@host:3306/database?ssl=true)

import mysql from "mysql2/promise";

function parseDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url || typeof url !== "string") {
    throw new Error(
      "DATABASE_URL is required. Set it in .env or Vercel environment variables.",
    );
  }
  const parsed = new URL(url);
  const options = {
    host: parsed.hostname,
    port: parsed.port ? parseInt(parsed.port, 10) : 3306,
    user: decodeURIComponent(parsed.username || "root"),
    password: decodeURIComponent(parsed.password || ""),
    database: parsed.pathname
      ? parsed.pathname.slice(1).replace(/%2f/gi, "/")
      : "",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 60000,
  };
  const sslParam = parsed.searchParams.get("ssl");
  if (sslParam === "true" || sslParam === "1") {
    options.ssl = { rejectUnauthorized: false };
  }
  return options;
}

let pool;
function getPool() {
  if (!pool) {
    const options = parseDatabaseUrl();
    pool = mysql.createPool(options);
    pool.on("error", (err) => {
      console.error("Unexpected database pool error:", {
        message: err.message,
        code: err.code,
        errno: err.errno,
        sqlState: err.sqlState,
        sqlMessage: err.sqlMessage,
      });
    });
  }
  return pool;
}

async function testConnection() {
  try {
    const connection = await getPool().getConnection();
    console.log("Database connection successful");
    connection.release();
    return true;
  } catch (error) {
    console.error("Error connecting to the database:", {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage,
    });
    return false;
  }
}

async function query(sql, params = []) {
  try {
    const [rows] = await getPool().query(sql, params);
    return rows;
  } catch (error) {
    console.error("Database query error:", {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage,
      sql: sql,
      params: params,
    });
    throw error;
  }
}

export { testConnection, query };
export default new Proxy(
  {},
  {
    get(_, prop) {
      return getPool()[prop];
    },
  },
);
