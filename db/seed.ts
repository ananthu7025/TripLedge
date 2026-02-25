import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { db } from './index';
import { roles, users, companySettings } from './schema';
import * as bcrypt from 'bcryptjs';

async function seed() {
  console.log('Seeding database...');

  try {
    // Create roles
    const [adminRole] = await db.insert(roles).values([
      { name: 'admin', description: 'Administrator with full access' },
    ]).returning();

    const [technicianRole] = await db.insert(roles).values([
      { name: 'technician', description: 'Field technician' },
    ]).returning();

    console.log('✓ Roles created');

    // Create default admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await db.insert(users).values({
      fullName: 'Admin User',
      email: 'admin@tripledge.com',
      passwordHash: hashedPassword,
      roleId: adminRole.id,
      status: 'active',
    });

    console.log('✓ Default admin user created (admin@tripledge.com / admin123)');

    // Create company settings
    await db.insert(companySettings).values({
      companyName: 'Trip Ledge',
      city: 'North Battleford',
      province: 'Saskatchewan',
      country: 'Canada',
      supportEmail: 'support@tripledge.com',
      supportPhone: '+1 (306) 555-0100',
    });

    console.log('✓ Company settings initialized');
    console.log('\nDatabase seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }

  process.exit(0);
}

seed();
