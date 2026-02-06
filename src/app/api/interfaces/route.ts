import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const includeReserved = searchParams.get('include_reserved') || 'false';

    try {
        const backendUrl = `http://localhost:8403/api/interfaces?include_reserved=${includeReserved}`;
        const response = await fetch(backendUrl);

        if (!response.ok) {
            return NextResponse.json(
                { error: `Backend returned ${response.status}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching from backend:', error);
        return NextResponse.json(
            { error: 'Failed to connect to backend' },
            { status: 500 }
        );
    }
}
