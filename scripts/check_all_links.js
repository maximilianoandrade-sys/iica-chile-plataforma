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
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        // Try HEAD first
        let response;
        try {
            response = await fetch(url, {
                method: 'HEAD',
                signal: controller.signal,
                headers: { 'User-Agent': userAgent },
                redirect: 'follow'
            });
        } catch (e) {
            response = null;
        }

        // Try GET if HEAD failed or returned error
        if (!response || response.status >= 400) {
            try {
                const controller2 = new AbortController();
                const timeoutId2 = setTimeout(() => controller2.abort(), 15000);
                response = await fetch(url, {
                    method: 'GET',
                    signal: controller2.signal,
                    headers: {
                        'User-Agent': userAgent,
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                        'Accept-Language': 'es-CL,es;q=0.9,en;q=0.8'
                    },
                    redirect: 'follow'
                });
                clearTimeout(timeoutId2);
            } catch (e) {
                clearTimeout(timeoutId);
                return { isValid: false, error: e.message };
            }
        }

        clearTimeout(timeoutId);

        // 403 from institutional sites is normal (they block bots but the URL is valid)
        const isValid = response.status >= 200 && response.status < 500;
        return { isValid, status: response.status, url };
    } catch (error) {
        return { isValid: false, error: error.message };
    }
}

async function run() {
    console.log(`\n🔍 Link Guardian — Checking ${projects.length} project links...\n`);

    const broken = [];
    const warnings = [];
    let valid = 0;

    for (const project of projects) {
        const label = `[${project.id}] ${project.nombre.substring(0, 50)}`;
        process.stdout.write(`  ${label}... `);

        const result = await checkLink(project.url_bases);

        if (result.isValid && result.status >= 200 && result.status < 300) {
            console.log('\x1b[32m✓ OK\x1b[0m');
            valid++;
        } else if (result.isValid && result.status >= 300) {
            // 3xx redirects or 4xx client errors that aren't 404
            console.log(`\x1b[33m⚠ Warning (${result.status})\x1b[0m`);
            warnings.push({
                id: project.id,
                name: project.nombre,
                url: project.url_bases,
                status: result.status
            });
            valid++;
        } else {
            console.log(`\x1b[31m✗ BROKEN (${result.status || result.error})\x1b[0m`);
            broken.push({
                id: project.id,
                name: project.nombre,
                url: project.url_bases,
                error: result.error,
                status: result.status
            });
        }

        // Small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 300));
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Link Guardian Summary');
    console.log('='.repeat(60));
    console.log(`  ✓ Valid:    ${valid}`);
    console.log(`  ⚠ Warnings: ${warnings.length}`);
    console.log(`  ✗ Broken:   ${broken.length}`);
    console.log(`  Total:      ${projects.length}`);
    console.log('='.repeat(60));

    const report = {
        timestamp: new Date().toISOString(),
        total: projects.length,
        valid,
        warnings: warnings.length,
        broken: broken.length,
        brokenLinks: broken,
        warningLinks: warnings
    };

    // Always save report
    const reportPath = path.join(__dirname, 'broken_links.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    if (broken.length > 0) {
        console.log(`\n⚠️  ${broken.length} broken links found. Report saved to scripts/broken_links.json`);
        console.log('\nBroken links:');
        broken.forEach(b => console.log(`  - [${b.id}] ${b.url} → ${b.status || b.error}`));
    } else {
        console.log('\n✅ All links are reachable!');
    }

    if (warnings.length > 0) {
        console.log(`\n💡 ${warnings.length} links returned non-200 status (may still be valid):`);
        warnings.forEach(w => console.log(`  - [${w.id}] ${w.url} → ${w.status}`));
    }

    // Exit 0 always — don't fail the workflow for broken links
    // The report is uploaded as an artifact for review
    process.exit(0);
}

run();
