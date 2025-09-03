// queue.js
// ---- Système simple sans Redis ----

// Stockage en mémoire des jobs
const jobs = new Map();

// ID unique pour les jobs
let jobIdCounter = 1;

// Ajouter un job
export function addJob(data) {
    const jobId = jobIdCounter++;
    const job = {
        id: jobId,
        data: data,
        status: 'pending',
        createdAt: new Date(),
        result: null,
        error: null
    };
    jobs.set(jobId, job);
    return job;
}

// Récupérer un job
export function getJob(jobId) {
    return jobs.get(parseInt(jobId));
}

// Mettre à jour un job
export function updateJob(jobId, updates) {
    const job = jobs.get(parseInt(jobId));
    if (job) {
        Object.assign(job, updates);
    }
    return job;
}

// Traiter un job immédiatement - NOUVELLE VERSION UNIVERSELLE
export async function processJob(jobId) {
    const job = jobs.get(parseInt(jobId));
    if (!job) {
        console.error(`❌ Job ${jobId} not found`);
        return;
    }

    try {
        console.log(`🚀 Processing universal job ${jobId}`);
        job.status = 'processing';

        // Utiliser le nouveau pipeline universel
        const result = await contentProcessor.processContent(job.data.input);

        // Finalisation avec le nouveau format
        if (result.success) {
            job.status = 'completed';
            job.result = {
                success: true,
                contentType: result.contentType,
                text: result.text,
                summary: result.summary,
                metadata: result.metadata,
                processed_at: result.processedAt
            };
            console.log(`🎉 Universal job ${jobId} completed successfully`);
        } else {
            throw new Error(result.error);
        }

    } catch (error) {
        console.error(`❌ Universal job ${jobId} failed:`, error.message);
        console.error(`❌ Full error:`, error);
        job.status = 'failed';
        job.error = error.message;

        // Maintenir la compatibilité avec l'ancien format d'erreur
        job.result = {
            success: false,
            error: error.message,
            processed_at: new Date().toISOString()
        };
    }
}

// Fonction utilitaire pour analyser les erreurs YouTube
function analyzeYouTubeError(errorMessage) {
    const errorPatterns = {
        'not_available_app': /The following content is not available on this app/i,
        'video_unavailable': /Video unavailable/i,
        'private_video': /This video is private/i,
        'age_restricted': /Sign in to confirm your age/i,
        'region_blocked': /This video is not available in your country/i,
        'copyright': /This video has been removed by the uploader/i,
        'network_error': /Network is unreachable|Connection timed out|HTTP Error 403/i,
        'quota_exceeded': /quota|too many requests|rate limit|429|Too Many Requests/i,
        'temporary_block': /temporary|blocked|temporarily unavailable|service unavailable/i,
        'geo_restricted': /geo|geographic|country|region/i,
        'embed_disabled': /embedding disabled|embed not allowed/i
    };

    for (const [errorType, pattern] of Object.entries(errorPatterns)) {
        if (pattern.test(errorMessage)) {
            return errorType;
        }
    }

    return 'unknown_error';
}

