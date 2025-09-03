// TEST EXTRACTION NOMINATIVE - VÉRIFICATION DES NOMS EXACTS

import { extractCompleteBookContent } from './utils/openaiService.js';
import dotenv from 'dotenv';

dotenv.config();

// Texte test avec des principes aux noms très spécifiques
const bookWithSpecificPrinciples = `
CHAPITRE 1: LES PRINCIPES SECRETS DE LA RICHESSE

PRINCIPE #1: LA LOI DE L'ABONDANCE MENTALE
L'univers regorge d'opportunités financières. Votre esprit doit s'ouvrir à cette abondance.

PRINCIPE #2: LE POUVOIR DE LA RESPONSABILITÉ TOTALE  
Vous êtes 100% responsable de votre situation financière. Aucune excuse.

PRINCIPE #3: LA FORCE DE LA PENSÉE POSITIVE EN FINANCES
Vos pensées créent votre réalité financière. Pensez riche, devenez riche.

PRINCIPE #4: L'ART DE LA VISUALISATION FINANCIÈRE
Visualisez votre richesse future chaque jour avec précision.

PRINCIPE #5: LE SECRET DE L'ACTION MALGRÉ LA PEUR
Les riches agissent même quand ils ont peur. La peur ne les arrête pas.

CHAPITRE 2: LES DIFFÉRENCES COMPORTEMENTALES

DIFFÉRENCE #1: LES RICHES PENSENT EN OPPORTUNITÉS, LES PAUVRES EN OBSTACLES
Face à un problème, les riches voient une chance, les pauvres voient un mur.

DIFFÉRENCE #2: LES RICHES INVESTISSENT D'ABORD, LES PAUVRES DÉPENSENT D'ABORD
Les riches paient d'abord leur fortune, les pauvres paient d'abord leurs plaisirs.

DIFFÉRENCE #3: LES RICHES S'ÉDUQUENT CONTINUELLEMENT, LES PAUVRES REGARDENT LA TV
Les riches lisent, apprennent, grandissent. Les pauvres se divertissent.

CHAPITRE 3: LES EXERCICES TRANSFORMATEURS

EXERCICE #1: L'AUDIT DE VOS CROYANCES FINANCIÈRES
Listez toutes vos croyances sur l'argent et identifiez les limitantes.

EXERCICE #2: LA TECHNIQUE DES AFFIRMATIONS QUOTIDIENNES
Répétez 10 affirmations positives sur l'argent chaque matin.

EXERCICE #3: LE PLAN FINANCIER DE VOS RÊVES
Écrivez précisément votre situation financière idéale dans 5 ans.

CHAPITRE 4: LES CITATIONS QUI CHANGENT TOUT

"L'argent n'est qu'un outil. Il vous mènera partout où vous le souhaitez, mais il ne vous remplacera pas en tant que conducteur." - Ayn Rand

"Ne sauvegardez pas ce qui reste après avoir dépensé, mais dépensez ce qui reste après avoir épargné." - Warren Buffett

"Le plus grand risque de tous est de ne prendre aucun risque." - Mark Zuckerberg

CHAPITRE 5: LES HISTOIRES INSPIRANTES

HISTOIRE #1: LE VENDEUR DE JOURNAUX MILLIONNAIRE
Tommy, vendeur de journaux à 12 ans, a appliqué les principes et est devenu millionnaire à 30 ans.

HISTOIRE #2: LA FEMME DE MÉNAGE QUI A CRÉÉ UN EMPIRE
Maria, femme de ménage, a économisé et investi pour créer une chaîne de nettoyage de 10 millions.

CONCLUSION: Vous avez maintenant tous les outils pour transformer votre vie financière.
`;

