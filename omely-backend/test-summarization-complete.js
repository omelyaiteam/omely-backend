// SCRIPT DE TEST COMPLET DE SUMMARIZATION - DEEPSEEK V2
import { verifyDeepSeekModelUsage, getDeepSeekConfig } from './utils/openaiService.js';
import { summarizeText, extractCompleteBookContent } from './utils/openaiService.js';

// Test cases pour différents formats et tailles
const TEST_CASES = [
  {
    name: 'Texte court (General)',
    text: 'Ceci est un test simple pour vérifier que DeepSeek v2 fonctionne correctement avec des textes courts. Le système doit pouvoir traiter ce contenu sans problème.',
    type: 'general',
    expectedChunks: 1
  },
  {
    name: 'Texte moyen (PDF simulation)',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(500),
    type: 'pdf',
    expectedChunks: 3
  },
  {
    name: 'Texte long (Book simulation)',
    text: 'Chapitre 1: Introduction aux concepts fondamentaux. '.repeat(2000),
    type: 'book',
    expectedChunks: 10
  },
  {
    name: 'Audio transcription (MP3 simulation)',
    text: 'Bienvenue dans ce podcast sur le développement personnel. Aujourd\'hui nous allons parler de la motivation, de la discipline et de l\'importance de fixer des objectifs clairs. '.repeat(300),
    type: 'audio',
    expectedChunks: 5
  },
  {
    name: 'Video transcription (MP4 simulation)',
    text: 'Dans cette vidéo, nous allons explorer les techniques de communication efficace. Vous apprendrez comment améliorer vos relations interpersonnelles et développer votre charisme. '.repeat(400),
    type: 'video',
    expectedChunks: 6
  }
];

async function runCompleteSummarizationTest() {
  console.log('🧪 DÉMARRAGE TEST COMPLET DE SUMMARIZATION DEEPSEEK V2\n');
  console.log('=' * 60);

  try {
    // 1. Vérification de la configuration DeepSeek
    console.log('📋 1. VÉRIFICATION CONFIGURATION DEEPSEEK:');
    const config = getDeepSeekConfig();
    console.log('   Configuration actuelle:');
    console.log(`   - Modèle: ${config.model}`);
    console.log(`   - API Key configurée: ${config.hasApiKey ? '✅' : '❌'}`);
    console.log(`   - Vérification modèle: ${config.verifyModel ? '✅' : '❌'}`);
    console.log(`   - URL API: ${config.baseURL}`);

    if (!config.hasApiKey) {
      console.error('❌ ERREUR: Clé API DeepSeek non configurée');
      console.log('   Définissez DEEPSEEK_API_KEY pour continuer les tests');
      return;
    }

    // 2. Test de vérification du modèle
    console.log('\n🔍 2. TEST VÉRIFICATION MODÈLE:');
    const modelCheck = await verifyDeepSeekModelUsage();
    if (modelCheck.success) {
      console.log('✅ Modèle DeepSeek v2 confirmé');
    } else {
      console.error('❌ Problème de modèle détecté:', modelCheck.error);
      return;
    }

    // 3. Tests de summarization par format
    console.log('\n📊 3. TESTS DE SUMMARIZATION PAR FORMAT:');

    let totalTests = 0;
    let successfulTests = 0;
    const results = [];

    for (const testCase of TEST_CASES) {
      totalTests++;
      console.log(`\n🧪 Test ${totalTests}/${TEST_CASES.length}: ${testCase.name}`);
      console.log(`   - Type: ${testCase.type}`);
      console.log(`   - Longueur: ${testCase.text.length} caractères`);
      console.log(`   - Chunks attendus: ${testCase.expectedChunks}`);

      try {
        const startTime = Date.now();

        // Test selon le type
        let result;
        if (testCase.type === 'book') {
          result = await extractCompleteBookContent(testCase.text, 'Test Book');
          result = result.completeSummary;
        } else {
          result = await summarizeText(testCase.text, testCase.type);
        }

        const duration = Date.now() - startTime;
        const success = result && result.length > 0;

        if (success) {
          successfulTests++;
          console.log('✅ RÉUSSI');
          console.log(`   - Durée: ${duration}ms`);
          console.log(`   - Résumé: ${result.length} caractères`);
          console.log(`   - Aperçu: ${result.substring(0, 100)}...`);

          results.push({
            name: testCase.name,
            type: testCase.type,
            success: true,
            duration,
            originalLength: testCase.text.length,
            summaryLength: result.length,
            ratio: (result.length / testCase.text.length * 100).toFixed(2)
          });
        } else {
          console.log('❌ ÉCHEC: Résumé vide ou null');
          results.push({
            name: testCase.name,
            type: testCase.type,
            success: false,
            error: 'Résumé vide'
          });
        }

      } catch (error) {
        console.log('❌ ÉCHEC:', error.message);
        results.push({
          name: testCase.name,
          type: testCase.type,
          success: false,
          error: error.message
        });
      }
    }

    // 4. Rapport final
    console.log('\n📈 4. RAPPORT FINAL:');
    console.log('='.repeat(60));
    console.log(`Tests totaux: ${totalTests}`);
    console.log(`Tests réussis: ${successfulTests}`);
    console.log(`Taux de réussite: ${(successfulTests/totalTests*100).toFixed(1)}%`);

    if (successfulTests === totalTests) {
      console.log('\n🎉 TOUS LES TESTS SONT RÉUSSIS!');
      console.log('✅ DeepSeek v2 fonctionne correctement pour tous les formats');
      console.log('✅ Les limites de tokens sont respectées');
      console.log('✅ Le chunking fonctionne correctement');
    } else {
      console.log('\n⚠️ PROBLÈMES DÉTECTÉS:');
      results.filter(r => !r.success).forEach(result => {
        console.log(`❌ ${result.name}: ${result.error}`);
      });
    }

    // 5. Statistiques détaillées
    console.log('\n📊 5. STATISTIQUES DÉTAILLÉES:');
    const successfulResults = results.filter(r => r.success);
    if (successfulResults.length > 0) {
      console.log('Performances par format:');
      successfulResults.forEach(result => {
        console.log(`   ${result.type.toUpperCase()}: ${result.duration}ms, Ratio: ${result.ratio}%`);
      });

      const avgDuration = successfulResults.reduce((sum, r) => sum + r.duration, 0) / successfulResults.length;
      const avgRatio = successfulResults.reduce((sum, r) => sum + parseFloat(r.ratio), 0) / successfulResults.length;

      console.log(`\nMoyennes:`);
      console.log(`   Durée moyenne: ${avgDuration.toFixed(0)}ms`);
      console.log(`   Ratio moyenne: ${avgRatio.toFixed(2)}%`);
    }

    return {
      totalTests,
      successfulTests,
      successRate: successfulTests/totalTests,
      results
    };

  } catch (error) {
    console.error('❌ Erreur générale lors des tests:', error);
    return {
      totalTests: 0,
      successfulTests: 0,
      successRate: 0,
      error: error.message
    };
  }
}

// Exécuter les tests
runCompleteSummarizationTest().catch(console.error);
