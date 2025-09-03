// TEST SIMPLE - SYSTÈME D'EXTRACTION
const testText = `
LES SECRETS D'UN ESPRIT MILLIONNAIRE
T. HARV EKER

CHAPITRE 1
VOTRE PLAN FINANCIER INTÉRIEUR

Si votre "plan financier" inconscient n'est pas "réglé" sur la réussite, rien de ce que vous apprendrez, rien de ce que vous saurez et rien de ce que vous accomplirez ne fera réellement de différence.

PRINCIPE CLÉ #1 : Votre plan financier intérieur détermine votre destinée financière.

Les riches pensent différemment des pauvres et de la classe moyenne. Voici les 17 différences principales :

DIFFÉRENCE #1 : Les riches croient : "Je crée ma vie." Les pauvres croient : "La vie m'arrive."
DIFFÉRENCE #2 : Les riches jouent au jeu de l'argent pour gagner. Les pauvres jouent au jeu de l'argent pour ne pas perdre.
DIFFÉRENCE #3 : Les riches s'engagent à être riches. Les pauvres veulent être riches.

CITATION IMPORTANTE : "Ne croyez pas un traître mot de ce que je vous dis. Testez-le dans votre propre vie."

DONNÉES IMPORTANTES :
- 80% des millionnaires sont des entrepreneurs
- 90% des millionnaires ont investi dans l'immobilier
- 95% des millionnaires lisent au moins 30 minutes par jour
`;

async function testSimple() {
  console.log('🧪 TEST SIMPLE - SYSTÈME D\'EXTRACTION');
  console.log('=====================================');
  
  try {
    console.log('📤 Test du endpoint chat...');
    
    const response = await fetch('https://omely-node-backend.fly.dev/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `Analyse ce texte et crée un résumé complet: ${testText}`,
        conversationHistory: []
      })
    });
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    
    console.log('✅ Réponse reçue !');
    console.log(`📊 Statut: ${result.status}`);
    console.log(`⏱️ Temps: ${result.metadata?.processingTime}ms`);
    
    if (result.status === 'success') {
      console.log('\n📖 RÉPONSE DU SYSTÈME:');
      console.log('=' .repeat(50));
      console.log(result.response);
      console.log('=' .repeat(50));
      
      // Vérification rapide
      const response = result.response;
      const hasPrinciples = response.includes('🔑') || response.includes('PRINCIPE');
      const hasDifferences = response.includes('⚡') || response.includes('différence');
      const hasQuotes = response.includes('💬') || response.includes('citation');
      
      console.log(`\n📊 VÉRIFICATION:`);
      console.log(`✅ Principes: ${hasPrinciples ? 'OUI' : 'NON'}`);
      console.log(`✅ Différences: ${hasDifferences ? 'OUI' : 'NON'}`);
      console.log(`✅ Citations: ${hasQuotes ? 'OUI' : 'NON'}`);
      
      if (hasPrinciples && hasDifferences) {
        console.log('🎉 SUCCÈS: Le système fonctionne parfaitement !');
      } else {
        console.log('⚠️ ATTENTION: Certains éléments manquent');
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testSimple();
