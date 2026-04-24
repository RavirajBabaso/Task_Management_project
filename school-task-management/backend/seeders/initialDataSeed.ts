import bcrypt from 'bcryptjs';
import { sequelize } from '../src/config/database';
import { Department, User, Task, Announcement, Approval } from '../src/models';

const departments = [
  'Chairman Office',
  'School Director',
  'Property & Maintenance',
  'Finance',
  'Admin Office',
  'Academic (Principal)',
  'Admission & Marketing',
  'HR',
  'Purchase',
  'IT & ERP',
  'Transport'
];

const departmentHeads = [
  { name: 'School Director', email: 'director@adhira.edu', role: 'DIRECTOR' as const },
  { name: 'Property Head', email: 'property@adhira.edu', role: 'PROPERTY' as const },
  { name: 'Finance Head', email: 'finance@adhira.edu', role: 'FINANCE' as const },
  { name: 'Admin Head', email: 'admin@adhira.edu', role: 'ADMIN' as const },
  { name: 'Principal', email: 'principal@adhira.edu', role: 'PRINCIPAL' as const },
  { name: 'Admission Head', email: 'admission@adhira.edu', role: 'ADMISSION' as const },
  { name: 'HR Head', email: 'hr@adhira.edu', role: 'HR' as const },
  { name: 'Purchase Head', email: 'purchase@adhira.edu', role: 'PURCHASE' as const },
  { name: 'IT Head', email: 'it@adhira.edu', role: 'IT' as const },
  { name: 'Transport Head', email: 'transport@adhira.edu', role: 'TRANSPORT' as const }
];

const sampleTasks = [
  {
    title: 'Update school website',
    description: 'Update the school website with new academic year information',
    priority: 'HIGH' as const,
    status: 'PENDING' as const,
    start_date: new Date('2026-04-25'),
    due_date: new Date('2026-05-01')
  },
  {
    title: 'Prepare monthly financial report',
    description: 'Compile and prepare the monthly financial report for board review',
    priority: 'MEDIUM' as const,
    status: 'IN_PROGRESS' as const,
    start_date: new Date('2026-04-20'),
    due_date: new Date('2026-04-30')
  },
  {
    title: 'Organize parent-teacher meeting',
    description: 'Coordinate and organize the quarterly parent-teacher meeting',
    priority: 'MEDIUM' as const,
    status: 'COMPLETED' as const,
    start_date: new Date('2026-04-15'),
    due_date: new Date('2026-04-20'),
    completed_at: new Date('2026-04-19')
  },
  {
    title: 'Repair classroom projector',
    description: 'Fix the malfunctioning projector in classroom 101',
    priority: 'LOW' as const,
    status: 'DELAYED' as const,
    start_date: new Date('2026-04-10'),
    due_date: new Date('2026-04-15')
  },
  {
    title: 'Implement new admission policy',
    description: 'Review and implement the new admission policy for next academic year',
    priority: 'HIGH' as const,
    status: 'ESCALATED' as const,
    start_date: new Date('2026-04-01'),
    due_date: new Date('2026-04-20')
  }
];

const sampleAnnouncements = [
  {
    target: 'ALL' as const,
    message: 'Welcome to the new academic year 2026-2027! We are excited to start this journey together.'
  },
  {
    target: 'DEPARTMENT' as const,
    message: 'IT Department: Please update all software licenses before the end of April.',
    departmentName: 'IT & ERP'
  }
];

const sampleApprovals = [
  {
    type: 'BUDGET' as const,
    title: 'Annual Budget Approval 2026',
    details: 'Request for approval of the annual budget for fiscal year 2026',
    amount: 5000000.00
  },
  {
    type: 'PURCHASE' as const,
    title: 'New Computer Lab Equipment',
    details: 'Purchase of 50 new computers and accessories for the computer lab',
    amount: 150000.00
  },
  {
    type: 'EVENT' as const,
    title: 'Annual Sports Day Organization',
    details: 'Budget allocation for organizing the annual sports day event',
    amount: 75000.00
  }
];

