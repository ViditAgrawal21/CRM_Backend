import bcrypt from 'bcrypt';

const passwords = {
  'owner123': await bcrypt.hash('owner123', 10),
  'test123': await bcrypt.hash('test123', 10)
};

console.log('Password Hashes:\n');
console.log('owner123:', passwords['owner123']);
console.log('test123:', passwords['test123']);

process.exit(0);
