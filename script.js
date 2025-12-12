import { FFmpeg } from 'https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/esm/index.js';
import { fetchFile, toBlobURL } from 'https://unpkg.com/@ffmpeg/util@0.12.1/dist/esm/index.js';

const ffmpeg = new FFmpeg();
let inputFile = null;

const uploadArea = document.getElementById('upload-area');
const fileInput = document.getElementById('file-input');
const fileInfo = document.getElementById('file-info');
const convertBtn = document.getElementById('convert-btn');
const statusDiv = document.getElementById('status');
const resultDiv = document.getElementById('result');
const compressionLevelSelect = document.getElementById('compression-level');

// Initialize FFmpeg
const initFFmpeg = async () => {
    try {
        statusDiv.textContent = 'Loading FFmpeg...';
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
        await ffmpeg.load({
            coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
        statusDiv.textContent = 'FFmpeg loaded. Ready.';
        console.log('FFmpeg loaded');
    } catch (error) {
        console.error('Error loading FFmpeg:', error);
        statusDiv.textContent = 'Error loading FFmpeg. Please check console.';
    }
};

initFFmpeg();

// Drag and drop handlers
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
});

const handleFile = (file) => {
    if (!file.type.startsWith('audio/')) {
        alert('Please select an audio file.');
        return;
    }
    inputFile = file;
    fileInfo.textContent = `Selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
    convertBtn.disabled = false;
    resultDiv.innerHTML = ''; // Clear previous results
};

convertBtn.addEventListener('click', async () => {
    if (!inputFile) return;

    convertBtn.disabled = true;
    statusDiv.textContent = 'Converting...';
    resultDiv.innerHTML = '';

    try {
        const inputName = 'input' + getExtension(inputFile.name);
        const outputName = 'output.mp3';

        await ffmpeg.writeFile(inputName, await fetchFile(inputFile));

        const bitrate = getBitrate(compressionLevelSelect.value);
        console.log(`Starting conversion: ${inputName} -> ${outputName} with bitrate ${bitrate}`);

        // FFmpeg command: -i input -b:a bitrate output.mp3
        // We can also add -map a to ensure only audio is processed if input has video/cover art
        await ffmpeg.exec(['-i', inputName, '-b:a', bitrate, outputName]);

        const data = await ffmpeg.readFile(outputName);

        const blob = new Blob([data.buffer], { type: 'audio/mp3' });
        const url = URL.createObjectURL(blob);
        const sizeMB = (blob.size / 1024 / 1024).toFixed(2);

        statusDiv.textContent = 'Conversion complete!';

        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = `compressed_${inputFile.name.split('.')[0]}.mp3`;
        downloadLink.className = 'download-link';
        downloadLink.textContent = `Download Compressed Audio (${sizeMB} MB)`;

        resultDiv.appendChild(downloadLink);

        // Cleanup
        /*
           Note: In a long running app, we might want to delete files from MEMFS.
           await ffmpeg.deleteFile(inputName);
           await ffmpeg.deleteFile(outputName);
        */

    } catch (error) {
        console.error('Conversion error:', error);
        statusDiv.textContent = 'Error during conversion. See console for details.';
    } finally {
        convertBtn.disabled = false;
    }
});

const getExtension = (filename) => {
    const parts = filename.split('.');
    return parts.length > 1 ? '.' + parts.pop() : '';
};

const getBitrate = (level) => {
    switch (level) {
        case 'high': return '192k';
        case 'balanced': return '128k';
        case 'low': return '64k';
        case 'very-low': return '32k';
        default: return '128k';
    }
};

// Logger for progress (optional but good for UX)
ffmpeg.on('log', ({ message }) => {
    console.log(message);
    // Simple progress heuristic could be added here if needed,
    // but parsing ffmpeg logs is complex.
});
