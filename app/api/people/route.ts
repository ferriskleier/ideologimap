import { NextResponse } from 'next/server';
import { getAllPeople, addPerson } from '@/lib/db';

export async function GET() {
  try {
    const people = getAllPeople();
    return NextResponse.json(people);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch people' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, x, y, wikipedia_url } = body;
    
    if (!name || typeof x !== 'number' || typeof y !== 'number') {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }
    
    const person = addPerson(name, x, y, wikipedia_url);
    return NextResponse.json(person);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add person' }, { status: 500 });
  }
}