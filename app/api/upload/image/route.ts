import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/utils/session';
import { put } from '@vercel/blob';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const ext = file.name.split('.').pop() ?? 'jpg';
    const filename = `blogs/${uuidv4()}.${ext}`;

    const blob = await put(filename, file, { access: 'public' });

    return NextResponse.json({ imageUrl: blob.url });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Image upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
