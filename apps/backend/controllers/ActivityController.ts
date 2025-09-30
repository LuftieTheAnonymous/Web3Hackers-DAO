import { Request, Response } from "express";
import { supabaseConfig } from "../config/supabase.js";
import redisClient from "../redis/set-up.js";

const upsertActivity = async (req: Request, res: Response) => {
    try {
        const methodUsed = req.method;
        const { memberDiscordId } = req.params;
        const { activity, id } = req.body;

        const redisKey = `activity:${id}:${memberDiscordId}`;

        // Check if hash exists
        const existing = await redisClient.exists(redisKey);

        console.log(existing);

        if (methodUsed === 'POST') {
            // If doesn't exist, set fresh
            if (!existing) {
                await redisClient.hSet(redisKey, {
                    discordId: memberDiscordId,
                    [activity]: 1
                });
            } else {
                // Otherwise, increment
                await redisClient.hIncrBy(redisKey, activity, 1);
                console.log('Incremented');
            }
        } else {
            // For non-POST, try to decrement
            const current = await redisClient.hGet(redisKey, activity);
            const currentValue = parseInt(current ?? '0', 10);
            const newValue = Math.max(0, currentValue - 1); // Avoid going negative

            await redisClient.hSet(redisKey, activity, newValue);
        }

        res.status(200).json({
            message: "success",
            data: "Updated activity in Redis",
            error: null,
            status: 200
        });

    } catch (err) {
        res.status(500).json({
            message: "error",
            data: null,
            error: err instanceof Error ? err.message : JSON.stringify(err),
            status: 500
        });
    }
};


const insertVoiceChatActivity=async(req:Request, res:Response)=>{
    try{
        const activityData = req.body;

        const {data,error}= await supabaseConfig.from('voice_chat_participation').insert([activityData]);

        if(!data || error){
            res.status(500).json({
                message: "error",
                data: null,
                error: error instanceof Error ? error.message : JSON.stringify(error),
                status: 500
            });
        }

        res.status(200).json({
            message: "success",
            data,
            error: null,
            status: 200
        });

    }catch(err){
        res.status(500).json({
            message: "error",
            data: null,
            error: err instanceof Error ? err.message : JSON.stringify(err),
            status: 500
        });
    }
}

export { upsertActivity, insertVoiceChatActivity }