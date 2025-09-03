// Test ULTRA-RAPIDE de la génération de quiz avec OpenAI GPT-4 Mini
import { createChatCompletion } from './omely-backend/utils/openaiService.js';

const testQuizGeneration = async () => {
  const testSummary = `
📚 **7 HABITUDES EFFICACES**
🔑 **PRINCIPES CLÉS:**
1. Proactif - Responsabilité
2. Vision claire - Objectifs
3. Gestion temps - Priorités
4. Solutions gagnant-gagnant
5. Écoute active
6. Travail d'équipe
7. Développement continu

⚡ **MENTALITÉS:**
Riches: Pensent principes, vision claire, focus important
Pauvres: Réactifs, confus, distraits par urgence
`;

  try {
    console.log('⚡ TEST ULTRA-RAPIDE - Génération quiz avec OpenAI GPT-4 Mini...');
    const startTime = Date.now();

    // PROMPT ULTRA-COURT POUR VITESSE MAXIMALE
    const quizPrompt = `QUIZ JSON sur les 7 habitudes efficaces:

${testSummary}

CRÉEZ 3 QUESTIONS RAPIDES:
Format: {"title":"7 Habitudes","questions":[{"question":"Q?","options":{"A":"A","B":"B","C":"C","D":"D"},"correctAnswer":"A","explanation":"Exp"}]} `;

    const messages = [
      { role: 'system', content: 'Quiz JSON rapide.' },
      { role: 'user', content: quizPrompt }
    ];

    console.log('🚀 Envoi requête optimisée...');
    const quizResponse = await createChatCompletion(messages, {
      max_tokens: 800,   // ULTRA-RÉDUIT
      temperature: 0.1,  // TRÈS BAS pour rapidité
      model: 'deepseek-chat'
    });

    const generationTime = Date.now() - startTime;
    console.log(`⚡ QUIZ GÉNÉRÉ EN ${generationTime}ms !`);

    // Parser le JSON
    try {
      const jsonMatch = quizResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const quizData = JSON.parse(jsonMatch[0]);
        console.log('🎯 RÉSULTAT:', {
          titre: quizData.title,
          questions: quizData.questions?.length || 0,
          tempsGeneration: `${generationTime}ms`
        });
      } else {
        console.log('📝 Réponse brute:', quizResponse.substring(0, 300));
      }
    } catch (parseError) {
      console.log('📝 Réponse reçue:', quizResponse.substring(0, 200));
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
};

// Lancer le test ultra-rapide
testQuizGeneration();
