import { supabase } from './src/config/supabase.js';

console.log('Testing Supabase connection...\n');

// Test 1: Check users table
const { data: users, error: usersError } = await supabase
  .from('users')
  .select('id, name, phone, role')
  .limit(5);

if (usersError) {
  console.error('❌ Error fetching users:', usersError);
} else {
  console.log('✅ Users found:', users.length);
  console.log('Users:', JSON.stringify(users, null, 2));
}

// Test 2: Try to find owner
const { data: owner, error: ownerError } = await supabase
  .from('users')
  .select('*')
  .eq('phone', '9999999999')
  .single();

if (ownerError) {
  console.error('\n❌ Owner user not found:', ownerError);
} else {
  console.log('\n✅ Owner user exists:', owner.name, '-', owner.phone);
}

process.exit(0);
