// Test rapide de l'API Quiz
const testQuizAPI = async () => {
  // Définir une clé API fictive pour les tests
  process.env.OPENAI_API_KEY = 'sk-test-key-for-development-only';
  const testSummary = `
📚 **RÉSUMÉ COMPLET PROFESSIONNEL**
📖 **Les 7 habitudes des gens très efficaces** - 100% VALEUR CAPTURÉE

## 🔑 **PRINCIPES D'ENRICHISSEMENT CLÉS**
Les règles fondamentales extraites pour une efficacité maximale.

**1.** Soyez proactif - Prenez la responsabilité de vos actions
**2.** Commencez avec une fin en tête - Définissez votre vision
**3.** Donnez la priorité aux priorités - Gérez votre temps efficacement
**4.** Pensez gagnant-gagnant - Cherchez des solutions bénéfiques
**5.** Cherchez d'abord à comprendre - Écoutez activement
**6.** Créez la synergie - Travaillez en équipe efficacement
**7.** Aiguisez la scie - Développez-vous continuellement

## ⚡ **MENTALITÉS : RICHES vs PAUVRES**
Les différences de pensée entre les personnes efficaces et inefficaces.

| 💰 **LES EFFICACES** | 💸 **LES INEFFICACES** |
|-------------------|---------------------|
| ✅ Pensent en termes de principes | ❌ Sont réactifs aux événements |
| ✅ Ont une vision claire | ❌ Sont confus sur leurs objectifs |
| ✅ Se concentrent sur l'important | ❌ Sont distraits par l'urgence |
| ✅ Cherchent des solutions mutuelles | ❌ Pensent en termes de compromis |

## 💰 **TECHNIQUES FINANCIÈRES ESSENTIELLES**
Les méthodes qui génèrent l'efficacité personnelle et professionnelle.

### 📈 **Gestion du temps**
• Matrice Eisenhower pour prioriser les tâches
• Programmation hebdomadaire pour planifier
• Délégation efficace des responsabilités
`;

  try {
    console.log('🧠 Test de l\'API Quiz...');

    const response = await fetch('http://localhost:3002/api/generate-quiz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        summaryContent: testSummary,
        summaryId: 'test-summary-123'
      })
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ API Quiz fonctionne !');
    console.log('📊 Données reçues:', {
      success: data.success,
      questionsCount: data.quiz?.questions?.length,
      processingTime: data.metadata?.processingTime
    });

    if (data.quiz?.questions) {
      console.log('🎯 Exemple de question 1:');
      console.log(data.quiz.questions[0]);
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
};

// Lancer le test
testQuizAPI();