async function testExtractionNominative() {
  console.log('🔍 TEST EXTRACTION NOMINATIVE - VÉRIFICATION DES NOMS EXACTS');
  console.log('=============================================================\n');
  
  console.log('🎯 OBJECTIF CRITIQUE:');
  console.log('   Vérifier que CHAQUE principe est extrait avec son NOM EXACT');
  console.log('   Pas de généralisation comme "les principes mentaux"');
  console.log('   Chaque élément doit être nommé individuellement\n');
  
  // Éléments à extraire avec leurs noms exacts
  const expectedElements = {
    principes: [
      'LA LOI DE L\'ABONDANCE MENTALE',
      'LE POUVOIR DE LA RESPONSABILITÉ TOTALE',
      'LA FORCE DE LA PENSÉE POSITIVE EN FINANCES',
      'L\'ART DE LA VISUALISATION FINANCIÈRE',
      'LE SECRET DE L\'ACTION MALGRÉ LA PEUR'
    ],
    differences: [
      'LES RICHES PENSENT EN OPPORTUNITÉS, LES PAUVRES EN OBSTACLES',
      'LES RICHES INVESTISSENT D\'ABORD, LES PAUVRES DÉPENSENT D\'ABORD',
      'LES RICHES S\'ÉDUQUENT CONTINUELLEMENT, LES PAUVRES REGARDENT LA TV'
    ],
    exercices: [
      'L\'AUDIT DE VOS CROYANCES FINANCIÈRES',
      'LA TECHNIQUE DES AFFIRMATIONS QUOTIDIENNES',
      'LE PLAN FINANCIER DE VOS RÊVES'
    ],
    histoires: [
      'LE VENDEUR DE JOURNAUX MILLIONNAIRE',
      'LA FEMME DE MÉNAGE QUI A CRÉÉ UN EMPIRE'
    ]
  };
  
  console.log('📚 Éléments à extraire NOMINATIVEMENT:');
  console.log(`   🔑 ${expectedElements.principes.length} principes avec noms exacts`);
  console.log(`   ⚡ ${expectedElements.differences.length} différences avec titres précis`);
  console.log(`   🛠 ${expectedElements.exercices.length} exercices avec noms spécifiques`);
  console.log(`   📖 ${expectedElements.histoires.length} histoires avec titres exacts\n`);
  
  console.log('⚡ Lancement extraction nominative...\n');
  
  const startTime = Date.now();
  
  try {
    const result = await extractCompleteBookContent(bookWithSpecificPrinciples, 'Test Extraction Nominative');
    
    const totalTime = Date.now() - startTime;
    
    if (result.success) {
      console.log('🎉 EXTRACTION TERMINÉE !');
      console.log(`⚡ Temps: ${totalTime}ms\n`);
      
      const summary = result.completeSummary;
      console.log('📄 RÉSUMÉ AVEC EXTRACTION NOMINATIVE:');
      console.log('====================================');
      console.log(summary);
      console.log('\n====================================\n');
      
      // VÉRIFICATION DE L'EXTRACTION NOMINATIVE
      console.log('🔍 VÉRIFICATION EXTRACTION NOMINATIVE:');
      console.log('======================================');
      
      const lowerSummary = summary.toLowerCase();
      
      // Vérifier les principes par nom exact
      let principesFound = 0;
      console.log('\n🔑 PRINCIPES (par nom exact):');
      expectedElements.principes.forEach((principe, index) => {
        const found = lowerSummary.includes(principe.toLowerCase());
        const status = found ? '✅' : '❌';
        console.log(`${status} PRINCIPE #${index + 1}: "${principe}"`);
        if (found) principesFound++;
      });
      
      // Vérifier les différences par nom exact
      let differencesFound = 0;
      console.log('\n⚡ DIFFÉRENCES (par nom exact):');
      expectedElements.differences.forEach((difference, index) => {
        const found = lowerSummary.includes(difference.toLowerCase());
        const status = found ? '✅' : '❌';
        console.log(`${status} DIFFÉRENCE #${index + 1}: "${difference}"`);
        if (found) differencesFound++;
      });
      
      // Vérifier les exercices par nom exact
      let exercicesFound = 0;
      console.log('\n🛠 EXERCICES (par nom exact):');
      expectedElements.exercices.forEach((exercice, index) => {
        const found = lowerSummary.includes(exercice.toLowerCase());
        const status = found ? '✅' : '❌';
        console.log(`${status} EXERCICE #${index + 1}: "${exercice}"`);
        if (found) exercicesFound++;
      });
      
      // Vérifier les histoires par nom exact
      let histoiresFound = 0;
      console.log('\n📖 HISTOIRES (par nom exact):');
      expectedElements.histoires.forEach((histoire, index) => {
        const found = lowerSummary.includes(histoire.toLowerCase());
        const status = found ? '✅' : '❌';
        console.log(`${status} HISTOIRE #${index + 1}: "${histoire}"`);
        if (found) histoiresFound++;
      });
      
      // Vérifications anti-généralisation
      console.log('\n🚨 VÉRIFICATIONS ANTI-GÉNÉRALISATION:');
      const badPhrases = [
        'les principes mentaux',
        'les concepts de base',
        'les enseignements principaux',
        'parmi les différences importantes',
        'les exercices incluent'
      ];
      
      let generalizationFound = false;
      badPhrases.forEach(phrase => {
        if (lowerSummary.includes(phrase)) {
          console.log(`❌ GÉNÉRALISATION DÉTECTÉE: "${phrase}"`);
          generalizationFound = true;
        }
      });
      
      if (!generalizationFound) {
        console.log('✅ AUCUNE généralisation détectée - Extraction nominative respectée');
      }
      
      // Scores finaux
      const principesScore = principesFound / expectedElements.principes.length;
      const differencesScore = differencesFound / expectedElements.differences.length;
      const exercicesScore = exercicesFound / expectedElements.exercices.length;
      const histoiresScore = histoiresFound / expectedElements.histoires.length;
      
      const totalElements = expectedElements.principes.length + expectedElements.differences.length + 
                           expectedElements.exercices.length + expectedElements.histoires.length;
      const totalFound = principesFound + differencesFound + exercicesFound + histoiresFound;
      const globalScore = totalFound / totalElements;
      
      console.log(`\n📊 SCORES D'EXTRACTION NOMINATIVE:`);
      console.log(`🔑 Principes: ${principesFound}/${expectedElements.principes.length} (${Math.round(principesScore*100)}%)`);
      console.log(`⚡ Différences: ${differencesFound}/${expectedElements.differences.length} (${Math.round(differencesScore*100)}%)`);
      console.log(`🛠 Exercices: ${exercicesFound}/${expectedElements.exercices.length} (${Math.round(exercicesScore*100)}%)`);
      console.log(`📖 Histoires: ${histoiresFound}/${expectedElements.histoires.length} (${Math.round(histoiresScore*100)}%)`);
      console.log(`\n🎯 SCORE GLOBAL: ${totalFound}/${totalElements} (${Math.round(globalScore*100)}%)`);
      
      // Évaluation finale
      if (globalScore >= 0.9 && !generalizationFound) {
        console.log('\n🏆 EXTRACTION NOMINATIVE EXCELLENTE !');
        console.log('✅ Tous les éléments extraits avec leurs noms exacts');
        console.log('✅ Aucune généralisation détectée');
        console.log('🎯 Mission accomplie: extraction chirurgicale réussie');
      } else if (globalScore >= 0.7) {
        console.log('\n👍 EXTRACTION NOMINATIVE CORRECTE');
        console.log('⚠️ Quelques éléments manquent ou généralisations présentes');
      } else {
        console.log('\n⚠️ EXTRACTION NOMINATIVE INSUFFISANTE');
        console.log('❌ Trop d\'éléments manquent ou trop de généralisations');
      }
      
      // Diagnostic spécifique
      if (principesScore < 0.8) {
        console.log('\n🔧 DIAGNOSTIC: Les principes ne sont pas assez extraits nominativement');
        console.log('   Probable cause: Généralisation au lieu d\'extraction individuelle');
      }
      
      if (generalizationFound) {
        console.log('\n🔧 DIAGNOSTIC: Généralisation détectée');
        console.log('   Solution: Forcer extraction nominative individuelle');
      }
      
      return globalScore >= 0.8 && !generalizationFound;
      
    } else {
      console.log('❌ EXTRACTION ÉCHOUÉE:', result.error);
      return false;
    }
    
  } catch (error) {
    console.error('💥 ERREUR TEST:', error.message);
    return false;
  }
}

// Lancer le test d'extraction nominative
console.log('🎯 DÉMARRAGE TEST EXTRACTION NOMINATIVE');
console.log('======================================\n');

testExtractionNominative()
  .then(success => {
    if (success) {
      console.log('\n🎉 TEST EXTRACTION NOMINATIVE RÉUSSI !');
      console.log('🔍 Chaque principe extrait avec son nom exact');
      console.log('🚫 Aucune généralisation - extraction chirurgicale opérationnelle');
    } else {
      console.log('\n⚠️ Test extraction nominative échoué');
      console.log('🔧 Ajustements nécessaires pour extraction individuelle');
    }
  })
  .catch(console.error);
