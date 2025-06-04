import { Request, Response } from "express";
import { supabaseConfig } from "../config/supabase.js";

const upsertActivity = async (req: Request, res: Response) => {
    try {
const methodUsed = req.method;
console.log(methodUsed);        
const { memberDiscordId } = req.params;
        const { activity, id } = req.body;

        console.log(activity, id, memberDiscordId);

        const { data, error } = await supabaseConfig
            .from('dao_month_activity')
            .select('*')
            .eq('member_id', Number(memberDiscordId))
            .eq('id', id)
            .single();

            console.log(data);
            console.log(error);

            if(error){
                 res.status(500).json({
                    message: "error",
                    data: null,
                    error: error.message,
                    status: 500
                });
            }

        if (!data) {
            const { data: insertData, error: insertError } = await supabaseConfig
                .from('dao_month_activity')
                .insert({
                    id,
                    [activity]: 1,
                    member_id: Number(memberDiscordId)
                }).single();

                console.log(insertData);
                console.log(insertError);

            if (insertError) {
                 res.status(500).json({
                    message: "error",
                    data: null,
                    error: insertError.message,
                    status: 500
                });
            }

         res.status(200).json({
                message: "success",
                data: insertData,
                error: null,
                status: 200
            });

        } else {
            const { data: updateData, error: updateError } = await supabaseConfig
                .from('dao_month_activity')
                .update({ [activity]: methodUsed === 'POST' ? (data[activity] + 1) : (data[activity] - 1) })
                .eq('id', id);
                
        if (updateError) {
                 res.status(500).json({
                    message: "error",
                    data: null,
                    error: updateError.message,
                    status: 500
                });
            }

             res.status(200).json({
                message: "success",
                data: updateData,
                error: null,
                status: 200
            });
        }

    } catch (err) {
         res.status(500).json({
            message: "error",
            data: null,
            error: err instanceof Error ? err.message : JSON.stringify(err),
            status: 500
        });
    }
}

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
            })
        }

        res.status(200).json({
            message: "success",
            data,
            error: null,
            status: 200
        })

    }catch(err){
        res.status(500).json({
            message: "error",
            data: null,
            error: err instanceof Error ? err.message : JSON.stringify(err),
            status: 500
        })
    }
}

export { upsertActivity, insertVoiceChatActivity }