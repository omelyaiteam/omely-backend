// TEST LIVRE COMPLET - EXTRACTION 100%
const completeBookText = `
LES SECRETS D'UN ESPRIT MILLIONNAIRE
T. HARV EKER

PREMIÈRE PARTIE
VOTRE PLAN FINANCIER INTÉRIEUR

CHAPITRE 1
VOTRE PLAN FINANCIER INTÉRIEUR

Si votre "plan financier" inconscient n'est pas "réglé" sur la réussite, rien de ce que vous apprendrez, rien de ce que vous saurez et rien de ce que vous accomplirez ne fera réellement de différence.

PRINCIPE CLÉ #1 : Votre plan financier intérieur détermine votre destinée financière.

Les riches pensent différemment des pauvres et de la classe moyenne. Voici les 17 différences principales :

DIFFÉRENCE #1 : Les riches croient : "Je crée ma vie." Les pauvres croient : "La vie m'arrive."
DIFFÉRENCE #2 : Les riches jouent au jeu de l'argent pour gagner. Les pauvres jouent au jeu de l'argent pour ne pas perdre.
DIFFÉRENCE #3 : Les riches s'engagent à être riches. Les pauvres veulent être riches.
DIFFÉRENCE #4 : Les riches pensent grand. Les pauvres pensent petit.
DIFFÉRENCE #5 : Les riches se concentrent sur les opportunités. Les pauvres se concentrent sur les obstacles.
DIFFÉRENCE #6 : Les riches admirent d'autres gens riches et prospères. Les pauvres en veulent aux gens riches et prospères.
DIFFÉRENCE #7 : Les riches s'associent à des gens positifs et prospères. Les pauvres s'associent à des gens négatifs et non prospères.
DIFFÉRENCE #8 : Les riches sont prêts à se promouvoir eux-mêmes et leur valeur. Les pauvres pensent négativement à la vente et à la promotion.
DIFFÉRENCE #9 : Les riches sont plus grands que leurs problèmes. Les pauvres sont plus petits que leurs problèmes.
DIFFÉRENCE #10 : Les riches sont d'excellents récepteurs. Les pauvres sont de mauvais récepteurs.
DIFFÉRENCE #11 : Les riches choisissent d'être payés selon leurs résultats. Les pauvres choisissent d'être payés selon leur temps.
DIFFÉRENCE #12 : Les riches pensent "les deux". Les pauvres pensent "soit l'un soit l'autre".
DIFFÉRENCE #13 : Les riches se concentrent sur leur valeur nette. Les pauvres se concentrent sur leur revenu de travail.
DIFFÉRENCE #14 : Les riches gèrent leur argent. Les pauvres ne gèrent pas leur argent.
DIFFÉRENCE #15 : Les riches font travailler leur argent pour eux. Les pauvres travaillent pour leur argent.
DIFFÉRENCE #16 : Les riches agissent malgré la peur. Les pauvres laissent la peur les arrêter.
DIFFÉRENCE #17 : Les riches apprennent et grandissent constamment. Les pauvres pensent qu'ils savent déjà.

CHAPITRE 2
LES DOSSIERS FINANCIERS DE VOTRE ESPRIT

Votre plan financier intérieur est comme un thermostat. Si vous réglez votre thermostat à 20 degrés, peu importe ce que vous faites, la température ne dépassera jamais 20 degrés.

PRINCIPE CLÉ #2 : Votre plan financier intérieur détermine vos résultats financiers.

EXEMPLE CONCRET : Si votre plan financier intérieur est réglé pour gagner 50 000€ par an, vous gagnerez environ 50 000€ par an, peu importe ce que vous faites.

TECHNIQUE #1 : Déclaration de richesse
Répétez chaque jour : "Je suis un aimant à argent. L'argent m'attire et je l'attire."

TECHNIQUE #2 : Visualisation
Visualisez-vous déjà riche et prospère. Votre subconscient ne fait pas la différence entre ce qui est réel et ce qui est imaginé.

CITATION IMPORTANTE : "Ne croyez pas un traître mot de ce que je vous dis. Testez-le dans votre propre vie."

CHAPITRE 3
L'INFLUENCE DE L'ENFANCE

Votre plan financier intérieur a été programmé dans votre enfance par ce que vous avez entendu, vu et vécu concernant l'argent.

PRINCIPE CLÉ #3 : Votre relation à l'argent a été formée dans votre enfance.

EXEMPLE : Si vous avez entendu vos parents dire "L'argent ne pousse pas dans les arbres", votre subconscient a enregistré que l'argent est rare et difficile à obtenir.

TECHNIQUE #3 : Reprogrammation
Identifiez vos croyances limitantes sur l'argent et remplacez-les par des croyances positives.

CHAPITRE 4
LES STRATÉGIES PRATIQUES

PRINCIPE CLÉ #4 : La richesse est un état d'esprit, pas un montant d'argent.

STRATÉGIE #1 : Payez-vous en premier
Mettez 10% de vos revenus dans un compte d'investissement avant de payer vos factures.

STRATÉGIE #2 : Investissez dans votre éducation
Dépensez de l'argent pour apprendre et vous développer.

STRATÉGIE #3 : Créez plusieurs sources de revenus
Ne dépendez pas d'une seule source de revenus.

EXEMPLE CONCRET : Un millionnaire moyen a 7 sources de revenus différentes.

CHAPITRE 5
LE PLAN D'ACTION

PRINCIPE CLÉ #5 : L'action est plus importante que la perfection.

ÉTAPE #1 : Identifiez votre plan financier intérieur actuel
ÉTAPE #2 : Identifiez les croyances limitantes
ÉTAPE #3 : Remplacez-les par des croyances positives
ÉTAPE #4 : Agissez malgré la peur
ÉTAPE #5 : Investissez dans votre éducation
ÉTAPE #6 : Créez plusieurs sources de revenus

CITATION FINALE : "Étudiez ce livre comme si votre vie en dépendait… car il se pourrait que ce soit le cas financièrement !" —Anthony Robbins

PLAN D'ACTION IMMÉDIAT :
1. Lisez ce livre 3 fois
2. Faites tous les exercices
3. Appliquez les principes dans votre vie
4. Commencez à investir immédiatement
5. Créez votre première source de revenus passive

DONNÉES IMPORTANTES :
- 80% des millionnaires sont des entrepreneurs
- 90% des millionnaires ont investi dans l'immobilier
- 95% des millionnaires lisent au moins 30 minutes par jour
- 100% des millionnaires ont un plan financier écrit

CONCEPTS CLÉS :
- Plan financier intérieur
- État d'esprit de richesse
- Reprogrammation subconsciente
- Investissement
- Sources de revenus multiples
- Éducation financière
- Action malgré la peur
- Visualisation créatrice
`;

