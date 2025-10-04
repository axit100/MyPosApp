import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CashNote from '@/models/CashNote';

// GET: Get a single cash note by ID
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const note = await CashNote.findById(params.id);
  if (!note) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(note);
}

// PUT: Update a cash note by ID
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const body = await req.json();
  const note = await CashNote.findByIdAndUpdate(params.id, body, { new: true });
  if (!note) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(note);
}

// DELETE: Delete a cash note by ID
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const note = await CashNote.findByIdAndDelete(params.id);
  if (!note) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
