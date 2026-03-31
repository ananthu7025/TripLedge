import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { contactRequests } from '@/db/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
  try {
    const requests = await db.select().from(contactRequests).orderBy(desc(contactRequests.createdAt));
    return NextResponse.json({ requests }, { status: 200 });
  } catch (error) {
    console.error('Error fetching contact requests:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, phone, propertyType, serviceNeeded, message } = body;

    // Basic validation
    if (!firstName || !lastName || !email || !phone || !propertyType || !serviceNeeded) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const [newRequest] = await db.insert(contactRequests).values({
      firstName,
      lastName,
      email,
      phone,
      propertyType,
      serviceNeeded,
      message,
    }).returning();

    return NextResponse.json(
      { message: 'Request submitted successfully', id: newRequest.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error submitting contact request:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
