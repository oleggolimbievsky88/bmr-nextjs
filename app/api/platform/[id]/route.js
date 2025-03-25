import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function GET(request, { params }) {
  const { id } = params;

  try {
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    });

    const [rows] = await connection.execute(
      "SELECT Name FROM bodies WHERE BodyID = ?",
      [id]
    );

    await connection.end();

    if (rows.length === 0) {
      return NextResponse.json({ platform: null }, { status: 404 });
    }

    return NextResponse.json({ platform: rows[0] }, { status: 200 });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Error fetching platform data" },
      { status: 500 }
    );
  }
}
