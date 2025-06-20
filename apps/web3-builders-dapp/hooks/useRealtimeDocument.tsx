'use client';


import { createSupabaseClient } from '@/lib/db/supabaseConfigClient';
import { TokenState, useStore } from '@/lib/zustandConfig';
import React, { useEffect } from 'react'

type Props<T> = {
    initialObj: T,
    tableName: string,

}

function useRealtimeDocument<T>({initialObj, tableName }: Props<T>) {
  const [serverObjectData,setServerObjectData] = React.useState<T>(initialObj);
  const token = useStore((state) => (state as TokenState).token);
  const supabase =  createSupabaseClient(!token ? '' : token);

useEffect(()=>{
const channels = supabase.channel(`realtime:${tableName}`).on("postgres_changes", {
    event:'INSERT',
    schema:'public',
    table:tableName
}, (payload:any) => {
    console.log(payload);
    setServerObjectData(payload.new);
})
.on("postgres_changes", {
    event:'DELETE',
        schema:'public',
    table:tableName
}, (payload:any) => {
    setServerObjectData(payload.old);
}).on("postgres_changes", {
    event:'UPDATE',
        schema:'public',
    table:tableName
}, (payload:any) => {
    setServerObjectData(payload.new);
}).subscribe();


 return ()=>{
    supabase.removeChannel(channels);
 }

},[supabase]);


return {
    objectData: serverObjectData
}
}

export default useRealtimeDocument