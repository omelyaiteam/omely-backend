// Test serveur local simple
const express = require('express');
const app = express();

app.use(require('cors')());
app.use(express.json());

// Endpoint quiz simple
app.post('/api/generate-quiz', (req, res) => {
  console.log('🧠 QUIZ ENDPOINT CALLED LOCALLY');

  const { summaryContent } = req.body;

  if (!summaryContent) {
    return res.status(400).json({
      success: false,
      error: 'Contenu de résumé manquant'
    });
  }

  const quiz = {
    success: true,
    quiz: {
      title: "Quiz OMELY - Test Local",
      description: "Quiz de test fonctionnel",
      questions: [{
        id: 1,
        question: "Test question locale?",
        options: { A: "Option A", B: "Option B", C: "Option C", D: "Option D" },
        correctAnswer: "A",
        explanation: "Test explanation locale",
        difficulty: "facile"
      }]
    }
  };

  res.json(quiz);
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Local server running' });
});

// Démarrer le serveur local
app.listen(3001, () => {
  console.log('🚀 Serveur local démarré sur port 3001');
  console.log('🧠 Test: POST http://localhost:3001/api/generate-quiz');

  // Test automatique
  testLocalAPI();
});

// Test de l'API locale
const testLocalAPI = async () => {
  try {
    console.log('🧠 Test de l\'API Quiz locale...');

    const response = await fetch('http://localhost:3001/api/generate-quiz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        summaryContent: 'Test content'
      })
    });

    console.log('📡 Statut local:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ API locale fonctionne !');
      console.log('📊 Données:', JSON.stringify(data, null, 2));
    } else {
      console.error('❌ Erreur locale:', response.status);
    }

  } catch (error) {
    console.error('❌ Erreur test local:', error.message);
  }
};
