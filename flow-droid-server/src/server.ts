import express from 'express';
import multer from 'multer';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';

// Initialize Express app
const app = express();
const port = 3040;

app.use(cors());
dotenv.config();

// Define input and output directories
const inputDir = path.join(__dirname, '../tools/input');
const outputDir = path.join(__dirname, '../tools/output');
const sootJar = path.join(__dirname, '../tools/soot-infoflow-cmd-jar-with-dependencies.jar');
const androidSdk = process.env.ANDROID_SDK;

// Ensure directories exist
if (!fs.existsSync(inputDir)) {
    fs.mkdirSync(inputDir, { recursive: true });
}
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Clean up old files in input directory
        fs.readdir(inputDir, (err, files) => {
            if (err) throw err;
            for (const file of files) {
                fs.unlinkSync(path.join(inputDir, file));
            }
        });
        cb(null, inputDir);
    },
    filename: (req, file, cb) => {
        // Add timestamp to filename to prevent caching issues
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({ storage });

// Define the /apk endpoint
app.post('/apk', upload.single('apkFile'), (req, res) => {
    // Check if a file was uploaded
    const apkFile = req.file;
    if (!apkFile) {
        res.status(400).send('No file uploaded');
        return;
    }

    // Validate file type
    if (!apkFile.originalname.endsWith('.apk')) {
        res.status(400).send('Invalid file type. Please upload an APK file.');
        return;
    }

    // Extract the base name (without extension)
    const apkName = path.basename(apkFile.originalname, '.apk');
    const outputFilePath = path.join(outputDir, `${apkName}.xml`);

    // Update the command with the correct outputFilePath
    const command = `java -jar ${sootJar} -a ${path.join(inputDir, apkFile.filename)} -p ${androidSdk} -s ${path.join(__dirname, '../tools/SourcesAndSinks.txt')} -o ${outputFilePath}`;
    console.log(`Executing command: ${command}`);

    // Clean up after analysis is complete
    const cleanupFiles = () => {
        if (apkFile && fs.existsSync(path.join(inputDir, apkFile.filename))) {
            fs.unlinkSync(path.join(inputDir, apkFile.filename));
        }
        if (fs.existsSync(outputFilePath)) {
            fs.unlinkSync(outputFilePath);
        }
    };

    // Execute the command
    exec(command, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
        // Log complete output for debugging
        console.log('Complete stdout:', stdout);
        console.log('Complete stderr:', stderr);

        // Combine stdout and stderr for analysis since Java writes to both
        const fullOutput = stdout + stderr;

        // Check if analysis found zero vulnerabilities
        if (fullOutput.includes('Found 0 leaks')) {
            res.status(200).json({
                message: 'Analysis complete - No vulnerabilities detected',
                vulnerabilitiesFound: false,
                output: fullOutput
            });
            cleanupFiles();
            return;
        }

        if (fs.existsSync(outputFilePath)) {
            // Send file using absolute path
            res.sendFile(outputFilePath, (err) => {
                if (err) {
                    console.error(`Error sending file: ${err.message}`);
                    res.status(500).send('Error sending file');
                }
                // Clean up files after sending response
                cleanupFiles();
            });
        } else {
            console.error('Output file not found at:', outputFilePath);
            res.status(500).json({
                message: 'Analysis process completed but no output file was generated',
                error: 'Missing output file',
                output: fullOutput
            });
            cleanupFiles();
        }
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});