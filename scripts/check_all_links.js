const fs = require('fs');
const path = require('path');

const projectsPath = path.join(__dirname, '..', 'data', 'projects.json');
const projects = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));

async function checkLink(url) {
    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
        return { isValid: false, error: 'Invalid URL format' };
    }

    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36';

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        // Try HEAD
        let response;
        try {
            response = await fetch(url, {
                method: 'HEAD',
                signal: controller.signal,
                headers: { 'User-Agent': userAgent }
            });
        } catch (e) {
            // If HEAD fails immediately (e.g. ECONNREFUSED), try GET
            response = null;
        }

        // Try GET if HEAD failed or returned error
        if (!response || response.status >= 400) {
            try {
                response = await fetch(url, {
                    method: 'GET',
                    signal: controller.signal,
                    headers: {
                        'User-Agent': userAgent,
                        'Range': 'bytes=0-0'
                    }
                });
            } catch (e) {
                // If both fail
                clearTimeout(timeoutId);
                return { isValid: false, error: e.message };
            }
        }

        clearTimeout(timeoutId);
        const isValid = response.status >= 200 && response.status < 400;
        return { isValid, status: response.status, url };
    } catch (error) {
        return { isValid: false, error: error.message };
    }
}

async function run() {
    console.log(`Checking ${projects.length} project links...`);
    const results = [];

    for (const project of projects) {
        process.stdout.write(`Checking ID ${project.id}: ${project.nombre.substring(0, 40)}... `);
        const result = await checkLink(project.url_bases);
        if (result.isValid) {
            console.log('\x1b[32mOK\x1b[0m');
        } else {
            console.log(`\x1b[31mFAILED (${result.status || result.error})\x1b[0m`);
            results.push({ id: project.id, name: project.nombre, url: project.url_bases, error: result.error, status: result.status });
        }
    }

    console.log('\n--- Summary of Broken Links ---');
    console.log(JSON.stringify(results, null, 2));

    if (results.length > 0) {
        fs.writeFileSync(path.join(__dirname, 'broken_links.json'), JSON.stringify(results, null, 2));
        console.log(`\nFound ${results.length} broken links. Saved to scripts/broken_links.json`);
        process.exit(1);
    } else {
        console.log('\nAll links are valid!');
        process.exit(0);
    }
}

run();
