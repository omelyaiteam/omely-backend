// Test rapide de l'API Pré-test
const testPreTestAPI = async () => {
  // Définir une clé API fictive pour les tests
  process.env.OPENAI_API_KEY = 'sk-test-key-for-development-only';
  const testSummary = `
📚 **RÉSUMÉ TEST PRÉ-TEST**
📖 **Les 7 habitudes des gens très efficaces** - TEST RAPIDE

## 🔑 **PRINCIPES CLÉS**
• Être proactif
• Commencer avec une fin en tête
• Mettre la priorité aux priorités
• Penser gagnant-gagnant
• Chercher d'abord à comprendre, puis à être compris
• Créer la synergie
• Aiguiser la scie

## ⚡ **POINTS IMPORTANTS**
• Les habitudes sont des pratiques répétées qui déterminent notre efficacité
• La maturité émotionnelle et l'indépendance sont essentielles
• La synergie crée des résultats supérieurs à la somme des parties
`;

  try {
    console.log('🧠 Test de l\'API Pré-test...');

    const response = await fetch('http://localhost:3002/api/generate-pretest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        summaryContent: testSummary,
        summaryId: 'test-pretest-summary-123'
      })
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ API Pré-test fonctionne !');
    console.log('📊 Données reçues:', {
      success: data.success,
      questionsCount: data.pretest?.questions?.length,
      processingTime: data.metadata?.processingTime
    });

    if (data.pretest?.questions) {
      console.log('🎯 Exemple de question pré-test 1:');
      console.log(data.pretest.questions[0]);
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
};

// Lancer le test
testPreTestAPI();
