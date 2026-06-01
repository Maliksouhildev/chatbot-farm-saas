import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : wsp : main
// Nodes   : 162  |  Connections: 152
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// SetContext                         code
// AiRouteur1                         agent                      [AI] [retry]
// _2DownloadImage1                   httpRequest                [creds] [retry]
// _1GetImageUrl1                     httpRequest                [creds] [retry]
// If4                                if
// ChercherCatalogueGs                toolWorkflow               [retry] [ai_tool]
// OnFormSubmission                   formTrigger
// OpenaiChatModel7                   lmChatOpenAi               [creds] [retry] [ai_languageModel]
// EmbeddingsOpenai1                  embeddingsOpenAi           [creds] [retry] [ai_embedding]
// EmbeddingsOpenai                   embeddingsOpenAi           [creds] [retry] [ai_embedding]
// OpenaiChatModel8                   lmChatOpenAi               [creds] [retry] [ai_languageModel]
// OpenaiChatModel3                   lmChatOpenAi               [creds] [retry] [ai_languageModel]
// OpenaiChatModel2                   lmChatOpenAi               [creds] [retry] [ai_languageModel]
// OpenaiChatModel1                   lmChatOpenAi               [creds] [retry] [ai_languageModel]
// OpenaiChatModel                    lmChatOpenAi               [creds] [retry] [ai_languageModel]
// WaImageVoyageur2                   whatsApp                   [creds]
// If3                                if
// WaImageVoyageur1                   whatsApp                   [creds]
// If2                                if
// IsRealMessage                      if
// RecursiveCharacterTextSplitter     textSplitterRecursiveCharacterTextSplitter [retry] [ai_textSplitter]
// DefaultDataLoader1                 documentDefaultDataLoader  [AI] [retry] [ai_document]
// QdrantInsert                       vectorStoreQdrant          [AI] [creds] [retry]
// QdrantVectorStore                  vectorStoreQdrant          [AI] [creds] [retry] [ai_vectorStore]
// AgentSupportClient                 agent                      [AI] [retry]
// OutilInfosHospitable1              toolWorkflow               [retry] [ai_tool] [ai_tool]
// ExtraireImageVoyageur              code
// WaImageVoyageur                    whatsApp                   [creds]
// If_                                if
// Code1                              code
// WebhookMetaVerify                  webhook
// RespondToMeta                      respondToWebhook
// WebhookReceiveMessage              webhook
// IsTextMessage                      switch
// ExtractText                        set
// TheRouter1                         switch
// BookingAgentVoyageur               agent                      [AI] [retry]
// WaVoyageur1                        httpRequest                [creds] [retry]
// BookingAgentProprietaire           agent                      [AI] [retry]
// SwitchVille1                       switch
// WaPoseQuestion1                    httpRequest                [creds] [retry]
// WaRefus1                           httpRequest                [creds] [retry]
// WaDemandePhotosInit                httpRequest                [creds] [retry]
// WaAttenteClient                    whatsApp                   [creds] [retry]
// RedisCrmHorsZone                   redis                      [creds]
// GenererScriptGamma                 agent                      [AI] [retry]
// RedisCrmProprietaire               redis                      [creds]
// WaScriptAdmin                      whatsApp                   [creds] [retry]
// WaMessageSupport                   httpRequest                [creds] [retry]
// _1PrepRedisVars                    code
// _2RedisGetInitial                  redis                      [creds]
// _3CalcNewBuffer                    code
// _4RedisSet                         redis                      [creds]
// _5WaitDebounce                     wait
// _6RedisGetCheck                    redis                      [creds]
// _7CollisionCheck                   if
// _8RedisDeleteKey                   redis                      [creds]
// DebouncedText                      code
// _10HaltNewerMsgExists              noOp
// RedisChatMemory                    memoryRedisChat            [creds] [retry] [ai_memory] [ai_memory] [ai_memory]
// RedisChatMemory1                   memoryRedisChat            [creds] [retry] [ai_memory]
// RedisChatMemory2                   memoryRedisChat            [creds] [retry] [ai_memory]
// DisponibilitesHospitable           toolWorkflow               [retry] [ai_tool]
// VerifierStatutPaiement             toolWorkflow               [retry] [ai_tool]
// BasicLlmChain                      chainLlm                   [AI] [retry]
// OpenaiChatModel4                   lmChatOpenAi               [creds] [retry] [ai_languageModel] [ai_languageModel] [ai_languageModel] [ai_languageModel] [ai_languageModel]
// TraductionWaPoseQuestion1          chainLlm                   [AI] [retry]
// TraductionWaRefus1                 chainLlm                   [AI] [retry]
// TraductionWaDemandePhotosInit      chainLlm                   [AI] [retry]
// TraductionWaMessageSupport         chainLlm                   [AI] [retry]
// RedisGetTextLang                   redis                      [creds]
// RedisSetTextLang                   redis                      [creds]
// _1GetAudioUrl                      httpRequest                [creds] [retry]
// _2DownloadAudio                    httpRequest                [creds] [retry]
// FormatTranscribedText              set
// FilterDarjaArabic                  if
// WaEscaladeLangueLocale             httpRequest                [creds] [retry]
// IsAudio                            if
// HttpRequest                        httpRequest                [creds] [retry]
// CodeCheckPause                     code
// IfPaused                           if
// CodeSetPause                       code
// CodeBuildAdminReport1              code
// CodeBuildAdminReport2              code
// WaReponseVocaleClient              httpRequest                [creds] [retry]
// WaForwardAudioAAdmin               httpRequest                [creds] [retry]
// RedisGetContext                    redis                      [creds]
// ActiveTextHistory                  code
// RedisGetHistory                    redis                      [creds]
// RedisSetHistory                    redis                      [creds]
// DetectLanguageHttp                 httpRequest                [creds] [retry]
// SaveActiveBranch                   code
// IfNuclearReset                     if
// WaResetConfirmation                httpRequest                [creds] [retry]
// Redis                              redis                      [creds]
// Redis1                             redis                      [creds]
// ReactionRandomizer                 code
// DetectOffreEnvoyee                 code
// IsOffreFinished                    if
// RedisWipeAppt                      redis                      [creds]
// RedisWipeVision                    redis                      [creds]
// RedisGetPhotoUrls                  redis                      [creds]
// ReactionDelay                      wait
// MarkAsReadHttp                     httpRequest                [creds] [retry]
// ResetPhotos                        toolWorkflow               [retry] [ai_tool]
// RedisGetBranch                     redis                      [creds]
// RechercheInformationsAgence        toolVectorStore            [AI] [retry] [ai_tool] [ai_tool] [ai_tool]
// OutilExportCrm                     toolWorkflow               [retry] [ai_tool]
// RedisGetApptsState                 redis                      [creds]
// StatePrepCode                      code
// ExtractApptsState                  httpRequest                [creds] [retry]
// StateCleanCode                     code
// RedisSetApptsState                 redis                      [creds]
// BuildBodyWaVoyageur1               code
// BuildBodyWaPoseQuestion1           code
// BuildBodyWaRefus1                  code
// BuildBodyWaDemandePhotosInit       code
// BuildBodyWaMessageSupport          code
// BuildBodyWaEscaladeLangueLocale    code
// BuildBodyWaReponseVocaleClient     code
// BuildBodyWaResetConfirmation       code
// CodeWipeMemory                     code
// RedisNuclearDelete                 redis                      [creds]
// StopSpam                           code
// _3AiVisionAnalysis1                agent                      [AI] [retry]
// OpenaiChatModel10                  lmChatOpenAi               [creds] [retry] [ai_languageModel]
// RedisGetFinalBatch                 redis                      [creds]
// TheBrainMoyenneMessage             code
// SauvegarderMemoireIa               redis                      [creds]
// WaEnvoiFinalUnique                 whatsApp                   [creds]
// TraductionWaEvaluationPhotos       chainLlm                   [AI] [retry]
// OpenaiChatModelTraduction          lmChatOpenAi               [creds] [retry] [ai_languageModel]
// RedisCountNode                     redis                      [creds]
// WaitAntiCollision                  wait
// RedisGetBatch                      redis                      [creds]
// CodeAppendBatch                    code
// RedisSetBatch                      redis                      [creds]
// WaitDebounce                       wait
// RedisCheckCount                    redis                      [creds]
// IfCollisionDernierePhoto           if
// RedisSavePhotoUrls                 redis                      [creds]
// RedisSavePhotoUrlsAfterAppend      redis                      [creds]
// RedisGetImageLang                  redis                      [creds]
// SendReactionHttp1                  httpRequest                [onError→regular] [creds] [retry]
// RedisGetApptsStateImg              redis                      [creds]
// RedisClearPhotoBatch               redis                      [creds]
// RedisGetLangStats                  redis                      [creds]
// CalculatePredominantLang           code
// RedisSetLangStats                  redis                      [creds]
// BuildBodyWaMediaInvalide           code
// WaErreurMediaClient                httpRequest                [creds]
// BuildBodyAdminError                code
// WaAdminErrorAlert                  httpRequest                [creds]
// RedisTagActiveClient24h            redis                      [creds]
// RedisSetApptsStateImg              redis                      [creds]
// ConvertAudioToBase64               code
// GenerateDynamicPromp               code
// GenerateDynamicPromp1              code
// GenerateDynamicPromp2              code
// GenerateDynamicPromp3              code
// GenerateDynamicPromp4              code
// GenerateDynamicPromp8              code
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// OnFormSubmission
//    → QdrantInsert
//      → AgentSupportClient
//        → If3
//          → CodeBuildAdminReport2
//            → WaImageVoyageur2
//              → CodeSetPause
//                → Code1
//         .out(1) → GenerateDynamicPromp2
//            → TraductionWaMessageSupport
//              → BuildBodyWaMessageSupport
//                → WaMessageSupport
//                  → Code1 (↩ loop)
// WebhookMetaVerify
//    → RespondToMeta
// WebhookReceiveMessage
//    → IsRealMessage
//      → CodeCheckPause
//        → IfPaused
//         .out(1) → IsTextMessage
//            → ExtractText
//              → IfNuclearReset
//                → CodeWipeMemory
//                  → RedisNuclearDelete
//                    → StopSpam
//                      → BuildBodyWaResetConfirmation
//                        → WaResetConfirmation
//               .out(1) → _1PrepRedisVars
//                  → _2RedisGetInitial
//                    → _3CalcNewBuffer
//                      → _4RedisSet
//                        → _5WaitDebounce
//                          → _6RedisGetCheck
//                            → _7CollisionCheck
//                              → _8RedisDeleteKey
//                                → DebouncedText
//                                  → RedisGetHistory
//                                    → ActiveTextHistory
//                                      → RedisSetHistory
//                                        → RedisGetTextLang
//                                          → DetectLanguageHttp
//                                            → RedisGetLangStats
//                                              → CalculatePredominantLang
//                                                → RedisSetLangStats
//                                                  → RedisSetTextLang
//                                                    → IsAudio
//                                                      → RedisGetContext
//                                                        → RedisGetPhotoUrls
//                                                          → RedisGetBranch
//                                                            → SetContext
//                                                              → AiRouteur1
//                                                                → SaveActiveBranch
//                                                                  → Redis1
//                                                                    → TheRouter1
//                                                                      → BookingAgentVoyageur
//                                                                        → If2
//                                                                          → CodeBuildAdminReport1
//                                                                            → WaImageVoyageur1
//                                                                              → CodeSetPause (↩ loop)
//                                                                         .out(1) → ExtraireImageVoyageur
//                                                                            → If_
//                                                                              → WaImageVoyageur
//                                                                                → BuildBodyWaVoyageur1
//                                                                                  → WaVoyageur1
//                                                                                    → Code1 (↩ loop)
//                                                                             .out(1) → GenerateDynamicPromp4
//                                                                                → BasicLlmChain
//                                                                                  → BuildBodyWaVoyageur1 (↩ loop)
//                                                                     .out(1) → RedisGetApptsState
//                                                                        → StatePrepCode
//                                                                          → ExtractApptsState
//                                                                            → StateCleanCode
//                                                                              → RedisSetApptsState
//                                                                                → BookingAgentProprietaire
//                                                                                  → If4
//                                                                                    → CodeBuildAdminReport1 (↩ loop)
//                                                                                   .out(1) → DetectOffreEnvoyee
//                                                                                      → SwitchVille1
//                                                                                        → TraductionWaPoseQuestion1
//                                                                                          → BuildBodyWaPoseQuestion1
//                                                                                            → WaPoseQuestion1
//                                                                                              → Code1 (↩ loop)
//                                                                                       .out(1) → TraductionWaPoseQuestion1 (↩ loop)
//                                                                                       .out(2) → RedisCrmHorsZone
//                                                                                          → GenerateDynamicPromp3
//                                                                                            → TraductionWaRefus1
//                                                                                              → BuildBodyWaRefus1
//                                                                                                → WaRefus1
//                                                                                                  → Code1 (↩ loop)
//                                                                                       .out(3) → WaAttenteClient
//                                                                                          → GenererScriptGamma
//                                                                                            → RedisCrmProprietaire
//                                                                                              → WaScriptAdmin
//                                                                                                → Code1 (↩ loop)
//                                                                                       .out(4) → GenerateDynamicPromp
//                                                                                          → TraductionWaDemandePhotosInit
//                                                                                            → BuildBodyWaDemandePhotosInit
//                                                                                              → WaDemandePhotosInit
//                                                                                                → Code1 (↩ loop)
//                                                                                       .out(5) → GenerateDynamicPromp1
//                                                                                          → TraductionWaPoseQuestion1 (↩ loop)
//                                                                                      → IsOffreFinished
//                                                                                        → RedisWipeAppt
//                                                                                          → RedisWipeVision
//                                                                     .out(2) → AgentSupportClient (↩ loop)
//                                                                     .out(3) → AgentSupportClient (↩ loop)
//                                                                     .out(4) → AgentSupportClient (↩ loop)
//                                                     .out(1) → RedisGetContext (↩ loop)
//                             .out(1) → _10HaltNewerMsgExists
//           .out(1) → _1GetImageUrl1
//              → Redis
//                → _2DownloadImage1
//                  → _3AiVisionAnalysis1
//                    → RedisCountNode
//                      → WaitAntiCollision
//                        → RedisGetBatch
//                          → CodeAppendBatch
//                            → RedisSavePhotoUrlsAfterAppend
//                              → RedisSetBatch
//                                → WaitDebounce
//                                  → RedisCheckCount
//                                    → IfCollisionDernierePhoto
//                                      → RedisGetFinalBatch
//                                        → RedisGetApptsStateImg
//                                          → TheBrainMoyenneMessage
//                                            → RedisSetApptsStateImg
//                                              → RedisSavePhotoUrls
//                                                → RedisGetImageLang
//                                                  → GenerateDynamicPromp8
//                                                    → TraductionWaEvaluationPhotos
//                                                      → SauvegarderMemoireIa
//                                                        → WaEnvoiFinalUnique
//                                                          → RedisClearPhotoBatch
//           .out(2) → _1GetAudioUrl
//              → _2DownloadAudio
//                → HttpRequest
//                  → FormatTranscribedText
//                    → _1PrepRedisVars (↩ loop)
//           .out(4) → BuildBodyWaMediaInvalide
//              → WaErreurMediaClient
//           .out(4) → BuildBodyAdminError
//              → WaAdminErrorAlert
//      → ReactionRandomizer
//        → ReactionDelay
//          → SendReactionHttp1
//      → RedisTagActiveClient24h
//    → MarkAsReadHttp
// FilterDarjaArabic
//    → BuildBodyWaEscaladeLangueLocale
//      → WaEscaladeLangueLocale
//        → WaForwardAudioAAdmin
//          → BuildBodyWaReponseVocaleClient
//            → WaReponseVocaleClient
//              → CodeSetPause (↩ loop)
//   .out(1) → RedisGetContext (↩ loop)
// ConvertAudioToBase64
//    → HttpRequest (↩ loop)
//
// AI CONNECTIONS
// AiRouteur1.uses({ ai_languageModel: OpenaiChatModel, ai_memory: RedisChatMemory2 })
// DefaultDataLoader1.uses({ ai_textSplitter: RecursiveCharacterTextSplitter })
// QdrantInsert.uses({ ai_embedding: EmbeddingsOpenai, ai_document: [DefaultDataLoader1] })
// QdrantVectorStore.uses({ ai_embedding: EmbeddingsOpenai1 })
// AgentSupportClient.uses({ ai_languageModel: OpenaiChatModel3, ai_tool: [OutilInfosHospitable1, RechercheInformationsAgence], ai_memory: RedisChatMemory })
// BookingAgentVoyageur.uses({ ai_tool: [ChercherCatalogueGs, OutilInfosHospitable1, DisponibilitesHospitable, VerifierStatutPaiement, RechercheInformationsAgence], ai_languageModel: OpenaiChatModel2, ai_memory: RedisChatMemory })
// BookingAgentProprietaire.uses({ ai_languageModel: OpenaiChatModel1, ai_memory: RedisChatMemory, ai_tool: [ResetPhotos, RechercheInformationsAgence, OutilExportCrm] })
// GenererScriptGamma.uses({ ai_languageModel: OpenaiChatModel8, ai_memory: RedisChatMemory1 })
// BasicLlmChain.uses({ ai_languageModel: OpenaiChatModel4 })
// TraductionWaPoseQuestion1.uses({ ai_languageModel: OpenaiChatModel4 })
// TraductionWaRefus1.uses({ ai_languageModel: OpenaiChatModel4 })
// TraductionWaDemandePhotosInit.uses({ ai_languageModel: OpenaiChatModel4 })
// TraductionWaMessageSupport.uses({ ai_languageModel: OpenaiChatModel4 })
// RechercheInformationsAgence.uses({ ai_languageModel: OpenaiChatModel7, ai_vectorStore: QdrantVectorStore })
// _3AiVisionAnalysis1.uses({ ai_languageModel: OpenaiChatModel10 })
// TraductionWaEvaluationPhotos.uses({ ai_languageModel: OpenaiChatModelTraduction })
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'QOHXjLEGpudJ5cki',
    name: 'wsp : main',
    active: true,
    projectId: 'eN0JyhHFEkunAK7Y',
    settings: { executionOrder: 'v1' },
})
export class WspMainWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        id: 'ed4623bc-6a41-4030-87d3-b5a4d84ca9fd',
        name: 'Set Context',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-5480, 2980],
    })
    SetContext = {
        jsCode: `const sender = $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.messages[0].from;
const phone = sender;

let nom_client = "Client WhatsApp";
try { nom_client = $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.contacts[0].profile.name || "Client WhatsApp"; } catch(e){}

// Récupération des textes
let text = $('Active Text & History').first().json.text || "";
let lastBotAction = "";
try {
    lastBotAction = Object.values($('Redis_Get_Context').first().json)[0] || "";
} catch (e) {}

let photosRech = "Aucune photo haute qualité enregistrée";

// PRIMARY: Read photo URLs from dedicated Redis key (set by The Brain after processing)
try {
    const redisPhotoUrls = $('Redis Get Photo URLs').first().json;
    const urlVal = Object.values(redisPhotoUrls)[0] || "";
    if (urlVal && urlVal.length > 5) {
        photosRech = urlVal;
    }
} catch(e) {}

// FALLBACK: Check static data (legacy)
if (photosRech === "Aucune photo haute qualité enregistrée") {
    try {
        const staticData = $getWorkflowStaticData('global');
        let rawPhotos = staticData['photos_' + sender];
        if (rawPhotos && rawPhotos.length > 0) {
            let urlArray = Array.isArray(rawPhotos) ? rawPhotos : [rawPhotos];
            if (urlArray.join("").length > 5) {
               photosRech = urlArray.join("\\n");
            }
        }
    } catch(e) {}
}


// PRIMARY: Extract photo URLs from bot context note (written by The Brain)
if (photosRech === "Aucune photo haute qualité enregistrée") {
    try {
        const contextNote = lastBotAction || "";
        const urlMatch = contextNote.match(/PHOTO_URLS:\\s*(.*)/);
        if (urlMatch && urlMatch[1] && urlMatch[1].trim() !== '') {
            let extractedUrls = urlMatch[1].trim();
            photosRech = extractedUrls !== 'AUCUN_LIEN' ? extractedUrls.split(',').join('\\n') : 'IMAGE_RECUE_SANS_URL';
        }
    } catch(e) {}
}
let activeBranch = "";
try {
    activeBranch = Object.values($('Redis_Get_Branch').first().json)[0] || "";
} catch (e) {}
activeBranch = activeBranch || "";

// FIX AMNESIA : Si le bot a analysé des photos dans le contexte récent, on valide l'étape des photos !
let consigne_photos = "⚠️ AUCUNE PHOTO ENREGISTRÉE DANS LE DOSSIER.";


// --- SMART PHOTO GUARD (no wipe if PHOTOS_VALIDEES is present) ---
let activeApptsStr = "[]";
try {
    activeApptsStr = $('Redis Get Appts State').first().json.value || "[]";
} catch(e) {}
// Only wipe ghost photos if there's NO [PHOTOS_VALIDEES] marker in context  
const hasPhotosValidated = (lastBotAction || "").includes("[PHOTOS_VALIDEES");
if (activeApptsStr === "[]" && !hasPhotosValidated && text.toLowerCase().trim() !== "photo") {
    photosRech = "Aucune photo haute qualité enregistrée";
}
// -----------------------------

const photoStepFullyValidated = lastBotAction && (lastBotAction.includes("[PHOTOS_VALIDEES")); // We will inject this marker when done

if (photoStepFullyValidated || (photosRech && photosRech !== "Aucune photo haute qualité enregistrée" && photosRech.trim() !== "")) {
    consigne_photos = "[STATUT ÉTAPE 2] : ✅ PHOTOS REÇUES. L'Étape 2 est 100% validée ! Le client vient d'envoyer les photos. Évalue l'historique de la conversation et pose DIRECTEMENT, de façon très naturelle, la prochaine question manquante.";
}

let userLang = "Français";
try {
    const txtLangItemUpdate = $('Calculate Predominant Lang').isExecuted ? $('Calculate Predominant Lang').first() : null;
    const txtLangItemOld = $('Redis Get Text Lang').isExecuted ? $('Redis Get Text Lang').first() : null;
    const imgLangItem = $('Redis Get Image Lang').isExecuted ? $('Redis Get Image Lang').first() : null;
    
    if (txtLangItemUpdate && txtLangItemUpdate.json && txtLangItemUpdate.json.dominant_lang) {
        userLang = txtLangItemUpdate.json.dominant_lang;
    } else if (txtLangItemOld && txtLangItemOld.json && txtLangItemOld.json.value && !txtLangItemOld.json.value.includes('Aucune')) {
        userLang = txtLangItemOld.json.value;
    } else if (imgLangItem && imgLangItem.json && imgLangItem.json.value) {
        userLang = imgLangItem.json.value;
    }
} catch(e) {}

// --- ANTI HALLUCINATION ROUTEUR ---
const rawUserText = text; 
const wordCount = rawUserText.trim().split(/\\s+/).length;

// 1. Highly typo-tolerant regex (catches ",ettre", "mon apart", "je veu")
const hasNewIntent = /(je cherche|je veu|jveu|besoin|j'aimerai|louer pour moi|cherche.*apart|trouver.*apart|mettre.*location|,ettre.*location|mon appart|mon apart|mon appartement|ma villa|mon bien|ma maison)/i.test(rawUserText);

// 2. Detect pure greetings so they NEVER get locked
const isPureGreeting = /^(ykho|salam|bonjour|salut|hello|hi|cc|coucou|wach|wesh)[\\s]*$/i.test(rawUserText.trim());

let textPourRouteur = rawUserText;

// Lock only for short messages, IF it's not a greeting, and IF there's no new intent
if (activeBranch && wordCount < 12 && !hasNewIntent && !isPureGreeting) {
    if (activeBranch === "proprietaire_potentiel") {
        textPourRouteur = "Je suis un propriétaire qui souhaite confier son appartement en gestion locative. Réponds UNIQUEMENT: proprietaire_potentiel";
    } else if (activeBranch === "voyageur_potentiel") {
        textPourRouteur = "Je cherche un appartement à louer pour moi. Réponds UNIQUEMENT: voyageur_potentiel";
    }
}

// NOW we can safely inject the system notes for the Agent
if (consigne_photos.includes('✅')) {
    text = text + "\\n\\n[NOTE SYSTÈME (Ne pas lire à voix haute) : L'étape des photos (Étape 2) est terminée à 100% avec succès dans un autre canal. NE ME DEMANDE PLUS JAMAIS DE PHOTOS. JE LES AI DÉJÀ ENVOYÉES. Pose-moi exclusivement la question sur l'étape suivante manquante.]";
}
// Inject per-turn mandatory reminder into the message
const currentDate = new Date().toISOString().split('T')[0];
const rappelSysteme = \`[RAPPEL SYSTÈME - \${currentDate}] AVANT de répondre, tu DOIS appeler Verifier_Statut_Paiement. Si le client pose une question sur un appartement déjà présenté comme disponible, réponds depuis le catalogue — ne dis JAMAIS qu'il est indisponible.\\n\\nMessage du client: \`;

return [{
  json: {
    phone: phone,
    nom_client: nom_client,
    consigne_dynamique_photos: consigne_photos,
    consigne_surface: "[SANTÉ MENTALE] : Si la surface donnée est aberrante (ex: 1000m² ou plus, 5m² etc), demande poliment confirmation. Ne valide pas la surface sans être sûr.",
    text: rappelSysteme + text,
    text_pour_routeur: textPourRouteur,
    langue_utilisateur: userLang,
    liens_photos: photosRech,
    contexte_recent: lastBotAction,
    active_branch: activeBranch
  }
}];`,
    };

    @node({
        id: 'fccf682d-f332-4948-af17-789ce8b2a9a0',
        name: 'AI Routeur1',
        type: '@n8n/n8n-nodes-langchain.agent',
        version: 1.7,
        position: [-5260, 2980],
        retryOnFail: true,
        maxTries: 5,
        waitBetweenTries: 5000,
    })
    AiRouteur1 = {
        promptType: 'define',
        text: "={{ $('Set Context').first().json.text_pour_routeur }}",
        options: {
            systemMessage: `=You are an invisible IT router. Your goal: print EXACTLY ONE WORD from 4 choices.

🔒 [ACTIVE BRANCH LOCK - ABSOLUTE PRIORITY] : {{ $('Set Context').first().json.active_branch }}
🔥 INVIOLABLE GOLDEN RULE 🔥: If the LOCK above IS NOT EMPTY, YOU ARE ABSOLUTELY FORBIDDEN FROM CHANGING IT if the user provides a short answer ("oui", "non", "hydra", "yes", "75m", etc). You MUST EXACTLY copy the lock's value. 
EXCEPTION: The ONLY way to change an active lock is if the client writes a complete sentence stating they want to completely change the subject, OR if they explicitly CORRECT themselves (e.g., "no I mean", "nn je veux dire", "en fait je veux"), OR if they provide a clear new intent (like "j'ai un appartement à mettre en location" which explicitly changes from traveler to owner). If the intent clearly changes, you MUST change the classification to match their NEW intent.

[RECENT BOT CONTEXT] : {{ $('Set Context').first().json.contexte_recent }}

[THE CHOICES]
1. proprietaire_potentiel — They want to give us their property to MANAGE or LIST for rental
2. voyageur_potentiel — They want to BOOK or RENT an apartment to STAY IN
3. client_existant — They are already staying with us and have an issue
4. accueil_general — Simple greeting or off-topic

[CLASSIFICATION RULES - READ CAREFULLY]
[🚨 ALERTE DARJA - MOTS CLÉS TEMPELS 🚨]
ATTENTION : En Darja, "lghedoua", "Lghedoua", "ghedoua", "ghodwa" veut dire "POUR DEMAIN" (tomorrow). "lyoum" = "aujourd'hui". "lila" = "une nuit". "bch ner9od" = "pour dormir".
SI LE MESSAGE CONTIENT "lghedoua", "Lghedoua", "ghedoua", "ghodwa", "lyoum", ou "lila" : TU DOIS IMPÉRATIVEMENT CHOISIR "voyageur_potentiel" !!!
Le client cherche à dormir quelque part. Ce n'est PAS un propriétaire, même s'il utilise le mot ambigu "nekri" ou "partma".

The key distinction is: does the person OWN/HAVE a property, or do they WANT TO STAY somewhere?

→ proprietaire_potentiel SIGNALS (person has a property to offer):
  - "I have an apartment" / "J'ai un appartement" / "J'ai un appart"
  - "I want to rent OUT my apartment" / "Je veux louer mon appartement" / "mettre en location"
  - "to rent out" / "à louer" (when referring to THEIR OWN property)
  - "gestion" / "gérer" / "confier mon bien"
  - "I have a property in Hydra" / "J'ai un bien/logement"

→ voyageur_potentiel SIGNALS (person wants to sleep somewhere):
  - "I want to rent" / "Je veux louer" (without "my" / "mon" — they want to rent from us)
  - "réserver" / "book" / "séjourner" / "passer la nuit" / "loger"
  - "do you have an apartment?" / "vous avez un appart?"
  - "rent for tomorrow" / "louer pour demain"

⚠️ CRITICAL DISAMBIGUATION — "rent" / "louer" is ambiguous:
  - "I want to rent FOR tomorrow" → voyageur_potentiel (renting TO STAY)
  - "I have an apartment to rent OUT" → proprietaire_potentiel (offering their property)
  - "I want to rent OUT my apartment" → proprietaire_potentiel
  - "rent in Hydra" → voyageur_potentiel (looking to stay in Hydra)
  - "I have an apartment to rent out in Hydra for tomorrow" → proprietaire_potentiel (they OWN it)

→ accueil_general: "hello", "bonjour", "salam", "hi" alone
→ client_existant: "my stay", "I'm at your apartment", "problem with the key"

IN DARJA:
(Note: 'ta3i', 'dialy', 'darti' mean 'my' / 'mine' in Darja)
- "Hab nekri" (without "ta3i" or "darti") → voyageur_potentiel
- "Hab n7at darti/darty", "nekri lpartma ta3i", "appart ta3i", "kra ta3i" → proprietaire_potentiel
- ⚠️ CRITICAL DARJA DISAMBIGUATION: "nekri partma" is ambiguous. BUT if the user adds timeframes like "lghedoua" (tomorrow), "lyoum" (today), "lila" (one night), "bch ner9od" (to sleep), "lyamat" (these days) -> IT IS ALWAYS voyageur_potentiel! They want to sleep there.
- Example: "nekri partma lghedoua bch ner9od Machi ta3i" -> voyageur_potentiel.
- Example: "Salam Kho rani 7ab nekri partma lghedoua nchallah" -> voyageur_potentiel.

[🚨 OVERRIDE ABSOLU 🚨]
Si le message contient EXACTEMENT "Salam Kho rani 7ab nekri partma lghedoua nchallah" (ou similaire), TU DOIS RENVOYER "voyageur_potentiel". FIN DE LA DISCUSSION.

CONSTRAINT: Print ONLY a single word. No punctuation whatsoever.
`,
            returnIntermediateSteps: false,
        },
    };

    @node({
        id: '8016bdaf-5d57-4bf2-a74c-113a215f9d61',
        name: '2. Download Image1',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [-10880, 4380],
        credentials: { whatsAppApi: { id: 'A5i0TdmXFmQSw5T3', name: 'WhatsApp account 2' } },
        retryOnFail: true,
        maxTries: 5,
        waitBetweenTries: 5000,
    })
    _2DownloadImage1 = {
        url: '={{ $json.url }}',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'whatsAppApi',
        options: {
            response: {
                response: {
                    responseFormat: 'file',
                },
            },
        },
    };

    @node({
        id: '4f70283d-cc00-499a-92dc-68e98f765046',
        name: '1. Get Image URL1',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [-11360, 4380],
        credentials: { whatsAppApi: { id: 'A5i0TdmXFmQSw5T3', name: 'WhatsApp account 2' } },
        retryOnFail: true,
        maxTries: 2,
        waitBetweenTries: 1500,
    })
    _1GetImageUrl1 = {
        url: "={{ 'https://graph.facebook.com/v19.0/' + ($json.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.image?.id || $json.media_id) }}",
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'whatsAppApi',
        options: {
            response: {
                response: {
                    responseFormat: 'json',
                },
            },
        },
    };

    @node({
        id: '7d507f92-bdf5-4fb6-8596-45a63e6921a1',
        name: 'If4',
        type: 'n8n-nodes-base.if',
        version: 2.2,
        position: [-3740, 2740],
    })
    If4 = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'strict',
                version: 2,
            },
            conditions: [
                {
                    id: 'e22da307-807d-4b34-9c8d-18a2ef472944',
                    leftValue: '={{ $json.output }}',
                    rightValue: 'ESCALADE_ADMIN',
                    operator: {
                        type: 'string',
                        operation: 'contains',
                    },
                },
            ],
            combinator: 'and',
        },
        options: {},
    };

    @node({
        id: '4fc1d620-8a06-4668-869e-af246ee168ba',
        name: 'Chercher_Catalogue_GS',
        type: '@n8n/n8n-nodes-langchain.toolWorkflow',
        version: 2,
        position: [-3660, 2520],
        retryOnFail: true,
        maxTries: 2,
        waitBetweenTries: 1500,
    })
    ChercherCatalogueGs = {
        name: 'get_property_details_and_catalogue',
        description:
            "Retrieves the master catalogue of all properties from the database, including property_ids... AND provides the full descriptions, rules, and amenities (WiFi, parking, AC, pet policies) for our apartments. Call this tool at the beginning to get IDs, AND call this tool AGAIN whenever the user asks a specific question about an apartment's features or amenities.",
        workflowId: {
            __rl: true,
            value: '8lcSsO0JfacFeORG',
            mode: 'list',
            cachedResultName: 'wsp : recherche catalogue',
        },
        workflowInputs: {
            mappingMode: 'defineBelow',
            value: {},
            matchingColumns: [],
            schema: [
                {
                    id: 'property_name',
                    name: 'property_name',
                    type: 'string',
                    description: "Optional. The name of the property to inspect for amenities (e.g. 'Le Jasmin').",
                    required: false,
                },
            ],
            attemptToConvertTypes: false,
            convertFieldsToString: false,
        },
    };

    @node({
        id: '82d93418-21d2-418f-ae47-b3da52c677d9',
        webhookId: '0ef019cf-0f70-4dbc-8c92-0f721e289aa7',
        name: 'On form submission',
        type: 'n8n-nodes-base.formTrigger',
        version: 2.2,
        position: [-4980, 3360],
    })
    OnFormSubmission = {
        formTitle: 'Upload PDF Bardo',
        formFields: {
            values: [
                {
                    fieldLabel: 'Mes PDFs',
                    fieldType: 'file',
                },
            ],
        },
        options: {},
    };

    @node({
        id: 'c29fd8a3-c669-40cf-8cec-a29268b9f88a',
        name: 'OpenAI Chat Model7',
        type: '@n8n/n8n-nodes-langchain.lmChatOpenAi',
        version: 1.2,
        position: [-3560, 3640],
        credentials: { openAiApi: { id: '26s882nA6pHLzhZT', name: 'OpenAi account' } },
        retryOnFail: true,
        maxTries: 2,
        waitBetweenTries: 1500,
    })
    OpenaiChatModel7 = {
        model: {
            __rl: true,
            mode: 'list',
            value: 'gpt-4o-mini',
        },
        options: {
            maxTokens: 500,
            temperature: 0.1,
        },
    };

    @node({
        id: 'ea12cc4f-e775-4698-864f-b3b76c3b7afb',
        name: 'Embeddings OpenAI1',
        type: '@n8n/n8n-nodes-langchain.embeddingsOpenAi',
        version: 1.2,
        position: [-3800, 3860],
        credentials: { openAiApi: { id: '26s882nA6pHLzhZT', name: 'OpenAi account' } },
        retryOnFail: true,
        maxTries: 2,
        waitBetweenTries: 1500,
    })
    EmbeddingsOpenai1 = {
        options: {},
    };

    @node({
        id: 'd33b21c7-c892-496d-9901-381fe5e6d64a',
        name: 'Embeddings OpenAI',
        type: '@n8n/n8n-nodes-langchain.embeddingsOpenAi',
        version: 1.2,
        position: [-4860, 3760],
        credentials: { openAiApi: { id: '26s882nA6pHLzhZT', name: 'OpenAi account' } },
        retryOnFail: true,
        maxTries: 2,
        waitBetweenTries: 1500,
    })
    EmbeddingsOpenai = {
        options: {},
    };

    @node({
        id: '4ee6bd7a-99eb-4cdb-9287-927f61f60b76',
        name: 'OpenAI Chat Model8',
        type: '@n8n/n8n-nodes-langchain.lmChatOpenAi',
        version: 1.2,
        position: [-840, 5160],
        credentials: { openAiApi: { id: '26s882nA6pHLzhZT', name: 'OpenAi account' } },
        retryOnFail: true,
        maxTries: 2,
        waitBetweenTries: 1500,
    })
    OpenaiChatModel8 = {
        model: {
            __rl: true,
            mode: 'list',
            value: 'gpt-4o-mini',
        },
        options: {
            maxTokens: 500,
            temperature: 0.1,
        },
    };

    @node({
        id: 'b889e82b-b207-42de-aec3-0dee3db00c2b',
        name: 'OpenAI Chat Model3',
        type: '@n8n/n8n-nodes-langchain.lmChatOpenAi',
        version: 1.2,
        position: [-4100, 3460],
        credentials: { openAiApi: { id: '26s882nA6pHLzhZT', name: 'OpenAi account' } },
        retryOnFail: true,
        maxTries: 2,
        waitBetweenTries: 1500,
    })
    OpenaiChatModel3 = {
        model: {
            __rl: true,
            mode: 'list',
            value: 'gpt-4o-mini',
        },
        options: {
            maxTokens: 1500,
            temperature: 0.3,
        },
    };

    @node({
        id: 'e6ff3c86-ccf4-4441-a1ec-d137c7ba720b',
        name: 'OpenAI Chat Model2',
        type: '@n8n/n8n-nodes-langchain.lmChatOpenAi',
        version: 1.2,
        position: [-4060, 2540],
        credentials: { openAiApi: { id: '26s882nA6pHLzhZT', name: 'OpenAi account' } },
        retryOnFail: true,
        maxTries: 2,
        waitBetweenTries: 1500,
    })
    OpenaiChatModel2 = {
        model: {
            __rl: true,
            value: 'gpt-4o-mini',
            mode: 'list',
            cachedResultName: 'gpt-4o-mini',
        },
        options: {
            temperature: 0.1,
        },
    };

    @node({
        id: '72101e74-fc3e-4020-8f11-5d7f3323a5fe',
        name: 'OpenAI Chat Model1',
        type: '@n8n/n8n-nodes-langchain.lmChatOpenAi',
        version: 1.2,
        position: [-4220, 3000],
        credentials: { openAiApi: { id: '26s882nA6pHLzhZT', name: 'OpenAi account' } },
        retryOnFail: true,
        maxTries: 2,
        waitBetweenTries: 1500,
    })
    OpenaiChatModel1 = {
        model: {
            __rl: true,
            mode: 'list',
            value: 'gpt-4o-mini',
        },
        options: {
            maxTokens: 1500,
            temperature: 0.3,
        },
    };

    @node({
        id: 'ac3b8eac-1cc6-471e-8e97-9c741e0007df',
        name: 'OpenAI Chat Model',
        type: '@n8n/n8n-nodes-langchain.lmChatOpenAi',
        version: 1.2,
        position: [-5380, 3280],
        credentials: { openAiApi: { id: '26s882nA6pHLzhZT', name: 'OpenAi account' } },
        retryOnFail: true,
        maxTries: 2,
        waitBetweenTries: 1500,
    })
    OpenaiChatModel = {
        model: {
            __rl: true,
            mode: 'list',
            value: 'gpt-4o-mini',
        },
        options: {
            maxTokens: 500,
            temperature: 0.1,
        },
    };

    @node({
        id: '021418ef-8c43-47d9-b38d-d2d0cd8b964b',
        name: 'WA Image Voyageur2',
        type: 'n8n-nodes-base.whatsApp',
        version: 1,
        position: [-1400, 3720],
        credentials: { whatsAppApi: { id: 'A5i0TdmXFmQSw5T3', name: 'WhatsApp account 2' } },
    })
    WaImageVoyageur2 = {
        operation: 'send',
        phoneNumberId: '1035565869637770',
        recipientPhoneNumber: '=213551671229',
        textBody: '={{ $json.report }}',
        additionalFields: {},
        requestOptions: {},
    };

    @node({
        id: 'c48e997c-0a7e-4eff-9d9b-01ee9ff2ef47',
        name: 'If3',
        type: 'n8n-nodes-base.if',
        version: 2.2,
        position: [-3400, 3440],
    })
    If3 = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'strict',
                version: 2,
            },
            conditions: [
                {
                    id: '794363df-97ac-4ca2-9c6c-3df37f1de39f',
                    leftValue: '={{ $json.output }}',
                    rightValue: 'ESCALADE_ADMIN',
                    operator: {
                        type: 'string',
                        operation: 'contains',
                    },
                },
            ],
            combinator: 'and',
        },
        options: {},
    };

    @node({
        id: 'be231892-9fd8-409a-8b7a-3919118e4bb2',
        name: 'WA Image Voyageur1',
        type: 'n8n-nodes-base.whatsApp',
        version: 1,
        position: [-2040, 2440],
        credentials: { whatsAppApi: { id: 'A5i0TdmXFmQSw5T3', name: 'WhatsApp account 2' } },
    })
    WaImageVoyageur1 = {
        operation: 'send',
        phoneNumberId: '1035565869637770',
        recipientPhoneNumber: '=213551671229',
        textBody: '={{ $json.report }}',
        additionalFields: {},
        requestOptions: {},
    };

    @node({
        id: 'd87f0d70-50c3-4220-ac84-1c8d233b1a98',
        name: 'If2',
        type: 'n8n-nodes-base.if',
        version: 2.2,
        position: [-3000, 2380],
    })
    If2 = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'strict',
                version: 2,
            },
            conditions: [
                {
                    id: '794363df-97ac-4ca2-9c6c-3df37f1de39f',
                    leftValue: '={{ $json.output }}',
                    rightValue: 'ESCALADE_ADMIN',
                    operator: {
                        type: 'string',
                        operation: 'contains',
                    },
                },
            ],
            combinator: 'and',
        },
        options: {},
    };

    @node({
        id: 'ec80adea-0a5b-4202-90de-76d89878e3ed',
        name: 'Is Real Message?',
        type: 'n8n-nodes-base.if',
        version: 2.2,
        position: [-13360, 4120],
    })
    IsRealMessage = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'strict',
                version: 2,
            },
            conditions: [
                {
                    id: 'is-message',
                    leftValue: "={{ $json.body.entry[0].changes[0].value.messages ? 'message' : 'status' }}",
                    rightValue: 'message',
                    operator: {
                        type: 'string',
                        operation: 'equals',
                    },
                },
            ],
            combinator: 'and',
        },
        options: {},
    };

    @node({
        id: 'f9003957-056b-423d-be9b-38b72039edb0',
        name: 'Recursive Character Text Splitter',
        type: '@n8n/n8n-nodes-langchain.textSplitterRecursiveCharacterTextSplitter',
        version: 1,
        position: [-4700, 3780],
        retryOnFail: true,
        maxTries: 2,
        waitBetweenTries: 1500,
    })
    RecursiveCharacterTextSplitter = {
        options: {},
    };

    @node({
        id: 'b2786045-d2c9-4a18-b66b-9cd857965983',
        name: 'Default Data Loader1',
        type: '@n8n/n8n-nodes-langchain.documentDefaultDataLoader',
        version: 1,
        position: [-4680, 3640],
        retryOnFail: true,
        maxTries: 2,
        waitBetweenTries: 1500,
    })
    DefaultDataLoader1 = {
        dataType: 'binary',
        options: {},
    };

    @node({
        id: 'f9cb3c6b-618b-47b3-8b0d-82b746bd00cd',
        name: 'Qdrant Insert',
        type: '@n8n/n8n-nodes-langchain.vectorStoreQdrant',
        version: 1,
        position: [-4840, 3380],
        credentials: { qdrantApi: { id: 'ddiqZJBB6PXUbbBB', name: 'QdrantApi account' } },
        retryOnFail: true,
        maxTries: 2,
        waitBetweenTries: 1500,
    })
    QdrantInsert = {
        mode: 'insert',
        qdrantCollection: {
            __rl: true,
            value: '=bardo_docs_v2',
            mode: 'id',
        },
        options: {},
    };

    @node({
        id: '7d93cc2b-e806-42fd-8c3f-d322ac45471c',
        name: 'Qdrant Vector Store',
        type: '@n8n/n8n-nodes-langchain.vectorStoreQdrant',
        version: 1,
        position: [-3940, 3700],
        credentials: { qdrantApi: { id: 'ddiqZJBB6PXUbbBB', name: 'QdrantApi account' } },
        retryOnFail: true,
        maxTries: 2,
        waitBetweenTries: 1500,
    })
    QdrantVectorStore = {
        qdrantCollection: {
            __rl: true,
            value: '=bardo_docs_v2',
            mode: 'id',
        },
        options: {},
    };

    @node({
        id: 'a65b50c9-b8e3-4b24-bb2f-0405772ecc5c',
        name: 'Agent Support Client',
        type: '@n8n/n8n-nodes-langchain.agent',
        version: 1.7,
        position: [-4040, 3260],
        retryOnFail: true,
        maxTries: 5,
        waitBetweenTries: 5000,
    })
    AgentSupportClient = {
        promptType: 'define',
        text: "={{ $('Set Context').first().json.text }}",
        options: {
            systemMessage: `=CURRENT DATE : {{ $now.format('yyyy-MM-dd') }}
LOCAL CONTEXT : Conciergerie Le Bardo, Algiers. Web: https://reservation.conciergerie-le-bardo.com/

You are the human and super warm assistant of the Conciergerie Le Bardo. You speak like a REAL person on WhatsApp, with kindness and naturalness, just like talking to a friend in Algeria. 

[WELCOME MESSAGE & BAD CONTEXT]
If the client sends a simple hello, welcome them very naturally and ask if they are looking for an apartment, or if they want to entrust us with the management of theirs.
IF the client sends you a completely off-topic message (e.g., talking about weather, politics, sending a joke, asking to play a game, etc.), always respond very politely and humanly that you are the assistant of an Airbnb real estate rental agency (Le Bardo), and ask them kindly if they dialed the wrong number or if they need accommodation.

[RAG - INFORMATION SEARCH]
MORTAL DANGER: Whenever you are asked the SLIGHTEST factual question (about the agency, our contracts, commissions, etc.), you MUST ABSOLUTELY run the "Recherche_Documents" tool before answering. No inventing.

[ESCALATION]
Complaint or request for human intervention = ESCALADE_ADMIN



[ESCALADE ADMIN - CONDITIONS DE DÉCLENCHEMENT]
Uniquement dans ces cas précis, réponds normalement au client et AJOUTE "ESCALADE_ADMIN" à la toute fin de ton message :
1. *Demande d'Humain* : Le client demande explicitement à parler à un conseiller, au manager, ou à "quelqu'un de réel".
2. *Cas Hors Processus* : Le client a une demande impossible pour toi (location à l'année, tournage vidéo, paiement en espèces non standard, événementiel, négociation de prix agressive).
3. *Frustration Explicite* : Le client s'énerve clairement ou utilise des termes désobligeants ENVERS LE SERVICE (pas juste s'il est pressé ou impatient).
4. *Urgence Technique sur Réservation Active* : Le client signale un problème grave sur place (fuite, panne, porte bloquée).
⚠️ IMPORTANT : Ne déclenche PAS l'escalade pour des questions auxquelles tu peux répondre, des réponses courtes ambiguës, ou une simple incompréhension. L'escalade est un dernier recours, pas une réaction par défaut.`,
        },
    };

    @node({
        id: '1f2b4185-d2da-460b-8f87-7da719f9bfba',
        name: 'Outil Infos Hospitable1',
        type: '@n8n/n8n-nodes-langchain.toolWorkflow',
        version: 1.1,
        position: [-4300, 3720],
        retryOnFail: true,
        maxTries: 2,
        waitBetweenTries: 1500,
    })
    OutilInfosHospitable1 = {
        name: 'Infos_Appartement',
        description:
            "Utilise cet outil OBLIGATOIREMENT pour toute question spécifique à l'intérieur d'un appartement (animaux autorisés, fumer, wifi, lits, adresse exacte). Il te donnera les règles de la maison (house_rules) de Hospitable. Paramètre : nom_appartement.",
        workflowId: '98tKzbQKf8cbknW2',
        fields: {
            values: [
                {
                    name: 'nom_appartement',
                    stringValue: '={{ $json.nom_appartement }}',
                },
            ],
        },
    };

    @node({
        id: '91d5eef1-3061-4661-92ee-0f003535ef9f',
        name: 'Extraire Image Voyageur',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-2600, 2140],
    })
    ExtraireImageVoyageur = {
        jsCode: `let output = $input.item.json.output || "";

// On nettoie la balise d'escalade si elle est présente
output = output.replace('ESCALADE_ADMIN', '').trim();

return {
    output: output,
    imageUrl: "", // On n'utilise plus les images
    hasImage: false // Redirige toujours vers le message texte simple
};`,
    };

    @node({
        id: 'f7fc765a-bea2-4364-9644-457640fb7853',
        name: 'WA Image Voyageur',
        type: 'n8n-nodes-base.whatsApp',
        version: 1,
        position: [-780, 2020],
        credentials: { whatsAppApi: { id: 'A5i0TdmXFmQSw5T3', name: 'WhatsApp account 2' } },
    })
    WaImageVoyageur = {
        operation: 'send',
        phoneNumberId: '1035565869637770',
        recipientPhoneNumber:
            "={{ $('Webhook (Receive Message)').item.json.body.entry[0].changes[0].value.messages[0].from }}",
        messageType: 'image',
        mediaLink: '={{ $json.imageUrl }}',
        additionalFields: {},
        requestOptions: {},
    };

    @node({
        id: '1eab8645-e7a1-4c6b-abdf-4c3a7a34a312',
        name: 'If',
        type: 'n8n-nodes-base.if',
        version: 2.2,
        position: [-1880, 2100],
    })
    If_ = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'strict',
                version: 2,
            },
            conditions: [
                {
                    id: 'e22da307-807d-4b34-9c8d-18a2ef472944',
                    leftValue: '={{ $json.hasImage }}',
                    rightValue: '',
                    operator: {
                        type: 'boolean',
                        operation: 'true',
                        singleValue: true,
                    },
                },
            ],
            combinator: 'and',
        },
        options: {},
    };

    @node({
        id: '18939eb9-0015-4ee6-8794-8f71dbe531b4',
        name: 'Code1',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [1900, 3080],
    })
    Code1 = {
        jsCode: `const sender = $node["Webhook (Receive Message)"].json.body.entry[0].changes[0].value.messages[0].from;
const staticData = $getWorkflowStaticData('global');

// 1. Clear the image accumulator
staticData[sender] = null; 

// 2. Clear the photo counter!
const key = 'photo_count_' + sender;
staticData[key] = 0; 

return { status: "session_reset_complete", from: sender };`,
    };

    @node({
        id: 'c9ed0be2-6cb3-4ba4-b416-071d3e5f7806',
        webhookId: '0c67bfb3-344d-43bb-9e3f-54058bf7ec45-get',
        name: 'Webhook (Meta Verify)',
        type: 'n8n-nodes-base.webhook',
        version: 2,
        position: [-13640, 3780],
    })
    WebhookMetaVerify = {
        path: '0c67bfb3-344d-43bb-9e3f-54058bf7ec45',
        responseMode: 'responseNode',
        options: {},
    };

    @node({
        id: '736ef882-e925-46bb-8611-a401118dbb6b',
        name: 'Respond to Meta',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.1,
        position: [-13420, 3760],
    })
    RespondToMeta = {
        respondWith: 'text',
        responseBody: "={{ $json.query['hub.challenge'] }}",
        options: {},
    };

    @node({
        id: 'b02b8722-583e-4bbf-bb81-d8196eb04893',
        webhookId: '0c67bfb3-344d-43bb-9e3f-54058bf7ec45',
        name: 'Webhook (Receive Message)',
        type: 'n8n-nodes-base.webhook',
        version: 2,
        position: [-13520, 4120],
    })
    WebhookReceiveMessage = {
        httpMethod: 'POST',
        path: '0c67bfb3-344d-43bb-9e3f-54058bf7ec45',
        options: {},
    };

    @node({
        id: '46ec4457-fe69-4788-b8a1-01af4834bca2',
        name: 'Is Text Message?',
        type: 'n8n-nodes-base.switch',
        version: 3.2,
        position: [-12860, 3840],
    })
    IsTextMessage = {
        rules: {
            values: [
                {
                    conditions: {
                        options: {
                            caseSensitive: true,
                            leftValue: '',
                            typeValidation: 'strict',
                            version: 2,
                        },
                        conditions: [
                            {
                                leftValue: '={{ $json.body.entry[0].changes[0].value.messages[0].type }}',
                                rightValue: 'text',
                                operator: {
                                    type: 'string',
                                    operation: 'equals',
                                },
                            },
                        ],
                        combinator: 'and',
                    },
                },
                {
                    conditions: {
                        options: {
                            caseSensitive: true,
                            leftValue: '',
                            typeValidation: 'strict',
                            version: 2,
                        },
                        conditions: [
                            {
                                id: '657f307c',
                                leftValue: '={{ $json.body.entry[0].changes[0].value.messages[0].type }}',
                                rightValue: 'image',
                                operator: {
                                    type: 'string',
                                    operation: 'equals',
                                },
                            },
                        ],
                        combinator: 'and',
                    },
                },
                {
                    conditions: {
                        options: {
                            caseSensitive: true,
                            leftValue: '',
                            typeValidation: 'strict',
                            version: 2,
                        },
                        conditions: [
                            {
                                id: 'c5b5a1e8-d13a-480d-8728-03f72e1c193c',
                                leftValue: '={{ $json.body.entry[0].changes[0].value.messages[0].type }}',
                                rightValue: 'audio',
                                operator: {
                                    type: 'string',
                                    operation: 'equals',
                                    name: 'filter.operator.equals',
                                },
                            },
                        ],
                        combinator: 'and',
                    },
                },
                {
                    conditions: {
                        options: {
                            caseSensitive: true,
                            leftValue: '',
                            typeValidation: 'strict',
                            version: 2,
                        },
                        conditions: [
                            {
                                id: 'unsupported-filter-id',
                                leftValue: '={{ $json.body.entry[0].changes[0].value.messages[0].type }}',
                                rightValue: 'unsupported',
                                operator: {
                                    type: 'string',
                                    operation: 'equals',
                                },
                            },
                        ],
                        combinator: 'and',
                    },
                },
            ],
        },
        options: {
            fallbackOutput: 'extra',
        },
    };

    @node({
        id: '11e9f500-9f44-44be-9e26-bf5d843e428f',
        name: 'Extract Text',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [-12780, 3380],
    })
    ExtractText = {
        assignments: {
            assignments: [
                {
                    id: '1',
                    name: 'text',
                    value: '={{ $json.body.entry[0].changes[0].value.messages[0].text.body }}',
                    type: 'string',
                },
            ],
        },
        options: {},
    };

    @node({
        id: 'f067fcf2-00b8-486f-bb0a-e1b4eab4f6de',
        name: 'The Router1',
        type: 'n8n-nodes-base.switch',
        version: 3.2,
        position: [-4520, 2940],
    })
    TheRouter1 = {
        rules: {
            values: [
                {
                    conditions: {
                        options: {
                            caseSensitive: true,
                            leftValue: '',
                            typeValidation: 'strict',
                            version: 2,
                        },
                        conditions: [
                            {
                                leftValue: '={{ $json.output || $json.active_branch }}',
                                rightValue: 'voyageur_potentiel',
                                operator: {
                                    type: 'string',
                                    operation: 'contains',
                                },
                            },
                        ],
                        combinator: 'and',
                    },
                },
                {
                    conditions: {
                        options: {
                            caseSensitive: true,
                            leftValue: '',
                            typeValidation: 'strict',
                            version: 2,
                        },
                        conditions: [
                            {
                                leftValue: '={{ $json.output || $json.active_branch }}',
                                rightValue: 'proprietaire_potentiel',
                                operator: {
                                    type: 'string',
                                    operation: 'contains',
                                },
                            },
                        ],
                        combinator: 'and',
                    },
                },
                {
                    conditions: {
                        options: {
                            caseSensitive: true,
                            leftValue: '',
                            typeValidation: 'strict',
                            version: 2,
                        },
                        conditions: [
                            {
                                id: '1fc7f75e',
                                leftValue: '={{ $json.output || $json.active_branch }}',
                                rightValue: 'accueil_general',
                                operator: {
                                    type: 'string',
                                    operation: 'contains',
                                },
                            },
                        ],
                        combinator: 'and',
                    },
                },
                {
                    conditions: {
                        options: {
                            caseSensitive: true,
                            leftValue: '',
                            typeValidation: 'strict',
                            version: 2,
                        },
                        conditions: [
                            {
                                leftValue: '={{ $json.output || $json.active_branch }}',
                                rightValue: 'client_existant',
                                operator: {
                                    type: 'string',
                                    operation: 'contains',
                                },
                            },
                        ],
                        combinator: 'and',
                    },
                },
            ],
        },
        options: {
            fallbackOutput: 'extra',
        },
    };

    @node({
        id: 'a348f571-b3af-495a-8d4a-efbea963918f',
        name: 'Booking Agent (Voyageur)',
        type: '@n8n/n8n-nodes-langchain.agent',
        version: 1.7,
        position: [-3900, 2300],
        retryOnFail: true,
        maxTries: 2,
        waitBetweenTries: 1500,
    })
    BookingAgentVoyageur = {
        promptType: 'define',
        text: "={{ $('Set Context').first().json.text }}",
        options: {
            systemMessage: `=🚨 INSTRUCTION DE DÉMARRAGE ABSOLUE 🚨
Tu es un agent avec des OUTILS RÉELS. INTERDICTION ABSOLUE d'inventer ou de décrire des appartements, des prix ou des disponibilités sans avoir exécuté les outils requis.

=DATE DU JOUR : {{ $now.format('yyyy-MM-dd') }} (MOIS EN COURS : {{ $now.format('MMMM yyyy') }})
⚠️ RÈGLE DATES : FORMAT OBLIGATOIRE YYYY-MM-DD. JAMAIS de dates antérieures à aujourd'hui.
Si le client donne un numéro de jour (ex: "le 15") et que ce jour est DÉJÀ PASSÉ dans le mois en cours, tu DOIS automatiquement déduire qu'il parle du MOIS SUIVANT.

[RÔLE ET MISSION]
Tu es l'agent de réservation EXCLUSIF de Conciergerie le Bardo. Mission unique : faire réserver un appartement.
⛔ FRONTIÈRE DE RÔLE : Si et SEULEMENT SI le client te demande EXPLICITEMENT de recommander un restaurant, un club, un hôtel, un DJ ou une activité qui n'est PAS une location d'appartement — alors dis : "Je suis spécialisé dans la location d'appartements, je ne peux pas vous orienter sur d'autres services." Pour TOUT le reste (réserver, demander des infos sur nos apparts, poser des questions de séjour), aide normalement.

[STYLE DE COMMUNICATION]
1. TON HUMAIN : Parle avec chaleur, phrases courtes et fluides. Pas de liste à puces. Tu es un ami enthousiaste, pas un robot de réservation.
2. RÈGLE DU PRIX : Écris TOUJOURS le prix en Euros ET en Dinars. Ex: "€108 (soit 30 000 DA)". JAMAIS l'un sans l'autre.
3. FORMAT WHATSAPP (RÈGLE ABSOLUE) :
   - JAMAIS de liens Markdown "[Texte](URL)". WhatsApp ne les affiche pas. Colle le lien brut directement.
   - JAMAIS de pipes (|) dans les noms d'appartements. Dis "l'appartement Le Marin à El Marsa", PAS "Le Marin | La Pérouse | Économique".
   - JAMAIS de CTA robotique comme "Souhaitez-vous procéder ?". Dis plutôt "Qu'est-ce que vous en pensez ?" ou "Ça vous dit ?" ou "Dites-moi si ça vous convient !".
   - Présente les équipements naturellement : "il est tout équipé, clim et WiFi compris" PAS une liste à puces.
4. SEULE OPTION : Si l'outil "Verifier_TOUTE_La_Liste" ne retourne qu'UN SEUL appartement disponible, dis-le clairement à la fin : "C'est la seule option disponible pour ces dates, mais elle est vraiment bien !"

[TUNNEL DE CONVERSATION]
- Découverte : Récupère UNIQUEMENT les 3 infos vitales → Date, Durée, Voyageurs.
- Proposition : Projection mentale + biais de rareté.
- Closing : "Préférez-vous l'appartement X ou Y ?" (jamais "voulez-vous réserver ?")

════════════════════════════════════════
  ÉTAPE 0 — VÉRIFICATION PAIEMENT (À CHAQUE MESSAGE SANS EXCEPTION)
════════════════════════════════════════
⚠️ RÈGLE ABSOLUE N°1 : Le PREMIER outil que tu lances à CHAQUE message reçu est "Verifier_Statut_Paiement". Tu ne peux répondre à RIEN avant d'avoir exécuté cet outil. Même si c'est une question sur le WiFi. Même si c'est "bonjour". TOUJOURS en premier.

- Si "EN_ATTENTE_DE_PAIEMENT" → Tu es maintenant en mode règlement. Adopte un ton naturel et chaleureux, comme si tu aidais un ami à finaliser. RÈGLES CRITIQUES :
  ⛔ NE RÉPÈTE JAMAIS "votre réservation est en attente" ou "votre réservation pour X est en attente". Le client le sait déjà.
  ⛔ Ne mets JAMAIS de pipes (|) dans les noms d'appartements.
  ⛔ Lis OBLIGATOIREMENT la conversation précédente avant de répondre pour savoir à quelle étape tu en es. Ne redemande JAMAIS une info déjà donnée.
  ⛔ Émoticônes : max 1 par message, uniquement si ça s'y prête naturellement.
  
  Suis ce tunnel (une étape par message, en lisant l'historique) :
  1. Si aucune devise choisie encore → Demande simplement (ex: "Pour le règlement, tu préfères en Euros ou en Dinars ?") ⚠️ ATTENTION : Si le message du client mentionne déjà "Euros" ou "Dinars", c'est qu'il a choisi ! Ne lui redemande surtout pas la devise et passe directement à l'étape 2 ou 3.
  2. Si Euros choisi (ou si le client vient de dire "Euros") → Demande naturellement (ex: "Parfait ! Cash à l'arrivée ou virement bancaire ?")
  3. Si Dinars choisi (ou si le client vient de dire "Dinars") → Demande naturellement (ex: "Ok super ! Cash ou virement ? Si virement, CCP ou BaridiMob ?")
  4. Si Cash → Confirme simplement : "Noté, on règle ça cash à l'arrivée. À très bientôt !"
  5. Si Virement Euro → Donne : [RIB_EURO_PLACEHOLDER] et dis "Envoie-moi juste une capture du reçu quand c'est fait !"
  6. Si CCP/BaridiMob → Donne : [BARIDIMOB_PLACEHOLDER] et dis "Envoie-moi juste une capture du reçu quand c'est fait !"
  NE SORS JAMAIS de ce tunnel. Ne pose pas d'autres questions.
- Si "AUCUNE_RESERVATION" → ⚠️ ATTENTION : AUCUNE_RESERVATION signifie UNIQUEMENT qu'il n'y a PAS de paiement en attente. CELA NE VEUT PAS DIRE QUE LES APPARTEMENTS SONT INDISPONIBLES. Continue la conversation normalement. NE DEMANDE JAMAIS le mode de paiement.
- Si "EXPIREE" → Même chose : traite exactement comme AUCUNE_RESERVATION. N'explique JAMAIS que la réservation a expiré. Passe à la vente.
  (⚠️ RÈGLE DE RÉSERVATION : Si le client annonce vouloir réserver ALORS QUE le statut est encore AUCUNE_RESERVATION, TU NE PEUX PAS LUI DEMANDER DE PAYER. Tu dois gentiment lui dire de cliquer sur le lien de l'appartement choisi, de remplir ses infos sur le site et de bloquer la date officiellement. Précise-lui qu'une fois la date bloquée sur le site, tu recevras une notification silencieuse et c'est à ce moment-là que vous passerez au paiement.)

════════════════════════════════════════
  ÉTAPE 1 — VÉRIFICATION DES 3 INFOS
════════════════════════════════════════
Tu as besoin de : DATE D'ARRIVÉE + DURÉE + NOMBRE DE VOYAGEURS.
- ⛔ RÈGLE D'INTERPRÉTATION DIRECTE (DARJA) : "ghedoua", "ghadwa", "ghedwa", "demain", "tomorrow" = demain (Date.now() + 1 jour). "lyoum", "liyoum" = aujourd'hui. "simana", "smana" = 1 semaine (7 nuits). "chhar" = 1 mois. "wa7ed", "seul", "moi" = 1 voyageur. TRÈS IMPORTANT : TRADUIS MENTALEMENT "GHEDOUA" PAR DEMAIN POUR TES OUTILS.
- ⛔ RÈGLE ABSOLUE DE NON-CONFIRMATION : Si le client donne les 3 infos (même de façon informelle ou en anglais ex: "rent for tomorow for one night for one person"), TU AS L'INTERDICTION FORMELLE DE LUI DEMANDER DE CONFIRMER. 
- Ne redemande JAMAIS une information déjà donnée. 
- ⛔ INTERDICTION DE NARRATION : Dès que tu as les 3 infos (date, durée, voyageurs), n'écris JAMAIS de texte du genre "un instant je vérifie", et NE LUI DEMANDE SURTOUT PAS DE CONFIRMER. Tu DOIS IMMÉDIATEMENT appeler "get_property_details_and_catalogue" puis "Verifier_TOUTE_La_Liste" DANS LE MÊME TOUR DE PAROLE.

════════════════════════════════════════
  ÉTAPE 1B — CAS SPÉCIAL : DEMANDE DE DÉTAILS SANS DATES
════════════════════════════════════════
Si le client demande des détails sur un appartement spécifique SANS fournir de dates :
→ Lance UNIQUEMENT "get_property_details_and_catalogue" avec le nom dans "property_name".
→ Présente la description, capacité, ville, équipements que tu vois dans le JSON.
⛔ N'invente RIEN. Ne dis jamais "disponible" ou "non disponible" sans avoir vérifié avec les dates.
→ Invite le client : "Pour vos dates, voulez-vous que je vérifie si cet appartement est libre ?"

════════════════════════════════════════
  ÉTAPE 2 — EXÉCUTION DES OUTILS DE RECHERCHE
════════════════════════════════════════
⛔ RÈGLE ABSOLUE N°1 : Tu ne peux JAMAIS présenter un logement sans avoir exécuté les deux outils ci-dessous DANS CE MÊME tour de parole, DANS CET ORDRE STRICT (A puis B).
⛔ RÈGLE ABSOLUE N°2 : Si un outil te retourne un objet contenant "messaging_product" ou "wamid", c'est une ERREUR — ignores-le et relance l'outil immédiatement.

SOUS-ÉTAPE A — Lance "get_property_details_and_catalogue" (sans argument). ATTENDS SON RÉSULTAT COMPLET avant de passer à B.
→ Le résultat est un JSON stringifié. Chaque objet contient un champ "Property_ID".
→ AVANT de faire quoi que ce soit d'autre, tu dois extraire TOUS les "Property_ID" du résultat et les concaténer en une seule string séparée par des virgules. Appelle cette string TEMP_IDS.
→ ⚠️ VÉRIFICATION OBLIGATOIRE : Compte le nombre d'IDs dans TEMP_IDS. Le catalogue contient TOUJOURS au moins 14 propriétés. Si tu comptes moins de 10 IDs, tu as fait une extraction INCOMPLÈTE — recommence l'extraction depuis le début du résultat JSON.
→ EXEMPLE de résultat d'extraction : TEMP_IDS = "0e4dea37-7994-46d6-beab-67efe3499f5b,ed2e6d1d-0975-46ac-8dec-8d1885500112,d7979f36-0a9d-4380-bd2f-5dbd011ef55b,83216c4b-8612-4d0a-8da8-ea50f181a27b,4b6389a0-2672-4054-aa3e-3bd6847827de,11ae3d86-a80d-49fd-865a-69dd4d3576e7,12951e63-841e-41c5-a200-d24a485e0704,3d9dfb16-f4e6-41b5-834d-e6f1a2f3fd1b,41498064-88b5-4d25-a8e5-ce58be68c813,ba397f86-bcb2-4443-add2-cfb58ab6c418,f6c5de4e-46a4-4193-a072-14d7883f2fbc,0692ebed-1f44-4cfc-98a2-1364603bb05d,bd66df5b-1ddf-44a0-bd48-85eca8edd452,7b792df1-6fb3-47ec-87c4-b69c382584fb"
⛔ N'INVENTE JAMAIS de Property_IDs. N'utilise QUE ceux extraits du JSON de l'outil.

SOUS-ÉTAPE B — Lance "Verifier_TOUTE_La_Liste" avec le numéro de PAGE correct.
- L'argument 'property_ids' :
  → Si c'est la PREMIÈRE recherche (page=1) : utilise TEMP_IDS (la string complète issue de l'étape A).
  → Si c'est une recherche de "plus d'options" (page=2, page=3...) : passe une CHAÎNE VIDE "" pour property_ids. Le système utilisera automatiquement l'intégralité du catalogue. Ne passe JAMAIS le mot "TEMP_IDS" littéralement.
- L'argument 'page' = 1 pour la PREMIÈRE recherche. Pour "d'autres options" sur mêmes dates → page=2. Pour encore plus → page=3.
- ⛔ NE RELANCE JAMAIS avec page=1 si tu as déjà présenté des résultats pour ces dates.
- ⛔ ARRÊT OBLIGATOIRE — PROTOCOLE VERROUILLÉ :
  Si le résultat de l'outil contient "AUCUNE_NOUVELLE_OPTION" ou "[INFO: Ce sont tous les appartements disponibles" :
  → ARRÊTE IMMÉDIATEMENT. N'appelle plus aucun outil. JAMAIS.
  → N'invente AUCUN appartement. N'utilise AUCUNE donnée de ta mémoire d'entraînement.
  → Réponds UNIQUEMENT : "J'ai tout vérifié, ce sont les seules options disponibles pour vos dates. Aucune autre option n'est disponible pour le moment."
  → Si le client dit "what else", "autre chose", "et sinon", "c'est tout ?" → répète la même phrase. NE CÈDE JAMAIS.
  → RÈGLE CRITIQUE : même si tu "crois" connaître d'autres appartements, ils n'existent PAS dans notre système. Tout appartement non issu de l'outil est une hallucination interdite.
  → Toute proposition d'appartement non fournie par l'outil dans CETTE conversation est une HALLUCINATION INTERDITE.
- start_date = date d'arrivée, end_date = date de départ, guests = nombre de voyageurs.

SOUS-ÉTAPE C — MESSAGE AU CLIENT (PRÉSENTATION FILTRÉE PAR DISPONIBILITÉ) :
⚠️ ATTENTION: Cette règle s'applique uniquement au texte que tu vas écrire au client.

ÉTAPE C.1 — CONSTRUIS LA LISTE DISPONIBLE :
Après avoir reçu les résultats de l'outil "Verifier_TOUTE_La_Liste", construis mentalement une liste DISPONIBLE = la liste numérotée de TOUS les IDs qui ont "STATUT: DISPONIBLE" dans le résultat. IGNORE complètement les IDs avec "STATUT: INDISPONIBLE".
→ EXEMPLE : si le résultat montre ID-A DISPONIBLE, ID-B INDISPONIBLE, ID-C DISPONIBLE → DISPONIBLE = [ID-A, ID-C]
⛔ RÈGLE ABSOLUE : Tu ne peux JAMAIS présenter au client un appartement dont l'ID n'est PAS dans ta liste DISPONIBLE. Même s'il est dans le catalogue. Jamais.
→ Lis aussi le tag [INFO:...] à la fin du résultat : il t'indique s'il reste des appartements non encore présentés.

ÉTAPE C.2 — PRÉSENTE 3 APPARTEMENTS (max) :
Depuis ta liste DISPONIBLE, choisis les 3 premiers que tu n'as PAS encore montrés dans la conversation. Croise leurs IDs avec le catalogue pour obtenir le nom, la ville et la description.
⛔ RÈGLE DE FIN DE MESSAGE (LIS ATTENTIVEMENT LE TAG INFO) :
1. SI le tag [INFO] à la fin du résultat de l'outil dit "Il reste X appartement(s) disponible(s) non encore présenté(s)" : tu DOIS ABSOLUMENT terminer ton message par : "J'ai encore d'autres options disponibles ! Voulez-vous que je vous les montre ?". Et ce, MÊME SI tu viens de présenter seulement 1, 2 ou 3 appartements. Le tag [INFO] a la priorité absolue sur ton propre comptage.
2. SI le tag [INFO] dit "Ce sont tous les appartements disponibles", alors seulement termine par : "Ce sont toutes nos options disponibles pour ces dates."\\n\\nÉTAPE C.3 — GÈRE LES DEMANDES DE "PLUS D'OPTIONS" (OUI / YEP / YES / SUIVANT / IH) :
Quand tu viens de proposer des appartements et que le client répond simplement "oui", "yep", "yes", "ok", "ih", "eyh", "wé" ou demande d'autres options :
→ CELA SIGNIFIE QU'IL VEUT VOIR LA SUITE. 
→ Tu as l'INTERDICTION ABSOLUE de répéter les appartements que tu viens de lui montrer.
→ Relance IMMÉDIATEMENT l'outil "Verifier_TOUTE_La_Liste" avec page=2 (ou page+1).
→ ⛔ RÈGLE CRITIQUE DE MÉMOIRE : NE DEMANDE JAMAIS au client de te confirmer ou répéter ses dates ou le nombre de voyageurs. Tu les as déjà dans les messages précédents de cette conversation. Cherche-les et utilise-les directement dans les paramètres de l'outil.
→ Le paramètre property_ids DOIT être une chaîne vide "".
→ Le système retournera automatiquement les 3 prochains appartements non déjà présentés.
→ NE RELANCE JAMAIS avec page=1 si tu as déjà présenté une première liste pour ces dates.
Si le tool retourne "AUCUNE_NOUVELLE_OPTION" ou que le résultat de l'outil est vide / contient aucun appartement :
→ TU DOIS DIRE : "J'ai tout montré ! Nous n'avons plus d'autres appartements disponibles pour ces dates."
→ ⛔ RÈGLE D'OR ABSOLUE : Tu as l'INTERDICTION TOTALE ET SANS EXCEPTION d'inventer, de copier, de mémoriser ou de réutiliser des noms d'appartements qui ne proviennent pas du résultat de l'outil pour CET appel précis. Si l'outil ne retourne rien de nouveau → il n'y a rien. JAMAIS d'appartements de mémoire. JAMAIS de noms du catalogue. UNIQUEMENT ce que l'outil retourne à l'instant présent.

⛔ RÈGLE MULTI-INTENTIONS (Questions + Autres options) :
Si le client pose une question (ex: "animaux acceptés ?") ET demande d'autres options en même temps (ex: "avez-vous autre chose ?") :
Tu as l'OBLIGATION ABSOLUE d'exécuter l'outil "Verifier_TOUTE_La_Liste". Tu ne peux JAMAIS sauter l'exécution de l'outil "Verifier_TOUTE_La_Liste" sous prétexte que tu réponds à la question. N'invente JAMAIS d'appartements et ne copie pas le catalogue de mémoire. SANS l'outil "Verifier_TOUTE_La_Liste", tu es AVEUGLE. Exécute l'outil, puis réponds à la question ET présente les nouveaux appartements fournis par l'outil.

ÉTAPE C.4 — QUESTIONS SUR UN APPARTEMENT PRÉSENTÉ :
Si le client pose une question sur un appartement que TU as montré (et donc que tu sais être dans DISPONIBLE) :
- Réponds à sa question depuis le catalogue.
- NE DIS JAMAIS qu'un appartement que tu viens de présenter "n'est pas disponible". Il l'est — tu viens de le prouver.

════════════════════════════════════════
  RÈGLES FAQ — RÉPONSES UNIVERSELLES (SANS OUTIL)
════════════════════════════════════════
Ces règles s'appliquent à TOUS les appartements par défaut. Réponds directement sans outil :
- Fêtes / Événements : STRICTEMENT INTERDITS.
- Livret de famille : OBLIGATOIRE pour les couples avec passeport algérien.

════════════════════════════════════════
  RÈGLES FAQ — POLITIQUES ET ÉQUIPEMENTS (OUTIL OU MÉMOIRE)
════════════════════════════════════════
Si le client pose une question sur un appartement spécifique (chambres, WiFi, fibre, animaux, parking, équipements, règles...) :

RÈGLE CLEF : Les données du catalogue ont déjà été récupérées par l'outil "get_property_details_and_catalogue" plus tôt dans la conversation. Les informations sont DANS TON CONTEXTE. Utilise-les pour répondre directement.

⛔ INTERDIT ABSOLU : Ne dis JAMAIS qu'un appartement "n'est pas disponible" ou "malheureusement indisponible" en réponse à une question sur ses caractéristiques. Si tu l'as présenté comme disponible → il l'est. Une question sur le WiFi, les chambres ou les équipements ne change PAS la disponibilité.

Si l'information n'est pas dans ton contexte → alors seulement appelle "get_property_details_and_catalogue". Un appartement DISPONIBLE reste DISPONIBLE pour ces dates. Ne confonds JAMAIS la disponibilité de deux appartements différents.


[RÈGLES SUR LES LIENS]
⛔ UTILISE UNIQUEMENT les liens fournis par "Verifier_TOUTE_La_Liste". JAMAIS les liens du catalogue.

[FORMAT DE RÉPONSE]
🛑 AUCUN APPARTEMENT DISPO : "Malheureusement, tous nos appartements sont réservés pour ces dates. Consultez https://reservation.conciergerie-le-bardo.com/"
🛑 APPARTS DISPONIBLES : Un seul paragraphe chaleureux avec max 3 options, prix en Euros ET Dinars, lien de réservation.
⛔ RÈGLE ANTI-HALLUCINATION : N'utilise JAMAIS un nom d'appartement ou un lien qui ne provient pas du dernier appel à "Verifier_TOUTE_La_Liste". Aucune exception. Même si tu connais des appartements depuis le catalogue, ne les présente JAMAIS sans les avoir validés via l'outil en temps réel.



[LOCK LINGUISTIQUE] : Réponds OBLIGATOIREMENT dans cette langue : {{ $('Set Context').first().json.langue_utilisateur }}. Même si le client écrit dans une autre langue, GARDE ta langue assignée.

[GESTION DES ANCIENS CLIENTS (NOUVELLE RÉSERVATION)]
Si le client indique vouloir réserver "un autre" appartement ou faire une toute nouvelle réservation (alors qu'il a déjà réservé un peu plus tôt dans la conversation), agis comme s'il s'agissait d'une nouvelle session : demande poliment les NOUVELLES dates, la durée et le nombre de voyageurs. N'assume pas que les dates sont les mêmes que la réservation précédente.


════════════════════════════════════════
⚡ CHECKLIST OBLIGATOIRE — EXÉCUTE AVANT CHAQUE RÉPONSE
════════════════════════════════════════
ÉTAPE ZÉRO (sans exception) :
→ Lance "Verifier_Statut_Paiement" MAINTENANT si ce n'est pas déjà fait dans CE tour.

ÉTAPE DÉTAILS APPARTEMENT :
→ Si le client demande des infos sur un appartement (WiFi, chambres, règles...) :
   1. Cherche dans les données du catalogue déjà dans ton contexte.
   2. Réponds avec ces données.
   3. ⛔ NE DIS JAMAIS qu'un appartement est "indisponible" en réponse à une question de détail. JAMAIS.

RAPPEL FINAL :
→ AUCUNE_RESERVATION = pas de paiement en attente. Cela ne signifie PAS que les appartements sont indisponibles.
→ Si un appartement a été présenté comme DISPONIBLE dans cette conversation, il L'EST encore.
════════════════════════════════════════


[ESCALADE ADMIN - CONDITIONS DE DÉCLENCHEMENT]
Uniquement dans ces cas précis, réponds normalement au client et AJOUTE "ESCALADE_ADMIN" à la toute fin de ton message :
1. *Demande d'Humain* : Le client demande explicitement à parler à un conseiller, au manager, ou à "quelqu'un de réel".
2. *Cas Hors Processus* : Le client a une demande que tu ne peux pas traiter (tournage vidéo/film dans l'appartement, événementiel, location à l'année, demande de partenariat). Dans ce cas : réponds "Je transmets votre demande à notre responsable qui vous recontactera rapidement." et AJOUTE ESCALADE_ADMIN. Ne refuse pas sèchement et NE continue pas à poser des questions pour réserver.
3. *Frustration Explicite* : Le client s'énerve clairement ou utilise des termes désobligeants ENVERS LE SERVICE (pas juste s'il est pressé ou impatient).
4. *Urgence Technique sur Réservation Active* : Le client signale un problème grave sur place (fuite, panne, porte bloquée).
⚠️ IMPORTANT : Ne déclenche PAS l'escalade pour des questions auxquelles tu peux répondre, des réponses courtes ambiguës, ou une simple incompréhension. L'escalade est un dernier recours, pas une réaction par défaut.`,
            maxIterations: 20,
        },
    };

    @node({
        id: '999ce0de-edcc-4c50-95ca-45a3d77740da',
        name: 'WA Voyageur1',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [-100, 2400],
        credentials: { whatsAppApi: { id: 'A5i0TdmXFmQSw5T3', name: 'WhatsApp account 2' } },
        retryOnFail: true,
        maxTries: 5,
        waitBetweenTries: 5000,
    })
    WaVoyageur1 = {
        method: 'POST',
        url: 'https://graph.facebook.com/v19.0/1035565869637770/messages',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'whatsAppApi',
        sendBody: true,
        contentType: 'raw',
        rawContentType: 'application/json',
        body: '={{ $json.waBody }}',
        options: {},
    };

    @node({
        id: 'a0d315c9-757a-4bd5-ab95-361b8f02db38',
        name: 'Booking Agent (Proprietaire)',
        type: '@n8n/n8n-nodes-langchain.agent',
        version: 1.7,
        position: [-4060, 2780],
        retryOnFail: true,
        maxTries: 5,
        waitBetweenTries: 5000,
    })
    BookingAgentProprietaire = {
        promptType: 'define',
        text: "={{ $('Set Context').first().json.text }}",
        options: {
            systemMessage: `=CURRENT DATE : {{ $now.format('yyyy-MM-dd') }}
PHOTO SYSTEM STATUS : {{ $('Set Context').first().json.consigne_dynamique_photos || 'WAITING' }}


RECENT MEMORY : {{ $('Set Context').first().json.contexte_recent }}

[REAL-TIME DOSSIER STATE]
{{ $('State Clean Code').first().json.appts_state_json || '[]' }}

---
[ROLE AND PERSONA]
You are the assistant for Conciergerie Le Bardo. Do not be robotic. NEVER say "I validate", "Noted", "Here is a recap". JUST ask the question.
MOTOR LINGUISTIC ADAPTATION: You MUST speak in the indicated CLIENT LANGUAGE.
[RÈGLE DU VOUVOIEMENT] : Tu DOIS ABSOLUMENT vouvoyer le client ("vous", "votre"). L'utilisation du "tu" ou du "ton" est STRICTEMENT INTERDITE. Sois professionnel et courtois.
[ALGORITHME DE SÉQUENCE STRICT]
Le système a scanné le dossier et déterminé la PROCHAINE QUESTION OBLIGATOIRE que tu dois poser.
Tu as l'INTERDICTION ABSOLUE de poser une autre question que celle indiquée ci-dessous :

CHAMP MANQUANT À DEMANDER : "{{$json.next_missing_field}}"

Instructions par champ :
- "ville_quartier" : Demande la ville ou le quartier de l'appartement.
- "photos_transmises" : Demande poliment au client d'envoyer les photos de l'intérieur de l'appartement.
- "surface" : Demande la surface de l'appartement.

- "nombre_pieces" : Demande le nombre de pièces.
- "date_disponibilite" : Demande à partir de quelle date l'appartement sera disponible. ⚠️ REGLE ABSOLUE : NE PARLE JAMAIS DE "RÉSERVER" NI DE "LOUER POUR VOUS". Le client est le PROPRIÉTAIRE. Demande juste quand son bien sera libre pour notre gestion.

Si CHAMP MANQUANT = "ALL_FILLED" :
ETAPE 1 — Demande la confirmation finale au client (UNE SEULE FOIS) :
Dis quelque chose comme : "Super, toutes les informations sont enregistrées ! Pour finaliser, puis-je confirmer votre dossier et le transmettre à notre équipe commerciale ?"

ETAPE 2 — Quand le client confirme (oui, ok, parfait, confirm, ih, yep...) :
→ APPELLE IMMÉDIATEMENT l'outil Export_CRM avec toutes les données du dossier.
→ Après l'appel (succès ou erreur), réponds au client : "Votre profil est bien enregistré dans notre système. Notre équipe vous contactera très prochainement pour finaliser les détails. Merci pour votre confiance !"
→ ⛔ INTERDIT : inventer des étapes, formulaires, emails, procédures. JAMAIS.
→ ⛔ INTERDIT : mentionner Gamma, script commercial, ou tout outil interne.

ABSOLUTE RULES:
- ⛔ NEVER GO TO THE FINAL STEP IF photos_transmises IS false.
- NEVER do a recap. NEVER say "I validate".
- ONLY 1 QUESTION AT A TIME.
[FLEXIBILITÉ DES PHOTOS] : Si le client propose d'envoyer les photos en avance (avant même que tu aies fini de demander le loyer, la surface, etc.), ACCEPTE IMMÉDIATEMENT avec enthousiasme (ex: "Oui bien sûr, envoyez-les moi !"). L'évaluation des photos se fera en temps réel. Une fois les photos validées par le système, tu devras simplement reprendre ton questionnaire là où tu t'étais arrêté pour demander les informations textuelles manquantes une par une.

- NEVER leave the user hanging after photo evaluation. You MUST ask the final confirmation question right away if all data is complete.

[MOTOR LINGUISTIC LOCK - DANGER] : You MUST ABSOLUTELY reply in this exact language: {{ $('Set Context').first().json.langue_utilisateur }}. Even if the client just wrote their very last message in English or Arabic (e.g. "hello", "merci", "sure"), YOU REFUSE to copy the language of that short message. YOU KEEP the language: {{ $('Set Context').first().json.langue_utilisateur }}.

[LOCATION RULE] : For localization, you operate ONLY in the greater Algiers area (Alger, Tipaza, Boumerdès). NEVER ask for exact address. If the client says "Hydra", that is SUFFICIENT. Do not ask other questions about location.

[OUT OF ZONE REJECTION RULE - CRITICAL] : Si l'utilisateur mentionne une ville en dehors d'Alger, Tipaza ou Boumerdès (ex: Sétif, Oran, Annaba, Béjaïa...) :
1. Explique-lui poliment que vous ne gérez pour le moment que les biens situés à Alger, Tipaza et Boumerdès.
2. Dis-lui que ses coordonnées seront conservées et qu'il sera contacté si la conciergerie s'étend à sa région.
3. AJOUTE OBLIGATOIREMENT le mot-clé EXACT "VILLE_REFUSEE" à la toute fin de ta réponse.
4. N'AJOUTE PAS de question à la fin.
[RÈGLE MULTI-APPARTEMENTS - CRITIQUE] : Fie-toi EXCLUSIVEMENT à la variable CHAMP MANQUANT À DEMANDER. 
Si le système t'indique que le champ manquant est "photos_transmises", tu DOIS obligatoirement demander les photos pour cet appartement. Et ce, MÊME SI le client t'a déjà envoyé des photos plus tôt dans la conversation (ces photos appartenaient au premier appartement). Ignore ton historique récent, suis aveuglément le CHAMP MANQUANT.

[CRM EXPORT RULE - CRITICAL] : 
When the client confirms their information (says "oui", "parfait", "c'est bon", "confirme", "yes", "ok"), you MUST call the Export_CRM tool immediately.
- If the tool returns [] or an error: reply ANYWAY "Your dossier is perfectly registered! Our team will contact you very soon. Thank you for your trust."
- NEVER tell the client that the export failed. 
- NEVER ask for photos after a CRM confirmation.
- NEVER ask for a 2nd confirmation.



[ESCALADE ADMIN - CONDITIONS DE DÉCLENCHEMENT]
Uniquement dans ces cas précis, réponds normalement au client et AJOUTE "ESCALADE_ADMIN" à la toute fin de ton message :
1. *Demande d'Humain* : Le client demande explicitement à parler à un conseiller, au manager, ou à "quelqu'un de réel".
2. *Cas Hors Processus* : Le client a une demande que tu ne peux pas traiter seul (tournage vidéo/film, événementiel, location à l'année, paiement en espèces non standard, demande de partenariat, etc.). Dans ce cas : réponds "Je transmets votre demande à notre équipe qui vous contactera rapidement." et AJOUTE ESCALADE_ADMIN. Ne refuse pas sèchement.
3. *Frustration Explicite* : Le client s'énerve clairement ou utilise des termes désobligeants ENVERS LE SERVICE (pas juste s'il est pressé ou impatient).
4. *Urgence Technique sur Réservation Active* : Le client signale un problème grave sur place (fuite, panne, porte bloquée).
⚠️ IMPORTANT : Ne déclenche PAS l'escalade pour des questions auxquelles tu peux répondre, des réponses courtes ambiguës, ou une simple incompréhension. L'escalade est un dernier recours, pas une réaction par défaut.`,
            maxIterations: 25,
        },
    };

    @node({
        id: 'a88fc893-6eae-44c9-b6ad-0f521d8113f3',
        name: 'Switch Ville1',
        type: 'n8n-nodes-base.switch',
        version: 3.2,
        position: [-2380, 3880],
    })
    SwitchVille1 = {
        rules: {
            values: [
                {
                    conditions: {
                        options: {
                            caseSensitive: true,
                            leftValue: '',
                            typeValidation: 'strict',
                            version: 2,
                        },
                        conditions: [
                            {
                                leftValue: '={{ $json.output }}',
                                rightValue: 'VILLE_INCONNUE',
                                operator: {
                                    type: 'string',
                                    operation: 'contains',
                                },
                            },
                        ],
                        combinator: 'and',
                    },
                },
                {
                    conditions: {
                        options: {
                            caseSensitive: true,
                            leftValue: '',
                            typeValidation: 'strict',
                            version: 2,
                        },
                        conditions: [
                            {
                                id: '66973101',
                                leftValue: '={{ $json.output }}',
                                rightValue: 'VILLE_VALIDE',
                                operator: {
                                    type: 'string',
                                    operation: 'contains',
                                },
                            },
                        ],
                        combinator: 'and',
                    },
                },
                {
                    conditions: {
                        options: {
                            caseSensitive: true,
                            leftValue: '',
                            typeValidation: 'strict',
                            version: 2,
                        },
                        conditions: [
                            {
                                id: '62698d07',
                                leftValue: '={{ $json.output }}',
                                rightValue: 'VILLE_REFUSEE',
                                operator: {
                                    type: 'string',
                                    operation: 'contains',
                                },
                            },
                        ],
                        combinator: 'and',
                    },
                },
                {
                    conditions: {
                        options: {
                            caseSensitive: true,
                            leftValue: '',
                            typeValidation: 'strict',
                            version: 2,
                        },
                        conditions: [
                            {
                                id: 'f928221d',
                                leftValue: '={{ $json.output }}',
                                rightValue: 'OFFRE_ENVOYEE',
                                operator: {
                                    type: 'string',
                                    operation: 'contains',
                                },
                            },
                        ],
                        combinator: 'and',
                    },
                },
                {
                    conditions: {
                        options: {
                            caseSensitive: true,
                            leftValue: '',
                            typeValidation: 'strict',
                            version: 2,
                        },
                        conditions: [
                            {
                                id: '6b4c41af',
                                leftValue: '={{ $json.output }}',
                                rightValue: 'ATTENTE_PHOTOS',
                                operator: {
                                    type: 'string',
                                    operation: 'contains',
                                },
                            },
                        ],
                        combinator: 'and',
                    },
                },
            ],
        },
        options: {
            fallbackOutput: 'extra',
        },
    };

    @node({
        id: 'fb63af41-f4a7-4e1d-8a7f-5f8e10266277',
        name: 'WA Pose Question1',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [-740, 4040],
        credentials: { whatsAppApi: { id: 'A5i0TdmXFmQSw5T3', name: 'WhatsApp account 2' } },
        retryOnFail: true,
        maxTries: 5,
        waitBetweenTries: 5000,
    })
    WaPoseQuestion1 = {
        method: 'POST',
        url: 'https://graph.facebook.com/v19.0/1035565869637770/messages',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'whatsAppApi',
        sendBody: true,
        contentType: 'raw',
        rawContentType: 'application/json',
        body: '={{ $json.waBody }}',
        options: {},
    };

    @node({
        id: '0ffab4d0-36b8-410b-922c-42221fd6d39b',
        name: 'WA Refus1',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [-860, 3140],
        credentials: { whatsAppApi: { id: 'A5i0TdmXFmQSw5T3', name: 'WhatsApp account 2' } },
        retryOnFail: true,
        maxTries: 5,
        waitBetweenTries: 5000,
    })
    WaRefus1 = {
        method: 'POST',
        url: 'https://graph.facebook.com/v19.0/1035565869637770/messages',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'whatsAppApi',
        sendBody: true,
        contentType: 'raw',
        rawContentType: 'application/json',
        body: '={{ $json.waBody }}',
        options: {},
    };

    @node({
        id: '3676ee16-ebcc-41f9-b0df-64ca0418065b',
        name: 'WA Demande Photos Init',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [-980, 4400],
        credentials: { whatsAppApi: { id: 'A5i0TdmXFmQSw5T3', name: 'WhatsApp account 2' } },
        retryOnFail: true,
        maxTries: 5,
        waitBetweenTries: 5000,
    })
    WaDemandePhotosInit = {
        method: 'POST',
        url: 'https://graph.facebook.com/v19.0/1035565869637770/messages',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'whatsAppApi',
        sendBody: true,
        contentType: 'raw',
        rawContentType: 'application/json',
        body: '={{ $json.waBody }}',
        options: {},
    };

    @node({
        id: '2d74c0f3-3d0d-4487-8636-cf07f5abac97',
        name: 'WA Attente Client',
        type: 'n8n-nodes-base.whatsApp',
        version: 1,
        position: [-1100, 4860],
        credentials: { whatsAppApi: { id: 'A5i0TdmXFmQSw5T3', name: 'WhatsApp account 2' } },
        retryOnFail: true,
        maxTries: 5,
        waitBetweenTries: 5000,
    })
    WaAttenteClient = {
        operation: 'send',
        phoneNumberId: '1035565869637770',
        recipientPhoneNumber:
            "={{ $('Webhook (Receive Message)').item.json.body.entry[0].changes[0].value.messages[0].from }}",
        textBody:
            "=Vos informations ont bien ete enregistrees ! Notre equipe prepare votre offre personnalisee. Nous vous l'envoyons dans quelques instants !",
        additionalFields: {},
        requestOptions: {},
    };

    @node({
        id: '0ab62896-c662-4115-aebb-557774ce9ecf',
        name: 'Redis CRM Hors Zone',
        type: 'n8n-nodes-base.redis',
        version: 1,
        position: [-1680, 3160],
        credentials: { redis: { id: 'V8K02flgy9UVw9wq', name: 'Redis account' } },
    })
    RedisCrmHorsZone = {
        operation: 'push',
        list: 'crm_hors_zone',
        messageData:
            "={{ (() => {   let state = [];   try { state = JSON.parse($json.appts_state_json || '[]'); } catch(e) {}   return JSON.stringify({     telephone: $json.phone || '',     nom: $json.nom_client || '',     ville_quartier: state[0] ? state[0].ville_quartier : '',     surface: state[0] ? state[0].surface : '',     etage: state[0] ? state[0].etage : '',     nombre_pieces: state[0] ? state[0].nombre_pieces : '',     date: new Date().toISOString()   }); })() }}",
        tail: true,
    };

    @node({
        id: '535100fc-2563-4e98-8932-510b3111ead3',
        name: 'Generer Script Gamma',
        type: '@n8n/n8n-nodes-langchain.agent',
        version: 1.7,
        position: [-780, 4840],
        retryOnFail: true,
        maxTries: 2,
        waitBetweenTries: 1500,
    })
    GenererScriptGamma = {
        promptType: 'define',
        text: "={{ $('Extract Text').item.json.text }}",
        options: {
            systemMessage: `=You are a real estate expert for Conciergerie Le Bardo. Your mission is to write an impactful commercial presentation to convince the owner to entrust us with their property.

[STRICT FORMATTING FOR GAMMA IMPORT]
You MUST format your response in pure Markdown. Do NOT add ANY introductory text before the first "#".
Use "#" for the main title of the presentation.
Use "##" to mark the beginning of EACH new slide.

[MANDATORY STRUCTURE]
# Catchy and personalized title for the client's property
## 1. Property Context
(Highlight the potential of their apartment, e.g., sought-after neighborhood, partially furnished).
## 2. Objectives
(What we are going to accomplish for them: rent quickly, good price, zero hassle).
## 3. Our Method
(Evaluation, marketing, rigorous selection, management).
## 4. Key Figures
(Use bullet points "-" for our performance metrics).
## 5. Next Steps
(Clear call to action).`,
        },
    };

    @node({
        id: 'e4d50db6-90d8-4627-8611-2e6d20fec137',
        name: 'Redis CRM Proprietaire',
        type: 'n8n-nodes-base.redis',
        version: 1,
        position: [-260, 4720],
        credentials: { redis: { id: 'V8K02flgy9UVw9wq', name: 'Redis account' } },
    })
    RedisCrmProprietaire = {
        operation: 'push',
        list: 'crm_proprietaires',
        messageData:
            "={{ (() => {   let state = [];   try { state = JSON.parse($json.appts_state_json || '[]'); } catch(e) {}   return JSON.stringify({     telephone: $json.phone || '',     nom: $json.nom_client || '',     ville_quartier: state[0] ? state[0].ville_quartier : '',     surface: state[0] ? state[0].surface : '',     etage: state[0] ? state[0].etage : '',     nombre_pieces: state[0] ? state[0].nombre_pieces : '',     date_disponibilite: state[0] ? state[0].date_disponibilite : '',     photos_urls: $json.liens_photos || '',     date_enregistrement: new Date().toISOString()   }); })() }}",
        tail: true,
    };

    @node({
        id: 'f099cecd-12c0-4689-8ca9-d3f51ab7f2bd',
        name: 'WA Script Admin',
        type: 'n8n-nodes-base.whatsApp',
        version: 1,
        position: [-60, 4720],
        credentials: { whatsAppApi: { id: 'A5i0TdmXFmQSw5T3', name: 'WhatsApp account 2' } },
        retryOnFail: true,
        maxTries: 5,
        waitBetweenTries: 5000,
    })
    WaScriptAdmin = {
        operation: 'send',
        phoneNumberId: '1035565869637770',
        recipientPhoneNumber: '213551671229',
        textBody: `=🏠 *NOUVEAU PROPRIÉTAIRE AJOUTÉ AU CRM*
━━━━━━━━━━━━━━━━━━━━━━━━

👤 *Nom* : {{ $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.contacts[0].profile.name || 'Inconnu' }}
📞 *Téléphone* : {{ $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.messages[0].from }}

🏢 *Données du Bien* :
{{ (() => {
  try {
    const state = JSON.parse($('State Clean Code').first().json.appts_state_json || '[]');
    const a = state[0] || {};
    let lines = [];
    if (a.ville_quartier) lines.push('📍 Localisation : ' + a.ville_quartier);
    if (a.surface)        lines.push('📐 Surface : ' + a.surface + ' m²');
    if (a.etage)          lines.push('🏗️ Étage : ' + a.etage);
    if (a.nombre_pieces)  lines.push('🛏️ Pièces : ' + a.nombre_pieces);
    if (a.date_disponibilite) lines.push('📅 Disponibilité : ' + a.date_disponibilite);
    return lines.length > 0 ? lines.join('\\n') : '(Données non renseignées)';
  } catch(e) { return '(Erreur lecture état)'; }
})() }}

📸 *Photos* : {{ $('Set Context').first().json.liens_photos || 'Aucune photo' }}

━━━━━━━━━━━━━━━━━━━━━━━━
🤝 Bon closing !`,
        additionalFields: {},
        requestOptions: {},
    };

    @node({
        id: 'b10c30b0-e7ab-47ae-9eac-62e46ae25ee8',
        name: 'WA Message Support',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [-920, 3380],
        credentials: { whatsAppApi: { id: 'A5i0TdmXFmQSw5T3', name: 'WhatsApp account 2' } },
        retryOnFail: true,
        maxTries: 2,
        waitBetweenTries: 1500,
    })
    WaMessageSupport = {
        method: 'POST',
        url: 'https://graph.facebook.com/v19.0/1035565869637770/messages',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'whatsAppApi',
        sendBody: true,
        contentType: 'raw',
        rawContentType: 'application/json',
        body: '={{ $json.waBody }}',
        options: {},
    };

    @node({
        id: 'f5d95fa7-8926-429e-8ea3-f5d1d2a0ad39',
        name: '1. Prep Redis Vars',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-11640, 3080],
    })
    _1PrepRedisVars = {
        jsCode: `// 1. Get the sender from the absolute beginning (the Webhook)
const sender = $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.messages[0].from;

// 2. Get the text directly from the current incoming item, NO looking ahead!
const text = $input.first().json.text || "";

return {
  redis_key: "wa_buffer_" + sender,
  incoming_text: text
};`,
    };

    @node({
        id: '78ea7d27-cd10-4d2e-866b-5ad2a5dd1fb9',
        name: '2. Redis Get Initial',
        type: 'n8n-nodes-base.redis',
        version: 1,
        position: [-11440, 3080],
        credentials: { redis: { id: 'V8K02flgy9UVw9wq', name: 'Redis account' } },
    })
    _2RedisGetInitial = {
        operation: 'get',
        key: "={{ $('1. Prep Redis Vars').first().json.redis_key }}",
        options: {},
    };

    @node({
        id: '76846e30-2c04-435e-a984-06774e6515d0',
        name: '3. Calc New Buffer',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-11240, 3080],
    })
    _3CalcNewBuffer = {
        jsCode: `let old_val = $input.first().json.value || $input.first().json.propertyName || "";
let prep = $('1. Prep Redis Vars').first().json;

let new_buffer = old_val ? (old_val + "\\n" + prep.incoming_text) : prep.incoming_text;

return {
  redis_key: prep.redis_key,
  new_buffer: new_buffer
};`,
    };

    @node({
        id: '6282efe2-9736-4d9f-aa21-aaf812cd0e86',
        name: '4. Redis Set',
        type: 'n8n-nodes-base.redis',
        version: 1,
        position: [-11040, 3080],
        credentials: { redis: { id: 'V8K02flgy9UVw9wq', name: 'Redis account' } },
    })
    _4RedisSet = {
        operation: 'set',
        key: "={{ $('3. Calc New Buffer').first().json.redis_key }}",
        value: "={{ $('3. Calc New Buffer').first().json.new_buffer }}",
    };

    @node({
        id: '4b2a4b35-f28f-4396-bc63-bda337b83874',
        webhookId: 'redis-debounce-wait',
        name: '5. Wait (Debounce)',
        type: 'n8n-nodes-base.wait',
        version: 1.1,
        position: [-10840, 3080],
    })
    _5WaitDebounce = {
        amount: 30,
    };

    @node({
        id: 'ab2dfdb7-9312-40f2-9a57-83a4dd233010',
        name: '6. Redis Get (Check)',
        type: 'n8n-nodes-base.redis',
        version: 1,
        position: [-10640, 3080],
        credentials: { redis: { id: 'V8K02flgy9UVw9wq', name: 'Redis account' } },
    })
    _6RedisGetCheck = {
        operation: 'get',
        key: "={{ $('3. Calc New Buffer').first().json.redis_key }}",
        options: {},
    };

    @node({
        id: '0cdf390c-70b6-4f33-aac0-08264013c586',
        name: '7. Collision Check',
        type: 'n8n-nodes-base.if',
        version: 2.2,
        position: [-10440, 3080],
    })
    _7CollisionCheck = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'strict',
                version: 2,
            },
            conditions: [
                {
                    id: 'collision-check',
                    leftValue: '={{ $json.value || $json.propertyName || "" }}',
                    rightValue: "={{ $('3. Calc New Buffer').first().json.new_buffer }}",
                    operator: {
                        type: 'string',
                        operation: 'equals',
                    },
                },
            ],
            combinator: 'and',
        },
        options: {},
    };

    @node({
        id: '027d4622-a7b0-464e-9e4f-4cd7c4d954ae',
        name: '8. Redis Delete Key',
        type: 'n8n-nodes-base.redis',
        version: 1,
        position: [-10140, 2980],
        credentials: { redis: { id: 'V8K02flgy9UVw9wq', name: 'Redis account' } },
    })
    _8RedisDeleteKey = {
        operation: 'delete',
        key: "={{ $('3. Calc New Buffer').first().json.redis_key }}",
    };

    @node({
        id: 'ebb8ae4c-144a-4388-bd3e-9e5cc524f676',
        name: 'Debounced Text',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-9940, 2980],
    })
    DebouncedText = {
        jsCode: `return {
  text: $('3. Calc New Buffer').first().json.new_buffer
};
`,
    };

    @node({
        id: 'c14d74d9-1ba4-416e-8346-2a2ef56c3faf',
        name: '10. Halt (Newer Msg Exists)',
        type: 'n8n-nodes-base.noOp',
        version: 1,
        position: [-10100, 3220],
    })
    _10HaltNewerMsgExists = {};

    @node({
        id: '4927fd8e-389b-4b97-b3aa-d5475309d675',
        name: 'Redis Chat Memory',
        type: '@n8n/n8n-nodes-langchain.memoryRedisChat',
        version: 1.4,
        position: [-1780, 3900],
        credentials: { redis: { id: 'V8K02flgy9UVw9wq', name: 'Redis account' } },
        retryOnFail: true,
        maxTries: 2,
        waitBetweenTries: 1500,
    })
    RedisChatMemory = {
        sessionIdType: 'customKey',
        sessionKey:
            "={{ $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.messages[0].from + 'global_16' }}",
        sessionTTL: 86400,
        contextWindowLength: 30,
    };

    @node({
        id: '1928e91e-868f-4d74-9eaf-c3d731209d36',
        name: 'Redis Chat Memory1',
        type: '@n8n/n8n-nodes-langchain.memoryRedisChat',
        version: 1.4,
        position: [-660, 5200],
        credentials: { redis: { id: 'V8K02flgy9UVw9wq', name: 'Redis account' } },
        retryOnFail: true,
        maxTries: 2,
        waitBetweenTries: 1500,
    })
    RedisChatMemory1 = {
        sessionIdType: 'customKey',
        sessionKey:
            "={{ $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.messages[0].from + 'fiche_8' }}",
        sessionTTL: 86400,
        contextWindowLength: 30,
    };

    @node({
        id: 'd1ae0acd-04b5-491f-8908-4f27fcbc56e4',
        name: 'Redis Chat Memory2',
        type: '@n8n/n8n-nodes-langchain.memoryRedisChat',
        version: 1.4,
        position: [-5020, 3240],
        credentials: { redis: { id: 'V8K02flgy9UVw9wq', name: 'Redis account' } },
        retryOnFail: true,
        maxTries: 2,
        waitBetweenTries: 1500,
    })
    RedisChatMemory2 = {
        sessionIdType: 'customKey',
        sessionKey:
            "={{ $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.messages[0].from + 'route_16' }}",
        sessionTTL: 86400,
        contextWindowLength: 30,
    };

    @node({
        id: '20908c12-a78b-4aaa-b6ff-e4618ca1fb74',
        name: 'Disponibilites_Hospitable',
        type: '@n8n/n8n-nodes-langchain.toolWorkflow',
        version: 2,
        position: [-3480, 2520],
        retryOnFail: true,
        maxTries: 2,
        waitBetweenTries: 1500,
    })
    DisponibilitesHospitable = {
        name: 'Verifier_TOUTE_La_Liste',
        description:
            "Vérifie les disponibilités et prix EN TEMPS RÉEL pour nos appartements.\\nPARAMÈTRES OBLIGATOIRES :\\n- property_ids : Liste de TOUS les IDs extraits du catalogue, strictement séparés par virgule.\\n- start_date : date d'arrivée au format YYYY-MM-DD\\n- end_date : date de départ au format YYYY-MM-DD\\n- guests : nombre de voyageurs",
        workflowId: {
            __rl: true,
            value: 'cpUwDbRPuJNAwpeM',
            mode: 'list',
            cachedResultName: 'wsp : dispo',
        },
        workflowInputs: {
            mappingMode: 'defineBelow',
            value: {
                start_date: "={{ $fromAI('start_date') }}",
                end_date: "={{ $fromAI('end_date') }}",
                guests: "={{ Number($fromAI('guests')) }}",
                phone: "={{ $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.messages[0].from }}",
                property_ids: "={{ $fromAI('property_ids') }}",
                first_name:
                    "={{ ($('Webhook (Receive Message)').first().json.body?.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.profile?.name || '').split(' ')[0] || '' }}",
                last_name:
                    "={{ ($('Webhook (Receive Message)').first().json.body?.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.profile?.name || '').split(' ').slice(1).join(' ') || '' }}",
                page: "={{ $fromAI('page', 'Page number for results (1 = first batch, 2 = second batch). Default is 1.', 'number') }}",
            },
            matchingColumns: [],
            schema: [
                {
                    id: 'property_ids',
                    displayName: 'property_ids',
                    required: true,
                    defaultMatch: false,
                    display: true,
                    canBeUsedToMatch: true,
                    type: 'string',
                    description: 'Comma separated list of property IDs',
                },
                {
                    id: 'start_date',
                    displayName: 'start_date',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    canBeUsedToMatch: true,
                    type: 'string',
                },
                {
                    id: 'end_date',
                    displayName: 'end_date',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    canBeUsedToMatch: true,
                    type: 'string',
                },
                {
                    id: 'guests',
                    displayName: 'guests',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    canBeUsedToMatch: true,
                    type: 'number',
                },
                {
                    id: 'phone',
                    displayName: 'phone',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    canBeUsedToMatch: true,
                    type: 'string',
                },
                {
                    id: 'first_name',
                    displayName: 'first_name',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    canBeUsedToMatch: false,
                    type: 'string',
                },
                {
                    id: 'last_name',
                    displayName: 'last_name',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    canBeUsedToMatch: false,
                    type: 'string',
                },
                {
                    id: 'page',
                    displayName: 'page',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    canBeUsedToMatch: false,
                    type: 'number',
                    default: 1,
                },
            ],
            attemptToConvertTypes: false,
            convertFieldsToString: false,
        },
    };

    @node({
        id: '4f88d8bb-9e67-41f5-b766-982e43a51f02',
        name: 'Verifier_Statut_Paiement',
        type: '@n8n/n8n-nodes-langchain.toolWorkflow',
        version: 2,
        position: [-3580, 2600],
        retryOnFail: true,
        maxTries: 2,
        waitBetweenTries: 1500,
    })
    VerifierStatutPaiement = {
        name: 'Verifier_Statut_Paiement',
        description:
            'DANGER DE MORT : Tu DOIS EXÉCUTER cet outil À CHAQUE NOUVEAU MESSAGE du client (même s\'il dit juste "ok", "dinar" ou "oui"). C\'est OBLIGATOIRE pour savoir si le client est en phase de paiement.',
        workflowId: {
            __rl: true,
            value: 'MRFnDCvajn6YaxpI',
            mode: 'list',
            cachedResultName: 'wsp : verifier paiement',
        },
        workflowInputs: {
            mappingMode: 'defineBelow',
            value: {
                phone: "={{ $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.messages[0].from }}",
            },
            matchingColumns: ['phone'],
            schema: [
                {
                    id: 'phone',
                    displayName: 'phone',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    canBeUsedToMatch: true,
                    type: 'string',
                    removed: false,
                },
            ],
            attemptToConvertTypes: false,
            convertFieldsToString: false,
        },
    };

    @node({
        id: '2e648c62-6da4-4fb1-a265-9e92bfa2cdbc',
        name: 'Basic LLM Chain',
        type: '@n8n/n8n-nodes-langchain.chainLlm',
        version: 1.5,
        position: [-1280, 2320],
        retryOnFail: true,
        maxTries: 2,
        waitBetweenTries: 1500,
    })
    BasicLlmChain = {
        promptType: 'define',
        text: "={{ $json.output.replace(/ESCALADE_ADMIN|VILLE_[A-Z]+|ATTENTE_PHOTOS|OFFRE_ENVOYEE/g, '').trim() }}",
        messages: {
            messageValues: [
                {
                    message: '={{ $json.dynamic_prompt }}',
                },
            ],
        },
    };

    @node({
        id: 'f8813e94-1261-4a56-a487-eb8b4f5a1a37',
        name: 'OpenAI Chat Model4',
        type: '@n8n/n8n-nodes-langchain.lmChatOpenAi',
        version: 1.2,
        position: [20, 4400],
        credentials: { openAiApi: { id: '26s882nA6pHLzhZT', name: 'OpenAi account' } },
        retryOnFail: true,
        maxTries: 3,
        waitBetweenTries: 2000,
    })
    OpenaiChatModel4 = {
        model: {
            __rl: true,
            mode: 'id',
            value: "={{ ($('Set Context').isExecuted ? ($('Set Context').first().json.langue_utilisateur || '') : ($('Redis_Get_Context').isExecuted ? ($('Redis_Get_Context').first().json.lang || '') : '')).includes('Darja') ? 'gpt-4o' : 'gpt-4o-mini' }}",
        },
        options: {
            maxTokens: 3000,
            temperature: 0.3,
        },
    };

    @node({
        id: '49f08d5f-f51e-4247-949a-a6657f3add89',
        name: 'Traduction_WA_Pose_Question1',
        type: '@n8n/n8n-nodes-langchain.chainLlm',
        version: 1.5,
        position: [-1540, 4080],
        retryOnFail: true,
        maxTries: 2,
        waitBetweenTries: 1500,
    })
    TraductionWaPoseQuestion1 = {
        promptType: 'define',
        text: "={{ $node['Booking Agent (Proprietaire)'].json.output.replace(/\\**VILLE_[A-Z]+\\**|\\*VILLE_[A-Z]+\\*|VILLE_[A-Z]+|ATTENTE_PHOTOS|OFFRE_ENVOYEE|ESCALADE_ADMIN/g,'').trim() }}",
        messages: {
            messageValues: [
                {
                    message: '={{ $json.dynamic_prompt }}',
                },
            ],
        },
    };

    @node({
        id: '74c31fac-f001-4f13-9bdb-1612b27c0fd3',
        name: 'Traduction_WA_Refus1',
        type: '@n8n/n8n-nodes-langchain.chainLlm',
        version: 1.5,
        position: [-1400, 3120],
        retryOnFail: true,
        maxTries: 2,
        waitBetweenTries: 1500,
    })
    TraductionWaRefus1 = {
        promptType: 'define',
        text: "={{ $node['Booking Agent (Proprietaire)'].json.output.replace(/VILLE_REFUSEE/g,'').trim() }}",
        messages: {
            messageValues: [
                {
                    message: '={{ $json.dynamic_prompt }}',
                },
            ],
        },
    };

    @node({
        id: 'a5ba9426-58b1-40c9-8b28-a8472ee664ba',
        name: 'Traduction_WA_Demande_Photos_Init',
        type: '@n8n/n8n-nodes-langchain.chainLlm',
        version: 1.5,
        position: [-1960, 4480],
        retryOnFail: true,
        maxTries: 2,
        waitBetweenTries: 1500,
    })
    TraductionWaDemandePhotosInit = {
        promptType: 'define',
        text: "={{ $node['Booking Agent (Proprietaire)'].json.output.replace(/ATTENTE_PHOTOS/g,'').trim() }}",
        messages: {
            messageValues: [
                {
                    message: '={{ $json.dynamic_prompt }}',
                },
            ],
        },
    };

    @node({
        id: 'ffd17473-18f9-47a2-8884-9a6f575c0499',
        name: 'Traduction_WA_Message_Support',
        type: '@n8n/n8n-nodes-langchain.chainLlm',
        version: 1.5,
        position: [-1740, 3380],
        retryOnFail: true,
        maxTries: 2,
        waitBetweenTries: 1500,
    })
    TraductionWaMessageSupport = {
        promptType: 'define',
        text: '={{ $json.output }}',
        messages: {
            messageValues: [
                {
                    message: '={{ $json.dynamic_prompt }}',
                },
            ],
        },
    };

    @node({
        id: 'abcc106e-5b9e-4305-bee5-dfa3911a56f1',
        name: 'Redis Get Text Lang',
        type: 'n8n-nodes-base.redis',
        version: 1,
        position: [-8840, 3340],
        credentials: { redis: { id: 'V8K02flgy9UVw9wq', name: 'Redis account' } },
    })
    RedisGetTextLang = {
        operation: 'get',
        key: "=lang_{{ $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.messages[0].from }}",
        options: {},
    };

    @node({
        id: 'a5fc2e3f-31a9-4a00-86b5-3be8b1a7ad9a',
        name: 'Redis Set Text Lang',
        type: 'n8n-nodes-base.redis',
        version: 1,
        position: [-7940, 3400],
        credentials: { redis: { id: 'V8K02flgy9UVw9wq', name: 'Redis account' } },
    })
    RedisSetTextLang = {
        operation: 'set',
        key: "=lang_{{ $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.messages[0].from }}",
        value: "={{ $('Calculate Predominant Lang').first().json.dominant_lang }}",
    };

    @node({
        id: '0943c6fc-6d69-42c1-b93a-5eba4086af32',
        name: '1. Get Audio URL',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [-12480, 3760],
        credentials: { whatsAppApi: { id: 'A5i0TdmXFmQSw5T3', name: 'WhatsApp account 2' } },
        retryOnFail: true,
        maxTries: 2,
        waitBetweenTries: 1500,
    })
    _1GetAudioUrl = {
        url: "={{ 'https://graph.facebook.com/v19.0/' + ($json.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.audio?.id || $json.media_id) }}",
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'whatsAppApi',
        options: {
            response: {
                response: {
                    responseFormat: 'json',
                },
            },
        },
    };

    @node({
        id: '91387691-4870-454f-8914-761605f060f2',
        name: '2. Download Audio',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [-12280, 3760],
        credentials: { whatsAppApi: { id: 'A5i0TdmXFmQSw5T3', name: 'WhatsApp account 2' } },
        retryOnFail: true,
        maxTries: 2,
        waitBetweenTries: 1500,
    })
    _2DownloadAudio = {
        url: '={{ $json.url }}',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'whatsAppApi',
        options: {
            response: {
                response: {
                    responseFormat: 'file',
                },
            },
        },
    };

    @node({
        id: 'b7ea521d-8170-461b-ba30-6655047b754b',
        name: 'Format Transcribed Text',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [-11940, 3620],
    })
    FormatTranscribedText = {
        assignments: {
            assignments: [
                {
                    id: '1',
                    name: 'text',
                    value: "={{ $json.text || $json.choices?.[0]?.message?.content || '' }}",
                    type: 'string',
                },
            ],
        },
        options: {},
    };

    @node({
        id: '0e321124-6e2f-4506-87ed-b0f42c38cbbf',
        name: 'Filter Darja/Arabic',
        type: 'n8n-nodes-base.if',
        version: 2.2,
        position: [-7080, 3620],
    })
    FilterDarjaArabic = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'strict',
                version: 2,
            },
            conditions: [
                {
                    id: 'c1',
                    leftValue: "={{ $('Calculate Predominant Lang').item.json.dominant_lang }}",
                    rightValue: 'Darja Algéroise',
                    operator: {
                        type: 'string',
                        operation: 'contains',
                    },
                },
                {
                    id: 'c2',
                    leftValue: "={{ $('Calculate Predominant Lang').item.json.dominant_lang }}",
                    rightValue: 'Arabe Classique',
                    operator: {
                        type: 'string',
                        operation: 'contains',
                    },
                },
            ],
            combinator: 'or',
        },
        options: {},
    };

    @node({
        id: '1ef1de00-836d-4e1f-aabb-a3d794bae864',
        name: 'WA Escalade Langue Locale',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [-6320, 3700],
        credentials: { whatsAppApi: { id: 'A5i0TdmXFmQSw5T3', name: 'WhatsApp account 2' } },
        retryOnFail: true,
        maxTries: 2,
        waitBetweenTries: 1500,
    })
    WaEscaladeLangueLocale = {
        method: 'POST',
        url: 'https://graph.facebook.com/v19.0/1035565869637770/messages',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'whatsAppApi',
        sendBody: true,
        contentType: 'raw',
        rawContentType: 'application/json',
        body: '={{ $json.waBody }}',
        options: {},
    };

    @node({
        id: '66b9d726-4be8-4dfb-a735-d43c9b5bebf4',
        name: 'Is Audio?',
        type: 'n8n-nodes-base.if',
        version: 2.2,
        position: [-7580, 3400],
    })
    IsAudio = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'strict',
                version: 2,
            },
            conditions: [
                {
                    id: '964763d1-c464-49b9-9c9c-4365a70f5e81',
                    leftValue:
                        "={{ $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.messages[0].type }}",
                    rightValue: 'audio',
                    operator: {
                        type: 'string',
                        operation: 'equals',
                        name: 'filter.operator.equals',
                    },
                },
            ],
            combinator: 'and',
        },
        options: {},
    };

    @node({
        id: 'fa2b7f68-f20b-48a6-bbb8-d8aac3c9361b',
        name: 'HTTP Request',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [-12060, 3760],
        credentials: { openAiApi: { id: '26s882nA6pHLzhZT', name: 'OpenAi account' } },
        retryOnFail: true,
        maxTries: 2,
        waitBetweenTries: 1500,
    })
    HttpRequest = {
        method: 'POST',
        url: 'https://api.openai.com/v1/audio/transcriptions',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'openAiApi',
        sendBody: true,
        contentType: 'multipart-form-data',
        bodyParameters: {
            parameters: [
                {
                    name: 'model',
                    value: 'whisper-1',
                },
                {
                    parameterType: 'formBinaryData',
                    name: 'file',
                    inputDataFieldName: 'data',
                },
                {
                    name: 'language',
                    value: 'fr',
                },
                {
                    name: 'prompt',
                    value: 'Darja algérienne romanisée, mélangée de français. Salam, wach, labas, kho, partma, nekri, lghedwa, 3afak, mochkil, kima. Transcription en lettres latines uniquement, jamais en arabe.',
                },
            ],
        },
        options: {},
    };

    @node({
        id: 'd6463d4d-fbda-4867-8703-c7580d2503cb',
        name: 'Code Check Pause',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-13200, 4120],
    })
    CodeCheckPause = {
        jsCode: `const staticData = $getWorkflowStaticData('global');
const msg = $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.messages[0];
const sender = msg.from;
const type = msg.type;

if (type === 'image') {
    staticData['last_image_ts_' + sender] = Date.now();
}

for (const item of $input.all()) {
  item.json.paused = !!staticData['pause_' + sender];
}
return $input.all();`,
    };

    @node({
        id: '0e0f0659-4e32-4f27-80d7-2f730f845331',
        name: 'If Paused',
        type: 'n8n-nodes-base.if',
        version: 2,
        position: [-13060, 3900],
    })
    IfPaused = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'strict',
                version: 2,
            },
            conditions: [
                {
                    id: 'c62142e8',
                    leftValue: '={{ $json.paused }}',
                    rightValue: true,
                    operator: {
                        type: 'boolean',
                        operation: 'equals',
                    },
                },
            ],
            combinator: 'and',
        },
        options: {},
    };

    @node({
        id: '64ba5e7d-a980-4c1a-a233-7616ddd581d7',
        name: 'Code Set Pause',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-1160, 3720],
    })
    CodeSetPause = {
        jsCode: `const staticData = $getWorkflowStaticData('global');
const sender = $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.messages[0].from;
staticData['pause_' + sender] = true;
return $input.all();`,
    };

    @node({
        id: 'eb51a663-7063-4d75-9d8c-c8b8a4a595d2',
        name: 'Code Build Admin Report 1',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-2760, 2420],
    })
    CodeBuildAdminReport1 = {
        jsCode: `const sender = $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.messages[0].from;
const contacts = $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.contacts;
const clientName = (contacts && contacts[0] && contacts[0].profile && contacts[0].profile.name)
  ? contacts[0].profile.name : 'Inconnu';

// Try to get agent output — could be voyageur or propriétaire
let agentName = 'Agent IA';
let agentSummary = '';
try {
  const out = $('Booking Agent (Voyageur)').first().json.output;
  if (out) { agentSummary = out; agentName = 'Booking Agent (Voyageur)'; }
} catch(e) {}
if (!agentSummary) {
  try {
    const out = $('Booking Agent (Proprietaire)').first().json.output;
    if (out) { agentSummary = out; agentName = 'Booking Agent (Propriétaire)'; }
  } catch(e) {}
}

const cleanSummary = agentSummary.replace(/ESCALADE_ADMIN/g, '').trim().substring(0, 500);

let lastMessage = '';
try { lastMessage = $('Debounced Text').first().json.text || ''; } catch(e) {}
if (!lastMessage) {
  try { lastMessage = $('Extract Text').first().json.text || '[message non-textuel]'; } catch(e) { lastMessage = '[indisponible]'; }
}

const staticData = $getWorkflowStaticData('global');
const photos = staticData['photos_' + sender] || [];
const photoSection = photos.length > 0
  ? '\\n\\n PHOTOS DU BIEN (' + photos.length + ' photo(s)) :\\n' + photos.map((url, i) => 'Photo ' + (i + 1) + ': ' + url).join('\\n')
  : '';

const report = \`🚨 ESCALADE — INTERVENTION REQUISE 🚨

👤 *Client* : \${clientName}
📞 *Tél* : \${sender}
🤖 *Source* : \${agentName}

💬 *Dernier message du client* :
"\${lastMessage}"

📋 *Résumé IA (Raison de l'escalade)* :
\${cleanSummary || '(Aucun contexte fourni par l\\'IA)'}\${photoSection}

⚠️ *Action Requise* : Le bot est mis en pause sur cette conversation. Prenez en charge manuellement.\`;

return [{ json: { report } }];`,
    };

    @node({
        id: '47406160-5f78-4401-b775-6742b6b5ef4f',
        name: 'Code Build Admin Report 2',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-2520, 3340],
    })
    CodeBuildAdminReport2 = {
        jsCode: `const sender = $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.messages[0].from;
const contacts = $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.contacts;
const clientName = (contacts && contacts[0] && contacts[0].profile && contacts[0].profile.name)
  ? contacts[0].profile.name : 'Inconnu';

let agentSummary = '';
try { agentSummary = $('Agent Support Client').first().json.output || ''; } catch(e) {}
const cleanSummary = agentSummary.replace(/ESCALADE_ADMIN/g, '').trim().substring(0, 500);

let lastMessage = '';
try { lastMessage = $('Debounced Text').first().json.text || ''; } catch(e) {}
if (!lastMessage) {
  try { lastMessage = $('Extract Text').first().json.text || '[message non-textuel]'; } catch(e) { lastMessage = '[indisponible]'; }
}

const staticData = $getWorkflowStaticData('global');
const photos = staticData['photos_' + sender] || [];
const photoSection = photos.length > 0
  ? '\\n\\n PHOTOS DU BIEN (' + photos.length + ' photo(s)) :\\n' + photos.map((url, i) => 'Photo ' + (i + 1) + ': ' + url).join('\\n')
  : '';

const report = \`🚨 ESCALADE — CLIENT EXISTANT / SUPPORT

👤 Client : \${clientName}
📞 Tél : \${sender}
🤖 Source : Agent Support Client

💬 Dernier message :
"\${lastMessage}"

📋 Résumé IA (raison de l'escalade) :
\${cleanSummary || '(aucun contexte disponible)'}\${photoSection}

 Bot mis en pause — Prenez en charge manuellement.\`;

return [{ json: { report } }];`,
    };

    @node({
        id: '03512cb1-4b78-4f02-9909-990f7ae6cd67',
        name: 'WA Reponse Vocale Client',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [-4880, 3960],
        credentials: { whatsAppApi: { id: 'A5i0TdmXFmQSw5T3', name: 'WhatsApp account 2' } },
        retryOnFail: true,
        maxTries: 2,
        waitBetweenTries: 1500,
    })
    WaReponseVocaleClient = {
        method: 'POST',
        url: 'https://graph.facebook.com/v19.0/1035565869637770/messages',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'whatsAppApi',
        sendBody: true,
        contentType: 'raw',
        rawContentType: 'application/json',
        body: '={{ $json.waBody }}',
        options: {},
    };

    @node({
        id: 'bc50a138-6299-4754-aeed-050fb3e58283',
        name: 'WA Forward Audio a Admin',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [-5400, 3760],
        credentials: { whatsAppApi: { id: 'A5i0TdmXFmQSw5T3', name: 'WhatsApp account 2' } },
        retryOnFail: true,
        maxTries: 3,
        waitBetweenTries: 2000,
    })
    WaForwardAudioAAdmin = {
        method: 'POST',
        url: 'https://graph.facebook.com/v19.0/1035565869637770/messages',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'whatsAppApi',
        sendBody: true,
        contentType: 'raw',
        rawContentType: 'application/json',
        body: '={{ JSON.stringify({"messaging_product":"whatsapp","to":"213551671229","type":"audio","audio":{"id":$json.audio_id}}) }}',
        options: {},
    };

    @node({
        id: '39fe19af-d1e9-4728-a8f4-4750fa3f3bc5',
        name: 'Redis_Get_Context',
        type: 'n8n-nodes-base.redis',
        version: 1,
        position: [-6800, 3280],
        credentials: { redis: { id: 'V8K02flgy9UVw9wq', name: 'Redis account' } },
    })
    RedisGetContext = {
        operation: 'get',
        key: "={{ 'bot_context_' + $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.messages[0].from }}",
        options: {},
    };

    @node({
        id: 'fddf8c22-37fa-45a2-9e22-92a18d7ec515',
        name: 'Active Text & History',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-9600, 2960],
    })
    ActiveTextHistory = {
        jsCode: `const text = $('Debounced Text').first()?.json?.text || "";
const sender = $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.messages[0].from;

const staticData = $getWorkflowStaticData('global');
const lastImageTs = staticData['last_image_ts_' + sender] || 0;
// If an image was received in the last 45 seconds, the Image branch is handling the conversation
if (Date.now() - lastImageTs < 45000) {
    // SILENT ABORT: Stop the Text branch to avoid double responses
    return [];
}


// Récupérer l'historique de Redis (provenant du nœud précédent)
let oldHistoryStr = $input.first()?.json?.value || "";

let historyArr = oldHistoryStr ? oldHistoryStr.split("\\n") : [];

// Réinitialisation si commandé
if (text.toLowerCase().trim() === '/reset' || text.toLowerCase().trim() === 'reset') {
    historyArr = [];
} else if (text) {
    historyArr.push(text);
    if (historyArr.length > 5) {
        historyArr.shift();
    }
}

const combinedHistory = historyArr.join("\\n");

return [{
    json: {
        text: text,
        history: combinedHistory
    }
}];`,
    };

    @node({
        id: 'abe4fc38-277d-400f-8933-7f809dd84e99',
        name: 'Redis Get History',
        type: 'n8n-nodes-base.redis',
        version: 1,
        position: [-9820, 2980],
        credentials: { redis: { id: 'V8K02flgy9UVw9wq', name: 'Redis account' } },
    })
    RedisGetHistory = {
        operation: 'get',
        key: "=lang_history_{{ $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.messages[0].from }}",
        options: {},
    };

    @node({
        id: 'b05fde5b-df9e-4aa3-87de-7a313a5490e2',
        name: 'Redis Set History',
        type: 'n8n-nodes-base.redis',
        version: 1,
        position: [-9400, 2960],
        credentials: { redis: { id: 'V8K02flgy9UVw9wq', name: 'Redis account' } },
    })
    RedisSetHistory = {
        operation: 'set',
        key: "=lang_history_{{ $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.messages[0].from }}",
        value: '={{ $json.history }}',
    };

    @node({
        id: 'a6390a57-8112-4561-89be-8f24a29a6dc3',
        name: 'Detect Language HTTP',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [-8700, 3360],
        credentials: { openAiApi: { id: '26s882nA6pHLzhZT', name: 'OpenAi account' } },
        retryOnFail: true,
        maxTries: 3,
        waitBetweenTries: 2000,
    })
    DetectLanguageHttp = {
        method: 'POST',
        url: 'https://api.openai.com/v1/chat/completions',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'openAiApi',
        sendBody: true,
        specifyBody: 'json',
        jsonBody: `={{
  ({
    "model": "gpt-4o-mini",
    "response_format": { "type": "json_object" },
    "messages": [
      {
        "role": "system",
        "content": "Tu es un expert en profilage linguistique en Algérie.\\n\\nConsignes :\\n1. Renvoie UNIQUEMENT un objet JSON valide.\\n2. Les clés doivent être strictement parmi : \\"Français\\", \\"English\\", \\"Arabe Classique\\", \\"Darja Algéroise\\", \\"Inconnue\\".\\n3. La valeur doit être le nombre exact de mots du texte appartenant à cette langue.\\n\\n⛔ RÈGLE ABSOLUE POUR LES TEXTES MIXTES :\\nLes Algériens mélangent souvent les langues. Tu DOIS compter CHAQUE MOT individuellement. Si une phrase commence par 'salam' (Darja) puis continue en français, tu dois séparer le décompte ! Attention aux fautes de frappe (ex: 'aart' = appart = Français, 'sdoir' = soir = Français).\\n\\n⛔ RÈGLE POUR L'ARABE ET LA DARJA :\\nLes mots informels ou salutations (salam, wach, labas, sahbi, khoya) = Darja Algéroise. Arabe Classique uniquement pour du texte littéral formel.\\n\\nExemples :\\nTexte: 'salam jaimerai un appart' -> {\\"Darja Algéroise\\": 1, \\"Français\\": 3}\\nTexte: 'salam wach rak' -> {\\"Darja Algéroise\\": 3}\\nTexte: 'bonjour cv' -> {\\"Français\\": 2}"
      },
      {
        "role": "user",
        "content": "Texte à analyser : " + ($('Active Text & History').first().json.text || "")
      }
    ],
    "temperature": 0
  })
}}`,
        options: {},
    };

    @node({
        id: '2d1d7661-8417-44f3-9b23-374c6c6cd6be',
        name: 'Save Active Branch',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-4980, 3000],
    })
    SaveActiveBranch = {
        jsCode: `const sender = $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.messages[0].from;
const routerOutput = $input.first().json.output || '';
const userMsg = ($('Set Context').first().json.text || '').toLowerCase();

const validBranches = ['proprietaire_potentiel', 'voyageur_potentiel', 'client_existant'];
let branchToSave = '';

// PRE-CLASSIFIER 1: VOYAGEUR (Regex for high fault tolerance on typos)
const voyageurRegex = /(louer un|loeur un|louer u n|louer l'ap|louer une|rent an|rent a|need to rent|want to rent|booking|r[eé]server|nuit|s[eé]jour|cherch(e|er) un ap|pour demain|pour dormir)/i;

if (voyageurRegex.test(userMsg)) {
    branchToSave = 'voyageur_potentiel';
}

// PRE-CLASSIFIER 2: PROPRIETAIRE (Typo-tolerant Regex)
if (!branchToSave) {
    const proprietaireRegex = /(rent out|mettre.*location|,ettre.*location|mon appart|mon apart|mon appartement|mon bien|ma villa|ma maison|j'ai un appart|j'ai un apart|j'ai une villa|gestion locative)/i;
    
    if (proprietaireRegex.test(userMsg)) {
        branchToSave = 'proprietaire_potentiel';
    }
}

// If no keyword match, trust the LLM router
if (!branchToSave) {
    for (const branch of validBranches) {
        if (routerOutput.toLowerCase().includes(branch)) {
            branchToSave = branch;
            break;
        }
    }
}

return [{
    json: {
        redis_key: 'active_branch_' + sender,
        active_branch: branchToSave
    }
}];`,
    };

    @node({
        id: 'db202952-b903-4c54-b893-3c0a380fe94d',
        name: 'If Nuclear Reset',
        type: 'n8n-nodes-base.if',
        version: 2.2,
        position: [-12580, 3220],
    })
    IfNuclearReset = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'strict',
                version: 2,
            },
            conditions: [
                {
                    id: 'reset1',
                    leftValue: '={{ $json.text.trim().toLowerCase() }}',
                    rightValue: '/reset',
                    operator: {
                        type: 'string',
                        operation: 'contains',
                    },
                },
                {
                    id: 'reset2',
                    leftValue: '={{ $json.text.trim().toLowerCase() }}',
                    rightValue: 'reset',
                    operator: {
                        type: 'string',
                        operation: 'contains',
                    },
                },
            ],
            combinator: 'or',
        },
        options: {},
    };

    @node({
        id: '19ed0ef3-585a-4b11-adcc-587aec26676f',
        name: 'WA Reset Confirmation',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [-11420, 2740],
        credentials: { whatsAppApi: { id: 'A5i0TdmXFmQSw5T3', name: 'WhatsApp account 2' } },
        retryOnFail: true,
        maxTries: 2,
        waitBetweenTries: 1500,
    })
    WaResetConfirmation = {
        method: 'POST',
        url: 'https://graph.facebook.com/v19.0/1035565869637770/messages',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'whatsAppApi',
        sendBody: true,
        contentType: 'raw',
        rawContentType: 'application/json',
        body: '={{ $json.waBody }}',
        options: {},
    };

    @node({
        id: 'de80e75d-b534-4fc5-81aa-866f9d012225',
        name: 'Redis',
        type: 'n8n-nodes-base.redis',
        version: 1,
        position: [-11140, 4380],
        credentials: { redis: { id: 'V8K02flgy9UVw9wq', name: 'Redis account' } },
    })
    Redis = {
        operation: 'push',
        list: "photos_{{ $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.messages[0].from }}",
        messageData: '{{ $json.url }}',
    };

    @node({
        id: 'ba57f71c-e40c-49b3-aaf8-1fbecb0fd342',
        name: 'Redis1',
        type: 'n8n-nodes-base.redis',
        version: 1,
        position: [-4760, 3000],
        credentials: { redis: { id: 'V8K02flgy9UVw9wq', name: 'Redis account' } },
    })
    Redis1 = {
        operation: 'set',
        key: '={{ $json.redis_key }}',
        value: '={{ $json.active_branch }}',
    };

    @node({
        id: '5e8fa029-00ae-4e3c-b083-bda9fdf6f7d3',
        name: 'Reaction Randomizer',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-12320, 4700],
    })
    ReactionRandomizer = {
        jsCode: `try {
    const webhookNode = $('Webhook (Receive Message)').first();
    if (!webhookNode || !webhookNode.json) return [];
    
    const msg = webhookNode.json.body.entry[0].changes[0].value.messages[0];
    
    // Skip reactions entirely for image messages (avoid triple-liking a photo batch)
    if (msg.type === 'image') return [];
    
    const messageId = msg.id;
    const phoneId = webhookNode.json.body.entry[0].changes[0].value.metadata.phone_number_id;
    
    // 35% chance
    if (Math.random() < 0.35) {
        const emojis = ["👍", "❤️"];
        return [{
            json: {
                message_id: messageId,
                phone_id: phoneId,
                emoji: emojis[Math.floor(Math.random() * emojis.length)]
            }
        }];
    }
    return [];
} catch(e) {
    return [];
}`,
    };

    @node({
        id: 'a3ef5db3-7937-4268-8a44-882fef5a4c6b',
        name: 'Detect Offre Envoyee',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-3100, 2980],
    })
    DetectOffreEnvoyee = {
        jsCode: `
let text = $input.first().json.output || "";
let isOffre = false;

if (text.includes("OFFRE_ENVOYEE")) {
    isOffre = true;
    text = text.replace("OFFRE_ENVOYEE", "").trim();
}

return {
    output: text,
    is_offre: isOffre
};`,
    };

    @node({
        id: '5a3caed1-e157-4dea-8302-66bbe44ab1e0',
        name: 'Is Offre Finished?',
        type: 'n8n-nodes-base.if',
        version: 2.2,
        position: [-2900, 2980],
    })
    IsOffreFinished = {
        conditions: {
            options: {
                caseSensitive: true,
                leftWordBoundary: false,
                rightWordBoundary: false,
            },
            conditions: [
                {
                    id: '2d1a3a3b-2bd4-44cd-9f79-6ea4fa5566f0',
                    leftValue: '={{ $json.is_offre }}',
                    rightValue: '',
                    operator: {
                        type: 'boolean',
                        operation: 'true',
                        singleValue: true,
                    },
                },
            ],
            combinator: 'and',
        },
        options: {},
    };

    @node({
        id: '3088e1b6-02ba-4373-9ee6-b18ffe20214b',
        name: 'Redis Wipe Appt',
        type: 'n8n-nodes-base.redis',
        version: 1,
        position: [-2440, 2880],
        credentials: { redis: { id: 'V8K02flgy9UVw9wq', name: 'Redis account' } },
    })
    RedisWipeAppt = {
        operation: 'delete',
        key: "={{ 'photo_count_' + $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.messages[0].from }}",
    };

    @node({
        id: 'beff2c12-3b02-48a2-91ac-838d0c505f77',
        name: 'Redis Wipe Vision',
        type: 'n8n-nodes-base.redis',
        version: 1,
        position: [-2240, 2880],
        credentials: { redis: { id: 'V8K02flgy9UVw9wq', name: 'Redis account' } },
    })
    RedisWipeVision = {
        operation: 'delete',
        key: "={{ 'vision_batch_' + $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.messages[0].from }}",
    };

    @node({
        id: '37fccf2f-a46b-4b51-937d-0f2c0bad1c91',
        name: 'Redis Get Photo URLs',
        type: 'n8n-nodes-base.redis',
        version: 1,
        position: [-6640, 3320],
        credentials: { redis: { id: 'V8K02flgy9UVw9wq', name: 'Redis account' } },
    })
    RedisGetPhotoUrls = {
        operation: 'get',
        key: "={{ 'photo_urls_' + $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.messages[0].from }}",
        options: {},
    };

    @node({
        id: '63c41333-4939-4463-b091-3fc836e9d471',
        webhookId: 'reaction-delay-upxjpovi1',
        name: 'Reaction Delay',
        type: 'n8n-nodes-base.wait',
        version: 1.1,
        position: [-11980, 4740],
    })
    ReactionDelay = {
        amount: 1,
    };

    @node({
        id: '73a099b8-d2bc-46dc-b4df-628c91429feb',
        name: 'Mark As Read HTTP',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [-13320, 4320],
        credentials: { whatsAppApi: { id: 'A5i0TdmXFmQSw5T3', name: 'WhatsApp account 2' } },
        retryOnFail: true,
        maxTries: 2,
        waitBetweenTries: 1500,
    })
    MarkAsReadHttp = {
        method: 'POST',
        url: 'https://graph.facebook.com/v19.0/1035565869637770/messages',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'whatsAppApi',
        sendBody: true,
        contentType: 'raw',
        rawContentType: 'application/json',
        body: '={{ JSON.stringify({"messaging_product":"whatsapp","status":"read","message_id":$(\'Webhook (Receive Message)\').first().json.body.entry[0].changes[0].value.messages[0].id}) }}',
        options: {},
    };

    @node({
        id: '4fe33d90-d161-4e01-8989-552f527feeeb',
        name: 'Reset_Photos',
        type: '@n8n/n8n-nodes-langchain.toolWorkflow',
        version: 2,
        position: [-3940, 3020],
        retryOnFail: true,
        maxTries: 2,
        waitBetweenTries: 1500,
    })
    ResetPhotos = {
        name: 'Reset_Photos',
        description:
            "Utilise cet outil UNIQUEMENT si le client dit qu'il a envoyé les mauvaises photos et veut les remplacer. Cet outil efface les photos actuelles pour en recevoir de nouvelles.",
        workflowId: {
            __rl: true,
            value: 'kCtbKybpBYduPMA8',
            mode: 'list',
            cachedResultName: 'wsp: reset pics',
        },
        workflowInputs: {
            mappingMode: 'defineBelow',
            value: {},
            matchingColumns: ['phone'],
            schema: [
                {
                    id: 'phone',
                    displayName: 'phone',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    canBeUsedToMatch: true,
                    type: 'string',
                    removed: false,
                },
            ],
            attemptToConvertTypes: false,
            convertFieldsToString: false,
        },
    };

    @node({
        id: '1defd3cf-a5c0-4765-b518-d7897948e647',
        name: 'Redis_Get_Branch',
        type: 'n8n-nodes-base.redis',
        version: 1,
        position: [-6460, 3320],
        credentials: { redis: { id: 'V8K02flgy9UVw9wq', name: 'Redis account' } },
    })
    RedisGetBranch = {
        operation: 'get',
        key: "={{ 'active_branch_' + $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.messages[0].from }}",
        options: {},
    };

    @node({
        id: '67df0878-84b4-43f9-8079-6f138e61bb3b',
        name: 'Recherche_Informations_Agence',
        type: '@n8n/n8n-nodes-langchain.toolVectorStore',
        version: 1,
        position: [-3880, 3480],
        retryOnFail: true,
        maxTries: 3,
        waitBetweenTries: 2000,
    })
    RechercheInformationsAgence = {
        name: 'Recherche_Documents',
        description:
            "Outil OBLIGATOIRE pour répondre aux questions du client concernant nos règles (commissions, gestion, pourcentages, procédures). S'il pose une question sur ces sujets, tu DOIS appeler cet outil.",
    };

    @node({
        id: '5d783ff8-3e53-4dc7-b708-6a25cbb0340f',
        name: 'Outil Export CRM',
        type: '@n8n/n8n-nodes-langchain.toolWorkflow',
        version: 2,
        position: [-4100, 3080],
        retryOnFail: true,
        maxTries: 2,
        waitBetweenTries: 1500,
    })
    OutilExportCrm = {
        name: 'Export_CRM',
        description: `Exporte les dossiers appartements au CRM. 
⛔ CONDITION BLOQUANTE : Appelle cet outil UNIQUEMENT si photos_transmises est true pour TOUS les appartements dans le JSON.
Si un appartement a photos_transmises:false → NE PAS APPELER cet outil. Demander les photos d'abord.
Argument 'liste_appartements_json' : copie EXACTEMENT le contenu du tableau JSON de l'état des appartements.`,
        workflowId: {
            __rl: true,
            value: 'XzQzgGQcUDzXWC1s',
            mode: 'list',
            cachedResultName: 'wsp ; crm export',
        },
        workflowInputs: {
            mappingMode: 'defineBelow',
            value: {
                liste_appartements_json:
                    '={{ $fromAI(\'liste_appartements_json\', \'Copie EXACTEMENT le tableau JSON de l\\\'état des appartements que tu as reçu dans ton context. Ne modifie rien. Exemple: [{"ville_quartier":"Hydra","surface":"110"}]\', \'string\') }}',
                phone: "={{ $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.messages[0].from }}",
                nom_client: "={{ $('Set Context').first().json.nom_client }}",
                liens_photos: "={{ $('Set Context').first().json.liens_photos }}",
            },
            matchingColumns: [],
            schema: [
                {
                    id: 'liste_appartements_json',
                    displayName: 'liste_appartements_json',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    canBeUsedToMatch: true,
                    type: 'string',
                },
                {
                    id: 'phone',
                    displayName: 'phone',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    canBeUsedToMatch: true,
                    type: 'string',
                },
                {
                    id: 'nom_client',
                    displayName: 'nom_client',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    canBeUsedToMatch: true,
                    type: 'string',
                },
                {
                    id: 'liens_photos',
                    displayName: 'liens_photos',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    canBeUsedToMatch: true,
                    type: 'string',
                },
            ],
            attemptToConvertTypes: false,
            convertFieldsToString: false,
        },
    };

    @node({
        id: '5ef1d6ea-762b-41e1-b8ee-91fd0417c210',
        name: 'Redis Get Appts State',
        type: 'n8n-nodes-base.redis',
        version: 1,
        position: [-5660, 2580],
        credentials: { redis: { id: 'V8K02flgy9UVw9wq', name: 'Redis account' } },
    })
    RedisGetApptsState = {
        operation: 'get',
        key: "=appts_state_{{ $('Set Context').first().json.phone }}",
        options: {},
    };

    @node({
        id: 'f89a07eb-eb56-4018-91b8-5f33652bcdac',
        name: 'State Prep Code',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-5360, 2580],
    })
    StatePrepCode = {
        jsCode: `
const firstJson = $input.first().json;
const oldStateStr = Object.values(firstJson)[0] || '[]';
let oldState = [];
try { oldState = JSON.parse(oldStateStr); } catch(e) {}

const ctxData = $('Set Context').first().json;
const userMsg = ctxData.text || '';
const contexteRecent = ctxData.contexte_recent || '';

// ANTI-AMNESIA FIX:
// Only wipe state on fresh session IF there is NO existing apartment data.
// Never wipe state just because contexteRecent is empty (can happen after photo branch).
if ((!contexteRecent || contexteRecent.trim() === '') && oldState.length === 0) {
    oldState = [];
}
// If oldState already has apartments, NEVER wipe it regardless of contexteRecent.

return [{
    json: {
        phone: ctxData.phone,
        chat_input: userMsg,
        current_state: JSON.stringify(oldState)
    }
}];
`,
    };

    @node({
        id: '9aa6ef79-ee53-4c30-b011-45d0792012d2',
        name: 'Extract Appts State',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [-5160, 2580],
        credentials: { openAiApi: { id: '26s882nA6pHLzhZT', name: 'OpenAi account' } },
        retryOnFail: true,
        maxTries: 2,
        waitBetweenTries: 1500,
    })
    ExtractApptsState = {
        method: 'POST',
        url: 'https://api.openai.com/v1/chat/completions',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'openAiApi',
        sendBody: true,
        specifyBody: 'json',
        jsonBody: `={{JSON.stringify({
  model: "gpt-4o-mini",
  messages: [
    {
      role: "system",
      content: "Tu es un parseur JSON STRICT. Tu lis le message du client et tu mets a jour le tableau JSON des appartements. Schema OBLIGATOIRE: { \\"appartements\\": [{ id: number, ville_quartier: string|null, surface: string|null, etage: string|null, nombre_pieces: string|null, date_disponibilite: string|null, photos_transmises: boolean }] }. REGLES ABSOLUES: 1. NE MODIFIE JAMAIS les champs qui ont deja une valeur non-null. Si ville_quartier est 'Hydra', garde 'Hydra'. 2. Remplis UNIQUEMENT les champs null si le client mentionne explicitement l information dans son message. 3. Si le client annonce plusieurs appartements dans le meme message, cree autant d objets que d appartements mentionnes. 4. REGLE PHOTOS CRITIQUE: NE TOUCHE JAMAIS au champ photos_transmises - il est gere par un autre systeme. 5. INITIALISATION OBLIGATOIRE: Quand tu crées un NOUVEL objet appartement, tu DOIS TOUJOURS initialiser photos_transmises a false (jamais true, jamais null). 6. Reponds STRICTEMENT AVEC UN OBJET JSON CONTENANT LA CLE 'appartements', sans markdown. 7. Si le message du client est une reponse courte NON INFORMATIVE ('sure', 'ok', 'oui', 'thnx', 'bien sur', 'une seconde', 'd accord', 'merci', 'parfait') -> renvoie le tableau EXACTEMENT tel quel sans aucune modification. 8. REGLE DATE FLEXIBLE (TRES IMPORTANT): Pour le champ date_disponibilite, accepte TOUTE expression de temps, meme approximative ou mal orthographiee. Exemples valides: 'tomorrow', 'demain', 'tomorow', 'demain je suppose', 'bientot', 'la semaine prochaine', 'dans une semaine', 'le mois prochain', 'disponible maintenant', 'dispo', 'asap', 'tout de suite', 'le 1er mai', 'avril', 'dans 2 semaines'. Si le client exprime une disponibilite approximative, stocke exactement ce qu il a dit. Ne laisse JAMAIS date_disponibilite a null si le client a donne une indication temporelle, meme vague. 9. REGLE REPONSE CONTEXTUELLE: Si le seul champ null est date_disponibilite et que le client repond avec une indication de temps (meme vague), c est OBLIGATOIREMENT la date de disponibilite. 10. REGLE ETAGE (TRES IMPORTANT): Si l un des champs vides est 'etage' et que le client repond avec un chiffre ou une expression ordinale ('the first', 'first', 'premier', '1er', 'rdc', 'ground floor', 'second', '2eme'), c est OBLIGATOIREMENT le champ 'etage'. 12. REGLE SURFACE (CRITIQUE): Si le client mentionne une mesure comme '100mcarre', '100 m²', '75', '80 metres', c'est OBLIGATOIREMENT le champ 'surface'. 11. REGLE DARJA (CRITIQUE): 'ga3 sif', 'sif', 'chta' = 'été'/'hiver', stocke les dans 'date_disponibilite'. Les mots 'lghedoua', 'Lghedoua', 'ghedoua', 'ghodwa' signifient 'demain'. Ce NE SONT PAS des noms de ville. Tu DOIS les mettre dans 'date_disponibilite' et JAMAIS dans 'ville_quartier'. Pareil pour 'lyoum' (aujourd hui) ou 'lila' (une nuit)."
    },
    {
      role: "user",
      content: "ETAT ACTUEL : " + $json.current_state + "\\nMESSAGE : " + $json.chat_input
    }
  ],
  temperature: 0
})}}`,
        options: {},
    };

    @node({
        id: '3493872e-bfb3-4db1-9f44-b80505084c6c',
        name: 'State Clean Code',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-4960, 2580],
    })
    StateCleanCode = {
        jsCode: `
let newStateStr = $input.first().json.choices[0].message.content.trim();

// Strip markdown code blocks if LLM adds them
if (newStateStr.includes('\`\`\`')) {
    newStateStr = newStateStr.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
}

// Validate it's a proper JSON array, fallback to empty
let newAppts = [];
try {
    let parsed = JSON.parse(newStateStr);
    if (!Array.isArray(parsed)) {
        if (parsed.appartements && Array.isArray(parsed.appartements)) {
            parsed = parsed.appartements;
        } else {
            parsed = [];
        }
    }
    newAppts = parsed;
} catch(e) {
    newAppts = [];
}

// ============================================================
// CRITICAL: Preserve photos_transmises from OLD Redis state.
// The extractor LLM is NOT allowed to change this field.
// Only the image pipeline can set photos_transmises = true.
// ============================================================
let oldAppts = [];
try {
    const oldStateStr = $('State Prep Code').first().json.current_state || '[]';
    oldAppts = JSON.parse(oldStateStr);
} catch(e) {}

const originalCtx = $('Set Context').first().json;
const recentCtx = originalCtx.contexte_recent || "";
// The Brain injects this exact signature when it evaluates a photo:


for (let newApt of newAppts) {
    const oldApt = oldAppts.find(o => o.id === newApt.id);
    if (oldApt) {
        // STRICTLY preserve the old value. Do NOT use the global hasSentPhotos here.
        newApt.photos_transmises = oldApt.photos_transmises;
    } else {
        // A brand NEW apartment MUST always start with false
        newApt.photos_transmises = false;
    }
    // Ensure date_disponibilite is null-safe
    if (newApt.date_disponibilite === '') newApt.date_disponibilite = null;
}

newStateStr = JSON.stringify(newAppts);

// Package for next nodes
const original = $('Set Context').first().json;
original.appts_state_json = newStateStr;

// STRICT ROUTER: Calculate the EXACT next missing field for the ACTIVE apartment
let next_missing_field = "ALL_FILLED";

if (newAppts.length > 0) {
    // Scan the array to find the FIRST apartment that is missing any required field
    let activeApt = newAppts.find(a => !a.ville_quartier || !a.photos_transmises || !a.surface || !a.nombre_pieces || !a.date_disponibilite);
    
    // If we found an incomplete apartment, figure out exactly what it needs
    if (activeApt) {
        if (!activeApt.ville_quartier) next_missing_field = "ville_quartier";
        else if (!activeApt.photos_transmises) next_missing_field = "photos_transmises";
        else if (!activeApt.surface) next_missing_field = "surface";
        else if (!activeApt.nombre_pieces) next_missing_field = "nombre_pieces";
        else if (!activeApt.date_disponibilite) next_missing_field = "date_disponibilite";
    }
} else {
    next_missing_field = "ville_quartier";
}

original.next_missing_field = next_missing_field;

return [{ json: original }];`,
    };

    @node({
        id: '782f09b2-2397-4b17-8299-6f5c7c8b9d29',
        name: 'Redis Set Appts State',
        type: 'n8n-nodes-base.redis',
        version: 1,
        position: [-4760, 2580],
        credentials: { redis: { id: 'V8K02flgy9UVw9wq', name: 'Redis account' } },
    })
    RedisSetApptsState = {
        operation: 'set',
        key: "=appts_state_{{ $('Set Context').first().json.phone }}",
        value: '={{ $json.appts_state_json }}',
    };

    @node({
        id: 'aab47408-1016-432b-b166-8b79febb3445',
        name: 'Build Body: WA Voyageur1',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-320, 2400],
    })
    BuildBodyWaVoyageur1 = {
        jsCode: `
const items = $input.all();
const phone = $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.messages[0].from;
const messageId = $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.messages[0].id;
let text = items[0].json.output || items[0].json.text || "";



// SMART SANITIZATION FIREWALL
let _lang = "Français";
try { _lang = $('Set Context').first().json.langue_utilisateur; } catch(e) {}

if (_lang === 'Darja Algéroise') {
    text = text.replace(/\\b3afak\\b/gi, 't3ich');
    text = text.replace(/\\b[q9]addach\\b/gi, 'ch7al');
    text = text.replace(/\\bmzyan\\b/gi, 'mlih');
    text = text.replace(/\\bdaba\\b/gi, 'deba');
    text = text.replace(/\\bt9al[b]?chi\\b/gi, 'tdawwer');
    text = text.replace(/\\bwah\\b/gi, 'ih');
    text = text.replace(/\\bm3oul\\b/gi, 'prévu');
    text = text.replace(/\\bt7ajer\\b/gi, 'réserver');
    text = text.replace(/[\\u0600-\\u06FF]/g, '');
}

const payload = JSON.stringify({
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": phone,
    "context": { "message_id": messageId },
    "type": "text",
    "text": { "body": text, "preview_url": true }
});

return items.map(item => ({ json: { ...item.json, waBody: payload, waPhone: phone } }));`,
    };

    @node({
        id: '2a082405-68dd-4f9c-b0eb-7af4ca6af9af',
        name: 'Build Body: WA Pose Question1',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-1060, 4020],
    })
    BuildBodyWaPoseQuestion1 = {
        jsCode: `
const items = $input.all();
const phone = $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.messages[0].from;
const messageId = $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.messages[0].id;
let text = items[0].json.output || items[0].json.text || "";



// SMART SANITIZATION FIREWALL
let _lang = "Français";
try { _lang = $('Set Context').first().json.langue_utilisateur; } catch(e) {}

if (_lang === 'Darja Algéroise') {
    text = text.replace(/\\b3afak\\b/gi, 't3ich');
    text = text.replace(/\\b[q9]addach\\b/gi, 'ch7al');
    text = text.replace(/\\bmzyan\\b/gi, 'mlih');
    text = text.replace(/\\bdaba\\b/gi, 'deba');
    text = text.replace(/\\bt9al[b]?chi\\b/gi, 'tdawwer');
    text = text.replace(/\\bwah\\b/gi, 'ih');
    text = text.replace(/\\bm3oul\\b/gi, 'prévu');
    text = text.replace(/\\bt7ajer\\b/gi, 'réserver');
    text = text.replace(/[\\u0600-\\u06FF]/g, '');
}

const payload = JSON.stringify({
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": phone,
    "context": { "message_id": messageId },
    "type": "text",
    "text": { "body": text, "preview_url": true }
});

return items.map(item => ({ json: { ...item.json, waBody: payload, waPhone: phone } }));`,
    };

    @node({
        id: '254e0008-3a27-4cee-ad88-02945328350b',
        name: 'Build Body: WA Refus1',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-1060, 3100],
    })
    BuildBodyWaRefus1 = {
        jsCode: `
const items = $input.all();
const phone = $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.messages[0].from;
const messageId = $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.messages[0].id;
const text = items[0].json.output || items[0].json.text || "";


// SMART SANITIZATION FIREWALL
let _lang = "Français";
try { _lang = $('Set Context').first().json.langue_utilisateur; } catch(e) {}

if (_lang === 'Darja Algéroise') {
    text = text.replace(/\\b3afak\\b/gi, 't3ich');
    text = text.replace(/\\b[q9]addach\\b/gi, 'ch7al');
    text = text.replace(/\\bmzyan\\b/gi, 'mlih');
    text = text.replace(/\\bdaba\\b/gi, 'deba');
    text = text.replace(/\\bt9al[b]?chi\\b/gi, 'tdawwer');
    text = text.replace(/\\bwah\\b/gi, 'ih');
    text = text.replace(/\\bm3oul\\b/gi, 'prévu');
    text = text.replace(/\\bt7ajer\\b/gi, 'réserver');
    text = text.replace(/[\\u0600-\\u06FF]/g, '');
}

const payload = JSON.stringify({
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": phone,
    "context": { "message_id": messageId },
    "type": "text",
    "text": { "body": text, "preview_url": true }
});

return items.map(item => ({ json: { ...item.json, waBody: payload, waPhone: phone } }));`,
    };

    @node({
        id: 'befaf553-c81e-426d-9527-e02ce5c0694d',
        name: 'Build Body: WA Demande Photos Init',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-1560, 4320],
    })
    BuildBodyWaDemandePhotosInit = {
        jsCode: `
const items = $input.all();
const phone = $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.messages[0].from;
const messageId = $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.messages[0].id;
const text = items[0].json.output || items[0].json.text || "";


// SMART SANITIZATION FIREWALL
let _lang = "Français";
try { _lang = $('Set Context').first().json.langue_utilisateur; } catch(e) {}

if (_lang === 'Darja Algéroise') {
    text = text.replace(/\\b3afak\\b/gi, 't3ich');
    text = text.replace(/\\b[q9]addach\\b/gi, 'ch7al');
    text = text.replace(/\\bmzyan\\b/gi, 'mlih');
    text = text.replace(/\\bdaba\\b/gi, 'deba');
    text = text.replace(/\\bt9al[b]?chi\\b/gi, 'tdawwer');
    text = text.replace(/\\bwah\\b/gi, 'ih');
    text = text.replace(/\\bm3oul\\b/gi, 'prévu');
    text = text.replace(/\\bt7ajer\\b/gi, 'réserver');
    text = text.replace(/[\\u0600-\\u06FF]/g, '');
}

const payload = JSON.stringify({
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": phone,
    "context": { "message_id": messageId },
    "type": "text",
    "text": { "body": text, "preview_url": true }
});

return items.map(item => ({ json: { ...item.json, waBody: payload, waPhone: phone } }));`,
    };

    @node({
        id: 'f866d96f-ec34-42cf-9d21-574badafccde',
        name: 'Build Body: WA Message Support',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-1280, 3400],
    })
    BuildBodyWaMessageSupport = {
        jsCode: `
const items = $input.all();
const phone = $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.messages[0].from;
const messageId = $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.messages[0].id;
const text = items[0].json.output || items[0].json.text || "";

const payload = JSON.stringify({
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": phone,
    "context": { "message_id": messageId },
    "type": "text",
    "text": { "body": text, "preview_url": true }
});

return items.map(item => ({ json: { ...item.json, waBody: payload, waPhone: phone } }));`,
    };

    @node({
        id: '54529c06-6688-4070-a481-e549cce66f8b',
        name: 'Build Body: WA Escalade Langue Locale',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-6540, 3700],
    })
    BuildBodyWaEscaladeLangueLocale = {
        jsCode: `
const items = $input.all();
const phone = $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.messages[0].from;
const messageId = $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.messages[0].id;
const text = "Désolé, je ne comprends pas encore très bien les vocaux en Darja ou en Arabe. Pourriez-vous m'écrire votre message ou me parler en français ?";

const payload = JSON.stringify({
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": phone,
    "context": { "message_id": messageId },
    "type": "text",
    "text": { "body": text, "preview_url": true }
});

return items.map(item => ({ json: { ...item.json, waBody: payload, waPhone: phone } }));`,
    };

    @node({
        id: '768c9248-354a-4e76-b7fa-ad5b41e9471a',
        name: 'Build Body: WA Reponse Vocale Client',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-5100, 3960],
    })
    BuildBodyWaReponseVocaleClient = {
        jsCode: `
const items = $input.all();
const phone = $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.messages[0].from;
const messageId = $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.messages[0].id;
const text = "Votre message vocal a été transmis à notre équipe. Nous vous répondrons dès que possible.";

const payload = JSON.stringify({
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": phone,
    "context": { "message_id": messageId },
    "type": "text",
    "text": { "body": text, "preview_url": true }
});

return items.map(item => ({ json: { ...item.json, waBody: payload, waPhone: phone } }));`,
    };

    @node({
        id: '76194f6e-3221-4553-9683-319aae14f2cf',
        name: 'Build Body: WA Reset Confirmation',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-11640, 2740],
    })
    BuildBodyWaResetConfirmation = {
        jsCode: `
const items = $input.all();
const phone = $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.messages[0].from;
const messageId = $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.messages[0].id;
const text = "🧹 Mémoire Effacée avec Succès !\\n\\nJe suis prêt à recommencer à zéro. Que puis-je faire pour vous aujourd'hui ?";

const payload = JSON.stringify({
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": phone,
    "context": { "message_id": messageId },
    "type": "text",
    "text": { "body": text, "preview_url": true }
});

return items.map(item => ({ json: { ...item.json, waBody: payload, waPhone: phone } }));`,
    };

    @node({
        id: 'ff99ef1f-8b6f-40c5-8f57-2fd9425fcc2f',
        name: 'Code Wipe Memory',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-12200, 2740],
    })
    CodeWipeMemory = {
        jsCode: `const sender = $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.messages[0].from;
const staticData = $getWorkflowStaticData('global');

// 1. Wipe all Static Memory (Locks, Pauses, Photos, Timestamps)
delete staticData['active_branch_' + sender];
delete staticData['photos_' + sender];
delete staticData['pause_' + sender];
delete staticData['last_image_ts_' + sender];

// 2. Return ONLY the vital keys in explicit order so Redis deletes them
const keys = [
    'active_branch_' + sender,       // <--- ADDED: Kills the sticky router bug
    'lang_history_' + sender,        // <--- ADDED: Kills sticky language bugs
    'photo_urls_' + sender,
    'bot_context_' + sender,
    'appts_state_' + sender,
    'vision_batch_' + sender,
    'photo_count_' + sender,
    'lang_' + sender,
    'lang_stats_' + sender,
    sender + 'global_16',
    sender + 'fiche_8',
    sender + 'route_16',
    'res_pending:' + sender,
    'recent_search:' + sender
];

return keys.map(key => ({ json: { key_to_delete: key } }));`,
    };

    @node({
        id: '2c7892af-bfc5-40f5-abbd-8d08a8f87604',
        name: 'Redis Nuclear Delete',
        type: 'n8n-nodes-base.redis',
        version: 1,
        position: [-12000, 2740],
        credentials: { redis: { id: 'V8K02flgy9UVw9wq', name: 'Redis account' } },
    })
    RedisNuclearDelete = {
        operation: 'delete',
        key: '={{ $json.key_to_delete }}',
    };

    @node({
        id: 'd322b2df-a2b8-4817-8793-7818021a36a1',
        name: 'Stop Spam',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-11820, 2740],
    })
    StopSpam = {
        jsCode: `// Keep only one item so we don't spam downstream nodes
return [$input.first()];`,
    };

    @node({
        id: 'd86f3324-0f02-496d-8427-68eb416accd4',
        name: '3. AI Vision Analysis1',
        type: '@n8n/n8n-nodes-langchain.agent',
        version: 1.7,
        position: [-10540, 4380],
        retryOnFail: true,
        maxTries: 2,
        waitBetweenTries: 1500,
    })
    _3AiVisionAnalysis1 = {
        promptType: 'define',
        text: `=Analyse cette image pour la Conciergerie Le Bardo à Alger.

[INSTRUCTIONS D'ÉVALUATION]
Tu es un expert immobilier et concierge humain très amical, mais avec des standards PREMIUM très stricts.
1. "est_logement_valide" : \`true\` si l'image répresente le domaine de l'immobilier. \`false\` si l'image est absurde.
2. "piece" : Nom de la pièce ou ce que représente la photo.
3. "score_sur_10" : Sois un expert EXIGEANT.
   - 9 à 10 : État impeccable, décoration moderne ou charme exceptionnel (prêt à louer premium).
   - 7 à 8 : Bon état général mais décoration basique ou nécessitant de légers ajustements.
   - 5 à 6 : En désordre, encombré, décoration vieillotte, nécessite un vrai rafraîchissement ou home staging.
   - 1 à 4 : Travaux lourds nécessaires, murs abîmés, sale.

[MESSAGE CLIENT - RÈGLES STRICTES]
- Si "est_logement_valide" est false : Rédige un message très humain et sympa. Ex: "Héhé, merci pour la photo !  Par contre nous sommes la conciergerie immobilière Le Bardo. Avez-vous envoyé ça par erreur ?"
- Si "est_logement_valide" est true : Fais un petit commentaire objectif et demande "Est-ce que vous souhaitez nous confier cet appartement en gestion locative ?"

FORMAT JSON EXCLU ET VALIDE :
{
  "est_logement_valide": true,
  "piece": "Salon",
  "score_sur_10": 6,
  "description_ia": "Description objective...",
  "message_client": "..."
}`,
        options: {
            passthroughBinaryImages: true,
        },
    };

    @node({
        id: '071fd0fe-e77e-4588-9594-8893e7b8a9d1',
        name: 'OpenAI Chat Model10',
        type: '@n8n/n8n-nodes-langchain.lmChatOpenAi',
        version: 1.2,
        position: [-10600, 4740],
        credentials: { openAiApi: { id: '26s882nA6pHLzhZT', name: 'OpenAi account' } },
        retryOnFail: true,
        maxTries: 2,
        waitBetweenTries: 1500,
    })
    OpenaiChatModel10 = {
        model: {
            __rl: true,
            mode: 'list',
            value: 'gpt-4o-mini',
        },
        options: {
            maxTokens: 500,
            temperature: 0.1,
        },
    };

    @node({
        id: '5e42b08f-3ac7-4911-8b67-0526b40c0379',
        name: 'Redis Get Final Batch',
        type: 'n8n-nodes-base.redis',
        version: 1,
        position: [-8080, 4380],
        credentials: { redis: { id: 'V8K02flgy9UVw9wq', name: 'Redis account' } },
    })
    RedisGetFinalBatch = {
        operation: 'get',
        key: "={{ 'vision_batch_' + $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.messages[0].from }}",
        options: {},
    };

    @node({
        id: '7651d945-c62b-44cf-a5f3-d30fc267c1ff',
        name: 'The Brain (Moyenne & Message)',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-7800, 4380],
    })
    TheBrainMoyenneMessage = {
        jsCode: `// Read photo batch from the dedicated batch node (by name)
const batchFirstJson = $('Redis Get Final Batch').first().json;
const batchStr = Object.values(batchFirstJson)[0] || "[]";
// Read appts state from $input (which is Redis Get Appts State (IMG))
const apptStateInputJson = $input.first().json;

let batch = [];
try { batch = JSON.parse(batchStr); } catch(e) {}

if (batch.length === 0) return [];

let validCount = 0;
let totalScore = 0;
let photoUrls = [];
let aiDescriptions = [];
let seenRooms = [];

for (let str of batch) {
    try {
        let entry = typeof str === 'string' ? JSON.parse(str) : str;
        let analysisStr = entry.analysis || str;
        let photoUrl = entry.photo_url || "";
        if (photoUrl) photoUrls.push(photoUrl);

        let jsonMatch = typeof analysisStr === 'string' ? analysisStr.match(/\\{[\\s\\S]*\\}/) : null;
        let data = jsonMatch ? JSON.parse(jsonMatch[0]) : analysisStr;

        if (data.est_logement_valide) {
            validCount++;
            totalScore += Number(data.score_sur_10 || 0);
            if (data.description_ia && data.piece && !seenRooms.includes(data.piece)) {
                seenRooms.push(data.piece);
                aiDescriptions.push(data.description_ia);
            }
        }
        // Count non-valid photos too (exterior, garden etc.) as "received" but not scored
        // so we never reject the whole batch just because 1 photo is off-topic
    } catch(e) {}
}

let average = validCount > 0 ? (totalScore / validCount) : 0;
let final_message = "";
let context_note_suffix = "";

let descriptionsText = "";
if (aiDescriptions.length > 0) {
    if (validCount >= 3 || average < 5) {
        descriptionsText = "\\n\\nVoici ce que je remarque :\\n" + aiDescriptions.join("\\n\\n");
    } else {
        descriptionsText = ""; // Hide descriptions until evaluation is final
    }
}

const totalReceived = batch.length;
if (validCount === 0 && totalReceived === 0) {
    final_message = "Merci pour les photos. Par contre, nous sommes la conciergerie immobilière Le Bardo. Avez-vous un appartement à nous confier en gestion locative ?";
} else if (validCount === 0 && totalReceived > 0) {
    // Some photos received but none clearly interior — ask for more, don't reject
    final_message = "Merci pour les photos ! Pour mieux apprécier votre appartement, pourriez-vous m'envoyer quelques photos de l'intérieur (salon, cuisine, salle de bain, chambre) ?";
} else if (validCount < 3) {
    // Il manque des photos
    final_message = "Merci pour ces " + validCount + " première(s) photo(s). L'appartement a l'air d'avoir du potentiel." + descriptionsText + "\\n\\nPourriez-vous m'envoyer quelques photos supplémentaires (salon, façade, chambre, etc.) pour mieux apprécier l'appartement s'il vous plaît ?";
} else if (average < 5) {
    // Mauvaise note
    final_message = "Merci pour toutes vos photos. Nous avons pris le temps de les analyser consciencieusement." + descriptionsText + "\\n\\nMalheureusement, nous sommes au regret de vous informer que le niveau des prestations actuelles de l'appartement ne correspond pas tout à fait au standard très spécifique de la Conciergerie Le Bardo. Nous ne pourrons malheureusement pas travailler avec vous pour le moment, mais nous gardons vos coordonnées précieusement pour l'avenir. Merci de votre confiance.";
    context_note_suffix = "[PHOTOS_REJETEES]";
} else {
    // Bonne note (acceptation + Gamma CTA)
    let scoreLabel = "";
    if (average >= 8) {
        scoreLabel = "Vos photos montrent un bien de très grande qualité, parfaitement entretenu ! Notre conciergerie serait très fière de le représenter.";
    } else {
        scoreLabel = "Vos photos donnent une bonne impression. L'appartement semble propre, fonctionnel et dispose d'un potentiel très intéressant.";
    }
    
   let apptStateStr = "[]";
    try { 
        apptStateStr = apptStateInputJson.value || apptStateInputJson.data || apptStateInputJson.propertyName || Object.values(apptStateInputJson)[0] || "[]"; 
    } catch(e) {}
    
    let appts = [];
    try { appts = JSON.parse(apptStateStr); } catch(e) {}

    // NEW: Instead of hardcoding appts[0], we find the specific apartment that was waiting for photos.
    // If we can't find one explicitly waiting for photos, we grab the very last apartment added to the list.
    let appt = appts.find(a => a.photos_transmises === false);
    if (!appt && appts.length > 0) {
        appt = appts[appts.length - 1]; 
    } else if (!appt) {
        appt = {};
    }

let cta = "";
    if (!appt.ville_quartier) {
        cta = "\\n\\nVos photos sont bien enregistrées ! Pour avancer sur votre dossier, pourriez-vous me donner la ville ou le quartier où se situe le bien ?";
    } else if (!appt.surface) {
        cta = "\\n\\nVos photos sont bien enregistrées ! Pourriez-vous me préciser la surface ?";
    } else if (!appt.nombre_pieces) {
        cta = "\\n\\nVos photos sont bien enregistrées ! Combien de pièces le bien compte-t-il ?";
    } else if (!appt.date_disponibilite) {
        cta = "\\n\\nVos photos sont bien enregistrées ! À partir de quelle date sera-t-il disponible ?";
    } else {
        cta = "\\n\\nVos photos sont bien enregistrées ! Le dossier est désormais complet. 😊 Me confirmez-vous que nous pouvons générer votre offre et la transmettre à notre équipe technique ?";
    }
    final_message = "Merci infiniment pour toutes vos photos. L'évaluation est terminée. " + scoreLabel + descriptionsText + cta;
    context_note_suffix = "[PHOTOS_VALIDEES]";
}

// Build updated appts state: flip photos_transmises to true
let apptStateStr = "[]";
try { 
    const brainFirstJson = $('Redis Get Appts State (IMG)').first().json;
    apptStateStr = Object.values(brainFirstJson)[0] || "[]"; 
} catch(e) {}
let appts = [];
try { appts = JSON.parse(apptStateStr); } catch(e) {}
let updatedAppts = appts.map(a => ({ ...a, photos_transmises: true }));
if (updatedAppts.length === 0) {
    updatedAppts = [{ id: 1, ville_quartier: null, surface: null, etage: null, nombre_pieces: null, date_disponibilite: null, photos_transmises: true }];
}

const phone = (() => { try { return $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.messages[0].from; } catch(e) { return ""; } })();

// BRAIN LANGUAGE CLEAN: ensure no Darja leaks in Brain-generated French messages
final_message = final_message.replace(/\\bab3atli\\b/gi, 'envoyez-nous');
final_message = final_message.replace(/\\bb3atli\\b/gi, 'envoyez-nous');
final_message = final_message.replace(/\\bsifet-li\\b/gi, 'envoyez-nous');
final_message = final_message.replace(/\\b3afak\\b/gi, 'stp');

return [{
    json: {
        message_to_send: final_message,
        context_note: "L'assistant IA a analysé " + validCount + " photos. " + context_note_suffix + " PHOTO_URLS: " + (photoUrls.length > 0 ? photoUrls.join(',') : "AUCUN_LIEN"),
        photo_urls: photoUrls.join("\\n"),
        updated_appts_state: JSON.stringify(updatedAppts),
        phone: phone
    }
}];`,
    };

    @node({
        id: '03e85c5f-bbfd-47ac-a665-b8f3234f7a2e',
        name: 'Sauvegarder Memoire IA',
        type: 'n8n-nodes-base.redis',
        version: 1,
        position: [-6380, 4320],
        credentials: { redis: { id: 'V8K02flgy9UVw9wq', name: 'Redis account' } },
    })
    SauvegarderMemoireIa = {
        operation: 'set',
        key: "={{ 'bot_context_' + $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.messages[0].from }}",
        value: '={{ $node["The Brain (Moyenne & Message)"].json.context_note }}',
    };

    @node({
        id: 'f3faa9fc-3a2c-4f4c-b07d-680b1861aed1',
        name: 'WA Envoi Final (Unique)',
        type: 'n8n-nodes-base.whatsApp',
        version: 1,
        position: [-5960, 4480],
        credentials: { whatsAppApi: { id: 'A5i0TdmXFmQSw5T3', name: 'WhatsApp account 2' } },
    })
    WaEnvoiFinalUnique = {
        operation: 'send',
        phoneNumberId: '1035565869637770',
        recipientPhoneNumber:
            "={{ $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.messages[0].from }}",
        textBody: '={{ $json.text || $json.output || $node["The Brain (Moyenne & Message)"].json.message_to_send }}',
        additionalFields: {},
        requestOptions: {},
    };

    @node({
        id: 'fc436ede-9193-43f8-98cd-336db122e28b',
        name: 'Traduction_WA_Evaluation_Photos',
        type: '@n8n/n8n-nodes-langchain.chainLlm',
        version: 1.5,
        position: [-6740, 4340],
        retryOnFail: true,
        maxTries: 3,
        waitBetweenTries: 2000,
    })
    TraductionWaEvaluationPhotos = {
        promptType: 'define',
        text: `={{ (function() {
const brainMsg = $('The Brain (Moyenne & Message)').first()?.json?.message_to_send || '';
const apptStateStr = $('Redis Get Appts State (IMG)').first()?.json?.value || '[]';
let apptState = [];
try { apptState = JSON.parse(apptStateStr); } catch(e) {}
const appt = apptState[0] || {};

const parts = [];
if (appt.nombre_pieces) parts.push(appt.nombre_pieces);
if (appt.surface) parts.push('de ' + appt.surface);
if (appt.ville_quartier) parts.push('à ' + appt.ville_quartier);
if (appt.loyer_souhaite) parts.push('loyer souhaité ' + appt.loyer_souhaite);
if (appt.date_disponibilite) parts.push('disponible ' + appt.date_disponibilite);
const recap = parts.length > 0 ? 'Pour récapituler votre demande : ' + parts.join(', ') + '.' : '';

let finalText = brainMsg;
if (!brainMsg.includes('quelques photos')) {
    finalText = brainMsg + (recap ? '\\n\\n' + recap : '');
}
return finalText;
})() }}`,
        messages: {
            messageValues: [
                {
                    message: '={{ $json.dynamic_prompt }}',
                },
            ],
        },
    };

    @node({
        id: 'e95850b8-b67d-4ad4-a109-b27ea8a75040',
        name: 'OpenAI Chat Model Traduction',
        type: '@n8n/n8n-nodes-langchain.lmChatOpenAi',
        version: 1.2,
        position: [-6600, 4580],
        credentials: { openAiApi: { id: '26s882nA6pHLzhZT', name: 'OpenAi account' } },
        retryOnFail: true,
        maxTries: 3,
        waitBetweenTries: 2000,
    })
    OpenaiChatModelTraduction = {
        model: {
            __rl: true,
            mode: 'id',
            value: "={{ ($('Set Context').isExecuted ? ($('Set Context').first().json.langue_utilisateur || '') : ($('Redis_Get_Context').isExecuted ? ($('Redis_Get_Context').first().json.lang || '') : '')).includes('Darja') ? 'gpt-4o' : 'gpt-4o-mini' }}",
        },
        options: {
            maxTokens: 1500,
            temperature: 0.3,
        },
    };

    @node({
        id: '7c5cb8f5-649b-4299-bea4-d2d9b219d640',
        name: 'Redis Count Node',
        type: 'n8n-nodes-base.redis',
        version: 1,
        position: [-10100, 4380],
        credentials: { redis: { id: 'V8K02flgy9UVw9wq', name: 'Redis account' } },
    })
    RedisCountNode = {
        operation: 'incr',
        key: "={{ 'photo_count_' + $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.messages[0].from }}",
    };

    @node({
        id: '030d676f-7145-4c5d-b6dd-49b182d068ec',
        webhookId: 'a73a9a18-dead-46a0-8925-63aaba1bf6e6',
        name: 'Wait (Anti-Collision)',
        type: 'n8n-nodes-base.wait',
        version: 1.1,
        position: [-9840, 4400],
    })
    WaitAntiCollision = {
        amount: '={{ Number(Object.values($json)[0]) * 2.5 }}',
    };

    @node({
        id: 'c50c117e-6da4-4f51-92e4-81b6d07d3817',
        name: 'Redis Get Batch',
        type: 'n8n-nodes-base.redis',
        version: 1,
        position: [-9520, 4400],
        credentials: { redis: { id: 'V8K02flgy9UVw9wq', name: 'Redis account' } },
    })
    RedisGetBatch = {
        operation: 'get',
        key: "={{ 'vision_batch_' + $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.messages[0].from }}",
        options: {},
    };

    @node({
        id: 'e7aa73f7-619f-4ac5-9738-2571a684588b',
        name: 'Code Append Batch',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-9220, 4400],
    })
    CodeAppendBatch = {
        jsCode: `// Déclaration des variables au début pour éviter ReferenceError
let imageUrl = "";
try {
    imageUrl = $("1. Get Image URL1").first().json.url;
} catch(e) {}

let fallbackUrl = "";
try { fallbackUrl = $("Redis").first().json.messageData; } catch(e) {}
if (!imageUrl) imageUrl = fallbackUrl;

let currentBatch = [];
const firstJson = $input.first().json;

// Extract the value dynamically
let redisStr = Object.values(firstJson)[0] || "[]";
try { 
    let parsed = JSON.parse(redisStr); 
    if (Array.isArray(parsed)) currentBatch = parsed;
} catch(e) {}

const newVision = $("3. AI Vision Analysis1").first().json.output;
// Store URL alongside analysis
const entryObj = { analysis: newVision || "", photo_url: imageUrl || "" };
if (newVision) currentBatch.push(JSON.stringify(entryObj));

// --- SAUVEGARDER L'URL DE LA PHOTO POUR LA MÉMOIRE DU BOT ---
const staticData = $getWorkflowStaticData('global');
const sender = $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.messages[0].from;
const photoKey = 'photos_' + sender;

let photos = staticData[photoKey] || [];
if (imageUrl && !photos.includes(imageUrl)) {
    photos.push(imageUrl);
    staticData[photoKey] = photos;
}

// Also expose photos array in output so a Redis SET node can save them to Redis
return [{ json: { new_batch: JSON.stringify(currentBatch), photo_urls: photos.join("\\n"), all_photos_json: JSON.stringify(photos) } }];`,
    };

    @node({
        id: '306438e9-0f1a-42f4-a41f-794c4a0a238c',
        name: 'Redis Set Batch',
        type: 'n8n-nodes-base.redis',
        version: 1,
        position: [-8940, 4400],
        credentials: { redis: { id: 'V8K02flgy9UVw9wq', name: 'Redis account' } },
    })
    RedisSetBatch = {
        operation: 'set',
        key: "={{ 'vision_batch_' + $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.messages[0].from }}",
        value: '={{ $json.new_batch }}',
    };

    @node({
        id: 'fb042973-93f4-4e3f-a88d-5582f3d64b0f',
        webhookId: 'af95338a-1e13-480f-9caf-36fba511887e',
        name: 'Wait (Debounce)',
        type: 'n8n-nodes-base.wait',
        version: 1.1,
        position: [-8740, 4400],
    })
    WaitDebounce = {
        amount: 30,
    };

    @node({
        id: '8702a6f9-f3fe-466f-8ccc-67a0caa6f77f',
        name: 'Redis Check Count',
        type: 'n8n-nodes-base.redis',
        version: 1,
        position: [-8540, 4400],
        credentials: { redis: { id: 'V8K02flgy9UVw9wq', name: 'Redis account' } },
    })
    RedisCheckCount = {
        operation: 'get',
        key: "={{ 'photo_count_' + $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.messages[0].from }}",
        options: {},
    };

    @node({
        id: '3d06235f-1e2d-479e-a7da-aff0e6e2969c',
        name: 'If Collision (Dernière photo ?)',
        type: 'n8n-nodes-base.if',
        version: 2.2,
        position: [-8340, 4400],
    })
    IfCollisionDernierePhoto = {
        conditions: {
            options: {
                caseSensitive: true,
                typeValidation: 'loose',
                version: 2,
            },
            conditions: [
                {
                    id: 'collision',
                    leftValue: '={{ Number(Object.values($node["Redis Count Node"].json)[0]) }}',
                    rightValue: '={{ Number(Object.values($json)[0]) }}',
                    operator: {
                        type: 'number',
                        operation: 'equals',
                    },
                },
            ],
            combinator: 'and',
        },
        looseTypeValidation: true,
        options: {},
    };

    @node({
        id: '70cedeb6-f0da-4b27-b499-e297ac016a7f',
        name: 'Redis Save Photo URLs',
        type: 'n8n-nodes-base.redis',
        version: 1,
        position: [-7440, 4380],
        credentials: { redis: { id: 'V8K02flgy9UVw9wq', name: 'Redis account' } },
    })
    RedisSavePhotoUrls = {
        operation: 'set',
        key: "={{ 'photo_urls_' + $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.messages[0].from }}",
        value: '={{ $json.photo_urls }}',
    };

    @node({
        id: 'eeb72df7-4844-4b9b-ace2-fed82a368493',
        name: 'Redis Save Photo URLs After Append',
        type: 'n8n-nodes-base.redis',
        version: 1,
        position: [-9100, 4400],
        credentials: { redis: { id: 'V8K02flgy9UVw9wq', name: 'Redis account' } },
    })
    RedisSavePhotoUrlsAfterAppend = {
        operation: 'set',
        key: "={{ 'photo_urls_' + $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.messages[0].from }}",
        value: '={{ $json.photo_urls }}',
    };

    @node({
        id: 'e1461484-c543-4fc4-a238-393c8d2b210b',
        name: 'Redis Get Image Lang',
        type: 'n8n-nodes-base.redis',
        version: 1,
        position: [-7220, 4340],
        credentials: { redis: { id: 'V8K02flgy9UVw9wq', name: 'Redis account' } },
    })
    RedisGetImageLang = {
        operation: 'get',
        key: "=lang_{{ $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.messages[0].from }}",
        options: {},
    };

    @node({
        id: '23236044-aceb-41cb-bba1-5624a814001e',
        name: 'Send Reaction HTTP1',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [-11780, 4780],
        credentials: { whatsAppApi: { id: 'A5i0TdmXFmQSw5T3', name: 'WhatsApp account 2' } },
        onError: 'continueRegularOutput',
        retryOnFail: true,
        maxTries: 3,
        waitBetweenTries: 2000,
    })
    SendReactionHttp1 = {
        method: 'POST',
        url: "={{ 'https://graph.facebook.com/v18.0/' + $json.phone_id + '/messages' }}",
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'whatsAppApi',
        sendBody: true,
        specifyBody: 'json',
        jsonBody: `={
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "{{ $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.messages[0].from }}",
  "type": "reaction",
  "reaction": {
    "message_id": "{{ $json.message_id }}",
    "emoji": "{{ $json.emoji }}"
  }
}`,
        options: {},
    };

    @node({
        id: 'a96bf989-fbb8-4f9a-b96a-d9c37c56d9b3',
        name: 'Redis Get Appts State (IMG)',
        type: 'n8n-nodes-base.redis',
        version: 1,
        position: [-7940, 4360],
        credentials: { redis: { id: 'V8K02flgy9UVw9wq', name: 'Redis account' } },
    })
    RedisGetApptsStateImg = {
        operation: 'get',
        key: "=appts_state_{{ $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.messages[0].from }}",
        options: {},
    };

    @node({
        id: '6bbb710c-2731-49d3-9496-d2aec194f48f',
        name: 'Redis Clear Photo Batch',
        type: 'n8n-nodes-base.redis',
        version: 1,
        position: [-5720, 4500],
        credentials: { redis: { id: 'V8K02flgy9UVw9wq', name: 'Redis account' } },
    })
    RedisClearPhotoBatch = {
        operation: 'delete',
        key: "=img_batch_{{ $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.messages[0].from }}",
    };

    @node({
        id: '11ef40f0-7218-48ac-a96a-fc83967cb172',
        name: 'Redis Get Lang Stats',
        type: 'n8n-nodes-base.redis',
        version: 1,
        position: [-8500, 3360],
        credentials: { redis: { id: 'V8K02flgy9UVw9wq', name: 'Redis account' } },
    })
    RedisGetLangStats = {
        operation: 'get',
        key: "={{ 'lang_stats_' + $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.messages[0].from }}",
        options: {},
    };

    @node({
        id: 'f10ec018-abdd-4ceb-abc3-b1701a2e38d6',
        name: 'Calculate Predominant Lang',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-8300, 3420],
    })
    CalculatePredominantLang = {
        jsCode: `// Le LLM nous renvoie directement le décompte des mots par langue !
const llmResultStr = $('Detect Language HTTP').first().json.choices[0].message.content.trim();
let messageWordCounts = {};
try { messageWordCounts = JSON.parse(llmResultStr); } catch(e) {}

// On lit les stats accumulées depuis Redis
let redisItem = $('Redis Get Lang Stats').isExecuted ? $('Redis Get Lang Stats').first()?.json : {};
let statsStr = redisItem?.value || redisItem?.propertyName || redisItem?.data || "{}";
if (typeof statsStr === 'string' && statsStr.startsWith('STAT:')) statsStr = statsStr.substring(5);

let stats = {};
if (statsStr !== "{}" && typeof statsStr === 'string' && statsStr.trim().length > 0) {
    try { stats = JSON.parse(statsStr); } catch(e) {}
}

const text = ($('Active Text & History').first()?.json?.text || "").toLowerCase();

// EXPLICIT USER COMMAND OVERRIDES (Lock language completely)
if (text.includes("francais") || text.includes("français")) {
    stats = { "Français": 1000 };
} else if (text.includes("darja") || text.includes("derja") || (text.includes("arabe") && !text.includes("appartement"))) {
    stats = { "Darja Algéroise": 1000 };
} else {
    // Add LLM word counts to accumulated stats (no pre-initialization bias)
    for (const [lang, count] of Object.entries(messageWordCounts)) {
        if (lang !== 'Inconnue' && ['Français', 'English', 'Arabe Classique', 'Darja Algéroise'].includes(lang)) {
            if ((stats[lang] || 0) !== 1000) {
                stats[lang] = (stats[lang] || 0) + parseInt(count);
            }
        }
    }

    // Keyword tiebreaker: only add a small bonus (+2) if stats are tied or empty
    const hasArabicChars = /[\\u0600-\\u06FF]/.test(text);
    const darjaKeywords = ['salam', 'kho', 'nekri', 'rani', 'partma', 'ghedoua', 'lghedoua', 'nchallah', 'waktach', 'ch7al', 'mlih', 'labass', '3andi', 't7ab', 'n9dir'];
    const hasDarjaKeyword = darjaKeywords.some(kw => text.includes(kw));

    const frScore = stats['Français'] || 0;
    const djScore = stats['Darja Algéroise'] || 0;

    if (hasArabicChars && !hasDarjaKeyword) {
        // Pure Arabic script → small boost for Arabe Classique
        stats['Arabe Classique'] = (stats['Arabe Classique'] || 0) + 2;
    } else if (hasDarjaKeyword && djScore >= frScore) {
        // Darja keyword present AND Darja is already not losing → small boost
        stats['Darja Algéroise'] = djScore + 2;
    }

    // Cap at 100 to prevent runaway dominance
    const MAX = 100;
    for (const lang of Object.keys(stats)) {
        if (stats[lang] > MAX) stats[lang] = MAX;
    }
}

// Find dominant language
let maxWords = -1;
let predominant = 'Français';

for (const [lang, count] of Object.entries(stats)) {
    if (count > maxWords) {
        maxWords = count;
        predominant = lang;
    } else if (count === maxWords) {
        // Tie → prefer Français (safer default)
        if (lang === 'Français' || predominant !== 'Français') {
            predominant = 'Français';
        }
    }
}

return [{
    json: {
        dominant_lang: predominant,
        new_stats_str: "STAT:" + JSON.stringify(stats)
    }
}];`,
    };

    @node({
        id: 'f0cbadd4-8751-44d5-8ff0-083d6a56c705',
        name: 'Redis Set Lang Stats',
        type: 'n8n-nodes-base.redis',
        version: 1,
        position: [-8120, 3400],
        credentials: { redis: { id: 'V8K02flgy9UVw9wq', name: 'Redis account' } },
    })
    RedisSetLangStats = {
        operation: 'set',
        key: "={{ 'lang_stats_' + $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.messages[0].from }}",
        value: "={{ $('Calculate Predominant Lang').first().json.new_stats_str }}",
    };

    @node({
        id: '8251d375-6ea9-4e5b-87b7-d29ab34e44d9',
        name: 'Build Body: WA Media Invalide',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-12260, 4180],
    })
    BuildBodyWaMediaInvalide = {
        jsCode: `const items = $input.all();
const phone = $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.messages[0].from;
const messageId = $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.messages[0].id;
const text = "Désolé, je ne peux pas traiter ce type de fichier (vidéo, document, sticker, etc.). Pourriez-vous me transmettre votre demande sous forme de texte, message vocal ou photo ?";

const payload = JSON.stringify({
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": phone,
    "context": { "message_id": messageId },
    "type": "text",
    "text": { "body": text, "preview_url": true }
});

return items.map(item => ({ json: { ...item.json, waBody: payload, waPhone: phone } }));`,
    };

    @node({
        id: '43c4a681-472e-4e31-966d-1b3fdc61f0aa',
        name: 'WA Erreur Media Client',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.1,
        position: [-12040, 4180],
        credentials: { whatsAppApi: { id: 'A5i0TdmXFmQSw5T3', name: 'WhatsApp account 2' } },
    })
    WaErreurMediaClient = {
        method: 'POST',
        url: 'https://graph.facebook.com/v18.0/1035565869637770/messages',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'whatsAppApi',
        sendBody: true,
        specifyBody: 'json',
        jsonBody: '={{ $json.waBody }}',
        options: {},
    };

    @node({
        id: '190a2dd7-1fbd-4baa-b99f-5c7f4d2f724b',
        name: 'Build Body: Admin Error',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-12260, 4340],
    })
    BuildBodyAdminError = {
        jsCode: `const items = $input.all();
const phone = $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.messages[0].from;
const name = $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.contacts[0].profile.name || "Inconnu";
const msgType = $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.messages[0].type;
const adminPhone = "213551671229"; // Hardcoded Admin

const text = "🚨 Le client " + name + " (" + phone + ") a envoyé un média non-supporté de type : " + msgType + ". Le bot lui a demandé de renvoyer cela sous un autre format.";

const payload = JSON.stringify({
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": adminPhone,
    "type": "text",
    "text": { "body": text, "preview_url": false }
});

return items.map(item => ({ json: { ...item.json, waBody: payload, waPhone: phone } }));`,
    };

    @node({
        id: 'f369f408-c32d-4e8b-a7d0-b5b4c9e3b56d',
        name: 'WA Admin Error Alert',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.1,
        position: [-12040, 4340],
        credentials: { whatsAppApi: { id: 'A5i0TdmXFmQSw5T3', name: 'WhatsApp account 2' } },
    })
    WaAdminErrorAlert = {
        method: 'POST',
        url: 'https://graph.facebook.com/v18.0/1035565869637770/messages',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'whatsAppApi',
        sendBody: true,
        specifyBody: 'json',
        jsonBody: '={{ $json.waBody }}',
        options: {},
    };

    @node({
        id: 'c08a8893-46c0-485f-8f72-f9380020aaa4',
        name: 'Redis: Tag Active Client 24h',
        type: 'n8n-nodes-base.redis',
        version: 1,
        position: [-11360, 5380],
        credentials: { redis: { id: 'V8K02flgy9UVw9wq', name: 'Redis account' } },
    })
    RedisTagActiveClient24h = {
        operation: 'set',
        key: "={{ 'recent_search:' + $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.messages[0].from }}",
        value: 'true',
    };

    @node({
        id: 'f6cc6cee-136f-4efe-b436-5ac981f83e92',
        name: 'Redis Set Appts State (IMG)',
        type: 'n8n-nodes-base.redis',
        version: 1,
        position: [-7660, 4400],
        credentials: { redis: { id: 'V8K02flgy9UVw9wq', name: 'Redis account' } },
    })
    RedisSetApptsStateImg = {
        operation: 'set',
        key: '=appts_state_{{ $json.phone }}',
        value: '={{ $json.updated_appts_state }}',
    };

    @node({
        id: 'dfa8a2dc-0de9-4ee1-baf5-3ae60bfe05e4',
        name: 'Convert Audio to Base64',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-12280, 3960],
    })
    ConvertAudioToBase64 = {
        jsCode: `// Convert binary audio to base64 and build full GPT-4o Audio API request body
const item = $input.first();
const binaryData = item.binary?.data;

if (!binaryData) {
  throw new Error("No binary audio data found. Check '2. Download Audio' node.");
}

// n8n stores binary data already as base64 internally
const base64Audio = binaryData.data;

const DARJA_PROMPT = "Tu es un expert en Darja algérien et en français algérien. Transcris ce message vocal EXACTEMENT tel qu'il est dit, en respectant le dialecte naturel du locuteur. Règles absolues : 1) Si la personne parle en Darja, écris en Darja romanisé (lettres latines) mélangé de français, comme parlent les vrais Algériens au quotidien. 2) N\\'écris JAMAIS en arabe classique (pas de lettres arabes). 3) Si la personne parle en français, transcris en français. 4) Réponds UNIQUEMENT avec la transcription, sans commentaires ni explication.";

// Build the full request body here to avoid nested expression issues in HTTP Request node
const gptBody = JSON.stringify({
  model: "gpt-4o-audio-preview",
  messages: [{
    role: "user",
    content: [
      {
        type: "input_audio",
        input_audio: {
          data: base64Audio,
          format: "ogg"
        }
      },
      {
        type: "text",
        text: DARJA_PROMPT
      }
    ]
  }],
  max_tokens: 500
});

return [{
  json: {
    base64Audio: base64Audio,
    gptBody: gptBody
  }
}];`,
    };

    @node({
        id: 'e4ea01f7-7055-4151-ac38-69ad9ef4a965',
        name: 'Generate Dynamic Promp',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-2160, 4420],
    })
    GenerateDynamicPromp = {
        jsCode: `const items = $input.all();

let targetLang = "Français";
try {
    let calc = $('Calculate Predominant Lang').isExecuted ? $('Calculate Predominant Lang').first().json.dominant_lang : null;
    if (calc && !calc.includes('Aucune') && !calc.includes('Darja')) { 
        targetLang = calc; 
    } else {
        let l2 = $('Redis Get Text Lang').isExecuted ? $('Redis Get Text Lang').first().json.value : null;
        if (l2 && !l2.includes('Aucune') && !l2.includes('Darja')) { targetLang = l2; }
    }
} catch (e) {}

// Force French if the system tries to default to Darja
if (targetLang.includes('Darja')) targetLang = 'Français';

let prompt = "Tu es une MACHINE DE TRADUCTION ET DE CORRECTION AUTOMATIQUE INVISIBLE. Tu n'es pas un assistant.\\n";
prompt += "Ta fonction : traduire OU réécrire le texte EXCLUSIVEMENT dans la langue cible.\\n\\n";
prompt += "ALERTE : Ce texte est destiné à un client. Ne réponds pas à son contenu. TRADUIS/RÉÉCRIS uniquement.\\n\\n";
prompt += "[LANGUE CIBLE]\\n" + targetLang + "\\n\\n";

prompt += "════════════════════════════════════════════\\n";
prompt += "RÈGLES DE TRADUCTION STRICTE\\n";
prompt += "════════════════════════════════════════════\\n";
prompt += "▶ 1. TRADUCTION EXACTE : Tu DOIS traduire le texte d'origine EXCLUSIVEMENT vers la langue : " + targetLang + ".\\n";
prompt += "▶ 2. VOUVOIEMENT OBLIGATOIRE : Si tu traduis en Français, tu DOIS ABSOLUMENT utiliser le 'VOUS' (vouvoiement). Ne tutoie JAMAIS le client.\\n";
prompt += "▶ 3. AUCUN DARJA : N'utilise AUCUN mot d'argot algérien ou de Darja. Utilise uniquement la langue cible standard (Français standard, Anglais, ou Arabe Classique).\\n";
prompt += "▶ 4. STYLE : Conserve le ton naturel, amical et professionnel, ainsi que les emojis et la mise en forme.\\n\\n";

prompt += "[SORTIE]\\n";
prompt += "Renvoie UNIQUEMENT le texte traduit/réécrit. Zéro introduction, zéro commentaire.";

return items.map(item => {
    return {
        json: {
            ...item.json,
            dynamic_prompt: prompt
        }
    };
});`,
    };

    @node({
        id: 'f1a974f1-0b51-4e7c-8c75-d4531643314c',
        name: 'Generate Dynamic Promp1',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-2080, 4200],
    })
    GenerateDynamicPromp1 = {
        jsCode: `const items = $input.all();

let targetLang = "Français";
try {
    let calc = $('Calculate Predominant Lang').isExecuted ? $('Calculate Predominant Lang').first().json.dominant_lang : null;
    if (calc && !calc.includes('Aucune') && !calc.includes('Darja')) { 
        targetLang = calc; 
    } else {
        let l2 = $('Redis Get Text Lang').isExecuted ? $('Redis Get Text Lang').first().json.value : null;
        if (l2 && !l2.includes('Aucune') && !l2.includes('Darja')) { targetLang = l2; }
    }
} catch (e) {}

// Force French if the system tries to default to Darja
if (targetLang.includes('Darja')) targetLang = 'Français';

let prompt = "Tu es une MACHINE DE TRADUCTION ET DE CORRECTION AUTOMATIQUE INVISIBLE. Tu n'es pas un assistant.\\n";
prompt += "Ta fonction : traduire OU réécrire le texte EXCLUSIVEMENT dans la langue cible.\\n\\n";
prompt += "ALERTE : Ce texte est destiné à un client. Ne réponds pas à son contenu. TRADUIS/RÉÉCRIS uniquement.\\n\\n";
prompt += "[LANGUE CIBLE]\\n" + targetLang + "\\n\\n";

prompt += "════════════════════════════════════════════\\n";
prompt += "RÈGLES DE TRADUCTION STRICTE\\n";
prompt += "════════════════════════════════════════════\\n";
prompt += "▶ 1. TRADUCTION EXACTE : Tu DOIS traduire le texte d'origine EXCLUSIVEMENT vers la langue : " + targetLang + ".\\n";
prompt += "▶ 2. VOUVOIEMENT OBLIGATOIRE : Si tu traduis en Français, tu DOIS ABSOLUMENT utiliser le 'VOUS' (vouvoiement). Ne tutoie JAMAIS le client.\\n";
prompt += "▶ 3. AUCUN DARJA : N'utilise AUCUN mot d'argot algérien ou de Darja. Utilise uniquement la langue cible standard (Français standard, Anglais, ou Arabe Classique).\\n";
prompt += "▶ 4. STYLE : Conserve le ton naturel, amical et professionnel, ainsi que les emojis et la mise en forme.\\n\\n";

prompt += "[SORTIE]\\n";
prompt += "Renvoie UNIQUEMENT le texte traduit/réécrit. Zéro introduction, zéro commentaire.";

return items.map(item => {
    return {
        json: {
            ...item.json,
            dynamic_prompt: prompt
        }
    };
});`,
    };

    @node({
        id: '15879ee9-6df4-4733-95ea-25c88c4dddcb',
        name: 'Generate Dynamic Promp2',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-2520, 3520],
    })
    GenerateDynamicPromp2 = {
        jsCode: `const items = $input.all();

let targetLang = "Français";
try {
    let calc = $('Calculate Predominant Lang').isExecuted ? $('Calculate Predominant Lang').first().json.dominant_lang : null;
    if (calc && !calc.includes('Aucune') && !calc.includes('Darja')) { 
        targetLang = calc; 
    } else {
        let l2 = $('Redis Get Text Lang').isExecuted ? $('Redis Get Text Lang').first().json.value : null;
        if (l2 && !l2.includes('Aucune') && !l2.includes('Darja')) { targetLang = l2; }
    }
} catch (e) {}

// Force French if the system tries to default to Darja
if (targetLang.includes('Darja')) targetLang = 'Français';

let prompt = "Tu es une MACHINE DE TRADUCTION ET DE CORRECTION AUTOMATIQUE INVISIBLE. Tu n'es pas un assistant.\\n";
prompt += "Ta fonction : traduire OU réécrire le texte EXCLUSIVEMENT dans la langue cible.\\n\\n";
prompt += "ALERTE : Ce texte est destiné à un client. Ne réponds pas à son contenu. TRADUIS/RÉÉCRIS uniquement.\\n\\n";
prompt += "[LANGUE CIBLE]\\n" + targetLang + "\\n\\n";

prompt += "════════════════════════════════════════════\\n";
prompt += "RÈGLES DE TRADUCTION STRICTE\\n";
prompt += "════════════════════════════════════════════\\n";
prompt += "▶ 1. TRADUCTION EXACTE : Tu DOIS traduire le texte d'origine EXCLUSIVEMENT vers la langue : " + targetLang + ".\\n";
prompt += "▶ 2. VOUVOIEMENT OBLIGATOIRE : Si tu traduis en Français, tu DOIS ABSOLUMENT utiliser le 'VOUS' (vouvoiement). Ne tutoie JAMAIS le client.\\n";
prompt += "▶ 3. AUCUN DARJA : N'utilise AUCUN mot d'argot algérien ou de Darja. Utilise uniquement la langue cible standard (Français standard, Anglais, ou Arabe Classique).\\n";
prompt += "▶ 4. STYLE : Conserve le ton naturel, amical et professionnel, ainsi que les emojis et la mise en forme.\\n\\n";

prompt += "[SORTIE]\\n";
prompt += "Renvoie UNIQUEMENT le texte traduit/réécrit. Zéro introduction, zéro commentaire.";

return items.map(item => {
    return {
        json: {
            ...item.json,
            dynamic_prompt: prompt
        }
    };
});`,
    };

    @node({
        id: '8896d7e1-f7aa-4b0f-9bff-957d2a5f4d58',
        name: 'Generate Dynamic Promp3',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-1560, 3160],
    })
    GenerateDynamicPromp3 = {
        jsCode: `const items = $input.all();

let targetLang = "Français";
try {
    let calc = $('Calculate Predominant Lang').isExecuted ? $('Calculate Predominant Lang').first().json.dominant_lang : null;
    if (calc && !calc.includes('Aucune') && !calc.includes('Darja')) { 
        targetLang = calc; 
    } else {
        let l2 = $('Redis Get Text Lang').isExecuted ? $('Redis Get Text Lang').first().json.value : null;
        if (l2 && !l2.includes('Aucune') && !l2.includes('Darja')) { targetLang = l2; }
    }
} catch (e) {}

// Force French if the system tries to default to Darja
if (targetLang.includes('Darja')) targetLang = 'Français';

let prompt = "Tu es une MACHINE DE TRADUCTION ET DE CORRECTION AUTOMATIQUE INVISIBLE. Tu n'es pas un assistant.\\n";
prompt += "Ta fonction : traduire OU réécrire le texte EXCLUSIVEMENT dans la langue cible.\\n\\n";
prompt += "ALERTE : Ce texte est destiné à un client. Ne réponds pas à son contenu. TRADUIS/RÉÉCRIS uniquement.\\n\\n";
prompt += "[LANGUE CIBLE]\\n" + targetLang + "\\n\\n";

prompt += "════════════════════════════════════════════\\n";
prompt += "RÈGLES DE TRADUCTION STRICTE\\n";
prompt += "════════════════════════════════════════════\\n";
prompt += "▶ 1. TRADUCTION EXACTE : Tu DOIS traduire le texte d'origine EXCLUSIVEMENT vers la langue : " + targetLang + ".\\n";
prompt += "▶ 2. VOUVOIEMENT OBLIGATOIRE : Si tu traduis en Français, tu DOIS ABSOLUMENT utiliser le 'VOUS' (vouvoiement). Ne tutoie JAMAIS le client.\\n";
prompt += "▶ 3. AUCUN DARJA : N'utilise AUCUN mot d'argot algérien ou de Darja. Utilise uniquement la langue cible standard (Français standard, Anglais, ou Arabe Classique).\\n";
prompt += "▶ 4. STYLE : Conserve le ton naturel, amical et professionnel, ainsi que les emojis et la mise en forme.\\n\\n";

prompt += "[SORTIE]\\n";
prompt += "Renvoie UNIQUEMENT le texte traduit/réécrit. Zéro introduction, zéro commentaire.";

return items.map(item => {
    return {
        json: {
            ...item.json,
            dynamic_prompt: prompt
        }
    };
});`,
    };

    @node({
        id: 'e4f78290-85ec-4713-b77b-b13d518d4269',
        name: 'Generate Dynamic Promp4',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-1560, 2260],
    })
    GenerateDynamicPromp4 = {
        jsCode: `const items = $input.all();

let targetLang = "Français";
try {
    let calc = $('Calculate Predominant Lang').isExecuted ? $('Calculate Predominant Lang').first().json.dominant_lang : null;
    if (calc && !calc.includes('Aucune') && !calc.includes('Darja')) { 
        targetLang = calc; 
    } else {
        let l2 = $('Redis Get Text Lang').isExecuted ? $('Redis Get Text Lang').first().json.value : null;
        if (l2 && !l2.includes('Aucune') && !l2.includes('Darja')) { targetLang = l2; }
    }
} catch (e) {}

// Force French if the system tries to default to Darja
if (targetLang.includes('Darja')) targetLang = 'Français';

let prompt = "Tu es une MACHINE DE TRADUCTION ET DE CORRECTION AUTOMATIQUE INVISIBLE. Tu n'es pas un assistant.\\n";
prompt += "Ta fonction : traduire OU réécrire le texte EXCLUSIVEMENT dans la langue cible.\\n\\n";
prompt += "ALERTE : Ce texte est destiné à un client. Ne réponds pas à son contenu. TRADUIS/RÉÉCRIS uniquement.\\n\\n";
prompt += "[LANGUE CIBLE]\\n" + targetLang + "\\n\\n";

prompt += "════════════════════════════════════════════\\n";
prompt += "RÈGLES DE TRADUCTION STRICTE\\n";
prompt += "════════════════════════════════════════════\\n";
prompt += "▶ 1. TRADUCTION EXACTE : Tu DOIS traduire le texte d'origine EXCLUSIVEMENT vers la langue : " + targetLang + ".\\n";
prompt += "▶ 2. VOUVOIEMENT OBLIGATOIRE : Si tu traduis en Français, tu DOIS ABSOLUMENT utiliser le 'VOUS' (vouvoiement). Ne tutoie JAMAIS le client.\\n";
prompt += "▶ 3. AUCUN DARJA : N'utilise AUCUN mot d'argot algérien ou de Darja. Utilise uniquement la langue cible standard (Français standard, Anglais, ou Arabe Classique).\\n";
prompt += "▶ 4. STYLE : Conserve le ton naturel, amical et professionnel, ainsi que les emojis et la mise en forme.\\n\\n";

prompt += "[SORTIE]\\n";
prompt += "Renvoie UNIQUEMENT le texte traduit/réécrit. Zéro introduction, zéro commentaire.";

return items.map(item => {
    return {
        json: {
            ...item.json,
            dynamic_prompt: prompt
        }
    };
});`,
    };

    @node({
        id: 'bc6378bf-6717-45ef-b7f5-01da565a70b8',
        name: 'Generate Dynamic Promp8',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-6940, 4320],
    })
    GenerateDynamicPromp8 = {
        jsCode: `const items = $input.all();

let targetLang = "Français";
try {
    // Read the language directly from the previous node (Redis Get Image Lang)
    let redisLang = items[0].json.value || items[0].json.propertyName;
    if (redisLang && !redisLang.includes('Aucune') && !redisLang.includes('Darja')) {
        targetLang = redisLang;
    }
} catch (e) {}

// Force French if the system tries to default to Darja
if (targetLang.includes('Darja')) targetLang = 'Français';

let prompt = "Tu es une MACHINE DE TRADUCTION ET DE CORRECTION AUTOMATIQUE INVISIBLE. Tu n'es pas un assistant.\\n";
prompt += "Ta fonction : traduire OU réécrire le texte EXCLUSIVEMENT dans la langue cible.\\n\\n";
prompt += "ALERTE : Ce texte est destiné à un client. Ne réponds pas à son contenu. TRADUIS/RÉÉCRIS uniquement.\\n\\n";
prompt += "[LANGUE CIBLE]\\n" + targetLang + "\\n\\n";

prompt += "════════════════════════════════════════════\\n";
prompt += "RÈGLES DE TRADUCTION STRICTE\\n";
prompt += "════════════════════════════════════════════\\n";
prompt += "▶ 1. TRADUCTION EXACTE : Tu DOIS traduire le texte d'origine EXCLUSIVEMENT vers la langue : " + targetLang + ".\\n";
prompt += "▶ 2. VOUVOIEMENT OBLIGATOIRE : Si tu traduis en Français, tu DOIS ABSOLUMENT utiliser le 'VOUS' (vouvoiement). Ne tutoie JAMAIS le client.\\n";
prompt += "▶ 3. AUCUN DARJA : N'utilise AUCUN mot d'argot algérien ou de Darja. Utilise uniquement la langue cible standard (Français standard, Anglais, ou Arabe Classique).\\n";
prompt += "▶ 4. STYLE : Conserve le ton naturel, amical et professionnel, ainsi que les emojis et la mise en forme.\\n\\n";

prompt += "[SORTIE]\\n";
prompt += "Renvoie UNIQUEMENT le texte traduit/réécrit. Zéro introduction, zéro commentaire.";

return items.map(item => {
    return {
        json: {
            ...item.json,
            dynamic_prompt: prompt
        }
    };
});`,
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.SetContext.out(0).to(this.AiRouteur1.in(0));
        this.AiRouteur1.out(0).to(this.SaveActiveBranch.in(0));
        this._2DownloadImage1.out(0).to(this._3AiVisionAnalysis1.in(0));
        this._1GetImageUrl1.out(0).to(this.Redis.in(0));
        this.If4.out(0).to(this.CodeBuildAdminReport1.in(0));
        this.If4.out(1).to(this.DetectOffreEnvoyee.in(0));
        this.OnFormSubmission.out(0).to(this.QdrantInsert.in(0));
        this.WaImageVoyageur2.out(0).to(this.CodeSetPause.in(0));
        this.If3.out(0).to(this.CodeBuildAdminReport2.in(0));
        this.If3.out(1).to(this.GenerateDynamicPromp2.in(0));
        this.WaImageVoyageur1.out(0).to(this.CodeSetPause.in(0));
        this.If2.out(0).to(this.CodeBuildAdminReport1.in(0));
        this.If2.out(1).to(this.ExtraireImageVoyageur.in(0));
        this.IsRealMessage.out(0).to(this.CodeCheckPause.in(0));
        this.IsRealMessage.out(0).to(this.ReactionRandomizer.in(0));
        this.IsRealMessage.out(0).to(this.RedisTagActiveClient24h.in(0));
        this.QdrantInsert.out(0).to(this.AgentSupportClient.in(0));
        this.AgentSupportClient.out(0).to(this.If3.in(0));
        this.ExtraireImageVoyageur.out(0).to(this.If_.in(0));
        this.WaImageVoyageur.out(0).to(this.BuildBodyWaVoyageur1.in(0));
        this.If_.out(0).to(this.WaImageVoyageur.in(0));
        this.If_.out(1).to(this.GenerateDynamicPromp4.in(0));
        this.WebhookMetaVerify.out(0).to(this.RespondToMeta.in(0));
        this.WebhookReceiveMessage.out(0).to(this.IsRealMessage.in(0));
        this.WebhookReceiveMessage.out(0).to(this.MarkAsReadHttp.in(0));
        this.IsTextMessage.out(0).to(this.ExtractText.in(0));
        this.IsTextMessage.out(1).to(this._1GetImageUrl1.in(0));
        this.IsTextMessage.out(2).to(this._1GetAudioUrl.in(0));
        this.IsTextMessage.out(4).to(this.BuildBodyWaMediaInvalide.in(0));
        this.IsTextMessage.out(4).to(this.BuildBodyAdminError.in(0));
        this.ExtractText.out(0).to(this.IfNuclearReset.in(0));
        this.TheRouter1.out(0).to(this.BookingAgentVoyageur.in(0));
        this.TheRouter1.out(1).to(this.RedisGetApptsState.in(0));
        this.TheRouter1.out(2).to(this.AgentSupportClient.in(0));
        this.TheRouter1.out(3).to(this.AgentSupportClient.in(0));
        this.TheRouter1.out(4).to(this.AgentSupportClient.in(0));
        this.BookingAgentVoyageur.out(0).to(this.If2.in(0));
        this.WaVoyageur1.out(0).to(this.Code1.in(0));
        this.BookingAgentProprietaire.out(0).to(this.If4.in(0));
        this.SwitchVille1.out(0).to(this.TraductionWaPoseQuestion1.in(0));
        this.SwitchVille1.out(1).to(this.TraductionWaPoseQuestion1.in(0));
        this.SwitchVille1.out(2).to(this.RedisCrmHorsZone.in(0));
        this.SwitchVille1.out(3).to(this.WaAttenteClient.in(0));
        this.SwitchVille1.out(4).to(this.GenerateDynamicPromp.in(0));
        this.SwitchVille1.out(5).to(this.GenerateDynamicPromp1.in(0));
        this.WaPoseQuestion1.out(0).to(this.Code1.in(0));
        this.WaRefus1.out(0).to(this.Code1.in(0));
        this.WaDemandePhotosInit.out(0).to(this.Code1.in(0));
        this.WaAttenteClient.out(0).to(this.GenererScriptGamma.in(0));
        this.RedisCrmHorsZone.out(0).to(this.GenerateDynamicPromp3.in(0));
        this.GenererScriptGamma.out(0).to(this.RedisCrmProprietaire.in(0));
        this.RedisCrmProprietaire.out(0).to(this.WaScriptAdmin.in(0));
        this.WaScriptAdmin.out(0).to(this.Code1.in(0));
        this.WaMessageSupport.out(0).to(this.Code1.in(0));
        this._1PrepRedisVars.out(0).to(this._2RedisGetInitial.in(0));
        this._2RedisGetInitial.out(0).to(this._3CalcNewBuffer.in(0));
        this._3CalcNewBuffer.out(0).to(this._4RedisSet.in(0));
        this._4RedisSet.out(0).to(this._5WaitDebounce.in(0));
        this._5WaitDebounce.out(0).to(this._6RedisGetCheck.in(0));
        this._6RedisGetCheck.out(0).to(this._7CollisionCheck.in(0));
        this._7CollisionCheck.out(0).to(this._8RedisDeleteKey.in(0));
        this._7CollisionCheck.out(1).to(this._10HaltNewerMsgExists.in(0));
        this._8RedisDeleteKey.out(0).to(this.DebouncedText.in(0));
        this.DebouncedText.out(0).to(this.RedisGetHistory.in(0));
        this.BasicLlmChain.out(0).to(this.BuildBodyWaVoyageur1.in(0));
        this.TraductionWaPoseQuestion1.out(0).to(this.BuildBodyWaPoseQuestion1.in(0));
        this.TraductionWaRefus1.out(0).to(this.BuildBodyWaRefus1.in(0));
        this.TraductionWaDemandePhotosInit.out(0).to(this.BuildBodyWaDemandePhotosInit.in(0));
        this.TraductionWaMessageSupport.out(0).to(this.BuildBodyWaMessageSupport.in(0));
        this.RedisGetTextLang.out(0).to(this.DetectLanguageHttp.in(0));
        this.RedisSetTextLang.out(0).to(this.IsAudio.in(0));
        this._1GetAudioUrl.out(0).to(this._2DownloadAudio.in(0));
        this._2DownloadAudio.out(0).to(this.HttpRequest.in(0));
        this.FormatTranscribedText.out(0).to(this._1PrepRedisVars.in(0));
        this.FilterDarjaArabic.out(0).to(this.BuildBodyWaEscaladeLangueLocale.in(0));
        this.FilterDarjaArabic.out(1).to(this.RedisGetContext.in(0));
        this.WaEscaladeLangueLocale.out(0).to(this.WaForwardAudioAAdmin.in(0));
        this.IsAudio.out(0).to(this.RedisGetContext.in(0));
        this.IsAudio.out(1).to(this.RedisGetContext.in(0));
        this.HttpRequest.out(0).to(this.FormatTranscribedText.in(0));
        this.CodeCheckPause.out(0).to(this.IfPaused.in(0));
        this.IfPaused.out(1).to(this.IsTextMessage.in(0));
        this.CodeSetPause.out(0).to(this.Code1.in(0));
        this.CodeBuildAdminReport1.out(0).to(this.WaImageVoyageur1.in(0));
        this.CodeBuildAdminReport2.out(0).to(this.WaImageVoyageur2.in(0));
        this.WaReponseVocaleClient.out(0).to(this.CodeSetPause.in(0));
        this.WaForwardAudioAAdmin.out(0).to(this.BuildBodyWaReponseVocaleClient.in(0));
        this.RedisGetContext.out(0).to(this.RedisGetPhotoUrls.in(0));
        this.ActiveTextHistory.out(0).to(this.RedisSetHistory.in(0));
        this.RedisGetHistory.out(0).to(this.ActiveTextHistory.in(0));
        this.RedisSetHistory.out(0).to(this.RedisGetTextLang.in(0));
        this.DetectLanguageHttp.out(0).to(this.RedisGetLangStats.in(0));
        this.SaveActiveBranch.out(0).to(this.Redis1.in(0));
        this.IfNuclearReset.out(0).to(this.CodeWipeMemory.in(0));
        this.IfNuclearReset.out(1).to(this._1PrepRedisVars.in(0));
        this.Redis.out(0).to(this._2DownloadImage1.in(0));
        this.Redis1.out(0).to(this.TheRouter1.in(0));
        this.ReactionRandomizer.out(0).to(this.ReactionDelay.in(0));
        this.DetectOffreEnvoyee.out(0).to(this.SwitchVille1.in(0));
        this.DetectOffreEnvoyee.out(0).to(this.IsOffreFinished.in(0));
        this.IsOffreFinished.out(0).to(this.RedisWipeAppt.in(0));
        this.RedisWipeAppt.out(0).to(this.RedisWipeVision.in(0));
        this.RedisGetPhotoUrls.out(0).to(this.RedisGetBranch.in(0));
        this.ReactionDelay.out(0).to(this.SendReactionHttp1.in(0));
        this.RedisGetBranch.out(0).to(this.SetContext.in(0));
        this.RedisGetApptsState.out(0).to(this.StatePrepCode.in(0));
        this.StatePrepCode.out(0).to(this.ExtractApptsState.in(0));
        this.ExtractApptsState.out(0).to(this.StateCleanCode.in(0));
        this.StateCleanCode.out(0).to(this.RedisSetApptsState.in(0));
        this.RedisSetApptsState.out(0).to(this.BookingAgentProprietaire.in(0));
        this.BuildBodyWaVoyageur1.out(0).to(this.WaVoyageur1.in(0));
        this.BuildBodyWaPoseQuestion1.out(0).to(this.WaPoseQuestion1.in(0));
        this.BuildBodyWaRefus1.out(0).to(this.WaRefus1.in(0));
        this.BuildBodyWaDemandePhotosInit.out(0).to(this.WaDemandePhotosInit.in(0));
        this.BuildBodyWaMessageSupport.out(0).to(this.WaMessageSupport.in(0));
        this.BuildBodyWaEscaladeLangueLocale.out(0).to(this.WaEscaladeLangueLocale.in(0));
        this.BuildBodyWaReponseVocaleClient.out(0).to(this.WaReponseVocaleClient.in(0));
        this.BuildBodyWaResetConfirmation.out(0).to(this.WaResetConfirmation.in(0));
        this.CodeWipeMemory.out(0).to(this.RedisNuclearDelete.in(0));
        this.RedisNuclearDelete.out(0).to(this.StopSpam.in(0));
        this.StopSpam.out(0).to(this.BuildBodyWaResetConfirmation.in(0));
        this._3AiVisionAnalysis1.out(0).to(this.RedisCountNode.in(0));
        this.RedisGetFinalBatch.out(0).to(this.RedisGetApptsStateImg.in(0));
        this.TheBrainMoyenneMessage.out(0).to(this.RedisSetApptsStateImg.in(0));
        this.SauvegarderMemoireIa.out(0).to(this.WaEnvoiFinalUnique.in(0));
        this.WaEnvoiFinalUnique.out(0).to(this.RedisClearPhotoBatch.in(0));
        this.TraductionWaEvaluationPhotos.out(0).to(this.SauvegarderMemoireIa.in(0));
        this.RedisCountNode.out(0).to(this.WaitAntiCollision.in(0));
        this.WaitAntiCollision.out(0).to(this.RedisGetBatch.in(0));
        this.RedisGetBatch.out(0).to(this.CodeAppendBatch.in(0));
        this.CodeAppendBatch.out(0).to(this.RedisSavePhotoUrlsAfterAppend.in(0));
        this.RedisSetBatch.out(0).to(this.WaitDebounce.in(0));
        this.WaitDebounce.out(0).to(this.RedisCheckCount.in(0));
        this.RedisCheckCount.out(0).to(this.IfCollisionDernierePhoto.in(0));
        this.IfCollisionDernierePhoto.out(0).to(this.RedisGetFinalBatch.in(0));
        this.RedisSavePhotoUrls.out(0).to(this.RedisGetImageLang.in(0));
        this.RedisSavePhotoUrlsAfterAppend.out(0).to(this.RedisSetBatch.in(0));
        this.RedisGetImageLang.out(0).to(this.GenerateDynamicPromp8.in(0));
        this.RedisGetApptsStateImg.out(0).to(this.TheBrainMoyenneMessage.in(0));
        this.RedisGetLangStats.out(0).to(this.CalculatePredominantLang.in(0));
        this.CalculatePredominantLang.out(0).to(this.RedisSetLangStats.in(0));
        this.RedisSetLangStats.out(0).to(this.RedisSetTextLang.in(0));
        this.BuildBodyWaMediaInvalide.out(0).to(this.WaErreurMediaClient.in(0));
        this.BuildBodyAdminError.out(0).to(this.WaAdminErrorAlert.in(0));
        this.RedisSetApptsStateImg.out(0).to(this.RedisSavePhotoUrls.in(0));
        this.ConvertAudioToBase64.out(0).to(this.HttpRequest.in(0));
        this.GenerateDynamicPromp.out(0).to(this.TraductionWaDemandePhotosInit.in(0));
        this.GenerateDynamicPromp1.out(0).to(this.TraductionWaPoseQuestion1.in(0));
        this.GenerateDynamicPromp2.out(0).to(this.TraductionWaMessageSupport.in(0));
        this.GenerateDynamicPromp3.out(0).to(this.TraductionWaRefus1.in(0));
        this.GenerateDynamicPromp4.out(0).to(this.BasicLlmChain.in(0));
        this.GenerateDynamicPromp8.out(0).to(this.TraductionWaEvaluationPhotos.in(0));

        this.AiRouteur1.uses({
            ai_languageModel: this.OpenaiChatModel.output,
            ai_memory: this.RedisChatMemory2.output,
        });
        this.DefaultDataLoader1.uses({
            ai_textSplitter: this.RecursiveCharacterTextSplitter.output,
        });
        this.QdrantInsert.uses({
            ai_embedding: this.EmbeddingsOpenai.output,
            ai_document: [this.DefaultDataLoader1.output],
        });
        this.QdrantVectorStore.uses({
            ai_embedding: this.EmbeddingsOpenai1.output,
        });
        this.AgentSupportClient.uses({
            ai_languageModel: this.OpenaiChatModel3.output,
            ai_memory: this.RedisChatMemory.output,
            ai_tool: [this.OutilInfosHospitable1.output, this.RechercheInformationsAgence.output],
        });
        this.BookingAgentVoyageur.uses({
            ai_languageModel: this.OpenaiChatModel2.output,
            ai_memory: this.RedisChatMemory.output,
            ai_tool: [
                this.ChercherCatalogueGs.output,
                this.OutilInfosHospitable1.output,
                this.DisponibilitesHospitable.output,
                this.VerifierStatutPaiement.output,
                this.RechercheInformationsAgence.output,
            ],
        });
        this.BookingAgentProprietaire.uses({
            ai_languageModel: this.OpenaiChatModel1.output,
            ai_memory: this.RedisChatMemory.output,
            ai_tool: [this.ResetPhotos.output, this.RechercheInformationsAgence.output, this.OutilExportCrm.output],
        });
        this.GenererScriptGamma.uses({
            ai_languageModel: this.OpenaiChatModel8.output,
            ai_memory: this.RedisChatMemory1.output,
        });
        this.BasicLlmChain.uses({
            ai_languageModel: this.OpenaiChatModel4.output,
        });
        this.TraductionWaPoseQuestion1.uses({
            ai_languageModel: this.OpenaiChatModel4.output,
        });
        this.TraductionWaRefus1.uses({
            ai_languageModel: this.OpenaiChatModel4.output,
        });
        this.TraductionWaDemandePhotosInit.uses({
            ai_languageModel: this.OpenaiChatModel4.output,
        });
        this.TraductionWaMessageSupport.uses({
            ai_languageModel: this.OpenaiChatModel4.output,
        });
        this.RechercheInformationsAgence.uses({
            ai_languageModel: this.OpenaiChatModel7.output,
            ai_vectorStore: this.QdrantVectorStore.output,
        });
        this._3AiVisionAnalysis1.uses({
            ai_languageModel: this.OpenaiChatModel10.output,
        });
        this.TraductionWaEvaluationPhotos.uses({
            ai_languageModel: this.OpenaiChatModelTraduction.output,
        });
    }
}
