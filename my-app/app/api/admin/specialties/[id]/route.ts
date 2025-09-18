import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUser } from '@/lib/user/getUser';
import { adminClient } from '@/sanity/lib/adminClient';

// PUT - Update specialty
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if specialty exists
    const existingSpecialty = await adminClient.fetch(`
      *[_type == "specialty" && _id == $id && isDeleted != true][0]
    `, { id: params.id });

    if (!existingSpecialty) {
      return NextResponse.json({ error: 'Specialty not found' }, { status: 404 });
    }

    // Check if name already exists (excluding current specialty)
    const duplicateSpecialty = await adminClient.fetch(`
      *[_type == "specialty" && name == $name && _id != $id && isDeleted != true][0]
    `, { name: name.trim(), id: params.id });

    if (duplicateSpecialty) {
      return NextResponse.json({ error: 'Specialty with this name already exists' }, { status: 409 });
    }

    // Update specialty
    const updatedSpecialty = await adminClient
      .patch(params.id)
      .set({
        name: name.trim(),
        description: description?.trim() || '',
        color: color || existingSpecialty.color,
        updatedAt: new Date().toISOString()
      })
      .commit();

    return NextResponse.json(updatedSpecialty);
  } catch (error) {
    console.error('Error updating specialty:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update specialty status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await getUser();
    if ('error' in currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { isActive } = await request.json();

    // Check if specialty exists
    const existingSpecialty = await adminClient.fetch(`
      *[_type == "specialty" && _id == $id && isDeleted != true][0]
    `, { id: params.id });

    if (!existingSpecialty) {
      return NextResponse.json({ error: 'Specialty not found' }, { status: 404 });
    }

    // Update specialty status
    const updatedSpecialty = await adminClient
      .patch(params.id)
      .set({
        isActive: isActive,
        updatedAt: new Date().toISOString()
      })
      .commit();

    return NextResponse.json(updatedSpecialty);
  } catch (error) {
    console.error('Error updating specialty status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete specialty
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await getUser();
    if ('error' in currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Check if specialty exists
    const existingSpecialty = await adminClient.fetch(`
      *[_type == "specialty" && _id == $id && isDeleted != true][0]
    `, { id: params.id });

    if (!existingSpecialty) {
      return NextResponse.json({ error: 'Specialty not found' }, { status: 404 });
    }

    // Check if any teachers are using this specialty
    const teachersUsingSpecialty = await adminClient.fetch(`
      count(*[_type == "user" && isDeleted != true && $specialtyName in specializations[]])
    `, { specialtyName: existingSpecialty.name });

    if (teachersUsingSpecialty > 0) {
      return NextResponse.json({ 
        error: `Cannot delete specialty. ${teachersUsingSpecialty} teacher(s) are currently using this specialty.` 
      }, { status: 400 });
    }

    // Soft delete specialty
    const deletedSpecialty = await adminClient
      .patch(params.id)
      .set({
        isDeleted: true,
        deletedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .commit();

    return NextResponse.json({ message: 'Specialty deleted successfully' });
  } catch (error) {
    console.error('Error deleting specialty:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 