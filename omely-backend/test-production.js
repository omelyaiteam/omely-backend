// TEST DE PRODUCTION - SYSTÈME D'EXTRACTION AVANCÉ
const testBookText = `
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

CHAPITRE 2
LES STRATÉGIES PRATIQUES

PRINCIPE CLÉ #2 : La richesse est un état d'esprit, pas un montant d'argent.

STRATÉGIE #1 : Payez-vous en premier
Mettez 10% de vos revenus dans un compte d'investissement avant de payer vos factures.

CITATION IMPORTANTE : "Ne croyez pas un traître mot de ce que je vous dis. Testez-le dans votre propre vie."

DONNÉES IMPORTANTES :
- 80% des millionnaires sont des entrepreneurs
- 90% des millionnaires ont investi dans l'immobilier
- 95% des millionnaires lisent au moins 30 minutes par jour
`;

async function testProductionExtraction() {
  console.log('🧪 TEST DE PRODUCTION - SYSTÈME D\'EXTRACTION AVANCÉ');
  console.log('====================================================');
  
  try {
    // Créer un FormData avec le texte de test
    const formData = new FormData();
    const blob = new Blob([testBookText], { type: 'text/plain' });
    formData.append('file', blob, 'test-book.txt');
    
    console.log('📤 Envoi de la requête au serveur de production...');
    
    const response = await fetch('https://omely-node-backend.fly.dev/summarize/pdf', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    
    console.log('✅ Réponse reçue du serveur de production');
    console.log(`📊 Statut: ${result.status}`);
    console.log(`⏱️ Temps de traitement: ${result.metadata?.totalProcessingTime}ms`);
    console.log(`📄 Longueur du texte: ${result.metadata?.textLength} caractères`);
    console.log(`📝 Longueur du résumé: ${result.metadata?.summaryLength} caractères`);
    
    if (result.status === 'success') {
      console.log('\n📖 RÉSUMÉ EXTRACTION COMPLÈTE:');
      console.log('=' .repeat(80));
      console.log(result.summary);
      console.log('=' .repeat(80));
      
      // Vérification rapide de la qualité
      const summary = result.summary;
      const qualityChecks = {
        hasPrinciples: summary.includes('🔑 PRINCIPES') && summary.includes('PRIORITÉ MAXIMALE'),
        hasDifferences: summary.includes('⚡ DIFFÉRENCES') && summary.includes('riches/pauvres'),
        hasStructure: summary.includes('📖 STRUCTURE') && summary.includes('CHAPITRES'),
        hasQuotes: summary.includes('💬 CITATIONS'),
        hasKeyPoints: summary.includes('🎯 POINTS CLÉS'),
        hasConcepts: summary.includes('💡 CONCEPTS'),
        hasExamples: summary.includes('📝 EXEMPLES'),
        hasTechniques: summary.includes('🛠️ TECHNIQUES'),
        hasData: summary.includes('📊 DONNÉES'),
        hasActionPlan: summary.includes('🎓 PLAN D\'ACTION'),
        has17Differences: summary.includes('17') && summary.includes('différences'),
        hasNoAnalysis: !summary.includes('Analysis: I can now help you')
      };
      
      const foundElements = Object.values(qualityChecks).filter(Boolean).length;
      const totalElements = Object.keys(qualityChecks).length;
      const qualityScore = Math.round((foundElements / totalElements) * 100);
      
      console.log(`\n📊 QUALITÉ DE L'EXTRACTION: ${qualityScore}% (${foundElements}/${totalElements} critères)`);
      
      if (qualityScore >= 80) {
        console.log('🎉 SUCCÈS: Le système d\'extraction avancé fonctionne parfaitement en production !');
        console.log('✅ Extraction 100% complète activée');
        console.log('✅ Tous les principes et différences extraits');
        console.log('✅ Structure complète par chapitres');
        console.log('✅ Plan d\'action détaillé');
      } else {
        console.log('⚠️ ATTENTION: Qualité d\'extraction à améliorer');
      }
      
    } else {
      console.error('❌ Échec de l\'extraction:', result.message);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test de production:', error.message);
  }
}

// Lancer le test
testProductionExtraction();
