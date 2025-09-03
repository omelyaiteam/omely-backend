import { summarizeContentDetailed } from './server.js';

async function testPrinciple() {
  try {
    console.log('🧪 Test d\'extraction des principes clés...');
    
    const testText = `Les Secrets d'un Esprit Millionnaire
    par T. Harv Eker
    
    CHAPITRE 1: VOTRE PLAN FINANCIER INTÉRIEUR
    
    Le plan financier intérieur détermine votre niveau de richesse.
    
    PRINCIPE D'ENRICHISSEMENT :
    Si vous souhaitez changer les fruits, vous devrez d'abord
    changer les racines. Si vous souhaitez changer le visible,
    il vous faudra d'abord changer l'invisible.
    
    RÈGLE DE RICHESSE :
    Les riches pensent différemment des pauvres.
    
    DIFFÉRENCE 1 :
    Les riches pensent: "Je crée ma vie"
    Les pauvres pensent: "La vie m'arrive"
    
    LOI DE L'ABONDANCE :
    L'argent est une énergie qui suit vos pensées.
    
    ENSEIGNEMENT CLÉ :
    Votre plan financier intérieur détermine votre niveau de richesse.`;
    
    console.log('📝 Texte de test avec principes:');
    console.log(testText);
    
    const result = await summarizeContentDetailed(testText, 'test');
    
    console.log('\n📊 RÉSULTAT:');
    console.log('='.repeat(50));
    console.log(result.summary);
    console.log('='.repeat(50));
    console.log(`⏱️ Temps de traitement: ${result.summarizationTime}ms`);
    
  } catch (error) {
    console.error('❌ Erreur test principe:', error);
  }
}

testPrinciple();


