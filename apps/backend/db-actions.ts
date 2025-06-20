import { supabaseConfig } from './config/supabase.ts';

type DBReturn<T> = Promise<{ data: T | null; error: string | null }>;

const handleResponse = <T>(res: { data: T | null; error: any }): DBReturn<T> => {
  if (res.error) return Promise.resolve({ data: null, error: res.error.message });
  return Promise.resolve({ data: res.data, error: null });
};

export const getDatabaseElement = async <T>(
  table: string,
  column: string,
  value: any,
  
): DBReturn<T> => {
  try {
    const res = await supabaseConfig.from(table).select('*').eq(column, value).maybeSingle();
    return handleResponse<T>(res);
  } catch (err) {
    console.error(err);
    return { data: null, error: 'getDatabaseElement failed' };
  }
};

export const getDatabaseElements = async <T>(table: string): DBReturn<T[]> => {
  try {
    const res = await supabaseConfig.from(table).select('*');
    return handleResponse<T[]>(res);
  } catch (err) {
    console.error(err);
    return { data: null, error: 'getDatabaseElements failed' };
  }
};

export const insertDatabaseElement = async <T>(
  table: string,
  payload: T
): DBReturn<T> => {
  try {
    const res = await supabaseConfig.from(table).insert(payload).single();
    return handleResponse<T>(res);
  } catch (err) {
    console.error(err);
    return { data: null, error: 'insertDatabaseElement failed' };
  }
};

export const updateDatabaseElement = async <T>(
  table: string,
  id: string,
  payload: Partial<T>,
  idField = 'id'
): DBReturn<T> => {
  try {
    const res = await supabaseConfig.from(table).update(payload).eq(idField, id).single();
    return handleResponse<T>(res);
  } catch (err) {
    console.error(err);
    return { data: null, error: 'updateDatabaseElement failed' };
  }
};

export const deleteDatabaseElement = async <T>(
  table: string,
  id: any,
  idField:string
): DBReturn<T> => {
  try {
    const res = await supabaseConfig.from(table).delete().eq(idField, id).single();
    return handleResponse<T>(res);
  } catch (err) {
    console.error(err);
    return { data: null, error: 'deleteDatabaseElement failed' };
  }
};