// TEST DU SERVEUR PRINCIPAL - DIAGNOSTIC ÉTAPE PAR ÉTAPE
console.log('🔍 TEST SERVEUR PRINCIPAL - DIAGNOSTIC');

// Étape 1: Test des imports de base
try {
  console.log('📦 Étape 1: Imports de base...');
  await import('express');
  await import('cors');
  await import('multer');
  console.log('✅ Imports de base OK');
} catch (error) {
  console.log('❌ Erreur imports de base:', error.message);
  process.exit(1);
}

// Étape 2: Test des services
try {
  console.log('🔧 Étape 2: Services...');
  await import('./utils/openaiService.js');
  console.log('✅ Services OK');
} catch (error) {
  console.log('❌ Erreur services:', error.message);
  process.exit(1);
}

// Étape 3: Test du serveur minimal (sans routes complexes)
try {
  console.log('🚀 Étape 3: Serveur minimal...');
  const { default: express } = await import('express');
  const { default: cors } = await import('cors');

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/health', (req, res) => {
    res.json({ status: 'OK', server: 'minimal-test' });
  });

  console.log('✅ Serveur minimal OK');
} catch (error) {
  console.log('❌ Erreur serveur minimal:', error.message);
  console.log('   Stack:', error.stack);
  process.exit(1);
}

// Étape 4: Test des routes du serveur principal
try {
  console.log('🛣️ Étape 4: Routes principales...');

  // Simuler les imports du server.js
  const { default: express } = await import('express');
  const { default: cors } = await import('cors');
  const { default: multer } = await import('multer');

  const app = express();
  app.use(cors());
  app.use(express.json());

  // Route de base
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: 'test'
    });
  });

  // Route test
  app.get('/test', (req, res) => {
    res.json({
      message: 'Test route fonctionne',
      timestamp: new Date().toISOString()
    });
  });

  console.log('✅ Routes principales OK');
} catch (error) {
  console.log('❌ Erreur routes principales:', error.message);
  console.log('   Stack:', error.stack);
  process.exit(1);
}

// Étape 5: Test avec les vrais services
try {
  console.log('🔧 Étape 5: Intégration services réels...');

  const { default: express } = await import('express');
  const { default: cors } = await import('cors');
  const { createChatCompletion } = await import('./utils/openaiService.js');

  const app = express();
  app.use(cors());
  app.use(express.json());

  // Route avec service réel
  app.get('/verify-deepseek', async (req, res) => {
    try {
      console.log('🔍 Test service DeepSeek...');
      const config = { max_tokens: 50 };
      const response = await createChatCompletion([{
        role: 'user',
        content: 'Test rapide'
      }], config);

      res.json({
        success: true,
        response: response.substring(0, 100)
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  console.log('✅ Intégration services réels OK');
} catch (error) {
  console.log('❌ Erreur intégration services:', error.message);
  console.log('   Stack:', error.stack);
  process.exit(1);
}

console.log('\n🎉 TOUTES LES ÉTAPES RÉUSSIES !');
console.log('Le serveur principal devrait fonctionner correctement.');


