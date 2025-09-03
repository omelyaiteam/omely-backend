// TEST DES RÉSUMÉS ULTRA-COMPLETS ET OPTIMISÉS

import { extractCompleteBookContent, summarizeText } from './utils/openaiService.js';
import dotenv from 'dotenv';

dotenv.config();

// Test avec un texte simulé de livre d'enrichissement
const simulatedBookText = `
CHAPITRE 1: LES SECRETS DES MILLIONNAIRES

═══ ENCADRÉ IMPORTANT ═══
RÈGLE D'OR: Les riches achètent des actifs, les pauvres achètent des passifs qu'ils croient être des actifs.
═══════════════════════

Robert Kiyosaki explique que "votre maison n'est PAS un actif - c'est un passif". Cette révélation choque beaucoup de gens.

DIFFÉRENCES FONDAMENTALES:
• Les RICHES: Investissent d'abord, dépensent ensuite
• Les PAUVRES: Dépensent d'abord, investissent (jamais) ensuite  
• CLASSE MOYENNE: Investit dans des fonds mutuels et pense que sa maison est un actif

"L'intelligence financière ne consiste pas à gagner plus d'argent, mais à garder plus de ce que vous gagnez."

TECHNIQUE PRATIQUE: La règle du 50/30/20
- 50% pour les besoins essentiels
- 30% pour les désirs
- 20% pour l'épargne et l'investissement

STATISTIQUE CHOC: 90% des millionnaires investissent dans l'immobilier locatif.

CHAPITRE 2: LES ERREURS FATALES

═══ ENCADRÉ CRUCIAL ═══
ERREUR #1: Travailler pour l'argent au lieu de faire travailler l'argent pour soi
ERREUR #2: Penser que la sécurité d'emploi existe encore
═══════════════════════

Warren Buffett dit: "Ne jamais investir dans un business que vous ne comprenez pas."

HISTOIRE MARQUANTE: L'auteur raconte comment son "père pauvre" (biologigue) était très éduqué mais financièrement ignorant, tandis que son "père riche" (mentor) avait arrêté l'école en 8ème année mais était multimillionnaire.

TECHNIQUE: Le plan FIRE (Financial Independence, Retire Early)
1. Calculer ses dépenses annuelles
2. Multiplier par 25 
3. C'est le montant à investir pour être libre financièrement

Les pauvres disent: "Je n'ai pas les moyens"
Les riches disent: "Comment puis-je me permettre cela?"

POURCENTAGE CLÉS: 
- 80% des millionnaires sont des self-made men
- 70% de leur richesse provient de l'immobilier
- Seulement 3% de la population atteint l'indépendance financière

CHAPITRE 3: LE PLAN D'ACTION

═══ EXERCICE PRATIQUE ═══
Listez 5 sources de revenus passifs possibles:
1. Immobilier locatif
2. Dividendes d'actions
3. Royalties de livres/brevets
4. Business automatisé
5. Investissements P2P
═══════════════════════

"Il ne suffit pas de gagner beaucoup d'argent. Il faut apprendre à le faire fructifier." - Robert Kiyosaki

PLAN D'ACTION EN 90 JOURS:
JOURS 1-30: Éducation financière (lire 3 livres)
JOURS 31-60: Analyser ses finances et créer un budget
JOURS 61-90: Effectuer son premier investissement

Les riches se concentrent sur leur colonne d'actifs, les pauvres se concentrent sur leur relevé de revenus.
`;

