const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const cheerio = require('cheerio');
const crypto = require('crypto');

const buildDir = path.join(__dirname, 'out');

async function buildExtension() {
    console.log('🚧 Preparing extension build...');

    // 1. Rename _next folder to next
    const oldPath = path.join(buildDir, '_next');
    const newPath = path.join(buildDir, 'next');

    if (fs.existsSync(oldPath)) {
        await fs.move(oldPath, newPath, { overwrite: true });
        console.log('✅ Renamed _next to next');
    }

    // 1b. Rename _not-found folder to not-found
    const notFoundOldPath = path.join(buildDir, '_not-found');
    const notFoundNewPath = path.join(buildDir, 'not-found');
    if (fs.existsSync(notFoundOldPath)) {
        await fs.move(notFoundOldPath, notFoundNewPath, { overwrite: true });
        console.log('✅ Renamed _not-found to not-found');
    }

    // 1c. Remove any other files starting with "_" (like __next..txt)
    const rootFiles = fs.readdirSync(buildDir);
    for (const file of rootFiles) {
        if (file.startsWith('_') && file !== '_next' && file !== 'not-found') {
            await fs.remove(path.join(buildDir, file));
            console.log(`✅ Removed underscore file: ${file}`);
        }
    }

    // 2. Find all HTML, JS, and CSS files in the build folder
    // Handle Windows paths for glob
    const files = glob.sync(`${buildDir.replace(/\\/g, '/')}/**/*.{html,js,css}`);

    // 3. Replace all instances of "/_next/" with "/next/" in the code
    for (const file of files) {
        let content = await fs.readFile(file, 'utf8');
        let changed = false;

        if (content.includes('/_next/')) {
            content = content.replace(/\/_next\//g, '/next/');
            changed = true;
        }
        if (content.includes('/_not-found')) {
            content = content.replace(/\/_not-found/g, '/not-found');
            changed = true;
        }

        if (changed) {
            await fs.writeFile(file, content, 'utf8');
        }
    }
    console.log(`✅ Updated references in ${files.length} files`);

    // 4. Extract Inline Scripts
    console.log('📦 Extracting inline scripts...');
    const htmlFiles = glob.sync(`${buildDir.replace(/\\/g, '/')}/**/*.html`);
    let extractedCount = 0;

    for (const file of htmlFiles) {
        const html = await fs.readFile(file, 'utf8');
        const $ = cheerio.load(html);
        let fileChanged = false;

        $('script').each((i, el) => {
            const $el = $(el);
            const content = $el.html();
            const src = $el.attr('src');

            // Only process inline scripts (no src) that have content
            if (!src && content && content.trim().length > 0) {
                // Generate hash for filename
                const hash = crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);
                const scriptFileName = `script-${hash}.js`;
                const scriptPath = path.join(buildDir, scriptFileName);

                // Write the script file
                fs.writeFileSync(scriptPath, content, 'utf8');

                // Replace inline script with external reference
                // Using root-relative path
                $el.attr('src', `/${scriptFileName}`);
                $el.html(''); // Clear content

                extractedCount++;
                fileChanged = true;
                console.log(`   - Extracted to ${scriptFileName}`);
            }
        });

        if (fileChanged) {
            await fs.writeFile(file, $.html(), 'utf8');
        }
    }
    console.log(`✅ Extracted ${extractedCount} inline scripts`);

    // 5. Update manifest.json with standard CSP
    const manifestPath = path.join(buildDir, 'manifest.json');
    if (fs.existsSync(manifestPath)) {
        const manifest = await fs.readJson(manifestPath);

        // Standard CSP - no hashes needed now!
        const csp = "script-src 'self'; object-src 'self'";

        manifest.content_security_policy = {
            extension_pages: csp
        };

        await fs.writeJson(manifestPath, manifest, { spaces: 2 });
        console.log('✅ Updated manifest.json with standard CSP');
    }

    console.log('🎉 Extension build ready in /out folder!');
}

buildExtension();
