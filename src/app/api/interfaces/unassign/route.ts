import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (!body.interfaces) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const backendUrl = 'http://localhost:8403/api/interfaces/unassign';
        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });

    } catch (error) {
        console.error('Error unassigning interfaces:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to connect to backend' },
            { status: 500 }
        );
    }
}