// Fonction de download avec gestion d'erreur robuste et stratégies de fallback
async function downloadAudio(url, jobId) {
    const { execFile } = await import('node:child_process');
    const fs = await import('fs');
    const path = await import('path');
    
    const TMP_DIR = path.resolve('./storage');
    const filePath = path.join(TMP_DIR, `${jobId}.mp3`);
    
    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(TMP_DIR)) {
        fs.mkdirSync(TMP_DIR, { recursive: true });
    }
    
    // Stratégies de fallback pour contourner la détection YouTube
    const strategies = [
        {
            name: 'android_client',
            args: [
                '-x',
                '--audio-format', 'mp3',
                '--audio-quality', '128k',
                '--proxy', 'socks5://00d3bd63b39069b84eb9:7a942b1b7d9b3782@gw.dataimpulse.com:824',
                '--user-agent', 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
                '--no-check-certificates',
                '--force-ipv4',
                '--extractor-args', 'youtube:player_client=android_music',
                '--no-playlist',
                '--no-warnings',
                '--quiet',
                '--retries', '5',
                '--fragment-retries', '5',
                '--geo-bypass',
                '--force-ipv4',
                '-o', filePath,
                url
            ]
        },
        {
            name: 'ios_client',
            args: [
                '-x',
                '--audio-format', 'mp3',
                '--audio-quality', '128k',
                '--proxy', 'socks5://00d3bd63b39069b84eb9:7a942b1b7d9b3782@gw.dataimpulse.com:824',
                '--user-agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
                '--no-check-certificates',
                '--force-ipv4',
                '--extractor-args', 'youtube:player_client=ios',
                '--no-playlist',
                '--no-warnings',
                '--quiet',
                '--retries', '5',
                '--fragment-retries', '5',
                '--geo-bypass',
                '--force-ipv4',
                '-o', filePath,
                url
            ]
        },
        {
            name: 'tvhtml5_client',
            args: [
                '-x',
                '--audio-format', 'mp3',
                '--audio-quality', '128k',
                '--proxy', 'socks5://00d3bd63b39069b84eb9:7a942b1b7d9b3782@gw.dataimpulse.com:824',
                '--user-agent', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                '--no-check-certificates',
                '--force-ipv4',
                '--extractor-args', 'youtube:player_client=tvhtml5',
                '--no-playlist',
                '--no-warnings',
                '--quiet',
                '--retries', '5',
                '--fragment-retries', '5',
                '--geo-bypass',
                '--force-ipv4',
                '-o', filePath,
                url
            ]
        },
        {
            name: 'web_client_fallback',
            args: [
            '-x',
            '--audio-format', 'mp3',
            '--audio-quality', '128k',
            '--proxy', 'socks5://00d3bd63b39069b84eb9:7a942b1b7d9b3782@gw.dataimpulse.com:824',
            '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            '--no-check-certificates',
            '--force-ipv4',
                '--extractor-args', 'youtube:player_client=web',
                '--no-playlist',
                '--no-warnings',
                '--quiet',
                '--retries', '5',
                '--fragment-retries', '5',
                '--geo-bypass',
                '--force-ipv4',
                '--referer', 'https://www.youtube.com/',
                '-o', filePath,
                url
            ]
        },
        {
            name: 'android_no_proxy',
            args: [
                '-x',
                '--audio-format', 'mp3',
                '--audio-quality', '128k',
                '--user-agent', 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
                '--no-check-certificates',
                '--force-ipv4',
                '--extractor-args', 'youtube:player_client=android_music',
                '--no-playlist',
                '--no-warnings',
                '--quiet',
                '--retries', '5',
                '--fragment-retries', '5',
                '--geo-bypass',
                '--force-ipv4',
                '--sleep-interval', '1',
                '--max-sleep-interval', '5',
                '-o', filePath,
                url
            ]
        },
        {
            name: 'web_no_proxy',
            args: [
                '-x',
                '--audio-format', 'mp3',
                '--audio-quality', '128k',
                '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                '--no-check-certificates',
                '--force-ipv4',
                '--extractor-args', 'youtube:player_client=web',
                '--no-playlist',
                '--no-warnings',
                '--quiet',
                '--retries', '5',
                '--fragment-retries', '5',
                '--geo-bypass',
                '--force-ipv4',
                '--sleep-interval', '1',
                '--max-sleep-interval', '5',
                '--referer', 'https://www.youtube.com/',
                '-o', filePath,
                url
            ]
        },
        {
            name: 'slow_mode_android',
            args: [
                '-x',
                '--audio-format', 'mp3',
                '--audio-quality', '128k',
                '--proxy', 'socks5://00d3bd63b39069b84eb9:7a942b1b7d9b3782@gw.dataimpulse.com:824',
                '--user-agent', 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
                '--no-check-certificates',
                '--force-ipv4',
                '--extractor-args', 'youtube:player_client=android_music',
                '--no-playlist',
            '--no-warnings',
            '--quiet',
            '--retries', '3',
            '--fragment-retries', '3',
                '--geo-bypass',
                '--force-ipv4',
                '--sleep-interval', '5',
                '--max-sleep-interval', '15',
                '--throttled-rate', '100K',
                '--limit-rate', '500K',
            '-o', filePath,
            url
            ]
        }
    ];

    for (let i = 0; i < strategies.length; i++) {
        const strategy = strategies[i];
        console.log(`🔄 Tentative ${i + 1}/${strategies.length} - Stratégie: ${strategy.name} pour job ${jobId}...`);

        try {
            await new Promise((resolve, reject) => {
                const ytDlpProcess = execFile('yt-dlp', strategy.args, (err, stdout, stderr) => {
            if (err) {
                        console.error(`❌ yt-dlp error (${strategy.name}) for job ${jobId}:`, err.message);
                console.error(`stderr:`, stderr);
                reject(new Error(`yt-dlp failed: ${err.message}`));
                return;
            }
            
            if (fs.existsSync(filePath)) {
                        console.log(`✅ File downloaded successfully with ${strategy.name}: ${filePath}`);
                resolve(filePath);
            } else {
                console.error(`❌ File not found after download: ${filePath}`);
                reject(new Error('File not found after download'));
            }
        });
        
        // Timeout de sécurité
        setTimeout(() => {
            if (ytDlpProcess && !ytDlpProcess.killed) {
                        console.error(`⏰ yt-dlp timeout (${strategy.name}) for job ${jobId}`);
                ytDlpProcess.kill();
                reject(new Error('Download timeout'));
            }
        }, 300000); // 5 minutes
    });

            // Si on arrive ici, le téléchargement a réussi
            console.log(`🎉 Téléchargement réussi avec la stratégie: ${strategy.name}`);
            return filePath;

        } catch (error) {
            const errorType = analyzeYouTubeError(error.message);
            console.error(`❌ Échec stratégie ${strategy.name} (${errorType}):`, error.message);

            // Log détaillé selon le type d'erreur
            switch (errorType) {
                case 'not_available_app':
                    console.log(`📱 Erreur "not available on app" - tentative avec un autre player_client...`);
                    break;
                case 'network_error':
                    console.log(`🌐 Erreur réseau - vérification proxy ou connexion...`);
                    break;
                case 'video_unavailable':
                    console.log(`🚫 Vidéo indisponible - vidéo supprimée ou privée`);
                    // Pour les vidéos supprimées, pas besoin de continuer
                    if (error.message.includes('removed by the uploader')) {
                        throw new Error(`Vidéo supprimée par l'uploader: ${url}`);
                    }
                    break;
                case 'private_video':
                    console.log(`🔒 Vidéo privée - accès impossible`);
                    throw new Error(`Vidéo privée inaccessible: ${url}`);
                case 'age_restricted':
                    console.log(`🔞 Vidéo avec restriction d'âge`);
                    break;
                case 'quota_exceeded':
                    console.log(`⏰ Quota dépassé - attente plus longue nécessaire...`);
                    break;
                case 'temporary_block':
                    console.log(`🛑 Blocage temporaire - tentative avec délais plus longs...`);
                    break;
                case 'geo_restricted':
                    console.log(`🌍 Restriction géographique - tentative avec proxy différent...`);
                    break;
                case 'embed_disabled':
                    console.log(`🚫 Embedding désactivé - tentative avec autre méthode...`);
                    break;
                default:
                    console.log(`❓ Erreur inconnue - tentative avec stratégie suivante...`);
            }

            // Nettoyer le fichier partiellement téléchargé s'il existe
            if (fs.existsSync(filePath)) {
                try {
                    fs.unlinkSync(filePath);
                    console.log(`🧹 Fichier partiellement téléchargé nettoyé: ${filePath}`);
                } catch (cleanupError) {
                    console.warn(`⚠️ Impossible de nettoyer le fichier:`, cleanupError.message);
                }
            }

            // Si c'était la dernière stratégie, rejeter l'erreur avec diagnostic
            if (i === strategies.length - 1) {
                const finalError = `Toutes les stratégies de téléchargement ont échoué. ` +
                    `Dernière erreur (${errorType}): ${error.message}. ` +
                    `URL: ${url}`;
                console.error(`💥 ${finalError}`);
                throw new Error(finalError);
            }

            // Attendre un peu avant la prochaine tentative (délais adaptés selon le type d'erreur)
            let waitTime = 2000; // Par défaut 2 secondes

            switch (errorType) {
                case 'network_error':
                case 'temporary_block':
                    waitTime = 8000; // 8 secondes pour erreurs réseau/temporaires
                    break;
                case 'quota_exceeded':
                    waitTime = 15000; // 15 secondes pour quota dépassé
                    break;
                case 'not_available_app':
                    waitTime = 3000; // 3 secondes pour erreurs d'app
                    break;
                case 'geo_restricted':
                    waitTime = 5000; // 5 secondes pour restrictions géo
                    break;
            }

            console.log(`⏳ Attente ${waitTime}ms avant prochaine tentative...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }
}

// Fonction de transcription avec gestion d'erreur robuste
async function transcribeAudio(audioPath) {
    const fs = await import('fs');
    const OpenAI = (await import('openai')).default;
    
    if (!fs.existsSync(audioPath)) {
        throw new Error(`Audio file not found: ${audioPath}`);
    }
    
    const openai = new OpenAI({ 
        apiKey: process.env.OPENAI_API_KEY 
    });
    
    try {
        console.log(`🎤 Sending ${audioPath} to Whisper...`);
        const transcription = await openai.audio.transcriptions.create({
            model: 'whisper-1',
            file: fs.createReadStream(audioPath)
        });
        
        console.log(`✅ Whisper transcription completed`);
        return transcription.text;
        
    } catch (error) {
        console.error(`❌ Whisper error:`, error.message);
        throw new Error(`Whisper failed: ${error.message}`);
    }
}

// Fonction de génération de résumé avec Gemini
async function generateSummary(transcript) {
    try {
        console.log(`🤖 Generating summary with Gemini...`);

        const summaryPrompt = `You are OMELY, a friendly AI learning assistant. Please create a comprehensive, well-structured summary of this video transcript.

IMPORTANT FORMATTING REQUIREMENTS:
- Use **bold** for key concepts and important terms
- Use *italic* for emphasis and secondary points
- Structure with clear headings using **Main Topic** format
- Use bullet points (•) for lists of key points
- Break content into logical paragraphs
- Make it engaging and easy to read

Focus on:
- **Main topics** and key concepts discussed
- **Important insights** and takeaways
- **Practical applications** if mentioned
- **Key arguments** or points made
- **Conclusions** or final thoughts

Keep it comprehensive but well-organized. The summary should be informative and engaging.

Transcript to summarize:
${transcript}

Please provide a clear, well-structured summary with proper formatting:`;

        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-goog-api-key': 'AIzaSyBCHiby_RSpR2vNbcj-TFov7OgJOBCwX3I',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: summaryPrompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.6,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 800,
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Gemini API Response Error:', errorText);
            throw new Error(`Gemini API failed: ${response.status} - ${errorText}`);
        }

        const data = await response.json();

        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            console.log(`✅ Gemini summary generated successfully`);
            return data.candidates[0].content.parts[0].text;
        } else {
            throw new Error('Invalid response format from Gemini API');
        }

    } catch (error) {
        console.error(`❌ Gemini summary generation error:`, error.message);
        throw new Error(`Summary generation failed: ${error.message}`);
    }
}

// ============================================================================
// 🎯 NOUVEAU SYSTÈME UNIVERSEL - DÉTECTION ET TRAITEMENT MULTI-FORMAT
// ============================================================================

// Module de détection de contenu
export class ContentDetector {
    static detectContentType(input) {
        // 1. Détection d'URL YouTube
        if (this.isYouTubeUrl(input)) {
            return {
                type: 'youtube',
                source: 'url',
                format: 'video',
                url: input
            };
        }

        // 2. Détection d'URL de fichier (si c'est une URL pointant vers un fichier)
        if (this.isFileUrl(input)) {
            const fileInfo = this.parseFileUrl(input);
            return {
                type: 'file_url',
                source: 'url',
                ...fileInfo,
                url: input
            };
        }

        // 3. Détection de fichier uploadé (objet File)
        if (input instanceof Object && input.name && input.type) {
            return this.detectUploadedFile(input);
        }

        // 4. Par défaut, considérer comme texte brut
        return {
            type: 'text',
            source: 'direct',
            format: 'txt',
            content: input
        };
    }

    static isYouTubeUrl(url) {
        const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        return youtubeRegex.test(url);
    }

    static isFileUrl(url) {
        // Vérifie si l'URL pointe vers un fichier direct
        const fileExtensions = ['.mp3', '.wav', '.flac', '.aac', '.mp4', '.avi', '.mov', '.mkv', '.pdf', '.txt', '.doc', '.docx'];
        return fileExtensions.some(ext => url.toLowerCase().includes(ext));
    }

    static parseFileUrl(url) {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        const filename = pathname.split('/').pop() || '';
        const extension = filename.split('.').pop()?.toLowerCase() || '';

        return this.getFileInfo(filename, extension, url);
    }

    static detectUploadedFile(file) {
        const filename = file.name;
        const mimeType = file.type;
        const extension = filename.split('.').pop()?.toLowerCase() || '';

        return {
            type: 'file_upload',
            source: 'upload',
            file: file,
            ...this.getFileInfo(filename, extension, null, mimeType)
        };
    }

    static getFileInfo(filename, extension, url = null, mimeType = null) {
        const audioFormats = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a'];
        const videoFormats = ['mp4', 'avi', 'mov', 'mkv', 'webm', 'flv', 'wmv'];
        const documentFormats = ['pdf', 'txt', 'doc', 'docx', 'rtf', 'odt'];
        const imageFormats = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff'];

        if (audioFormats.includes(extension)) {
            return {
                format: 'audio',
                subtype: extension,
                filename: filename,
                mimeType: mimeType || `audio/${extension}`,
                url: url
            };
        }

        if (videoFormats.includes(extension)) {
            return {
                format: 'video',
                subtype: extension,
                filename: filename,
                mimeType: mimeType || `video/${extension}`,
                url: url
            };
        }

        if (documentFormats.includes(extension)) {
            return {
                format: 'document',
                subtype: extension,
                filename: filename,
                mimeType: mimeType || `application/${extension}`,
                url: url
            };
        }

        if (imageFormats.includes(extension)) {
            return {
                format: 'image',
                subtype: extension,
                filename: filename,
                mimeType: mimeType || `image/${extension}`,
                url: url
            };
        }

        // Format inconnu
        return {
            format: 'unknown',
            subtype: extension,
            filename: filename,
            mimeType: mimeType || 'application/octet-stream',
            url: url
        };
    }
}

// Pipeline unifié de traitement de contenu
export class ContentProcessor {
    constructor() {
        this.tempDir = './storage';
        this.ensureTempDir();
    }

    async ensureTempDir() {
        const fs = await import('fs');
        if (!fs.existsSync(this.tempDir)) {
            fs.mkdirSync(this.tempDir, { recursive: true });
        }
    }

    // 🎯 Fonction principale unifiée
    async processContent(input, options = {}) {
        console.log(`🚀 Starting universal content processing...`);

        try {
            // Étape 1: Détection automatique du type de contenu
            console.log(`🔍 Detecting content type...`);
            const contentInfo = ContentDetector.detectContentType(input);
            console.log(`📋 Content detected: ${contentInfo.type} (${contentInfo.format})`);

            // Étape 2: Extraction du texte selon le type
            console.log(`📖 Extracting text content...`);
            const extractedText = await this.extractText(contentInfo);

            if (!extractedText || extractedText.trim().length === 0) {
                throw new Error('No text content could be extracted from the input');
            }

            // Étape 3: Génération du résumé avec Gemini
            console.log(`🤖 Generating summary...`);
            const summary = await this.generateSummary(extractedText, contentInfo);

            // Étape 4: Métadonnées supplémentaires
            const metadata = await this.extractMetadata(contentInfo);

            return {
                success: true,
                contentType: contentInfo,
                text: extractedText,
                summary: summary,
                metadata: metadata,
                processedAt: new Date().toISOString()
            };

        } catch (error) {
            console.error(`❌ Content processing failed:`, error.message);
            return {
                success: false,
                error: error.message,
                contentType: null,
                text: null,
                summary: null,
                metadata: null,
                processedAt: new Date().toISOString()
            };
        }
    }

    // Extraction de texte selon le type de contenu
    async extractText(contentInfo) {
        switch (contentInfo.type) {
            case 'youtube':
                return await this.extractYouTubeAudio(contentInfo.url);

            case 'file_url':
            case 'file_upload':
                return await this.extractFileContent(contentInfo);

            case 'text':
                return contentInfo.content;

            default:
                throw new Error(`Unsupported content type: ${contentInfo.type}`);
        }
    }

    // Extraction audio YouTube (méthode existante)
    async extractYouTubeAudio(url) {
        const audioPath = await downloadAudio(url, 'universal');
        const transcription = await transcribeAudio(audioPath);
        return transcription;
    }

    // Extraction de contenu depuis fichiers
    async extractFileContent(contentInfo) {
        switch (contentInfo.format) {
            case 'audio':
                return await this.extractAudioContent(contentInfo);

            case 'video':
                return await this.extractVideoContent(contentInfo);

            case 'document':
                return await this.extractDocumentContent(contentInfo);

            case 'image':
                throw new Error('Image processing not implemented yet');

            default:
                throw new Error(`Unsupported file format: ${contentInfo.format}`);
        }
    }

    // Extraction audio depuis fichiers
    async extractAudioContent(contentInfo) {
        let audioPath;

        if (contentInfo.source === 'upload') {
            // Fichier uploadé - sauvegarder temporairement
            audioPath = await this.saveUploadedFile(contentInfo.file);
        } else {
            // URL de fichier - télécharger
            audioPath = await this.downloadFile(contentInfo.url);
        }

        // Convertir si nécessaire et transcrire
        const normalizedAudioPath = await this.normalizeAudioFormat(audioPath);
        const transcription = await transcribeAudio(normalizedAudioPath);

        return transcription;
    }

    // Extraction vidéo (extraire l'audio puis transcrire)
    async extractVideoContent(contentInfo) {
        let videoPath;

        if (contentInfo.source === 'upload') {
            videoPath = await this.saveUploadedFile(contentInfo.file);
        } else {
            videoPath = await this.downloadFile(contentInfo.url);
        }

        // Extraire l'audio de la vidéo
        const audioPath = await this.extractAudioFromVideo(videoPath);
        const transcription = await transcribeAudio(audioPath);

        return transcription;
    }

    // Extraction de documents texte
    async extractDocumentContent(contentInfo) {
        let filePath;

        if (contentInfo.source === 'upload') {
            filePath = await this.saveUploadedFile(contentInfo.file);
        } else {
            filePath = await this.downloadFile(contentInfo.url);
        }

        return await this.extractTextFromDocument(filePath, contentInfo.subtype);
    }

    // Génération de résumé adaptée au type de contenu
    async generateSummary(text, contentInfo) {
        const contextMap = {
            youtube: "YouTube video",
            audio: "audio file",
            video: "video file",
            document: "document"
        };

        const contentType = contextMap[contentInfo.format] || "content";
        const summaryPrompt = `You are OMELY, a friendly AI learning assistant. Please create a comprehensive, well-structured summary of this ${contentType}.

IMPORTANT FORMATTING REQUIREMENTS:
- Use **bold** for key concepts and important terms
- Use *italic* for emphasis and secondary points
- Structure with clear headings using **Main Topic** format
- Use bullet points (•) for lists of key points
- Break content into logical paragraphs
- Make it engaging and easy to read

Focus on:
- **Main topics** and key concepts discussed
- **Important insights** and takeaways
- **Practical applications** if mentioned
- **Key arguments** or points made
- **Conclusions** or final thoughts

Keep it comprehensive but well-organized. The summary should be informative and engaging.

Content to summarize:
${text}

Please provide a clear, well-structured summary with proper formatting:`;

        return await this.callGeminiAPI(summaryPrompt);
    }

    // Métadonnées selon le type de contenu
    async extractMetadata(contentInfo) {
        const metadata = {
            contentType: contentInfo.type,
            format: contentInfo.format,
            subtype: contentInfo.subtype,
            filename: contentInfo.filename || null,
            duration: null,
            language: 'unknown'
        };

        // Essayer d'extraire des métadonnées spécifiques
        try {
            if (contentInfo.format === 'audio' || contentInfo.format === 'video') {
                // Utiliser FFprobe pour extraire la durée
                metadata.duration = await this.getMediaDuration(contentInfo);
            }
        } catch (error) {
            console.warn('Could not extract metadata:', error.message);
        }

        return metadata;
    }

    // --- Méthodes utilitaires ---

    async saveUploadedFile(file) {
        const fs = await import('fs');
        const path = await import('path');

        const fileName = `${Date.now()}_${file.name}`;
        const filePath = path.join(this.tempDir, fileName);

        const buffer = await file.arrayBuffer();
        fs.writeFileSync(filePath, Buffer.from(buffer));

        return filePath;
    }

    async downloadFile(url) {
        const fs = await import('fs');
        const path = await import('path');
        const { execFile } = await import('node:child_process');

        const urlObj = new URL(url);
        const fileName = path.basename(urlObj.pathname) || `downloaded_${Date.now()}`;
        const filePath = path.join(this.tempDir, fileName);

        return new Promise((resolve, reject) => {
            execFile('curl', ['-L', '-o', filePath, url], (error) => {
                if (error) {
                    reject(new Error(`Download failed: ${error.message}`));
                } else if (fs.existsSync(filePath)) {
                    resolve(filePath);
                } else {
                    reject(new Error('Downloaded file not found'));
                }
            });
        });
    }

    async normalizeAudioFormat(audioPath) {
        // Utiliser FFmpeg pour normaliser le format audio
        const fs = await import('fs');
        const path = await import('path');
        const { execFile } = await import('node:child_process');

        const ext = path.extname(audioPath);
        if (ext === '.mp3') {
            return audioPath; // Déjà au bon format
        }

        const normalizedPath = audioPath.replace(ext, '.mp3');

        return new Promise((resolve, reject) => {
            execFile('ffmpeg', [
                '-i', audioPath,
                '-acodec', 'libmp3lame',
                '-ab', '128k',
                '-y', // Overwrite
                normalizedPath
            ], (error) => {
                if (error) {
                    reject(new Error(`Audio normalization failed: ${error.message}`));
                } else {
                    resolve(normalizedPath);
                }
            });
        });
    }

    async extractAudioFromVideo(videoPath) {
        const fs = await import('fs');
        const path = await import('path');
        const { execFile } = await import('node:child_process');

        const audioPath = videoPath.replace(path.extname(videoPath), '.mp3');

        return new Promise((resolve, reject) => {
            execFile('ffmpeg', [
                '-i', videoPath,
                '-vn', // No video
                '-acodec', 'libmp3lame',
                '-ab', '128k',
                '-y',
                audioPath
            ], (error) => {
                if (error) {
                    reject(new Error(`Audio extraction failed: ${error.message}`));
                } else {
                    resolve(audioPath);
                }
            });
        });
    }

    async extractTextFromDocument(filePath, format) {
        const fs = await import('fs');

        switch (format) {
            case 'txt':
                return fs.readFileSync(filePath, 'utf8');

            case 'pdf':
                return await this.extractTextFromPDF(filePath);

            case 'docx':
                return await this.extractTextFromDOCX(filePath);

            default:
                throw new Error(`Document format not supported: ${format}`);
        }
    }

    async extractTextFromPDF(filePath) {
        // Placeholder - nécessite PyPDF2 ou pdf-parse
        throw new Error('PDF extraction not implemented yet. Install pdf-parse dependency.');
    }

    async extractTextFromDOCX(filePath) {
        // Placeholder - nécessite mammoth ou similar
        throw new Error('DOCX extraction not implemented yet. Install mammoth dependency.');
    }

    async getMediaDuration(contentInfo) {
        // Placeholder - utiliser ffprobe pour obtenir la durée
        return null;
    }

    async callGeminiAPI(prompt) {
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-goog-api-key': 'AIzaSyBCHiby_RSpR2vNbcj-TFov7OgJOBCwX3I',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.6,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 800,
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gemini API failed: ${response.status} - ${errorText}`);
        }

        const data = await response.json();

        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        } else {
            throw new Error('Invalid response format from Gemini API');
        }
    }
}

// Instance globale du processeur
const contentProcessor = new ContentProcessor();

// Fonction d'export pour l'API
export { contentProcessor };