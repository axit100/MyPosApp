import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CashNote from '@/models/CashNote';

// GET: Fetch all cash notes (with optional date range, pagination)
export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
  const start = searchParams.get('start');
  const end = searchParams.get('end');

  const filter: any = {};
  if (start && end) {
    filter.date = { $gte: new Date(start), $lte: new Date(end) };
  } else if (start) {
    filter.date = { $gte: new Date(start) };
  } else if (end) {
    filter.date = { $lte: new Date(end) };
  }

  const total = await CashNote.countDocuments(filter);
  const notes = await CashNote.find(filter)
    .sort({ date: -1, createdAt: -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize);

  return NextResponse.json({ notes, total });
}

// POST: Add a new cash note
export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();
  const { type, amount, description, date } = body;
  if (!type || !amount || !date) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  const note = await CashNote.create({
    type,
    amount,
    description,
    date,
  });
  return NextResponse.json(note, { status: 201 });
}
