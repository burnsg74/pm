import fs from 'fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

const PROJECT_PATH = '/Users/greg/Library/CloudStorage/Dropbox/Notebooks/Job Search/Job Search PM/Jobs';

async function processMarkdownFiles() {
    try {
        const files = await fs.readdir(PROJECT_PATH);

        // Filter markdown files
        const markdownFiles = files.filter(file => path.extname(file) === '.md');

        if (!markdownFiles.length) {
            console.log('No Markdown files found in the directory.');
            return;
        }

        // Process one file first for testing
        // console.log('Testing with one file:');
        // await processFile(markdownFiles[0]);
        // console.log('Test completed.\n');
        // process.exit(1);

        // Process the rest of the files
        console.log('Processing remaining files:');
        for (const file of markdownFiles) {
            await processFile(file);
        }

    } catch (err) {
        console.error('Error processing markdown files:', err);
    }
}

async function processFile(file) {
    const filePath = path.join(PROJECT_PATH, file);

    try {
        // Read file content
        const fileContent = await fs.readFile(filePath, 'utf8');

        // Use gray-matter to parse the frontmatter
        const { data: frontmatter, content } = matter(fileContent);

        console.log(`Processing file: ${file}`);
        // console.log('Extracted Frontmatter:', frontmatter);
        // console.log('Extracted Frontmatter:', content);

        // Ensure `status` key exists in frontmatter
        if (!frontmatter?.status) {
            console.warn(`File "${file}" has no "status" key in frontmatter. Skipping.`);
            return;
        }

        // Determine new folder path based on `status`
        const statusFolder = path.join(PROJECT_PATH, frontmatter.status);

        // Create directory if it doesn't exist
        await fs.mkdir(statusFolder, { recursive: true });

        // Move file to the new folder
        const newFilePath = path.join(statusFolder, file);
        await fs.rename(filePath, newFilePath);

        console.log(`File "${file}" moved to "${statusFolder}".`);
    } catch (err) {
        console.error(`Error processing file "${file}":`, err);
    }
}

// Run the script
processMarkdownFiles();