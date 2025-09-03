#!/usr/bin/env node

/**
 * Script de déploiement propre pour Vercel
 * Supprime tous les caches et reconfigure proprement
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧹 Nettoyage complet pour déploiement Vercel...\n');

// 1. Supprimer les caches locaux
console.log('1️⃣ Suppression des caches...');
try {
  // Supprimer .vercel dans le projet
  if (fs.existsSync('../omely-website-premium/.vercel')) {
    fs.rmSync('../omely-website-premium/.vercel', { recursive: true, force: true });
    console.log('✅ Cache projet supprimé');
  }

  // Supprimer .vercel dans le profil utilisateur
  const userVercelPath = path.join(process.env.USERPROFILE || process.env.HOME, '.vercel');
  if (fs.existsSync(userVercelPath)) {
    fs.rmSync(userVercelPath, { recursive: true, force: true });
    console.log('✅ Cache utilisateur supprimé');
  }
} catch (error) {
  console.log('⚠️ Erreur lors de la suppression des caches:', error.message);
}

// 2. Nettoyer node_modules si nécessaire
console.log('\n2️⃣ Nettoyage node_modules...');
try {
  execSync('cd ../omely-website-premium && rm -rf node_modules package-lock.json', { stdio: 'inherit' });
  console.log('✅ node_modules nettoyé');
} catch (error) {
  console.log('⚠️ Erreur nettoyage node_modules:', error.message);
}

// 3. Réinstaller les dépendances
console.log('\n3️⃣ Réinstallation des dépendances...');
try {
  execSync('cd ../omely-website-premium && npm install', { stdio: 'inherit' });
  console.log('✅ Dépendances réinstallées');
} catch (error) {
  console.log('❌ Erreur installation:', error.message);
  process.exit(1);
}

// 4. Build de test
console.log('\n4️⃣ Test du build...');
try {
  execSync('cd ../omely-website-premium && npm run build', { stdio: 'inherit' });
  console.log('✅ Build réussi');
} catch (error) {
  console.log('❌ Erreur build:', error.message);
  process.exit(1);
}

// 5. Instructions finales
console.log('\n🎯 PRÊT POUR LE DÉPLOIEMENT !');
console.log('\nÉtapes suivantes:');
console.log('1. Ouvrez un terminal dans le dossier omely-website-premium');
console.log('2. Exécutez: npx vercel --prod');
console.log('3. Connectez-vous avec votre compte omelyaiteam@gmail.com');
console.log('4. Sélectionnez l\'équipe "omelyaiteam"');
console.log('5. Le déploiement devrait réussir avec la nouvelle configuration');

console.log('\n🔧 Si le problème persiste:');
console.log('- Vérifiez que omelyaiteam@gmail.com a accès à l\'équipe Vercel');
console.log('- Essayez de vous déconnecter/reconnecter à Vercel CLI');
console.log('- Vérifiez les membres de l\'équipe dans l\'interface Vercel');

console.log('\n🚀 Bonne chance avec le déploiement !');
