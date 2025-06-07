'use client';


import { supabase } from '@/lib/db/supabaseConfigClient';
import React, { useEffect } from 'react'

type Props<T> = {
    initialObj: T,
    tableName: string
}

function useRealtimeDocument<T>({initialObj, tableName }: Props<T>) {
  const [serverObjectData,setServerObjectData] = React.useState<T>(initialObj);


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