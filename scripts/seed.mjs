import { createClient } from '@supabase/supabase-js'

const url = process.env.VITE_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const admin = createClient(url, serviceKey)

async function ensureUser(email, password) {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (error && !String(error.message || '').includes('already registered')) throw error
  return data?.user
}

async function upsertProfile(userId, role) {
  const { error } = await admin.from('profiles').upsert({ user_id: userId, role })
  if (error) throw error
}

async function upsertStudent(userId, firstName, lastName, email) {
  const { error } = await admin
    .from('ausbildung_main_engine')
    .upsert({ user_id: userId, first_name: firstName, last_name: lastName, email })
  if (error) throw error
}

async function insertBewerbung(userId, title, company, status, agent) {
  const { error } = await admin
    .from('bewerbungen')
    .insert({ student_user_id: userId, title, company, status, agent_name: agent })
  if (error) throw error
}

async function main() {
  const adminUser = await ensureUser('admin@example.com', 'Password123!')
  if (adminUser?.id) {
    await upsertProfile(adminUser.id, 'admin')
  }

  const student1 = await ensureUser('student1@example.com', 'Password123!')
  const student2 = await ensureUser('student2@example.com', 'Password123!')

  if (student1?.id) {
    await upsertProfile(student1.id, 'student')
    await upsertStudent(student1.id, 'Alice', 'Schmidt', 'student1@example.com')
    await insertBewerbung(student1.id, 'Ausbildung Metallbauer', 'Muster AG', 'submitted', 'Agent Didi')
  }

  if (student2?.id) {
    await upsertProfile(student2.id, 'student')
    await upsertStudent(student2.id, 'Bob', 'Müller', 'student2@example.com')
    await insertBewerbung(student2.id, 'Ausbildung Pflege', 'Gesund GmbH', 'interview', 'Agent Didi')
  }

  console.log('Seeding complete')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
