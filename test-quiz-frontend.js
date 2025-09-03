// Test rapide de l'API Quiz depuis le frontend
const testQuizAPI = async () => {
  const testSummary = `
📚 **RÉSUMÉ TEST**
📖 **Test Document** - TEST QUIZ GENERATION

## 🔑 **PRINCIPES CLÉS**
**1.** Premier principe important pour tester
**2.** Deuxième principe essentiel
**3.** Troisième concept fondamental

## ⚡ **POINTS IMPORTANTS**
• Point 1 à retenir
• Point 2 à maîtriser
• Point 3 à appliquer
`;

  try {
    console.log('🧠 Test de l\'API Quiz depuis le frontend...');

    // Test d'abord en local pour voir si ça fonctionne
    console.log('🔍 Test local d\'abord...');
    try {
      const localResponse = await fetch('http://localhost:3000/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summaryContent: testSummary })
      });
      if (localResponse.ok) {
        const localData = await localResponse.json();
        console.log('✅ LOCAL fonctionne ! Données:', JSON.stringify(localData, null, 2));
        return; // Sortir si local fonctionne
      }
    } catch (localError) {
      console.log('⚠️ Local pas dispo, test distant...');
    }

    const response = await fetch('https://omely-node-backend.fly.dev/api/generate-quiz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        summaryContent: testSummary
      })
    });

    console.log('📡 Statut de la réponse:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur HTTP:', response.status, errorText);
      return;
    }

    const data = await response.json();
    console.log('✅ API Quiz fonctionne !');
    console.log('📊 Données reçues:', {
      success: data.success,
      hasQuiz: !!data.quiz,
      questionsCount: data.quiz?.questions?.length,
      title: data.quiz?.title
    });

    if (data.quiz?.questions && data.quiz.questions.length > 0) {
      console.log('🎯 Première question:');
      console.log(JSON.stringify(data.quiz.questions[0], null, 2));
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    console.error('🔍 Détails:', error);
  }
};

// Lancer le test
testQuizAPI();
