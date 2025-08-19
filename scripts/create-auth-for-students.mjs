import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const admin = createClient(url, serviceKey);

// Define a default password for new users.
// IMPORTANT: Students should be required to reset this password on first login.
const DEFAULT_PASSWORD = 'TemporaryPassword123!';

async function createAuthForExistingStudents() {
  console.log('Fetching students without auth records...');
  
  // Fetch all students from the ausbildung_main_engine table
  const { data: students, error: fetchError } = await admin.from('ausbildung_main_engine').select('user_id, Email');
  if (fetchError) {
    throw new Error('Failed to fetch students from database: ' + fetchError.message);
  }

  // Iterate over each student
  for (const student of students) {
    try {
      // Check if a user already exists with this user_id
      const { data: { user } } = await admin.auth.admin.getUserById(student.user_id);
      
      if (user) {
        console.log(`User already exists for ${student.Email}. Skipping.`);
        continue;
      }
    } catch (e) {
      // If getUserById throws an error, it means the user doesn't exist, which is what we want.
      // We can proceed to create the user.
    }

    try {
      // Create the new authentication entry with a default password
      const { data, error: authError } = await admin.auth.admin.createUser({
        Email: student.Email,
        password: DEFAULT_PASSWORD,
        Email_confirm: true,
      });

      if (authError) {
        throw authError;
      }

      const newUserId = data.user.id;
      
      // Update the student's record and add a profile
      await admin.from('ausbildung_main_engine').update({ user_id: newUserId }).eq('Email', student.Email);
      await admin.from('profiles').insert({ user_id: newUserId, role: 'student' });

      console.log(`Successfully created user auth and linked profile for ${student.Email}`);
    } catch (e) {
      console.error(`Failed to create user auth for ${student.Email}:`, e);
    }
  }

  console.log('Script finished.');
}

createAuthForExistingStudents().catch((e) => {
  console.error(e);
  process.exit(1);
});