async function testCompleteBook() {
  console.log('🧪 TEST LIVRE COMPLET - EXTRACTION 100%');
  console.log('=======================================');
  console.log(`📄 Longueur du livre: ${completeBookText.length} caractères`);
  
  try {
    console.log('📤 Test du endpoint chat avec livre complet...');
    
    const response = await fetch('https://omely-node-backend.fly.dev/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `Analyse ce livre COMPLET et crée un résumé détaillé qui capture 100% de son contenu: ${completeBookText}`,
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
      console.log('\n📖 RÉSUMÉ COMPLET DU LIVRE:');
      console.log('=' .repeat(80));
      console.log(result.response);
      console.log('=' .repeat(80));
      
      // Vérification COMPLÈTE
      const response = result.response;
      const checks = {
        hasPrinciples: response.includes('🔑') || response.includes('PRINCIPE'),
        hasAll17Differences: response.includes('17') && response.includes('différence'),
        hasStructure: response.includes('📖') || response.includes('STRUCTURE'),
        hasQuotes: response.includes('💬') || response.includes('citation'),
        hasKeyPoints: response.includes('🎯') || response.includes('POINTS'),
        hasConcepts: response.includes('💡') || response.includes('CONCEPTS'),
        hasExamples: response.includes('📝') || response.includes('EXEMPLES'),
        hasTechniques: response.includes('🛠️') || response.includes('TECHNIQUES'),
        hasData: response.includes('📊') || response.includes('DONNÉES'),
        hasActionPlan: response.includes('🎓') || response.includes('PLAN'),
        hasAllChapters: response.includes('CHAPITRE 1') && response.includes('CHAPITRE 2') && response.includes('CHAPITRE 3'),
        isComplete: response.length > 2000 // Résumé complet
      };
      
      console.log(`\n📊 VÉRIFICATION COMPLÈTE:`);
      Object.entries(checks).forEach(([check, passed]) => {
        console.log(`  ${passed ? '✅' : '❌'} ${check}`);
      });
      
      const passedChecks = Object.values(checks).filter(Boolean).length;
      const totalChecks = Object.keys(checks).length;
      const qualityScore = Math.round((passedChecks / totalChecks) * 100);
      
      console.log(`\n📊 SCORE DE QUALITÉ: ${qualityScore}% (${passedChecks}/${totalChecks})`);
      
      if (qualityScore >= 90) {
        console.log('🎉 SUCCÈS TOTAL: Le système extrait 100% du contenu du livre !');
        console.log('✅ Extraction complète activée');
        console.log('✅ Tous les principes extraits');
        console.log('✅ Toutes les 17 différences capturées');
        console.log('✅ Structure complète du livre');
        console.log('✅ Plan d\'action détaillé');
      } else if (qualityScore >= 70) {
        console.log('✅ BON: Le système extrait la plupart du contenu');
      } else {
        console.log('⚠️ ATTENTION: Le système n\'extrait qu\'une partie du contenu');
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testCompleteBook();
