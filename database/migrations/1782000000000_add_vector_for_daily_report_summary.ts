/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Kysely } from "kysely";
import { sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable("project_daily_reports")
        .addColumn("summary_embedding", sql`vector(768)`)
        .execute();
}
