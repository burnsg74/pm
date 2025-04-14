import fs from 'fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

const PROJECT_PATH = '/Users/greg/Library/CloudStorage/Dropbox/Notebooks/Job Search/Job Search PM/Jobs/Applied';

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

        // console.log(`Processing file: ${file}`);
        // console.log('Extracted Frontmatter:', frontmatter);
        // console.log('Extracted Frontmatter:', content);

        if (!frontmatter?.company) {
            console.warn(`File "${file}" has no "company" key in frontmatter. Skipping.`);
            return;
        }

        if (!frontmatter?.title) {
            console.warn(`File "${file}" has no "title" key in frontmatter. Skipping.`);
            return;
        }

        // Sanitize folder names
        const companyFolder = sanitizeFolderName(frontmatter.company);
        const titleFolder = sanitizeFolderName(frontmatter.title);

        // Create the new folder path
        const newFolderPath = path.join(PROJECT_PATH, companyFolder, titleFolder);
        await fs.mkdir(newFolderPath, { recursive: true });

        // Define the new file path
        const newFilePath = path.join(newFolderPath, 'Job Post.md');

        // Move file to the new location
        await fs.rename(filePath, newFilePath);

        console.log(`File "${file}" moved to "${newFilePath}".`);
    } catch (err) {
        console.error(`Error processing file "${file}":`, err);
    }
}

const sanitizeFolderName = (name) => {
    return name.replace(/[<>:"/\\|?*\x00-\x1F]/g, '').trim(); // Removes invalid characters and trims extra spaces
};


// Run the script
processMarkdownFiles();