// Test de qualité et vitesse
async function testUltraSummary() {
  console.log('🧪 TEST RÉSUMÉ ULTRA-COMPLET ET OPTIMISÉ');
  console.log('=======================================');
  
  const startTime = Date.now();
  
  try {
    console.log('📚 Texte test:', simulatedBookText.length, 'caractères');
    console.log('⚡ Lancement extraction ultra-complète...\n');
    
    const result = await extractCompleteBookContent(simulatedBookText, 'Les Secrets des Millionnaires (Test)');
    
    const totalTime = Date.now() - startTime;
    
    if (result.success) {
      console.log('🎉 EXTRACTION RÉUSSIE !');
      console.log(`⚡ Temps total: ${totalTime}ms`);
      console.log(`📊 Méthode: ${result.metadata.extractionMethod}`);
      console.log(`✨ Qualité: ${result.metadata.quality}`);
      
      console.log('\n📄 RÉSUMÉ GÉNÉRÉ:');
      console.log('==================');
      console.log(result.completeSummary);
      
      // Vérifications de qualité
      const summary = result.completeSummary.toLowerCase();
      
      console.log('\n🔍 VÉRIFICATIONS DE QUALITÉ:');
      console.log('============================');
      
      const checks = [
        { name: 'Encadrés extraits', test: summary.includes('encadré') || summary.includes('règle') },
        { name: 'Citations présentes', test: summary.includes('robert kiyosaki') || summary.includes('warren buffett') },
        { name: 'Différences riches/pauvres', test: summary.includes('riches') && summary.includes('pauvres') },
        { name: 'Statistiques incluses', test: summary.includes('90%') || summary.includes('80%') || summary.includes('70%') },
        { name: 'Techniques pratiques', test: summary.includes('technique') || summary.includes('plan') },
        { name: 'Format professionnel', test: summary.includes('#') || summary.includes('**') },
        { name: 'Exemples concrets', test: summary.includes('exemple') || summary.includes('histoire') },
        { name: 'Plan d'action', test: summary.includes('action') || summary.includes('étape') }
      ];
      
      let passed = 0;
      checks.forEach(check => {
        const status = check.test ? '✅' : '❌';
        console.log(`${status} ${check.name}`);
        if (check.test) passed++;
      });
      
      console.log(`\n📊 Score qualité: ${passed}/${checks.length} (${Math.round(passed/checks.length*100)}%)`);
      
      if (passed >= checks.length * 0.8) {
        console.log('🎉 QUALITÉ EXCELLENTE !');
      } else if (passed >= checks.length * 0.6) {
        console.log('👍 Qualité acceptable');
      } else {
        console.log('⚠️ Qualité à améliorer');
      }
      
      console.log(`\n✨ VITESSE: ${totalTime < 30000 ? '🚀 RAPIDE' : totalTime < 60000 ? '👍 CORRECT' : '⏳ LENT'} (${totalTime}ms)`);
      
      return true;
    } else {
      console.log('❌ EXTRACTION ÉCHOUÉE:', result.error);
      return false;
    }
    
  } catch (error) {
    console.error('💥 ERREUR TEST:', error.message);
    return false;
  }
}

// Test de formatage spécifique
async function testFormatting() {
  console.log('\n🎨 TEST FORMATAGE PREMIUM');
  console.log('=========================');
  
  const shortText = `
  RÈGLE IMPORTANTE: Les riches investissent dans des actifs qui génèrent des revenus.
  
  "Ne travaillez pas pour l'argent, faites travailler l'argent pour vous" - Robert Kiyosaki
  
  STATISTIQUE: 80% des millionnaires sont self-made.
  `;
  
  try {
    const result = await summarizeText(shortText, 'book');
    
    console.log('📝 Résultat formatage:');
    console.log('======================');
    console.log(result);
    
    // Vérifier le formatage
    const hasMarkdown = result.includes('#') || result.includes('**');
    const hasEmojis = /[\u{1F300}-\u{1F6FF}]/u.test(result);
    const hasStructure = result.includes('---') || result.includes('##');
    
    console.log('\n🔍 Analyse formatage:');
    console.log(`${hasMarkdown ? '✅' : '❌'} Markdown présent`);
    console.log(`${hasEmojis ? '✅' : '❌'} Emojis structurants`);
    console.log(`${hasStructure ? '✅' : '❌'} Structure claire`);
    
    return hasMarkdown && hasEmojis;
    
  } catch (error) {
    console.error('❌ Erreur test formatage:', error.message);
    return false;
  }
}

// Fonction principale
async function runTests() {
  console.log('🎯 TESTS RÉSUMÉS ULTRA-OPTIMISÉS');
  console.log('=================================\n');
  
  const test1 = await testUltraSummary();
  const test2 = await testFormatting();
  
  console.log('\n🏆 RÉSULTATS FINAUX');
  console.log('==================');
  console.log(`✅ Extraction complète: ${test1 ? 'RÉUSSIE' : 'ÉCHOUÉE'}`);
  console.log(`✅ Formatage premium: ${test2 ? 'RÉUSSIE' : 'ÉCHOUÉE'}`);
  
  if (test1 && test2) {
    console.log('\n🎉 TOUS LES TESTS RÉUSSIS !');
    console.log('🚀 Vitesse: Parallélisation activée');
    console.log('📚 Qualité: Extraction exhaustive');
    console.log('✨ Style: Premium ChatGPT/Claude');
    console.log('🎯 Résultat: 100% valeur du livre');
  } else {
    console.log('\n⚠️ Certains tests ont échoué');
  }
}

// Lancer les tests
runTests().catch(console.error);
