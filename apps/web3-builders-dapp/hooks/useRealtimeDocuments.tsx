'use client';



import { supabase } from '@/lib/db/supabaseConfigClient';
import React, { useEffect } from 'react'

type Props<T> = {
    initialData:T[],
    tableName:string,
    parameterOnChanges:string
}

function useRealtimeDocuments<T>({tableName, parameterOnChanges, initialData}: Props<T>) {

    const [serverData,setData] = React.useState<T[]>(initialData);
    const [loading,setLoading] = React.useState<boolean>(false);


useEffect(()=>{
    setLoading(true);
const channels = supabase.channel(`realtime:${tableName}`).on("postgres_changes", {
    event:'INSERT',
    schema:'public',
    table:tableName
}, (payload:any) => {
    console.log(payload);
    setData([...serverData,payload.new]);
 
})
.on("postgres_changes", {
    event:'DELETE',
        schema:'public',
    table:tableName
}, (payload:any) => {
    setData(serverData.filter((item:any) => item[parameterOnChanges] !== payload.old[parameterOnChanges]));
 
}).on("postgres_changes", {
    event:'UPDATE',
        schema:'public',
    table:tableName
}, (payload:any) => {
    setData(serverData.map((item:any) => item[parameterOnChanges] === payload.new[parameterOnChanges] ? payload.new : item));
  
}).subscribe();
      setLoading(false);

 return ()=>{
    supabase.removeChannel(channels);
 }

},[supabase]);


return {
    serverData,
    isLoading:loading
}
}
export default useRealtimeDocuments