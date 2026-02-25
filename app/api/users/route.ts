import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { requireAuth } from '@/lib/utils/session';
import { logAudit } from '@/lib/utils/audit';
import { hashPassword } from '@/lib/auth';
import { eq, desc } from 'drizzle-orm';

// GET /api/users
export async function GET() {
  try {
    await requireAuth();

    const allUsers = await db.query.users.findMany({
      orderBy: [desc(users.createdAt)],
      with: {
        role: true,
      },
    });

    const usersWithoutPassword = allUsers.map(({ passwordHash, ...user }) => user);

    return NextResponse.json({ users: usersWithoutPassword });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/users - Create new user
export async function POST(request: NextRequest) {
  try {
    const currentUser = await requireAuth();

    const { fullName, email, roleId, password } = await request.json();

    if (!fullName || !email || !roleId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const hashedPassword = password ? await hashPassword(password) : await hashPassword('password123');

    const [newUser] = await db.insert(users).values({
      fullName,
      email,
      passwordHash: hashedPassword,
      roleId,
      status: 'active',
    }).returning();

    await logAudit({
      userId: currentUser.id,
      action: 'create_user',
      module: 'users',
      entityType: 'user',
      entityId: newUser.id,
      metadata: { email, fullName },
    });

    const { passwordHash, ...userWithoutPassword } = newUser;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/users?id=xxx - Update user
export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await requireAuth();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const updates = await request.json();

    await db.update(users).set(updates).where(eq(users.id, id));

    await logAudit({
      userId: currentUser.id,
      action: 'update_user',
      module: 'users',
      entityType: 'user',
      entityId: id,
      metadata: updates,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
