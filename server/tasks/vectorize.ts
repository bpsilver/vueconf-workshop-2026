import pgvector from "pgvector/knex"; // Use 'pgvector/postgres' for generic node-postgres setups

export default defineTask({
    meta: {
        name: "db:vectorize",
        description: "Vectorize the daily report summaries",
    },
    async run({ payload, context }) {
        console.log("Vectorizing daily report summaries...");

        // Add your task logic here (e.g., ORM queries or API calls)
        try {
            // await db.insert(...).values(...)
            const reports = await ProjectDailyReport.all();
            //console.log(reports);

            for (const id in reports) {
                const report = reports[id];

                const response = await ai.models.embedContent({
                    model: "gemini-embedding-001",
                    config: { outputDimensionality: 768 },
                    contents: report?.summary,
                });

                const vector = response.embeddings[0].values;
                //console.log(vector);
                report.summary_embedding = pgvector.toSql(vector);
                report.save();
            }
            return { result: "Summaries vectorized successfully" };
        } catch (error) {
            return { result: "Failed to vectorize summaries", error };
        }
    },
});
