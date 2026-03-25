import { getProjects } from "@/lib/data";
import ProjectExplorer from "@/components/ProjectExplorer";
import JsonLd from "@/components/JsonLd";

export default async function ProjectListContainer({
    searchParams
}: {
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    // 1. Fetch ALL projects from data source
    const projects = await getProjects();

    return (
        <>
            <JsonLd projects={projects} />
            <ProjectExplorer allProjects={projects} />
        </>
    );
}

