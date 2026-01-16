import { NextResponse } from 'next/server';
import projects from '@/data/projects.json';

export async function GET() {
    // Simulamos una latencia de red para ver el Skeleton loading (opcional, bueno para debug UX)
    // await new Promise(resolve => setTimeout(resolve, 500)); 

    // En un escenario real, aquí conectaríamos con PostgreSQL/Supabase
    // const data = await db.query('SELECT * FROM projects');

    try {
        return NextResponse.json(projects);
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
