import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Student } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mpxpaxezjurmuxsbeioi.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_S9liwY-mYtPWQWldVU7MyA_fP7kN3nF';

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export function getSupabaseClient(): SupabaseClient {
  return supabase;
}

/**
 * Transforms database row (with lowercase column names) to application Student object.
 */
function rowToStudent(row: any): Student {
  return {
    id: row.id,
    roll: Number(row.roll),
    registrationNo: row.registrationNo || row.registrationno || row.reg_no || `REG-${row.roll}`,
    name: row.name || 'Unnamed Student',
    gender: (row.gender || 'Male') as 'Male' | 'Female',
    class: (row.class || 'Class 10') as 'Class 9' | 'Class 10',
    section: (row.section || 'A') as 'A' | 'B',
    group: (row.group || 'Science') as 'Science' | 'Humanities' | 'Business Studies',
    session: row.session || '2025-2026',
    edgeCaseTag: row.edgeCaseTag || row.edgecasetag || undefined,
    edgeCaseDescription: row.edgeCaseDescription || row.edgecasedescription || undefined,
    marks: row.marks || {},
  };
}

/**
 * Transforms Student object to database payload compatible with PostgreSQL lowercase columns.
 */
function studentToRow(s: Student): any {
  return {
    id: String(s.id),
    roll: Number(s.roll),
    registrationno: s.registrationNo || `REG-${s.roll}`,
    name: s.name,
    gender: s.gender || 'Male',
    class: s.class,
    section: s.section,
    group: s.group,
    session: s.session,
    edgecasetag: s.edgeCaseTag || null,
    edgecasedescription: s.edgeCaseDescription || null,
    marks: s.marks || {},
  };
}

/**
 * Loads all students directly from the connected Supabase database.
 */
export async function getAllStudents(): Promise<Student[]> {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('roll', { ascending: true });

    if (error) {
      console.error('Error fetching students from Supabase:', error.message);
      return [];
    }

    if (!data || data.length === 0) return [];

    return data.map(rowToStudent);
  } catch (err: any) {
    console.error('Failed to fetch from Supabase:', err.message);
    return [];
  }
}

/**
 * Saves/upserts a batch of students directly into the Supabase database.
 */
export async function saveAllStudents(students: Student[]): Promise<{ success: boolean; error?: string }> {
  try {
    const rows = students.map(studentToRow);
    const { error } = await supabase
      .from('students')
      .upsert(rows, { onConflict: 'id' });

    if (error) {
      console.error('Error saving students to Supabase:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Failed to save to Supabase:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Upserts a single student directly in Supabase.
 */
export async function upsertStudent(student: Student): Promise<{ success: boolean; error?: string }> {
  try {
    const row = studentToRow(student);
    const { error } = await supabase
      .from('students')
      .upsert(row, { onConflict: 'id' });

    if (error) {
      console.error('Error upserting student in Supabase:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Failed to upsert in Supabase:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Deletes a student from Supabase by ID.
 */
export async function deleteStudent(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting student from Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.error('Failed to delete student from Supabase:', err.message);
    return false;
  }
}
