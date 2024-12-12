import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    switch (type) {
        case 'participants':
            return NextResponse.json({
                1: { "name": "Adam", "threshold": 4 },
                2: { "name": "Bosco", "threshold": 4 },
                3: { "name": "Catherine", "threshold": 5 }
            });

        case 'availability':
            return NextResponse.json({
                1: {
                    "Monday": [{ "start": "09:00", "end": "11:00" }, {
                        "start":
                            "14:00", "end": "16:30"
                    }],
                    "Tuesday": [{ "start": "09:00", "end": "18:00" }]
                },
                2: {
                    "Monday": [{ "start": "09:00", "end": "18:00" }],
                    "Tuesday": [{ "start": "09:00", "end": "11:30" }]
                },
                3: {
                    "Monday": [{ "start": "09:00", "end": "18:00" }],
                    "Tuesday": [{ "start": "09:00", "end": "18:00" }]
                }
            });

        case 'schedules':
            return NextResponse.json({
                1: {
                    "2024-10-28": [{ "start": "09:30", "end": "10:30" }, {
                        "start": "15:00", "end": "16:30"
                    }]
                },
                2: {
                    "2024-10-28": [{ "start": "13:00", "end": "13:30" }],
                    "2024-10-29": [{ "start": "09:00", "end": "10:30" }]
                }
            });

        default:
            return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }
}
