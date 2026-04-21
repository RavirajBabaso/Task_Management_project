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
  'Transport'
];

const seedAdmin = async () => {
  await sequelize.authenticate();
  await sequelize.sync();

  for (const name of departments) {
    await Department.findOrCreate({
      where: { name },
      defaults: {
        name,
        description: `${name} department`
      } as Department
    });
  }

  const passwordHash = await bcrypt.hash('Admin@123', 12);

  const [chairman, created] = await User.findOrCreate({
    where: { email: 'chairman@adhira.edu' },
    defaults: {
      name: 'Chairman',
      email: 'chairman@adhira.edu',
      password_hash: passwordHash,
      role: 'CHAIRMAN',
      department_id: null,
      is_active: true
    } as User
  });

  if (!created) {
    chairman.name = 'Chairman';
    chairman.password_hash = passwordHash;
    chairman.role = 'CHAIRMAN';
    chairman.department_id = null;
    chairman.is_active = true;
    await chairman.save();
  }

  const departmentCount = await Department.count();

  console.log(
    `Seed complete. Chairman user ${created ? 'inserted' : 'updated'} with id ${chairman.id}. Departments: ${departmentCount}.`
  );
};

seedAdmin()
  .catch((error) => {
    console.error('Admin seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });
