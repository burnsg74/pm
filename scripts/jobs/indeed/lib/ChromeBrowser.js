import dotenv from "dotenv";
import {chromium} from "@playwright/test";
import {execSync} from "child_process";
import path from "node:path";
import fs from "fs-extra";

class ChromeBrowser {
    static CONFIG = {
        PROFILE: "Profile 4",
        BASE_URL: "https://www.indeed.com",
        DEBUG_PORT: 9222,
        CUSTOM_DATA_DIR: "/tmp/chrome-debug-data",
        CHROME_STARTUP_DELAY: 1000
    };

    constructor() {
        this.browser = null;
        dotenv.config();
    }

    async initialize() {
        console.log("Starting...", process.env.NODE_ENV, process.env.DB_NAME);
        console.log("Opening Chrome...");
        this.browser = await this.launchChrome();
    }

    async cleanup() {
        console.log("Closing Chrome...");
        await this.browser?.close();
        this.closeExistingChromeInstances();
    }

    async getTab(tabNumber = 1) {
        if (!this.browser) {
            return null;
        }

        const context = this.browser.contexts()[0];
        if (tabNumber > this.browser.contexts()[0].pages().length) {
            await context.newPage();
        }
        return this.browser.contexts()[0].pages()[tabNumber - 1];
    }

    async launchChrome() {
        this.copyUserProfile();
        this.closeExistingChromeInstances();

        this.startChromeProcess();
        console.log("Waiting for Chrome to initialize...");
        await this.delay(ChromeBrowser.CONFIG.CHROME_STARTUP_DELAY);

        return await chromium.connectOverCDP(
            `http://127.0.0.1:${ChromeBrowser.CONFIG.DEBUG_PORT}`
        );
    }

    copyUserProfile() {
        const defaultUserDataPath = this.getDefaultUserDataPath();
        const {CUSTOM_DATA_DIR, PROFILE} = ChromeBrowser.CONFIG;

        fs.removeSync(CUSTOM_DATA_DIR);
        fs.mkdirSync(CUSTOM_DATA_DIR, {recursive: true});

        this.copyProfileFiles(defaultUserDataPath, CUSTOM_DATA_DIR, PROFILE);
    }

    getDefaultUserDataPath() {
        return path.join(
            process.env.HOME,
            'Library',
            'Application Support',
            'Google',
            'Chrome'
        );
    }

    copyProfileFiles(sourcePath, targetPath, profile) {
        fs.copySync(
            path.join(sourcePath, 'Local State'),
            path.join(targetPath, 'Local State')
        );
        fs.copySync(
            path.join(sourcePath, profile),
            path.join(targetPath, profile)
        );

        const variationsPath = path.join(sourcePath, 'Variations');
        if (fs.existsSync(variationsPath)) {
            fs.copySync(
                variationsPath,
                path.join(targetPath, 'Variations')
            );
        }
    }

    startChromeProcess() {
        const {DEBUG_PORT, CUSTOM_DATA_DIR, PROFILE, BASE_URL} = ChromeBrowser.CONFIG;
        execSync(
            `open -na "Google Chrome" --args \
        --remote-debugging-port=${DEBUG_PORT} \
        --user-data-dir="${CUSTOM_DATA_DIR}" \
        --profile-directory="${PROFILE}" \
        --no-first-run \
        --no-default-browser-check \
        --disable-features=IsolateOrigins \
        --disable-notifications \
        ${BASE_URL}`
    );
}

    closeExistingChromeInstances() {
        try {
            execSync(`pkill -f "Google Chrome"`);
            console.log("Closed existing Chrome instances.");
        } catch (error) {
            console.log("No existing Chrome instances were running.");
        }
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export default ChromeBrowser;