import { z } from "zod";
import { sql } from "kysely";
import pgvector from "pgvector/knex";

const querySchema = z.object({
    q: z.string().optional(),
});

export default defineEventHandler(async (event) => {
    const { q } = await getValidatedQuery(event, querySchema.parse);

    if (!q) {
        return Project.all();
    }

    const response = await ai.models.embedContent({
        model: "gemini-embedding-001",
        config: { outputDimensionality: 768, taskType: "RETRIEVAL_QUERY" },
        contents: q,
    });

    const vector = response.embeddings[0].values;

    const pattern = `%${q}%`;

    return Project.where((eb) =>
        eb.or([
            eb("name", "ilike", pattern),
            eb(
                "id",
                "in",
                eb
                    .selectFrom("project_daily_reports")
                    .where(sql<boolean>`summary_embedding <=> ${pgvector.toSql(vector)}::vector < 0.5`)
                    .where((eb) =>
                        eb.or([
                            eb("summary", "ilike", pattern),
                            sql<boolean>`summary_embedding <=> ${pgvector.toSql(vector)}::vector < 0.5`,
                        ]),
                    )
                    .select("project_id"),
            ),
        ]),
    ).get();
});