const seedInitialData = async () => {
  await sequelize.authenticate();
  await sequelize.sync();

  console.log('Starting initial data seeding...');

  let departmentsInserted = 0;
  let usersInserted = 0;
  let tasksInserted = 0;
  let announcementsInserted = 0;
  let approvalsInserted = 0;

  // Insert departments
  console.log('Inserting departments...');
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
    if (created) departmentsInserted++;
  }

  // Insert Chairman
  console.log('Inserting Chairman...');
  const chairmanPasswordHash = await bcrypt.hash('Admin@123', 12);
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
  if (chairmanCreated) usersInserted++;

  // Insert department heads
  console.log('Inserting department heads...');
  const deptPasswordHash = await bcrypt.hash('Dept@123', 12);
  const createdUsers = [chairman];

  for (let i = 0; i < departmentHeads.length; i++) {
    const head = departmentHeads[i];
    const dept = createdDepartments.find(d => 
      d.name === head.role ||
      (head.role === 'DIRECTOR' && d.name === 'School Director') ||
      (head.role === 'PROPERTY' && d.name === 'Property & Maintenance') ||
      (head.role === 'ADMIN' && d.name === 'Admin Office') ||
      (head.role === 'PRINCIPAL' && d.name === 'Academic (Principal)') ||
      (head.role === 'ADMISSION' && d.name === 'Admission & Marketing') ||
      (head.role === 'FINANCE' && d.name === 'Finance') ||
      (head.role === 'PURCHASE' && d.name === 'Purchase') ||
      (head.role === 'IT' && d.name === 'IT & ERP') ||
      (head.role === 'TRANSPORT' && d.name === 'Transport')
    );

    if (!dept) {
      console.error(`Department not found for role: ${head.role}`);
      continue;
    }

    const [user, created] = await User.findOrCreate({
      where: { email: head.email },
      defaults: {
        name: head.name,
        email: head.email,
        password_hash: deptPasswordHash,
        role: head.role,
        department_id: dept.id,
        is_active: true
      } as User
    });

    createdUsers.push(user);
    if (created) usersInserted++;

    // Update department head_user_id
    dept.head_user_id = user.id;
    await dept.save();
  }

  // Insert sample tasks
  console.log('Inserting sample tasks...');
  for (let i = 0; i < sampleTasks.length; i++) {
    const taskData = sampleTasks[i];
    const assignedToUser = createdUsers[i % createdUsers.length]; // Cycle through users
    const assignedByUser = chairman; // All tasks assigned by chairman

    const [task, created] = await Task.findOrCreate({
      where: {
        title: taskData.title,
        assigned_to: assignedToUser.id,
        assigned_by: assignedByUser.id
      },
      defaults: {
        ...taskData,
        assigned_by: assignedByUser.id,
        assigned_to: assignedToUser.id,
        department_id: assignedToUser.department_id
      } as Task
    });

    if (created) tasksInserted++;
  }

  // Insert sample announcements
  console.log('Inserting sample announcements...');
  for (const announcementData of sampleAnnouncements) {
    let departmentId = null;
    if (announcementData.target === 'DEPARTMENT' && announcementData.departmentName) {
      const dept = createdDepartments.find(d => d.name === announcementData.departmentName);
      if (dept) departmentId = dept.id;
    }

    const [announcement, created] = await Announcement.findOrCreate({
      where: {
        message: announcementData.message,
        created_by: chairman.id
      },
      defaults: {
        created_by: chairman.id,
        target: announcementData.target,
        message: announcementData.message,
        department_id: departmentId
      } as Announcement
    });

    if (created) announcementsInserted++;
  }

  // Insert sample approvals
  console.log('Inserting sample approvals...');
  for (const approvalData of sampleApprovals) {
    const requestedByUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];

    const [approval, created] = await Approval.findOrCreate({
      where: {
        title: approvalData.title,
        requested_by: requestedByUser.id
      },
      defaults: {
        ...approvalData,
        requested_by: requestedByUser.id,
        status: 'PENDING'
      } as any
    });

    if (created) approvalsInserted++;
  }

  console.log('\n' + '='.repeat(60));
  console.log('INITIAL DATA SEEDING COMPLETED');
  console.log('='.repeat(60));
  console.log(`Departments inserted: ${departmentsInserted}`);
  console.log(`Users inserted: ${usersInserted}`);
  console.log(`Tasks inserted: ${tasksInserted}`);
  console.log(`Announcements inserted: ${announcementsInserted}`);
  console.log(`Approvals inserted: ${approvalsInserted}`);
  console.log('='.repeat(60));
  console.log('Default login credentials:');
  console.log('Chairman: chairman@adhira.edu / Admin@123');
  console.log('Department Heads: {role}@adhira.edu / Dept@123');
  console.log('='.repeat(60));
};

seedInitialData()
  .catch((error) => {
    console.error('Initial data seeding failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });