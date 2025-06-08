
import { createClient } from "@supabase/supabase-js";

 const createSupabaseClient = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("supabase_jwt") : null;


  return token ?
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
     process.env.NEXT_PUBLIC_API_KEY as string,
      {
      global: {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      },
    }
  ):  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
     process.env.NEXT_PUBLIC_API_KEY as string
  );
};

export const supabase=createSupabaseClient();

