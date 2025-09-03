// TEST STYLE NARRATIF - RÉSUMÉS ENGAGEANTS ET EXHAUSTIFS

import { extractCompleteBookContent } from './utils/openaiService.js';
import dotenv from 'dotenv';

dotenv.config();

// Texte test riche pour vérifier le style narratif
const narrativeTestBook = `
INTRODUCTION: LES SECRETS DE LA RICHESSE RÉVÉLÉS

Ce livre dévoile pourquoi certaines personnes accumulent des millions tandis que d'autres restent dans la survie financière.

CHAPITRE 1: LA RÉVOLUTION MENTALE

PRINCIPE #1: LA LOI DE L'ABONDANCE
L'argent n'est pas rare. Il y en a des milliards qui circulent chaque jour. Le problème n'est pas le manque d'argent, mais notre programmation mentale.

PRINCIPE #2: LE POUVOIR DES CROYANCES
"Que vous pensiez pouvoir ou ne pas pouvoir, vous avez raison" - Henry Ford. Nos croyances déterminent nos résultats financiers.

PRINCIPE #3: LA RESPONSABILITÉ TOTALE
Les riches prennent 100% de responsabilité pour leur situation. Les pauvres trouvent des excuses.

CHAPITRE 2: L'ABÎME ENTRE LES MENTALITÉS

DIFFÉRENCE #1: LES RICHES PENSENT GRAND, LES PAUVRES PENSENT PETIT
Les riches voient des opportunités de millions, les pauvres s'inquiètent de quelques euros.

DIFFÉRENCE #2: LES RICHES AGISSENT MALGRÉ LA PEUR, LES PAUVRES SONT PARALYSÉS
Warren Buffett: "Soyez craintif quand les autres sont cupides, et cupide quand les autres sont craintifs."

DIFFÉRENCE #3: LES RICHES SE CONCENTRENT SUR LEUR VALEUR NETTE, LES PAUVRES SUR LEUR SALAIRE
Un riche mesure sa richesse, un pauvre compte ses heures de travail.

CHAPITRE 3: LES HISTOIRES QUI CHANGENT TOUT

HISTOIRE #1: LE VENDEUR DE GLACES MILLIONNAIRE
Tony, un simple vendeur de glaces, a créé un empire de 50 millions en appliquant un principe simple: "Donnez plus de valeur que ce que vous recevez."

HISTOIRE #2: LA SERVEUSE QUI EST DEVENUE MILLIONNAIRE
Sarah, serveuse dans un restaurant, a économisé 15% de ses pourboires pendant 20 ans et les a investis. Résultat: 2 millions à la retraite.

CHAPITRE 4: VOTRE PLAN D'ACTION

EXERCICE #1: L'AUDIT FINANCIER
Calculez votre valeur nette exacte. Listez tous vos actifs et passifs. La plupart des gens ne connaissent même pas leur situation réelle.

EXERCICE #2: LA VISION À 10 ANS
Écrivez exactement où vous voulez être dans 10 ans. Soyez précis: combien d'argent, quel style de vie, quels investissements.

EXERCICE #3: LE PLAN 90 JOURS
Définissez 3 actions concrètes pour les 90 prochains jours qui vous rapprocheront de vos objectifs financiers.

CHAPITRE 5: LES CHIFFRES QUI PARLENT

STATISTIQUE #1: 95% des gens atteignent 65 ans soit morts, soit fuchés, soit dépendants de la famille ou du gouvernement.

STATISTIQUE #2: Les 1% les plus riches possèdent 50% de la richesse mondiale.

STATISTIQUE #3: Un investissement de 100$ par mois à 8% d'intérêt pendant 40 ans donne 279 781$.

CONCLUSION: VOTRE TRANSFORMATION COMMENCE MAINTENANT

La richesse n'est pas un accident. C'est le résultat d'un état d'esprit, de décisions et d'actions cohérentes. Vous avez maintenant les outils. La question est: allez-vous les utiliser?
`;

