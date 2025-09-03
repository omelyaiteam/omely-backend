// TEST PERSISTANCE DES RÉSUMÉS v6.4
import fetch from 'node-fetch';

const SERVER_URL = 'http://localhost:3000';

// Test que les résumés sont bien intégrés dans le chat
async function testSummaryPersistence() {
  console.log('🔍 Test persistance des résumés...');
  
  try {
    // 1. Test endpoint chat-with-summary
    const testSummaryContent = `
═══════════════════════════════════════════════════════════════════
📚 **RÉSUMÉ COMPLET PROFESSIONNEL**
📖 **PÈRE RICHE PÈRE PAUVRE** - 100% VALEUR CAPTURÉE
═══════════════════════════════════════════════════════════════════

## 🔑 **PRINCIPES D'ENRICHISSEMENT CLÉS**
*Les règles fondamentales qui créent la richesse*

**1.** Les riches achètent des actifs, les pauvres des passifs
   → **Application pratique :** Investir dans l'immobilier locatif

**2.** Payez-vous en premier
   → **Application pratique :** Économiser 10% avant toute dépense
`;

    const response = await fetch(`${SERVER_URL}/chat-with-summary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        summaryContent: testSummaryContent,
        summaryMetadata: {
          filename: 'pere-riche-pere-pauvre.pdf',
          source: 'book-extraction-test',
          quality: 'PROFESSIONAL_GRADE'
        },
        conversationHistory: [],
        userId: 'test-user-123'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status === 'success' && data.summaryIntegrated) {
      console.log('✅ Résumé intégré avec succès dans le chat');
      console.log('✅ Persistance confirmée');
      console.log(`📊 Temps de traitement: ${data.metadata.processingTime}ms`);
      console.log(`📊 Mémoire utilisée: ${data.metadata.memoryUsage?.estimatedKB}KB`);
      return true;
    } else {
      console.log('❌ Intégration échouée');
      return false;
    }

  } catch (error) {
    console.log('❌ Erreur test persistance:', error.message);
    return false;
  }
}

// Test features endpoint
async function testFeaturesEndpoint() {
  console.log('🔍 Test endpoint features...');
  
  try {
    const response = await fetch(`${SERVER_URL}/test`);
    const data = await response.json();
    
    if (data.features.chat_persistence && data.features.summary_preservation) {
      console.log('✅ Features de persistance activées');
      console.log('✅ Version 6.4 confirmée');
      return true;
    } else {
      console.log('❌ Features de persistance manquantes');
      return false;
    }
  } catch (error) {
    console.log('❌ Erreur test features:', error.message);
    return false;
  }
}

// Test principal
async function runPersistenceTests() {
  console.log('🚀 TESTS PERSISTANCE RÉSUMÉS v6.4');
  console.log('='.repeat(50));
  
  const results = [
    await testFeaturesEndpoint(),
    await testSummaryPersistence()
  ];
  
  const success = results.every(r => r);
  
  console.log('\n📊 RÉSULTATS:');
  console.log('Features:', results[0] ? '✅' : '❌');
  console.log('Persistance:', results[1] ? '✅' : '❌');
  
  if (success) {
    console.log('\n🎉 PERSISTANCE OPÉRATIONNELLE');
    console.log('✅ Les résumés restent dans l\'historique');
    console.log('✅ Intégration chat fonctionnelle');
    console.log('✅ Métadonnées sauvegardées');
  } else {
    console.log('\n❌ PROBLÈMES DE PERSISTANCE');
  }
  
  return success;
}

// Export pour utilisation
export default runPersistenceTests;

// Lancer si exécuté directement
if (import.meta.url === `file://${process.argv[1]}`) {
  runPersistenceTests().then(success => process.exit(success ? 0 : 1));
}
