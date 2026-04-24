import bcrypt from 'bcryptjs';
import { sequelize } from '../src/config/database';
import { Department, User } from '../src/models';

const departments = [
  'Director',
  'Property',
  'Finance',
  'Admin',
  'Principal',
  'Admission',
  'HR',
  'Purchase',
  'IT',
  'Transport',
  'Chairman' // Adding Chairman as a department for consistency
];

const departmentHeads = [
  { name: 'Director Head', email: 'director@adhira.edu', role: 'DIRECTOR' as const },
  { name: 'Property Head', email: 'property@adhira.edu', role: 'PROPERTY' as const },
  { name: 'Finance Head', email: 'finance@adhira.edu', role: 'FINANCE' as const },
  { name: 'Admin Head', email: 'admin@adhira.edu', role: 'ADMIN' as const },
  { name: 'Principal Head', email: 'principal@adhira.edu', role: 'PRINCIPAL' as const },
  { name: 'Admission Head', email: 'admission@adhira.edu', role: 'ADMISSION' as const },
  { name: 'HR Head', email: 'hr@adhira.edu', role: 'HR' as const },
  { name: 'Purchase Head', email: 'purchase@adhira.edu', role: 'PURCHASE' as const },
  { name: 'IT Head', email: 'it@adhira.edu', role: 'IT' as const },
  { name: 'Transport Head', email: 'transport@adhira.edu', role: 'TRANSPORT' as const }
];

const seedProduction = async () => {
  // Only run in production environment
  if (process.env.NODE_ENV !== 'production') {
    console.error('Production seed can only be run in production environment');
    process.exit(1);
  }

  await sequelize.authenticate();
  await sequelize.sync();

  console.log('Creating departments...');

  // Create all departments
  const createdDepartments = [];
  for (const name of departments) {
    const [dept, created] = await Department.findOrCreate({
      where: { name },
      defaults: {
        name,
        description: `${name} department`
      } as Department
    });
    createdDepartments.push(dept);
    console.log(`${created ? 'Created' : 'Found'} department: ${name}`);
  }

  console.log('Creating Chairman account...');

  // Create Chairman account
  const chairmanPassword = 'Chairman@2024!';
  const chairmanPasswordHash = await bcrypt.hash(chairmanPassword, 12);

  const [chairman, chairmanCreated] = await User.findOrCreate({
    where: { email: 'chairman@adhira.edu' },
    defaults: {
      name: 'Chairman',
      email: 'chairman@adhira.edu',
      password_hash: chairmanPasswordHash,
      role: 'CHAIRMAN',
      department_id: null,
      is_active: true
    } as User
  });

  if (!chairmanCreated) {
    chairman.name = 'Chairman';
    chairman.password_hash = chairmanPasswordHash;
    chairman.role = 'CHAIRMAN';
    chairman.department_id = null;
    chairman.is_active = true;
    await chairman.save();
  }

  console.log(`${chairmanCreated ? 'Created' : 'Updated'} Chairman account`);

  console.log('Creating department head accounts...');

  // Create department head accounts
  const credentials = [
    ['Chairman', 'chairman@adhira.edu', chairmanPassword]
  ];

  for (let i = 0; i < departmentHeads.length; i++) {
    const head = departmentHeads[i];
    const dept = createdDepartments.find(d => d.name === head.role);

    if (!dept) {
      console.error(`Department not found for role: ${head.role}`);
      continue;
    }

    const tempPassword = `${head.role.toLowerCase()}@2024!`;
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    const [user, created] = await User.findOrCreate({
      where: { email: head.email },
      defaults: {
        name: head.name,
        email: head.email,
        password_hash: passwordHash,
        role: head.role,
        department_id: dept.id,
        is_active: true
      } as User
    });

    if (!created) {
      user.name = head.name;
      user.password_hash = passwordHash;
      user.role = head.role;
      user.department_id = dept.id;
      user.is_active = true;
      await user.save();
    }

    // Update department head_user_id
    dept.head_user_id = user.id;
    await dept.save();

    credentials.push([head.name, head.email, tempPassword]);
    console.log(`${created ? 'Created' : 'Updated'} ${head.role} head account`);
  }

  // Display credentials table
  console.log('\n' + '='.repeat(80));
  console.log('PRODUCTION ACCOUNTS CREATED');
  console.log('='.repeat(80));
  console.log('Name'.padEnd(20), 'Email'.padEnd(30), 'Password');
  console.log('-'.repeat(80));

  credentials.forEach(([name, email, password]) => {
    console.log(name.padEnd(20), email.padEnd(30), password);
  });

  console.log('='.repeat(80));
  console.log('IMPORTANT: Change all passwords after first login!');
  console.log('='.repeat(80));

  const departmentCount = await Department.count();
  const userCount = await User.count();

  console.log(`\nProduction seed complete. Departments: ${departmentCount}, Users: ${userCount}`);
};

seedProduction()
  .catch((error) => {
    console.error('Production seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });