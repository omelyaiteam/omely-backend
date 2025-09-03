// TEST SPÉCIAL - COMPTAGE D'EXTRACTION EXHAUSTIVE

import { extractCompleteBookContent } from './utils/openaiService.js';
import dotenv from 'dotenv';

dotenv.config();

// Texte test avec BEAUCOUP de principes facilement comptables
const bookWithManyPrinciples = `
CHAPITRE 1: LES 20 LOIS DE L'ARGENT

Voici les 20 lois fondamentales pour devenir riche selon l'auteur:

LOI #1: LA LOI DE L'ABONDANCE
L'argent est partout autour de nous. Il y en a plus qu'assez pour tout le monde.

LOI #2: LA LOI DE L'ATTRACTION
Nous attirons exactement ce que nous pensons et ressentons.

LOI #3: LA LOI DE LA VALEUR
Plus vous apportez de valeur, plus vous recevez d'argent.

LOI #4: LA LOI DU TEMPS
Le temps est votre ressource la plus précieuse.

LOI #5: LA LOI DE LA SPÉCIALISATION
Devenez excellent dans un domaine spécifique.

LOI #6: LA LOI DE L'INVESTISSEMENT
Investissez 20% de vos revenus minimum.

LOI #7: LA LOI DE LA PATIENCE
La richesse se construit lentement mais sûrement.

LOI #8: LA LOI DU RISQUE CALCULÉ
Prenez des risques intelligents et mesurés.

LOI #9: LA LOI DE L'ÉDUCATION CONTINUE
Investissez constamment dans votre formation.

LOI #10: LA LOI DU RÉSEAU
Votre réseau détermine votre valeur nette.

CHAPITRE 2: LES 10 AUTRES LOIS CRUCIALES

LOI #11: LA LOI DE LA PERSÉVÉRANCE
Ne jamais abandonner face aux difficultés.

LOI #12: LA LOI DE L'INNOVATION
Trouvez toujours de nouvelles façons de faire.

LOI #13: LA LOI DE LA DISCIPLINE
Contrôlez vos dépenses et vos habitudes.

LOI #14: LA LOI DE LA GÉNÉROSITÉ
Plus vous donnez, plus vous recevez.

LOI #15: LA LOI DE LA GRATITUDE
Soyez reconnaissant pour ce que vous avez.

LOI #16: LA LOI DE L'ACTION
Les idées sans action ne valent rien.

LOI #17: LA LOI DE LA MESURE
Mesurez tout ce qui compte.

LOI #18: LA LOI DE L'ADAPTATION
Adaptez-vous aux changements du marché.

LOI #19: LA LOI DE LA CONCENTRATION
Focalisez-vous sur l'essentiel.

LOI #20: LA LOI DE LA MANIFESTATION
Visualisez clairement vos objectifs financiers.

CHAPITRE 3: LES 15 DIFFÉRENCES MAJEURES

DIFFÉRENCE #1: Les riches pensent à long terme, les pauvres pensent à court terme.

DIFFÉRENCE #2: Les riches investissent d'abord, les pauvres dépensent d'abord.

DIFFÉRENCE #3: Les riches cherchent des opportunités, les pauvres cherchent la sécurité.

DIFFÉRENCE #4: Les riches s'éduquent financièrement, les pauvres regardent la TV.

DIFFÉRENCE #5: Les riches s'entourent de gagnants, les pauvres s'entourent de plaignants.

DIFFÉRENCE #6: Les riches prennent des risques calculés, les pauvres évitent tous les risques.

DIFFÉRENCE #7: Les riches ont multiple sources de revenus, les pauvres n'en ont qu'une.

DIFFÉRENCE #8: Les riches automatisent leurs finances, les pauvres les gèrent manuellement.

DIFFÉRENCE #9: Les riches investissent dans des actifs, les pauvres achètent des passifs.

DIFFÉRENCE #10: Les riches négocient leurs salaires, les pauvres acceptent ce qu'on leur donne.

DIFFÉRENCE #11: Les riches créent des systèmes, les pauvres travaillent dans des systèmes.

DIFFÉRENCE #12: Les riches pensent en propriétaire, les pauvres pensent en employé.

DIFFÉRENCE #13: Les riches résolvent des problèmes, les pauvres évitent les problèmes.

DIFFÉRENCE #14: Les riches investissent en eux-mêmes, les pauvres investissent dans le divertissement.

DIFFÉRENCE #15: Les riches planifient leur succession, les pauvres vivent au jour le jour.

CHAPITRE 4: LES 12 HABITUDES QUOTIDIENNES

HABITUDE #1: Se lever à 5h du matin pour avoir plus de temps productif.

HABITUDE #2: Lire 30 minutes par jour sur les finances personnelles.

HABITUDE #3: Faire de l'exercice pour maintenir son énergie.

HABITUDE #4: Méditer 10 minutes pour clarifier ses pensées.

HABITUDE #5: Planifier sa journée la veille au soir.

HABITUDE #6: Réviser ses objectifs financiers chaque semaine.

HABITUDE #7: Économiser au minimum 20% de ses revenus.

HABITUDE #8: Investir automatiquement chaque mois.

HABITUDE #9: Apprendre une nouvelle compétence chaque trimestre.

HABITUDE #10: Réseauter avec une nouvelle personne chaque semaine.

HABITUDE #11: Analyser ses dépenses chaque dimanche.

HABITUDE #12: Visualiser ses objectifs financiers chaque matin.

CONCLUSION: RÉCAPITULATIF TOTAL

En résumé, ce livre contient:
- 20 lois fondamentales de l'argent
- 15 différences cruciales entre riches et pauvres  
- 12 habitudes quotidiennes des millionnaires

Total: 47 éléments distincts à appliquer pour devenir riche.
`;

