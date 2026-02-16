import { supabase, isSupabaseConfigured } from './supabase';
import type { User, Classroom, Pet, Goal, Checkin } from './supabase';

const FALLBACK_KEY = 'classbandit_state';
const PTS_PER_LEVEL = 25;

// Default goals to seed new classrooms
const DEFAULT_GOALS = [
  { title: 'Staying On Task', casel_category: 'Self-Management', sort_order: 0 },
  { title: 'Helping Others', casel_category: 'Relationship Skills', sort_order: 1 },
  { title: 'Working Together', casel_category: 'Relationship Skills', sort_order: 2 },
  { title: 'Quick and Calm Transitions', casel_category: 'Self-Management', sort_order: 3 },
];

// ============================================================
// AUTH
// ============================================================

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/` },
  });
  if (error) throw error;
}

export async function signInWithMicrosoft() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'azure',
    options: {
      redirectTo: `${window.location.origin}/`,
      scopes: 'email profile openid',
    },
  });
  if (error) throw error;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export function onAuthChange(callback: (session: any) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
}

// ============================================================
// USER PROFILE
// ============================================================

export async function getUser(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) return null;
  return data;
}

export async function updateUser(userId: string, updates: Partial<User>) {
  const { data, error } = await supabase
    .from('users')
    .upsert({ id: userId, ...updates, updated_at: new Date().toISOString() }, { onConflict: 'id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ============================================================
// CLASSROOMS
// ============================================================

export async function getClassrooms(teacherId: string): Promise<Classroom[]> {
  const { data, error } = await supabase
    .from('classrooms')
    .select('*')
    .eq('teacher_id', teacherId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createClassroom(teacherId: string, name: string, gradeLevel: number, classSize: number): Promise<Classroom> {
  const { data, error } = await supabase
    .from('classrooms')
    .insert({ teacher_id: teacherId, name, grade_level: gradeLevel, class_size: classSize })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateClassroom(classroomId: string, updates: Partial<Classroom>) {
  const { data, error } = await supabase
    .from('classrooms')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', classroomId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ============================================================
// PETS
// ============================================================

export async function getPet(classroomId: string): Promise<Pet | null> {
  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .eq('classroom_id', classroomId)
    .maybeSingle();
  if (error) return null;
  return data;
}

export async function createPet(classroomId: string, name: string, petType: string = 'pet1'): Promise<Pet> {
  const { data, error } = await supabase
    .from('pets')
    .insert({ classroom_id: classroomId, name, pet_type: petType })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updatePetMood(classroomId: string, mood: string) {
  const { error } = await supabase
    .from('pets')
    .update({ mood, updated_at: new Date().toISOString() })
    .eq('classroom_id', classroomId);
  if (error) throw error;
}

export async function updatePet(classroomId: string, updates: {name?: string; pet_type?: string; mood?: string}) {
  const { data, error } = await supabase
    .from('pets')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('classroom_id', classroomId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ============================================================
// GOALS
// ============================================================

export async function getGoals(classroomId: string): Promise<Goal[]> {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('classroom_id', classroomId)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function createGoal(classroomId: string, title: string, caselCategory: string) {
  const { data, error } = await supabase
    .from('goals')
    .insert({ classroom_id: classroomId, title, casel_category: caselCategory })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteGoal(goalId: string) {
  const { error } = await supabase
    .from('goals')
    .update({ is_active: false })
    .eq('id', goalId);
  if (error) throw error;
}

export async function updateGoal(goalId: string, updates: { title?: string; casel_category?: string }) {
  const { data, error } = await supabase
    .from('goals')
    .update(updates)
    .eq('id', goalId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function seedDefaultGoals(classroomId: string) {
  const goals = DEFAULT_GOALS.map(g => ({ ...g, classroom_id: classroomId }));
  const { error } = await supabase.from('goals').insert(goals);
  if (error) throw error;
}

// ============================================================
// POINTS (uses RPC for atomic update)
// ============================================================

export async function addPoints(
  classroomId: string,
  goalId: string | null = null,
  actionType: string = 'goal',
  points: number = 1
): Promise<Pet> {
  const { data, error } = await supabase.rpc('add_points', {
    p_classroom_id: classroomId,
    p_goal_id: goalId,
    p_action_type: actionType,
    p_points: points,
  });
  if (error) throw error;
  return data;
}

// ============================================================
// REFLECTIONS
// ============================================================

export async function createReflection(
  classroomId: string,
  userId: string,
  category: string,
  emotion: string | null,
  followUpResponse: string | null
) {
  const { error } = await supabase
    .from('reflections')
    .insert({
      classroom_id: classroomId,
      category,
      emotion,
      follow_up_response: followUpResponse,
      created_by: userId,
    });
  if (error) throw error;
}

// ============================================================
// REALTIME SUBSCRIPTION
// ============================================================

export function subscribeToPet(classroomId: string, callback: (pet: Pet) => void) {
  return supabase
    .channel(`pet:${classroomId}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'pets',
      filter: `classroom_id=eq.${classroomId}`,
    }, (payload) => {
      callback(payload.new as Pet);
    })
    .subscribe();
}

// ============================================================
// FULL CLASS SETUP (onboarding)
// ============================================================

export async function setupNewClass(
  teacherId: string,
  className: string,
  gradeLevel: number,
  classSize: number,
  petName: string,
  petType: string = 'pet1'
) {
  // 1. Create classroom
  const classroom = await createClassroom(teacherId, className, gradeLevel, classSize);

  // 2. Create pet
  const pet = await createPet(classroom.id, petName, petType);

  // 3. Seed default goals
  await seedDefaultGoals(classroom.id);

  // 4. Get goals
  const goals = await getGoals(classroom.id);

  return { classroom, pet, goals };
}

// ============================================================
// CHECKINS TODAY (for streak/daily tracking)
// ============================================================

export async function getCheckinsToday(classroomId: string): Promise<Checkin[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('checkins')
    .select('*')
    .eq('classroom_id', classroomId)
    .gte('created_at', today.toISOString())
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

// ============================================================
// FALLBACK: localStorage (when Supabase not configured)
// ============================================================

export function getFallbackState() {
  try {
    const s = localStorage.getItem(FALLBACK_KEY);
    if (s) return JSON.parse(s);
  } catch (e) {}
  return null;
}

export function setFallbackState(state: any) {
  try {
    localStorage.setItem(FALLBACK_KEY, JSON.stringify(state));
  } catch (e) {}
}

export function clearFallbackState() {
  try {
    localStorage.removeItem(FALLBACK_KEY);
  } catch (e) {}
}
