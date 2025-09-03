#!/usr/bin/env node

/**
 * Script de déploiement frontend OMELY vers Vercel
 * Après nettoyage complet du repo GitHub
 */

const { execSync } = require('child_process');

console.log('🚀 DÉPLOIEMENT FRONTEND OMELY VERS VERCEL\n');

// Vérifier que nous sommes dans le bon dossier
console.log('📍 Vérification du dossier...');
try {
  const packageJson = require('./package.json');
  if (packageJson.name !== 'omely-ai-chat') {
    throw new Error('Mauvais dossier - doit être omely-website-premium');
  }
  console.log('✅ Bon dossier détecté:', packageJson.name);
} catch (error) {
  console.log('❌ Erreur: Pas dans le bon dossier');
  console.log('Allez dans omely-website-premium/');
  process.exit(1);
}

// Vérifier l'identité Git
console.log('\n👤 Vérification identité Git...');
try {
  const email = execSync('git config user.email', { encoding: 'utf8' }).trim();
  const name = execSync('git config user.name', { encoding: 'utf8' }).trim();

  if (email !== 'omelyaiteam@gmail.com' || name !== 'Omely AI Team') {
    console.log('⚠️ Identité Git incorrecte:');
    console.log('Email:', email);
    console.log('Name:', name);
    console.log('Configuration automatique...');

    execSync('git config user.email "omelyaiteam@gmail.com"');
    execSync('git config user.name "Omely AI Team"');
    console.log('✅ Identité corrigée');
  } else {
    console.log('✅ Identité Git correcte');
  }
} catch (error) {
  console.log('❌ Erreur vérification Git');
}

// Instructions finales
console.log('\n🎯 DÉPLOIEMENT PRÊT !');
console.log('\nÉtapes à suivre :');
console.log('1. Assurez-vous que omelyaiteam@gmail.com a accès à l\'équipe Vercel "omelyaiteam"');
console.log('2. Ouvrez un terminal et allez dans ce dossier (omely-website-premium/)');
console.log('3. Exécutez : npx vercel --prod');
console.log('4. Connectez-vous avec : omelyaiteam@gmail.com');
console.log('5. Sélectionnez l\'équipe : omelyaiteam');
console.log('6. Le déploiement devrait réussir !');

console.log('\n🔧 Variables d\'environnement à configurer dans Vercel :');
console.log('- GEMINI_API_KEY : Votre clé Gemini AI');
console.log('- BACKEND_API_URL : URL de votre backend Fly.io');
console.log('- NEXTAUTH_SECRET : Secret pour l\'authentification (optionnel)');

console.log('\n📊 Attendu :');
console.log('- Build automatique Next.js ✅');
console.log('- Déploiement en ~30 secondes ✅');
console.log('- URL : https://votre-app.vercel.app ✅');

console.log('\n💡 Si problème persiste :');
console.log('- Vérifiez https://vercel.com/dashboard les membres de l\'équipe');
console.log('- Essayez : npx vercel logout && npx vercel login');

console.log('\n🚀 BONNE CHANCE POUR LE DÉPLOIEMENT ! 🎉');
