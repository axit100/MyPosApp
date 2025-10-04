import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CashNote from '@/models/CashNote';

// GET: Get a single cash note by ID
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const note = await CashNote.findById(id);
  if (!note) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(note);
}

// PUT: Update a cash note by ID
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const body = await req.json();
  const { id } = await params;
  const note = await CashNote.findByIdAndUpdate(id, body, { new: true });
  if (!note) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(note);
}

// DELETE: Delete a cash note by ID
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const note = await CashNote.findByIdAndDelete(id);
  if (!note) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
