import { defineModel } from "vasta-orm";
import { z } from "zod";

export class ProjectDailyReport extends defineModel({
    db,
    table: "project_daily_reports",
    events: {
        saved: async (report) => {
            const tagSchema = z.object({
                tags: z.array(z.string()),
            });

            const tagList = await DailyReportTag.all();
            const delimitedTagNames = tagList.map((drt) => drt.attributes["name"]).join(", ");
            const prompt = `The following text is a summary report from a construction job site.
            Please extract the tags from the following text: "${report.attributes.summary}".
            The list of available tags is: ${delimitedTagNames}.`;
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseJsonSchema: z.toJSONSchema(tagSchema),
                    responseMimeType: "application/json",
                    // below doesn't work!!
                    //responseFormat: { text: { mimeType: "application/json", schema: z.toJSONSchema(tagSchema) } },
                },
            });

            //const savedReport = await ProjectDailyReport.where("project_id", report.attributes['id']).first();

            const tagResponse = tagSchema.parse(JSON.parse(response.text));
            tagResponse.tags.forEach((t) => {
                const tag = tagList.find((drt) => drt.attributes["name"] === t);
                if (tag) {
                    const drtu = new DailyReportTagUsage({
                        daily_report_id: report.attributes["id"],
                        daily_report_tag_id: tag.attributes["id"],
                    });
                    drtu.save();
                }
            });

            // throw "test";
        },
    },
}) {
    get project() {
        return this.belongsTo(Project, "project_id");
    }

    get tags() {
        return this.hasMany(DailyReportTagUsage, "daily_report_id").with("tag");
    }

    get photoStoragePath() {
        return `daily-reports/${this.id}/${this.photo_file_name}`;
    }

    async savePhoto(data: File | Buffer, fileName?: string) {
        if (!this.id) {
            await this.save();
        }
        if (data instanceof File) {
            this.photo_file_name = fileName || data.name;
            await storagePublic.setItem(this.photoStoragePath, data);
        } else {
            this.photo_file_name = fileName ?? "photo.jpg";
            await storagePublic.setItemRaw(this.photoStoragePath, data);
        }
        await this.save();
    }
}