async function testNarrativeStyle() {
  console.log('📖 TEST STYLE NARRATIF - RÉSUMÉS ENGAGEANTS ET EXHAUSTIFS');
  console.log('===========================================================\n');
  
  console.log('🎯 OBJECTIFS DU TEST:');
  console.log('   ✅ Vérifier l\'exhaustivité (tous les éléments extraits)');
  console.log('   ✅ Vérifier le style narratif (engageant, pas liste brute)');
  console.log('   ✅ Vérifier la structure thématique (regroupement logique)');
  console.log('   ✅ Vérifier l\'expérience de lecture (fluide et inspirant)\n');
  
  console.log('📚 Texte test:', narrativeTestBook.length, 'caractères');
  console.log('🔍 Contenu à transformer:');
  console.log('   - 3 principes fondamentaux');
  console.log('   - 3 différences riches/pauvres');
  console.log('   - 2 histoires inspirantes');
  console.log('   - 3 exercices pratiques');
  console.log('   - 3 statistiques importantes\n');
  
  console.log('⚡ Lancement extraction avec style narratif...\n');
  
  const startTime = Date.now();
  
  try {
    const result = await extractCompleteBookContent(narrativeTestBook, 'Les Secrets de la Richesse (Test Narratif)');
    
    const totalTime = Date.now() - startTime;
    
    if (result.success) {
      console.log('🎉 EXTRACTION RÉUSSIE !');
      console.log(`⚡ Temps: ${totalTime}ms\n`);
      
      const summary = result.completeSummary;
      console.log('📄 RÉSUMÉ NARRATIF GÉNÉRÉ:');
      console.log('============================');
      console.log(summary);
      console.log('\n============================\n');
      
      // ANALYSE DU STYLE NARRATIF
      console.log('📊 ANALYSE DU STYLE NARRATIF:');
      console.log('=============================');
      
      const lowerSummary = summary.toLowerCase();
      
      // Tests d'exhaustivité
      const exhaustivityChecks = [
        { name: 'Principe "Loi de l\'abondance" extrait', test: lowerSummary.includes('abondance') },
        { name: 'Principe "Pouvoir des croyances" extrait', test: lowerSummary.includes('croyances') },
        { name: 'Principe "Responsabilité totale" extrait', test: lowerSummary.includes('responsabilité') },
        { name: 'Différence "pensent grand/petit" extraite', test: lowerSummary.includes('grand') || lowerSummary.includes('petit') },
        { name: 'Différence "agissent malgré peur" extraite', test: lowerSummary.includes('peur') },
        { name: 'Histoire vendeur de glaces extraite', test: lowerSummary.includes('tony') || lowerSummary.includes('glace') },
        { name: 'Histoire serveuse millionnaire extraite', test: lowerSummary.includes('sarah') || lowerSummary.includes('serveuse') },
        { name: 'Exercice audit financier extrait', test: lowerSummary.includes('audit') || lowerSummary.includes('valeur nette') },
        { name: 'Statistique 95% extraite', test: lowerSummary.includes('95%') }
      ];
      
      // Tests de style narratif
      const narrativeChecks = [
        { name: 'TL;DR présent au début', test: summary.includes('RÉSUMÉ EXPRESS') || summary.includes('TL;DR') },
        { name: 'Questions rhétoriques utilisées', test: summary.includes('?') && (lowerSummary.includes('et si') || lowerSummary.includes('saviez-vous')) },
        { name: 'Paragraphes d\'introduction présents', test: summary.split('\n').some(line => line.includes('*') && line.length > 50) },
        { name: 'Style storytelling (pas de listes brutes)', test: !summary.includes('- PRINCIPE #1:') && !summary.includes('• ') },
        { name: 'Regroupement thématique', test: lowerSummary.includes('mindset') || lowerSummary.includes('transformation') },
        { name: 'Conclusion motivante présente', test: lowerSummary.includes('ce que vous retenez') || lowerSummary.includes('transformation') || lowerSummary.includes('commence maintenant') },
        { name: 'Émojis modérés (pas d\'effet catalogue)', test: (summary.match(/📚|🧠|💰|🎯|💬|📖|🛠|📊|🔗|💎/g) || []).length <= 10 },
        { name: 'Format fluide et engageant', test: summary.length > 3000 && summary.includes('*') }
      ];
      
      let exhaustivityPassed = 0;
      let narrativePassed = 0;
      
      console.log('\n🔍 EXHAUSTIVITÉ (Tous les éléments extraits):');
      exhaustivityChecks.forEach(check => {
        const status = check.test ? '✅' : '❌';
        console.log(`${status} ${check.name}`);
        if (check.test) exhaustivityPassed++;
      });
      
      console.log('\n📖 STYLE NARRATIF (Expérience de lecture):');
      narrativeChecks.forEach(check => {
        const status = check.test ? '✅' : '❌';
        console.log(`${status} ${check.name}`);
        if (check.test) narrativePassed++;
      });
      
      const exhaustivityScore = exhaustivityPassed / exhaustivityChecks.length;
      const narrativeScore = narrativePassed / narrativeChecks.length;
      
      console.log(`\n📊 SCORES FINAUX:`);
      console.log(`📚 Exhaustivité: ${exhaustivityPassed}/${exhaustivityChecks.length} (${Math.round(exhaustivityScore*100)}%)`);
      console.log(`📖 Style narratif: ${narrativePassed}/${narrativeChecks.length} (${Math.round(narrativeScore*100)}%)`);
      console.log(`📝 Longueur résumé: ${summary.length} caractères`);
      
      // Évaluation globale
      const globalScore = (exhaustivityScore + narrativeScore) / 2;
      
      if (globalScore >= 0.8) {
        console.log('\n🏆 RÉSULTAT EXCELLENT !');
        console.log('✅ Résumé exhaustif ET engageant');
        console.log('🎯 Mission accomplie: guide fluide et inspirant');
      } else if (globalScore >= 0.6) {
        console.log('\n👍 RÉSULTAT CORRECT');
        console.log('⚠️ Quelques améliorations possibles');
      } else {
        console.log('\n⚠️ RÉSULTAT INSUFFISANT');
        console.log('❌ Style narratif ou exhaustivité à améliorer');
      }
      
      // Analyse spécifique du style
      if (narrativeScore >= 0.7) {
        console.log('\n🎨 STYLE: Transformation réussie ! Plus de listes brutes, résumé engageant');
      } else {
        console.log('\n📝 STYLE: Encore trop "catalogue", manque de fluidité narrative');
      }
      
      if (exhaustivityScore >= 0.8) {
        console.log('📚 CONTENU: Extraction exhaustive maintenue avec succès');
      } else {
        console.log('📚 CONTENU: Certains éléments manquent encore');
      }
      
      return globalScore >= 0.7;
      
    } else {
      console.log('❌ EXTRACTION ÉCHOUÉE:', result.error);
      return false;
    }
    
  } catch (error) {
    console.error('💥 ERREUR TEST:', error.message);
    return false;
  }
}

// Lancer le test narratif
console.log('🎯 DÉMARRAGE TEST STYLE NARRATIF');
console.log('===============================\n');

testNarrativeStyle()
  .then(success => {
    if (success) {
      console.log('\n🎉 TEST NARRATIF RÉUSSI !');
      console.log('📖 Résumés exhaustifs ET engageants opérationnels');
      console.log('✨ Fini l\'effet catalogue, bonjour les guides inspirants !');
    } else {
      console.log('\n⚠️ Test narratif échoué');
      console.log('🔧 Ajustements style ou exhaustivité nécessaires');
    }
  })
  .catch(console.error);
