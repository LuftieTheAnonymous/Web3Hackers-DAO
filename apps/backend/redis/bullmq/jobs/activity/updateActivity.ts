import dayjs from "dayjs";
import { supabaseConfig } from "../../../../config/supabase.js";
import redisClient from "../../../set-up.js";

export const updateMembersActivity = async () => {
    try {
        // Scan Redis keys matching activity:*
        const keys = await redisClient.keys("activity:*");

        console.log(keys, "Keys object");

        if(Object.keys(keys).length === 0) return {
            message: "success",
            data: 'No activities found !',
            error: null,
            status: 200
        };

        for (const key of keys) {
            console.log(key, "Key in keys");
            const [_, id, memberDiscordId] = key.split(":"); // activity:id:memberDiscordId
            const activityData = await redisClient.hGetAll(key);

            console.log(id, memberDiscordId);

            if (!activityData || !activityData.discordId) continue;

            // Remove discordId field from the object
            delete activityData.discordId;

            // Convert all values to numbers (Redis stores strings)
            const parsedActivity = Object.fromEntries(
                Object.entries(activityData).map(([k, v]) => [k, parseInt(v, 10)])
            );
            console.log("Parsed Activity", parsedActivity);

            // Check if row exists in Supabase
            const { data: existing, error: fetchError } = await supabaseConfig
                .from("dao_month_activity")
                .select("*")
                .eq("id", id)
                .eq("member_id", Number(memberDiscordId))
                .single();

                console.log(fetchError);

            if (fetchError && fetchError.code !== "PGRST116") {
                // Skip only if it's a 'no rows found' error, otherwise throw
                console.error("Fetch error:", fetchError);
                continue;
            }

            if (!existing) {
                // Insert new record
                const { error: insertError } = await supabaseConfig
                    .from("dao_month_activity")
                    .insert({
                        id,
                        member_id: Number(memberDiscordId),
                        reward_month:`${dayjs().month()}-${dayjs().year()}`,
                        ...parsedActivity
                    });

                if (insertError) {
                    console.error("Insert error:", insertError);
                }
            } else {
                // Update existing record (merge values)
                const updatedFields:any = {};

                for (const [activity, value] of Object.entries(parsedActivity)) {
                    const current = existing[activity] ?? 0;
                    updatedFields[activity] = current + value;
                }

                console.log(updatedFields);

                const { error: updateError } = await supabaseConfig
                    .from("dao_month_activity")
                    .update(updatedFields)
                    .eq("id", id)
                    .eq("member_id", Number(memberDiscordId));

                if (updateError) {
                    console.error("Update error:", updateError);
                }
            }
            await redisClient.del(key);
        }

        return {
            message: "success",
            data: null,
            error: null,
            status: 200
        };

    } catch (err) {
        return {
            message: "error",
            data: null,
            error: err instanceof Error ? err.message : JSON.stringify(err),
            status: 500
        };
    }
};
