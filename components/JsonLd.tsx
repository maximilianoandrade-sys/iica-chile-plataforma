import { Project } from "@/lib/data";

/** Escape sequences that could break out of a script tag */
function safeJsonStringify(data: unknown): string {
    return JSON.stringify(data)
        .replace(/<\//g, "<\\/")      // Prevent </script> breakout
        .replace(/<!--/g, "<\\!--");   // Prevent HTML comment injection
}

export default function JsonLd({ projects }: { projects: Project[] }) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": projects.map((project, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": {
                "@type": "Grant",
                "name": project.nombre,
                "description": `Fondo concursable de ${project.institucion} categoría ${project.categoria}.`,
                "url": project.url_bases,
                "funder": {
                    "@type": "Organization",
                    "name": project.institucion
                },
                "availabilityEnds": project.fecha_cierre
            }
        }))
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: safeJsonStringify(jsonLd) }}
        />
    );
}
