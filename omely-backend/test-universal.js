// test-universal.js - Script de test pour le système universel
// Lancez avec : node test-universal.js

import { ContentDetector, ContentProcessor } from './queue.js';

async function testSystem() {
    console.log('🧪 Test du système universel OMELY\n');

    const testCases = [
        {
            name: 'YouTube URL',
            input: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            expected: { type: 'youtube', format: 'video' }
        },
        {
            name: 'Direct MP3 URL',
            input: 'https://example.com/audio.mp3',
            expected: { type: 'file_url', format: 'audio' }
        },
        {
            name: 'Direct PDF URL',
            input: 'https://example.com/document.pdf',
            expected: { type: 'file_url', format: 'document' }
        },
        {
            name: 'Texte brut',
            input: 'Ceci est un test de résumé de texte brut.',
            expected: { type: 'text', format: 'txt' }
        },
        {
            name: 'Fichier uploadé MP3',
            input: { name: 'test.mp3', type: 'audio/mpeg', size: 1024 },
            expected: { type: 'file_upload', format: 'audio' }
        },
        {
            name: 'Fichier uploadé PDF',
            input: { name: 'document.pdf', type: 'application/pdf', size: 2048 },
            expected: { type: 'file_upload', format: 'document' }
        }
    ];

    console.log('🔍 Test de la détection de contenu :\n');

    for (const testCase of testCases) {
        try {
            const result = ContentDetector.detectContentType(testCase.input);

            const success = result.type === testCase.expected.type &&
                          result.format === testCase.expected.format;

            console.log(`✅ ${testCase.name}:`);
            console.log(`   Détecté: ${result.type} (${result.format})`);
            console.log(`   Attendu: ${testCase.expected.type} (${testCase.expected.format})`);
            console.log(`   ${success ? '✅ CORRECT' : '❌ ÉCHEC'}\n`);

        } catch (error) {
            console.log(`❌ ${testCase.name}: ERREUR - ${error.message}\n`);
        }
    }

    console.log('🚀 Test du pipeline complet avec texte :\n');

    try {
        const contentProcessor = new ContentProcessor();
        const result = await contentProcessor.processContent('Ceci est un test simple pour vérifier le pipeline.');

        console.log('✅ Pipeline test réussi:');
        console.log(`   Succès: ${result.success}`);
        console.log(`   Longueur texte: ${result.text?.length || 0} caractères`);
        console.log(`   Résumé généré: ${!!result.summary}`);
        console.log(`   Métadonnées: ${JSON.stringify(result.metadata, null, 2)}`);

    } catch (error) {
        console.log(`❌ Pipeline test échoué: ${error.message}`);
    }

    console.log('\n🎉 Tests terminés !');
}

// Lancer les tests si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
    testSystem().catch(console.error);
}

export { testSystem };
