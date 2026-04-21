import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUser } from '@/lib/user/getUser';
import { adminClient } from '@/sanity/lib/adminClient';

// GET - Fetch all specialties
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await getUser();
    if ('error' in currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get all specialties from the database
    const specialties = await adminClient.fetch(`
      *[_type == "specialty" && isDeleted != true] | order(name asc) {
        _id,
        name,
        description,
        color,
        isActive,
        "teacherCount": count(*[_type == "user" && isDeleted != true && $specialtyId in specializations[]])
      }
    `, { specialtyId: 'placeholder' }); // We'll count teachers for each specialty separately

    // Get teacher count for each specialty
    const specialtiesWithCounts = await Promise.all(
      specialties.map(async (specialty: any) => {
        const teacherCount = await adminClient.fetch(`
          count(*[_type == "user" && isDeleted != true && "${specialty.name}" in specializations[]])
        `);
        return {
          ...specialty,
          teacherCount: teacherCount || 0
        };
      })
    );

    return NextResponse.json({ specialties: specialtiesWithCounts });
  } catch (error) {
    console.error('Error fetching specialties:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new specialty
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await getUser();
    if ('error' in currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { name, description, color } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Specialty name is required' }, { status: 400 });
    }

    // Check if specialty already exists
    const existingSpecialty = await adminClient.fetch(`
      *[_type == "specialty" && name == $name && isDeleted != true][0]
    `, { name: name.trim() });

    if (existingSpecialty) {
      return NextResponse.json({ error: 'Specialty with this name already exists' }, { status: 409 });
    }

    // Create new specialty
    const newSpecialty = await adminClient.create({
      _type: 'specialty',
      name: name.trim(),
      description: description?.trim() || '',
      color: color || '#3B82F6',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json(newSpecialty, { status: 201 });
  } catch (error) {
    console.error('Error creating specialty:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 