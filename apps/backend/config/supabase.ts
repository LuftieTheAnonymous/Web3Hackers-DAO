import {createClient} from '@supabase/supabase-js';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

console.log(process.env.SUPABASE_BACKEND_ACTION_JWT_TOKEN as string);

console.log(jwt.decode(process.env.SUPABASE_BACKEND_ACTION_JWT_TOKEN as string));

export const supabaseConfig = createClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_API_KEY as string,
    {
        'global':{
            headers:{
                'Authorization': `Bearer ${process.env.SUPABASE_BACKEND_ACTION_JWT_TOKEN as string}`
            }
        }
    }
)