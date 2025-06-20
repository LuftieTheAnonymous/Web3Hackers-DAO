'use server';
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
 const createSupabaseClient = async () => {
  
  const cookiesStored = await cookies();

  


  return cookiesStored.get('supabase_jwt') && cookiesStored.get('supabase_jwt')?.value  ?
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
     process.env.NEXT_PUBLIC_API_KEY as string,
      {
      global: {
        headers: {
          Authorization: cookiesStored.get('supabase_jwt') ? `Bearer ${cookiesStored.get('supabase_jwt')?.value}` : "",
        },
      },
    }
  ):  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
     process.env.NEXT_PUBLIC_API_KEY as string
  );
};

export const supabase= await createSupabaseClient();

