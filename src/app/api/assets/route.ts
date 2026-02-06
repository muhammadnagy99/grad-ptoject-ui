import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const backendUrl = 'http://localhost:8403/api/assets';
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
        console.error('Error fetching assets from backend:', error);
        return NextResponse.json(
            { error: 'Failed to connect to backend' },
            { status: 500 }
        );
    }
}
