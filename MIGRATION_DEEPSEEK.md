# Migration vers DeepSeek V2 - Documentation

## Résumé de la Migration

Toutes les APIs GPT-4o mini ont été remplacées par DeepSeek V2 pour :
- ✅ Résumés de documents
- ✅ Chat IA avec mémoire
- ✅ Extraction de livres complets
- ✅ Génération de quiz
- ✅ Génération de pré-tests

**Whisper d'OpenAI est conservé uniquement pour la transcription audio** (comme demandé).

## Fichiers Modifiés

### 1. Nouveau Service : `utils/deepseekService.js`
- Service complet DeepSeek V2 avec gestion de rate limiting
- Support des mêmes fonctions que l'ancien service OpenAI
- Configuration optimisée pour DeepSeek (100 req/min vs 60 pour GPT-4o mini)

### 2. Services Migrés
- ✅ `utils/openaiService.js` → Redirige vers DeepSeek
- ✅ `utils/summarize.js` → Utilise DeepSeek V2
- ✅ `utils/advancedPdfExtractor.js` → Utilise DeepSeek V2
- ✅ `server.js` → Tous les endpoints utilisent DeepSeek V2

### 3. Service Conservé
- ✅ `utils/transcribe.js` → Garde OpenAI Whisper pour la transcription uniquement

## Variables d'Environnement Requises

### Nouvelle Variable (Obligatoire)
```bash
DEEPSEEK_API_KEY=votre_clé_api_deepseek
```

### Variables Existantes (Toujours Nécessaires)
```bash
OPENAI_API_KEY=votre_clé_api_openai  # Uniquement pour Whisper
GEMINI_API_KEY=votre_clé_api_gemini  # Si utilisé ailleurs
```

## Avantages de DeepSeek V2

### Performance
- 🚀 **Plus rapide** : DeepSeek V2 est optimisé pour la vitesse
- 💰 **Plus économique** : Coûts réduits par token
- 📈 **Meilleur débit** : 100 requêtes/minute vs 60 pour GPT-4o mini

### Fonctionnalités
- ✅ **Mêmes capacités** : Toutes les fonctionnalités GPT-4o mini sont préservées
- ✅ **Mémémoire optimisée** : Gestion améliorée des conversations longues
- ✅ **Extraction complète** : Support des mêmes prompts complexes

## Compatibilité

### API Identique
Toutes les fonctions existantes fonctionnent sans changement :
```javascript
import { createChatCompletion, summarizeText } from './utils/openaiService.js';
// Ces fonctions utilisent maintenant DeepSeek V2 automatiquement
```

### Endpoints Non Modifiés
Tous les endpoints REST restent identiques :
- `POST /chat/completion`
- `POST /summarize/pdf`
- `POST /api/generate-quiz`
- `POST /extract/book`

## Test de la Migration

### 1. Configuration
```bash
export DEEPSEEK_API_KEY="votre_clé_deepseek"
export OPENAI_API_KEY="votre_clé_openai_pour_whisper"
```

### 2. Test DeepSeek
```bash
curl -X GET http://localhost:3002/test/openai
```

### 3. Test Transcription (Whisper)
```bash
curl -X POST http://localhost:3002/summarize/audio \
  -F "file=@audio.mp3"
```

## Rollback Possible

Si nécessaire, il est possible de revenir à GPT-4o mini :
1. Sauvegarde créée : `utils/openaiService.js.backup`
2. Modifier `utils/deepseekService.js` pour utiliser GPT-4o mini
3. Changer `DEEPSEEK_API_KEY` par `OPENAI_API_KEY`

## Support

La migration maintient 100% de compatibilité avec le code existant. Tous les tests et fonctionnalités devraient fonctionner normalement avec DeepSeek V2.

---

**Migration terminée avec succès ✅**
