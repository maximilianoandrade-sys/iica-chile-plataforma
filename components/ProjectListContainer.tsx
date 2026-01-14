import { getProjects } from "@/lib/data";
import ProjectList from "@/components/ProjectList";
import JsonLd from "@/components/JsonLd";

export default async function ProjectListContainer() {
    const projects = await getProjects();
    return (
        <>
            <JsonLd projects={projects} />
            <ProjectList projects={projects} />
        </>
    );
}
