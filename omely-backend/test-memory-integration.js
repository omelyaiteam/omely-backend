// TEST DE L'INTÉGRATION MÉMOIRE APRÈS MIGRATION OPENAI

const BACKEND_URL = 'http://localhost:3002';

// Test de mémoire avec historique
async function testMemoryIntegration() {
  console.log('\n🧠 TEST MÉMOIRE: Chat avec historique');
  
  try {
    // Simuler un historique de conversation
    const conversationHistory = [
      {
        id: '1',
        role: 'user',
        content: 'Bonjour, je m\'appelle Jean et je veux apprendre l\'investissement.'
      },
      {
        id: '2',
        role: 'assistant',
        content: 'Bonjour Jean ! C\'est formidable que vous vouliez apprendre l\'investissement. C\'est un domaine passionnant qui peut transformer votre avenir financier.'
      },
      {
        id: '3',
        role: 'user',
        content: 'J\'ai lu un livre sur Robert Kiyosaki.'
      },
      {
        id: '4',
        role: 'assistant',
        content: '📚 RÉSUMÉ: Père riche, père pauvre de Robert Kiyosaki\n\n🔑 PRINCIPES CLÉS\n- Les riches achètent des actifs\n- Les pauvres achètent des passifs\n- L\'éducation financière est cruciale'
      }
    ];

    // Nouvelle question qui devrait utiliser la mémoire
    const response = await fetch(`${BACKEND_URL}/chat/completion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemPrompt: 'Tu es OMELY, assistant IA spécialisé dans l\'apprentissage.',
        userMessage: 'Peux-tu me rappeler mon nom et ce que j\'ai lu ?',
        conversationHistory: conversationHistory,
        userId: 'test-user-123',
        options: { max_tokens: 300 }
      })
    });

    const data = await response.json();

    if (data.success) {
      console.log('✅ Réponse avec mémoire:', data.response);
      
      // Vérifier si la réponse contient des éléments de mémoire
      const hasName = data.response.toLowerCase().includes('jean');
      const hasBook = data.response.toLowerCase().includes('kiyosaki') || 
                     data.response.toLowerCase().includes('père riche');
      
      if (hasName && hasBook) {
        console.log('🎉 MÉMOIRE FONCTIONNE PARFAITEMENT !');
        console.log('   ✅ Se souvient du nom (Jean)');
        console.log('   ✅ Se souvient du livre (Kiyosaki)');
        return true;
      } else {
        console.log('⚠️ Mémoire partielle:');
        console.log(`   ${hasName ? '✅' : '❌'} Nom retenu`);
        console.log(`   ${hasBook ? '✅' : '❌'} Livre retenu`);
        return false;
      }
    } else {
      console.log('❌ Erreur réponse:', data.error);
      return false;
    }
  } catch (error) {
    console.log('❌ Erreur test mémoire:', error.message);
    return false;
  }
}

// Test de sauvegarde des résumés
async function testSummaryMemory() {
  console.log('\n📚 TEST MÉMOIRE: Persistance des résumés');
  
  try {
    const conversationHistory = [
      {
        id: '1',
        role: 'assistant',
        content: '📚 RÉSUMÉ COMPLET: Les 7 Habitudes de Stephen Covey\n\n🔑 PRINCIPES CLÉS\n- Soyez proactif\n- Commencez avec la fin en tête\n- Priorités aux priorités'
      },
      {
        id: '2',
        role: 'user',
        content: 'Merci pour ce résumé'
      }
    ];

    const response = await fetch(`${BACKEND_URL}/chat/completion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemPrompt: 'Tu es OMELY.',
        userMessage: 'Quels résumés as-tu créés pour moi ?',
        conversationHistory: conversationHistory,
        userId: 'test-user-456',
        options: { max_tokens: 300 }
      })
    });

    const data = await response.json();

    if (data.success) {
      console.log('✅ Réponse résumés:', data.response.substring(0, 200) + '...');
      
      const hasCovey = data.response.toLowerCase().includes('covey') || 
                      data.response.toLowerCase().includes('habitudes');
      
      if (hasCovey) {
        console.log('🎉 MÉMOIRE RÉSUMÉS FONCTIONNE !');
        console.log('   ✅ Se souvient des résumés créés');
        return true;
      } else {
        console.log('⚠️ Ne se souvient pas des résumés précédents');
        return false;
      }
    } else {
      console.log('❌ Erreur:', data.error);
      return false;
    }
  } catch (error) {
    console.log('❌ Erreur test résumés:', error.message);
    return false;
  }
}

// Fonction principale
async function runMemoryTests() {
  console.log('🧠 TESTS DE MÉMOIRE ET HISTORIQUE');
  console.log('==================================');
  
  const tests = [
    { name: 'Mémoire Conversation', fn: testMemoryIntegration },
    { name: 'Mémoire Résumés', fn: testSummaryMemory }
  ];
  
  let passed = 0;
  
  for (const test of tests) {
    console.log(`\n⏳ Test: ${test.name}...`);
    const success = await test.fn();
    if (success) {
      passed++;
      console.log(`✅ ${test.name}: RÉUSSI`);
    } else {
      console.log(`❌ ${test.name}: ÉCHOUÉ`);
    }
    
    // Pause entre tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📊 RÉSULTATS MÉMOIRE');
  console.log('====================');
  console.log(`✅ Tests réussis: ${passed}/${tests.length}`);
  
  if (passed === tests.length) {
    console.log('\n🎉 MÉMOIRE ET HISTORIQUE FONCTIONNENT PARFAITEMENT !');
    console.log('🔗 La migration OpenAI préserve toute la mémoire');
  } else {
    console.log('\n⚠️ Problèmes détectés dans la mémoire');
  }
  
  return passed === tests.length;
}

// Point d'entrée
runMemoryTests().catch(console.error);
