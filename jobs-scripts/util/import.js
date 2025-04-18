import dotenv from "dotenv";
import fs from "fs";
import matter from 'gray-matter';
import path from "node:path";
import Turndown from "turndown";
import * as mysql from "mysql2/promise";

dotenv.config({path: `../../.env.${process.env.NODE_ENV ?? 'development'}`});

// Create MySQL connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const findMarkdownFiles = (dir) => {
    const files = [];
    const items = fs.readdirSync(dir);

    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            files.push(...findMarkdownFiles(fullPath));
        } else if (item === 'Job Post.md') {
            files.push(fullPath);
        }
    }

    return files;
};

const parseMarkdownFile = (filePath) => {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const {data, content} = matter(fileContent);
    return {frontmatter: data, content};
};

const processJobPost = async (filePath) => {
    try {
        const {frontmatter, content} = parseMarkdownFile(filePath);
        console.log(`Processing: ${filePath}`);
        console.log('Frontmatter:', frontmatter);
        const company = await findOrCreateCompany(frontmatter.company);
        console.log(company);

        const jobData = {
            company_id: company.company_id,
            source: "Indeed",
            jk: frontmatter.jk,
            title: frontmatter.title,
            skills: frontmatter.skills_known,
            search_query: frontmatter.search_query,
            salary_min: frontmatter.salary_min,
            salary_max: frontmatter.salary_max,
            link: frontmatter.link,
            job_post: content,
            status: frontmatter.status ?? 'New',
            date_posted: frontmatter.date_posted ? new Date(frontmatter.date_posted).toISOString().slice(0, 19).replace('T', ' ') : null,
            date_new: new Date().toISOString().slice(0, 19).replace('T', ' '),
        }
        await insertJob(jobData);

    } catch (error) {
        console.error(`Error processing ${filePath}:`, error);
    }
};


async function findOrCreateCompany(companyName) {
    if (!companyName) {
        throw new Error('Company name is required');
    }

    const conn = await pool.getConnection();

    try {
        // Begin transaction
        await conn.beginTransaction();

        // Try to find the company by name
        const [rows] = await conn.query(
            'SELECT * FROM company WHERE name = ?',
            [companyName]
        );

        if (rows.length > 0) {
            // Company exists, return it
            await conn.commit();
            return rows[0];
        }

        // Company doesn't exist, create it
        const [result] = await conn.query(
            'INSERT INTO company (name) VALUES (?)',
            [companyName]
        );

        // Get the newly created company
        const [newCompany] = await conn.query(
            'SELECT * FROM company WHERE company_id = ?',
            [result.insertId]
        );

        await conn.commit();
        return newCompany[0];

    } catch (error) {
        await conn.rollback();
        console.error('Error finding or creating company:', error);
        throw error;
    } finally {
        conn.release();
    }
}

async function insertJob(jobData) {
    const conn = await pool.getConnection();
    try {
        const fields = Object.keys(jobData).filter(key => jobData[key] !== undefined);
        const placeholders = fields.map(() => '?').join(', ');
        const values = fields.map(field => jobData[field]);
        const query = `INSERT INTO job (${fields.join(', ')}) VALUES (${placeholders})`;

        await conn.beginTransaction();
        const [result] = await conn.query(query, values);
        await conn.commit();

        return {
            jobId: result.insertId,
            affected: result.affectedRows,
            success: true
        };
    } catch (error) {
        await conn.rollback();
        console.error('Error inserting job:', error);
        throw error;
    } finally {
        conn.release();
    }
}

// ------------------------------------------------------------------------------------------------- //

const main = async () => {
    try {
        const jobsDirectory = '/Users/greg/Library/CloudStorage/Dropbox/Notebooks/Job-Search/Jobs';
        const markdownFiles = findMarkdownFiles(jobsDirectory);

        for (const file of markdownFiles) {
            await processJobPost(file);
        }
    } catch (error) {
        console.error('Error in main process:', error);
    } finally {
        await pool.end();
    }
};

main();

// /Users/greg/Library/CloudStorage/Dropbox/Notebooks/Job-Search/Jobs/BELVA/Sr React Developer