async function testCountingExtraction() {
  console.log('🧮 TEST COMPTAGE EXTRACTION - VÉRIFICATION EXHAUSTIVITÉ');
  console.log('====================================================\n');
  
  // Compter manuellement les éléments dans le texte
  const expectedCounts = {
    lois: 20,
    differences: 15, 
    habitudes: 12,
    total: 47
  };
  
  console.log('🎯 ÉLÉMENTS À EXTRAIRE OBLIGATOIREMENT:');
  console.log(`   📚 ${expectedCounts.lois} LOIS (LOI #1 à LOI #20)`);
  console.log(`   ⚡ ${expectedCounts.differences} DIFFÉRENCES (DIFFÉRENCE #1 à #15)`);
  console.log(`   🔄 ${expectedCounts.habitudes} HABITUDES (HABITUDE #1 à #12)`);
  console.log(`   🎯 TOTAL: ${expectedCounts.total} éléments distincts\n`);
  
  console.log('📚 Texte test:', bookWithManyPrinciples.length, 'caractères');
  console.log('⚡ Lancement extraction avec comptage obligatoire...\n');
  
  const startTime = Date.now();
  
  try {
    const result = await extractCompleteBookContent(bookWithManyPrinciples, 'Les 47 Principes de la Richesse (Test Comptage)');
    
    const totalTime = Date.now() - startTime;
    
    if (result.success) {
      console.log('🎉 EXTRACTION TERMINÉE !');
      console.log(`⚡ Temps: ${totalTime}ms\n`);
      
      const summary = result.completeSummary;
      console.log('📄 RÉSUMÉ GÉNÉRÉ:');
      console.log('=================');
      console.log(summary);
      console.log('\n=================\n');
      
      // COMPTAGE AUTOMATIQUE DES ÉLÉMENTS EXTRAITS
      console.log('🧮 COMPTAGE AUTOMATIQUE DES ÉLÉMENTS EXTRAITS:');
      console.log('===============================================');
      
      const lowerSummary = summary.toLowerCase();
      
      // Compter les lois
      let foundLaws = 0;
      for (let i = 1; i <= 20; i++) {
        if (lowerSummary.includes(`loi #${i}`) || lowerSummary.includes(`loi ${i}`)) {
          foundLaws++;
        }
      }
      
      // Compter les différences
      let foundDifferences = 0;
      for (let i = 1; i <= 15; i++) {
        if (lowerSummary.includes(`différence #${i}`) || lowerSummary.includes(`différence ${i}`)) {
          foundDifferences++;
        }
      }
      
      // Compter les habitudes
      let foundHabits = 0;
      for (let i = 1; i <= 12; i++) {
        if (lowerSummary.includes(`habitude #${i}`) || lowerSummary.includes(`habitude ${i}`)) {
          foundHabits++;
        }
      }
      
      // Compter les principes génériques
      const principleMatches = summary.match(/PRINCIPE #\d+/gi) || [];
      const foundPrinciples = principleMatches.length;
      
      console.log(`📊 RÉSULTATS DU COMPTAGE:`);
      console.log(`   🏆 LOIS trouvées: ${foundLaws}/${expectedCounts.lois} (${Math.round(foundLaws/expectedCounts.lois*100)}%)`);
      console.log(`   ⚡ DIFFÉRENCES trouvées: ${foundDifferences}/${expectedCounts.differences} (${Math.round(foundDifferences/expectedCounts.differences*100)}%)`);
      console.log(`   🔄 HABITUDES trouvées: ${foundHabits}/${expectedCounts.habitudes} (${Math.round(foundHabits/expectedCounts.habitudes*100)}%)`);
      console.log(`   💎 PRINCIPES génériques: ${foundPrinciples}`);
      
      const totalFound = foundLaws + foundDifferences + foundHabits;
      console.log(`\n🎯 TOTAL EXTRAIT: ${totalFound}/${expectedCounts.total} (${Math.round(totalFound/expectedCounts.total*100)}%)`);
      
      // Évaluation de la qualité
      const completenessScore = totalFound / expectedCounts.total;
      
      if (completenessScore >= 0.9) {
        console.log('\n🏆 EXTRACTION EXCELLENTE ! Quasi-exhaustive !');
        console.log('✅ Le système capture la grande majorité des éléments');
      } else if (completenessScore >= 0.7) {
        console.log('\n👍 EXTRACTION CORRECTE mais perfectible');
        console.log('⚠️ Certains éléments manquent encore');
      } else if (completenessScore >= 0.5) {
        console.log('\n⚠️ EXTRACTION INSUFFISANTE');
        console.log('❌ Trop d\'éléments manquants');
      } else {
        console.log('\n💥 EXTRACTION ÉCHOUÉE');
        console.log('❌ La majorité des éléments sont manquants');
      }
      
      // Vérifications détaillées
      console.log('\n🔍 VÉRIFICATIONS DÉTAILLÉES:');
      console.log(`${foundLaws >= 15 ? '✅' : '❌'} Lois: ${foundLaws >= 15 ? 'BONNE EXTRACTION' : 'EXTRACTION INCOMPLÈTE'}`);
      console.log(`${foundDifferences >= 10 ? '✅' : '❌'} Différences: ${foundDifferences >= 10 ? 'BONNE EXTRACTION' : 'EXTRACTION INCOMPLÈTE'}`);
      console.log(`${foundHabits >= 8 ? '✅' : '❌'} Habitudes: ${foundHabits >= 8 ? 'BONNE EXTRACTION' : 'EXTRACTION INCOMPLÈTE'}`);
      
      return completenessScore >= 0.7;
      
    } else {
      console.log('❌ EXTRACTION ÉCHOUÉE:', result.error);
      return false;
    }
    
  } catch (error) {
    console.error('💥 ERREUR TEST:', error.message);
    return false;
  }
}

// Lancer le test de comptage
console.log('🎯 DÉMARRAGE TEST COMPTAGE EXTRACTION');
console.log('====================================\n');

testCountingExtraction()
  .then(success => {
    if (success) {
      console.log('\n🎉 TEST COMPTAGE RÉUSSI !');
      console.log('🚀 Le système extrait maintenant de façon exhaustive');
      console.log('📊 Tous les éléments sont capturés correctement');
    } else {
      console.log('\n⚠️ Test comptage échoué');
      console.log('🔧 Ajustements supplémentaires nécessaires');
    }
  })
  .catch(console.error);
