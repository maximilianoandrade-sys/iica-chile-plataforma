const fs = require('fs');
const path = require('path');

// Leer el archivo de proyectos
const projectsPath = path.join(__dirname, '..', 'data', 'projects.json');
const projects = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));

console.log(`📊 Total de proyectos antes de limpieza: ${projects.length}`);

// REGLA 1: Eliminar proyectos que NO son relevantes para Chile
const irrelevantProjects = [
    'Guatemala',
    'Kenia',
    'África',
    'Argentina',
    'Brasil',
    'Paraguay',
    'Uruguay'
];

const cleanedProjects = projects.filter(project => {
    // Verificar si las regiones contienen países irrelevantes
    const hasIrrelevantRegion = project.regiones.some(region =>
        irrelevantProjects.some(country => region.includes(country))
    );

    if (hasIrrelevantRegion) {
        console.log(`❌ Eliminando: ${project.nombre} (Región: ${project.regiones.join(', ')})`);
        return false;
    }

    return true;
});

console.log(`✅ Proyectos después de limpieza: ${cleanedProjects.length}`);
console.log(`🗑️  Proyectos eliminados: ${projects.length - cleanedProjects.length}`);

// REGLA 2: Normalizar nombres de instituciones
const institutionMapping = {
    'Fondo Chile (PNUD)': 'PNUD',
    'Unión Europea': 'UE',
    'European Union': 'UE',
    'World Bank': 'Banco Mundial',
    'IDB': 'BID',
    'Green Climate Fund': 'GCF',
    'USAID': 'USAID',
    'GIZ': 'GIZ',
    'FAO': 'FAO',
    'IFAD': 'FIDA',
    'CAF': 'CAF'
};

cleanedProjects.forEach(project => {
    if (institutionMapping[project.institucion]) {
        const oldName = project.institucion;
        project.institucion = institutionMapping[project.institucion];
        if (oldName !== project.institucion) {
            console.log(`🔄 Normalizando: "${oldName}" → "${project.institucion}"`);
        }
    }
});

// Guardar el archivo limpio
fs.writeFileSync(projectsPath, JSON.stringify(cleanedProjects, null, 4));

console.log('\n✅ Base de datos limpiada exitosamente');
console.log(`📁 Archivo guardado en: ${projectsPath}`);
