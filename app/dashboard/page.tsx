import { getProjects } from '@/lib/data';
import DashboardClient from './DashboardClient';

export const metadata = {
    title: 'Mi Campo Digital | Dashboard Expertos',
    description: 'Panel de control personalizado para productores agrícolas.',
};

export default async function DashboardPage() {
    const projects = await getProjects();

    return (
        <main className="min-h-screen bg-gray-50 pb-20 md:pb-0">
            <DashboardClient projects={projects} />
        </main>
    );
}
