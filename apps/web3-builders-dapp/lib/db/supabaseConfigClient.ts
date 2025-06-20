import { createClient } from "@supabase/supabase-js";
 export const createSupabaseClient =  (supabaseJwt?: string) => {



  return supabaseJwt  ?
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
     process.env.NEXT_PUBLIC_API_KEY as string,
      {
      global: {
        headers: {
          Authorization: supabaseJwt ? `Bearer ${supabaseJwt}` : "",
        },
      },
    }
  ):  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
     process.env.NEXT_PUBLIC_API_KEY as string
  );
};



