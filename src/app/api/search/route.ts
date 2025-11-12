import { NextResponse } from 'next/server';
import { searchToys } from '@/lib/toys-data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';

  if (!query) {
    return NextResponse.json({
      query: '',
      count: 0,
      results: [],
    });
  }

  try {
    const results = await searchToys(query);

    return NextResponse.json({
      query,
      count: results.length,
      results,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      {
        error: 'Search failed',
        query,
        count: 0,
        results: [],
      },
      { status: 500 }
    );
  }
}


