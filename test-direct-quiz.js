// Test direct de la génération de quiz avec OpenAI GPT-4 Mini
import { createChatCompletion } from './omely-backend/utils/openaiService.js';

const testQuizGeneration = async () => {
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

**Riches :** Pensent en termes de principes | **Pauvres :** Sont réactifs aux événements
**Riches :** Ont une vision claire | **Pauvres :** Sont confus sur leurs objectifs
**Riches :** Se concentrent sur l'important | **Pauvres :** Sont distraits par l'urgence
`;

  try {
    console.log('🧠 Test direct génération quiz avec OpenAI GPT-4 Mini...');

    const quizPrompt = `Vous êtes un expert en pédagogie et en génération de quiz. Votre mission est de créer un quiz interactif et pédagogique basé sur le résumé fourni.

RÉSUMÉ À ANALYSER:
${testSummary}

INSTRUCTIONS POUR LE QUIZ:
1. Créez 5 questions de quiz basées sur ce résumé
2. Chaque question doit avoir 4 options (A, B, C, D)
3. Une seule bonne réponse par question
4. Incluez une explication pour chaque réponse
5. Utilisez le format JSON suivant:

{
  "title": "Quiz - Les 7 habitudes",
  "description": "Testez vos connaissances sur les principes d'efficacité",
  "questions": [
    {
      "id": 1,
      "question": "Quelle est la première habitude des gens très efficaces?",
      "options": {
        "A": "Soyez proactif",
        "B": "Commencez avec une fin en tête",
        "C": "Donnez la priorité aux priorités",
        "D": "Pensez gagnant-gagnant"
      },
      "correctAnswer": "A",
      "explanation": "La première habitude est d'être proactif et de prendre la responsabilité de ses actions.",
      "difficulty": "facile"
    }
  ]
}

Générez maintenant le quiz JSON:`;

    const messages = [
      { role: 'system', content: 'Vous êtes un expert en création de quiz pédagogiques.' },
      { role: 'user', content: quizPrompt }
    ];

    const quizResponse = await createChatCompletion(messages, {
      max_tokens: 2000,
      temperature: 0.7,
      model: 'deepseek-chat'
    });

    console.log('✅ Quiz généré avec succès!');
    console.log('📊 Réponse OpenAI:', quizResponse.substring(0, 500) + '...');

    // Parser le JSON
    try {
      const jsonMatch = quizResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const quizData = JSON.parse(jsonMatch[0]);
        console.log('🎯 Quiz analysé:', {
          title: quizData.title,
          questionsCount: quizData.questions?.length || 0,
          premiereQuestion: quizData.questions?.[0]?.question
        });
      }
    } catch (parseError) {
      console.log('⚠️ Erreur parsing JSON, mais réponse reçue:', quizResponse.substring(0, 200));
    }

  } catch (error) {
    console.error('❌ Erreur génération quiz:', error.message);
  }
};

// Lancer le test
testQuizGeneration();
