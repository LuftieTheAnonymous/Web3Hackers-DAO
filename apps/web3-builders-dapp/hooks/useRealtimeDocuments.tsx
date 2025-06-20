'use client';



import { createSupabaseClient } from '@/lib/db/supabaseConfigClient';
import { TokenState, useStore } from '@/lib/zustandConfig';
import React, { useEffect } from 'react'

type Props<T> = {
    initialData:T[],
    tableName:string,
    parameterOnChanges:string,
    otherParameterOnChanges?:string,
    matchOnChangeParam:string,
    jsonToken?:string
}

function useRealtimeDocuments<T>({tableName, parameterOnChanges, initialData, otherParameterOnChanges, jsonToken, matchOnChangeParam}: Props<T>) {

    const [serverData,setData] = React.useState<T[]>(initialData);
    const [loading,setLoading] = React.useState<boolean>(false);

   const token = useStore((state) => (state as TokenState).token);
   const supabase =  createSupabaseClient(!token ? '' : token);


useEffect(()=>{
    setLoading(true);

const channels = supabase.channel(`realtime:${tableName}`).on("postgres_changes", {
    event:'INSERT',
    schema:'public',
    table:tableName
}, async (payload:any) => {

      const { data: full_element } = await supabase
    .from(tableName)
    .select(otherParameterOnChanges ? `*, ${otherParameterOnChanges}` : '*')
    .eq(`${matchOnChangeParam}`, payload.new[matchOnChangeParam])
    .single();

    

    console.log(payload);
    setData(prev => [...prev, full_element as T]);
    setLoading(false);
 
})
.on("postgres_changes", {
    event:'DELETE',
        schema:'public',
    table:tableName
}, (payload:any) => {
    setData(prev => prev.filter((item: any) => item[parameterOnChanges] !== payload.old[parameterOnChanges]));

    setLoading(false);
 
}).on("postgres_changes", {
    event:'UPDATE',
        schema:'public',
    table:tableName
}, (payload:any) => {
   setData(prev => prev.map((item: any) =>
  item[parameterOnChanges] === payload.new[parameterOnChanges] ? payload.new : item
));
        setLoading(false);
  
}).subscribe();
      setLoading(false);

 return ()=>{
    supabase.removeChannel(channels);
 }

},[tableName, parameterOnChanges]);


return {
    serverData,
    isLoading:loading
}
}
export default useRealtimeDocuments