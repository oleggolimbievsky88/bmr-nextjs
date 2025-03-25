import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function GET() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    });

    const [bannerRows] = await connection.execute(
      "SELECT * FROM banner WHERE display = 1"
    );

    if (!bannerRows || bannerRows.length === 0) {
      await connection.end();
      return NextResponse.json({ error: "No banner found" }, { status: 404 });
    }

    const banner = bannerRows[0];
    const [imageRows] = await connection.execute(
      "SELECT * FROM bannerimages WHERE bannerid = ? ORDER BY ImagePosition",
      [banner.bannerid]
    );

    await connection.end();

    return NextResponse.json({
      banner,
      images: imageRows,
    });
  } catch (error) {
    console.error("Error fetching banner:", error);
    return NextResponse.json(
      { error: "Error fetching banner" },
      { status: 500 }
    );
  }
}
