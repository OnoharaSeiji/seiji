(function () {
  const plan = window.studyPlan;
  if (!plan || !Array.isArray(plan.lessons)) return;

  const repoConfig = window.SEIJI_REPO_CONFIG || {
    owner: "OnoharaSeiji",
    repo: "seiji",
    lessonsDir: "apostilas",
  };

  const stateKey = "seiji_study_progress_v1";

  const refsBySubject = {
    "Meta Ads": [
      { title: "Meta for Business · Ad objectives", url: "https://www.facebook.com/business/ads/ad-objectives", desc: "Objetivos de campanha e relação entre objetivo de negócio e entrega do sistema." },
      { title: "Meta for Business · Advantage+ campaign budget", url: "https://www.facebook.com/business/ads/meta-advantage-plus/budget", desc: "Distribuição automática de orçamento na camada de campanha." },
      { title: "Meta for Business · Advantage+ placements", url: "https://www.facebook.com/business/ads/meta-advantage-plus/placements", desc: "Placements automáticos e expansão de oportunidades de entrega." }
    ],
    "Google Ads": [
      { title: "Google Ads Help · Keyword matching options", url: "https://support.google.com/google-ads/answer/11586965?hl=en", desc: "Correspondência ampla, frase e exata e como cada uma afeta o alcance." },
      { title: "Google Ads Help · Responsive search ads", url: "https://support.google.com/google-ads/answer/7684791?hl=en-419", desc: "Como RSAs combinam assets e aprendem quais combinações performam melhor." },
      { title: "Google Ads Help · About Performance Max campaigns", url: "https://support.google.com/google-ads/answer/10724817?hl=en", desc: "Papel da PMAX, canais cobertos e lógica de otimização com IA." }
    ],
    "Traqueamento": [
      { title: "Tag Manager Help · Set up GA4 events in Tag Manager", url: "https://support.google.com/tagmanager/answer/13034206?hl=en", desc: "Passo a passo oficial para configurar eventos GA4 via GTM." },
      { title: "Analytics Help · About events", url: "https://support.google.com/analytics/answer/9322688?hl=en-419", desc: "Conceito oficial de eventos no GA4 e seus tipos." },
      { title: "Analytics Help · Conversions vs. key events in GA4", url: "https://support.google.com/analytics/answer/13965727?hl=en", desc: "Diferença atual entre key events no Analytics e conversions no Google Ads." }
    ],
    "n8n": [
      { title: "n8n Docs · Error handling", url: "https://docs.n8n.io/flow-logic/error-handling/", desc: "Tratamento de erro, error workflow e investigação de falhas." },
      { title: "n8n Docs · Stop And Error", url: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.stopanderror/", desc: "Como forçar falha controlada e disparar fluxos de erro." },
      { title: "n8n Docs · Dealing with errors in workflows", url: "https://docs.n8n.io/courses/level-two/chapter-4/", desc: "Leitura de executions e depuração de workflows." }
    ],
    "CRM": [{ title: "IES · Organizing Instruction and Study to Improve Student Learning", url: "https://ies.ed.gov/ncee/wwc/Docs/PracticeGuide/20072004.pdf", desc: "Base para revisão ativa, retenção e aplicação prática ao estudo." }],
    "Prospecção ativa": [{ title: "IES · Organizing Instruction and Study to Improve Student Learning", url: "https://ies.ed.gov/ncee/wwc/Docs/PracticeGuide/20072004.pdf", desc: "Base metodológica para recuperação ativa e prática deliberada." }],
    "Vendas": [{ title: "IES · Organizing Instruction and Study to Improve Student Learning", url: "https://ies.ed.gov/ncee/wwc/Docs/PracticeGuide/20072004.pdf", desc: "Base metodológica para revisão ativa, síntese e aplicação." }],
    "n8n + CRM": [
      { title: "n8n Docs · Error handling", url: "https://docs.n8n.io/flow-logic/error-handling/", desc: "Base oficial sobre falhas, alerts e tratamento de execução." },
      { title: "IES · Organizing Instruction and Study to Improve Student Learning", url: "https://ies.ed.gov/ncee/wwc/Docs/PracticeGuide/20072004.pdf", desc: "Base pedagógica da estrutura de estudo e aplicação." }
    ],
    "Integração": [{ title: "IES · Organizing Instruction and Study to Improve Student Learning", url: "https://ies.ed.gov/ncee/wwc/Docs/PracticeGuide/20072004.pdf", desc: "Base da metodologia de revisão ativa e síntese." }],
    "Idiomas": [{ title: "IES · Organizing Instruction and Study to Improve Student Learning", url: "https://ies.ed.gov/ncee/wwc/Docs/PracticeGuide/20072004.pdf", desc: "Base para repetição ativa, evocação e prática curta frequente." }]
  };

  const subjectGuides = {
    "Meta Ads": {
      core: "Em Meta Ads, a qualidade da gestão depende de três camadas: estrutura, intenção de entrega e leitura correta de sinais. Quando essas camadas se misturam, a conta até pode rodar, mas ela deixa de ensinar por que performa bem ou mal.",
      why: "Seu papel como gestor não é apenas subir campanha. É desenhar um sistema em que campanha, conjunto, anúncio, objetivo, orçamento, público e criativo conversem com o mesmo objetivo de negócio.",
      example: "Em um e-commerce, separar aquisição, remarketing e recorrência geralmente melhora clareza. A mesma lógica vale para criativos: mensagem de descoberta para público frio, prova e urgência para público quente, recompra e cross-sell para cliente.",
      errors: ["Misturar estágios de funil na mesma leitura.", "Trocar campanha cedo demais sem hipótese clara.", "Interpretar uma métrica isolada como diagnóstico final."],
      english: ["campaign objective", "ad set", "placement", "frequency", "cost per result"],
      japanese: ["こうこく", "もくひょう", "よさん", "ぶんせき", "ふくしゅう"]
    },
    "Google Ads": {
      core: "Em Google Ads, o centro do raciocínio é intenção. Search, PMAX, assets, palavras-chave, correspondência e landing page só fazem sentido quando você sabe qual demanda quer capturar e qual ação quer incentivar.",
      why: "A conta boa é a que aproxima consulta, anúncio e página. Quando essa tríade quebra, você compra clique sem comprar oportunidade real.",
      example: "Uma campanha brand protege demanda já aquecida; uma campanha genérica capta procura mais aberta; uma PMAX pode ampliar alcance e complementar Search quando a conversão principal está bem definida.",
      errors: ["Ad group genérico demais.", "Negativas esquecidas.", "RSA com assets repetitivos ou pouco específicos."],
      english: ["keyword match type", "responsive search ad", "asset group", "search term", "conversion"],
      japanese: ["けんさく", "こうこく", "へんかん", "しひょう", "よさん"]
    },
    "Traqueamento": {
      core: "Traqueamento é a base da otimização. Se evento, conversão, parâmetro e validação não estão corretos, o algoritmo aprende em cima de sinais pobres e você toma decisão com visão parcial.",
      why: "Pixel, GA4, GTM, CAPI e key events existem para transformar comportamento em evidência. Sem evidência limpa, métricas bonitas podem estar só mascarando coleta ruim.",
      example: "Um CPA ruim pode ser problema de anúncio, mas também pode ser evento duplicado, compra sem value, lead sem parâmetro ou conversão marcada errado.",
      errors: ["Confundir evento com conversão.", "Implementar e não validar.", "Ignorar deduplicação, consentimento e priorização."],
      english: ["event", "key event", "conversion", "trigger", "debug view"],
      japanese: ["でーた", "へんかん", "そくてい", "ぶんせき", "かくにん"]
    },
    "n8n": {
      core: "n8n exige pensamento em fluxo: entrada, transformação, decisão, saída e tratamento de erro. O melhor workflow não é o mais complexo; é o que reduz trabalho manual com confiabilidade.",
      why: "Quando você entende trigger, node, execução e fallback, para de copiar automação dos outros e começa a desenhar fluxo útil para sua rotina.",
      example: "Um formulário pode gerar lead, gravar planilha, notificar no WhatsApp e criar tarefa de follow-up. Se algum passo falhar, o fluxo precisa avisar e registrar.",
      errors: ["Automação sem objetivo claro.", "Node sem teste intermediário.", "Fluxo publicado sem estratégia de erro."],
      english: ["workflow", "trigger", "webhook", "execution", "error handling"],
      japanese: ["じどうか", "ながれ", "にゅうりょく", "しっぱい", "かくにん"]
    },
    "CRM": {
      core: "CRM é a disciplina de transformar contato em processo visível. Sem pipeline, estágio, próxima ação e cadência, sua venda depende de memória e impulso.",
      why: "O CRM bom não é o mais sofisticado; é o que te mostra quem está em qual estágio, o que aconteceu e o que precisa acontecer agora.",
      example: "Lead novo, qualificado, diagnóstico, proposta, follow-up, fechamento e pós-venda. Cada etapa pede um critério claro de avanço.",
      errors: ["Lead sem próxima ação.", "Estágio mal definido.", "Follow-up sem registro."],
      english: ["pipeline", "follow-up", "lead stage", "next action", "qualification"],
      japanese: ["えいぎょう", "れんらく", "だんかい", "つぎ", "きろく"]
    },
    "Prospecção ativa": {
      core: "Prospecção ativa é geração de oportunidade por método. O ganho não está em mandar muita mensagem; está em escolher ICP, diagnosticar rápido e abordar com coerência.",
      why: "Quanto melhor sua pesquisa, melhor sua hipótese de dor. Quanto melhor sua hipótese, maior a chance de resposta qualificada.",
      example: "Mapear marca, site, maturidade, decisor, presença de anúncios e possível gargalo comercial antes da abordagem.",
      errors: ["Falar com a empresa errada.", "Abordagem genérica.", "Não registrar contato e follow-up."],
      english: ["outreach", "decision maker", "ideal customer profile", "qualification", "follow-up"],
      japanese: ["えいぎょう", "きゃく", "しらべる", "れんらく", "きろく"]
    },
    "Vendas": {
      core: "Venda consultiva depende de diagnóstico, clareza de dor, objeção bem interpretada e próximo passo definido. Fechar não é pressionar; é conduzir bem.",
      why: "Quem pergunta melhor entende melhor o problema do cliente e ancora melhor a proposta. Quem só fala do próprio serviço tende a perder contexto e confiança.",
      example: "Uma boa call abre com contexto, aprofunda dor, mede impacto, enquadra solução, trata objeção e fecha o próximo passo.",
      errors: ["Pular diagnóstico.", "Responder objeção como debate.", "Encerrar call sem avanço claro."],
      english: ["discovery call", "objection", "proposal", "closing", "next step"],
      japanese: ["そうだん", "ていあん", "もんだい", "こたえ", "つぎ"]
    },
    "n8n + CRM": {
      core: "Quando automação e CRM se encontram, a meta é velocidade com organização. O lead entra, é classificado, vira registro, gera tarefa e não se perde no caminho.",
      why: "Automação comercial boa não serve para enfeitar processo. Serve para reduzir atraso, esquecimento e retrabalho.",
      example: "Lead recebido → validação → criação no CRM → alerta interno → tarefa de follow-up após 48h sem resposta.",
      errors: ["Automatizar caos.", "Exigir dados demais na entrada.", "Gerar alerta sem dono."],
      english: ["automation", "routing", "lead scoring", "task", "notification"],
      japanese: ["じどうか", "きろく", "つぎ", "れんらく", "つうち"]
    },
    "Integração": {
      core: "Integração é fazer mídia, tracking, CRM, prospecção e vendas trabalharem como sistema. Quando uma parte falha, o restante perde força.",
      why: "Aquisição sem tracking aprende mal. Tracking sem CRM perde conexão comercial. CRM sem oferta e rotina comercial não fecha.",
      example: "Campanha gera demanda, tracking mede, CRM organiza, follow-up acelera, venda aprende com o que converteu.",
      errors: ["Tratar áreas como ilhas.", "Não definir prioridade do sistema.", "Criar rotina sem ligação com resultado."],
      english: ["integration", "measurement", "pipeline", "attribution", "workflow"],
      japanese: ["れんけい", "そくてい", "しくみ", "きろく", "けいぞく"]
    },
    "Idiomas": {
      core: "Idioma aplicado funciona melhor quando entra no seu contexto de trabalho. Frase curta, repetição ativa e vocabulário útil batem estudo solto e irregular.",
      why: "Você fixa mais quando usa vocabulário ligado a situações reais do seu dia a dia, especialmente marketing, relatório, campanha e comunicação.",
      example: "Transformar a própria rotina em frase: ‘I’m reviewing campaign metrics today.’ / きょう は こうこく の しひょう を ふくしゅう します。",
      errors: ["Estudar vocabulário sem contexto.", "Ficar só lendo e não produzir.", "Não repetir o suficiente."],
      english: ["campaign", "report", "budget", "review", "result"],
      japanese: ["べんきょう", "ふくしゅう", "けっか", "よさん", "こうこく"]
    }
  };

  const loadingStyle = `
    .lesson-shell{padding:32px 0 72px}
    .lesson-pro{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:20px}
    .hero-pro{display:grid;grid-template-columns:1.1fr .9fr;gap:16px;margin-top:18px}
    .hero-box,.mini-box,.map-card,.practice-card,.check-card,.ref-card,.qa-card,.truth-card,.timeline-card,.exercise-card,.glossary-card,.insight-card,.synthesis-card{padding:20px;border-radius:20px;border:1px solid var(--line);background:rgba(255,255,255,.035)}
    .hero-box h2,.map-card h3,.practice-card h3,.check-card h3,.exercise-card h3,.glossary-card h3,.ref-card h3,.timeline-card h3,.insight-card h3,.qa-card h3,.truth-card h3,.synthesis-card h3{margin:0 0 10px}
    .hero-box p,.mini-box p,.map-card p,.practice-card p,.check-card p,.exercise-card p,.glossary-card p,.ref-card p,.timeline-card p,.insight-card p,.qa-card p,.truth-card p,.synthesis-card p{margin:0;color:var(--muted);line-height:1.75}
    .hero-box ul,.map-card ul,.practice-card ul,.check-card ul,.exercise-card ul,.glossary-card ul,.qa-card ul,.truth-card ul,.ref-card ul,.timeline-card ul,.insight-card ul{margin:14px 0 0 18px;padding:0}
    .hero-box li,.map-card li,.practice-card li,.check-card li,.exercise-card li,.glossary-card li,.qa-card li,.truth-card li,.ref-card li,.timeline-card li,.insight-card li{margin:8px 0;line-height:1.7}
    .eyeline{display:flex;flex-wrap:wrap;gap:10px;margin:16px 0 0}
    .pill{padding:8px 12px;border-radius:999px;border:1px solid var(--line);background:rgba(255,255,255,.04);color:var(--muted);font-size:.9rem}
    .mini-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
    .mini-box strong{display:block;font-size:1rem;margin-bottom:8px}
    .section-stack{display:grid;gap:16px;margin-top:20px}
    .section-label{display:inline-flex;align-items:center;gap:8px;padding:8px 12px;border-radius:999px;border:1px solid var(--line);background:rgba(255,255,255,.04);color:var(--muted);font-size:.86rem;text-transform:uppercase;letter-spacing:.07em}
    .pro-section{padding:24px;border-radius:24px;border:1px solid var(--line);background:rgba(255,255,255,.03)}
    .pro-section h2{margin:0 0 12px;font-size:1.35rem;letter-spacing:-.03em}
    .pro-section p{margin:0;color:var(--muted);line-height:1.8}
    .pro-section p + p{margin-top:12px}
    .two-col{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
    .three-col{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
    .call-grid,.framework,.quiz-list,.decision-table{display:grid;gap:14px;margin-top:16px}
    .call-card,.framework-step,.quiz-item,.decision-row{padding:16px;border-radius:18px;border:1px solid var(--line);background:rgba(255,255,255,.035)}
    .framework-step{display:grid;grid-template-columns:56px 1fr;gap:14px;align-items:start}
    .step-n{width:56px;height:56px;border-radius:18px;display:grid;place-items:center;font-weight:800;background:linear-gradient(135deg,var(--accent-2),var(--accent));color:#04111f}
    .truth-grid,.lang-grid,.exercise-grid,.synthesis-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px}
    .truth-card.bad{border-color:rgba(251,113,133,.18)}
    .truth-card.good{border-color:rgba(110,231,183,.18)}
    .note-strong{margin-top:14px;padding:16px;border-radius:18px;border:1px solid rgba(251,191,36,.2);background:rgba(251,191,36,.08);color:#ffefbf}
    .board{margin-top:16px;border:1px dashed rgba(255,255,255,.18);border-radius:20px;padding:18px;background:rgba(255,255,255,.02)}
    .board h3{margin:0 0 10px}
    .board p{margin:0;color:var(--muted)}
    .board-lines{display:grid;gap:10px;margin-top:14px}
    .board-line{height:14px;border-radius:999px;background:rgba(255,255,255,.06)}
    details.answer{margin-top:12px;border-top:1px solid var(--line);padding-top:12px}
    details.answer summary{cursor:pointer;font-weight:700;color:#dff8ff}
    .micro-card{padding:18px;border-radius:18px;border:1px solid var(--line);background:rgba(255,255,255,.03)}
    .micro-card h3{margin:0 0 10px}
    .micro-card p{margin:0;color:var(--muted);line-height:1.75}
    .micro-card ul{margin:12px 0 0 18px;padding:0}
    .micro-card li{margin:8px 0;line-height:1.7}
    .aside-card .status-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px}
    .aside-mini{padding:14px;border-radius:16px;background:rgba(255,255,255,.035);border:1px solid var(--line)}
    .aside-mini strong{display:block;margin-bottom:6px}
    .aside-check{display:grid;gap:10px;margin-top:16px}
    .aside-check label{display:flex;gap:10px;align-items:flex-start;color:var(--muted);line-height:1.5}
    .quote-box{margin-top:16px;padding:16px 18px;border-left:4px solid var(--accent);border-radius:16px;background:rgba(110,231,183,.08);color:#e5fff7}
    .reference-list{display:grid;gap:12px;margin-top:16px}
    .reference-list a{display:block;padding:14px 16px;border-radius:16px;border:1px solid var(--line);background:rgba(255,255,255,.03);color:var(--text)}
    .reference-list small{display:block;color:var(--muted);margin-top:6px;line-height:1.6}
    .mark-box{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:18px;border-radius:18px;border:1px solid var(--line);background:rgba(255,255,255,.04);margin-top:18px}
    .mark-box p{margin:6px 0 0;color:var(--muted)}
    .lesson-footer{margin-top:22px;padding:20px 0 0;border-top:1px solid var(--line)}
    .footer-actions{display:flex;flex-wrap:wrap;gap:12px}
    .small-muted{font-size:.94rem;color:var(--muted)}
    .next-disabled{opacity:.65;pointer-events:none}
    .lesson-error{padding:56px 0}
    .lesson-error .card{padding:28px}
    @media (max-width: 1020px){
      .lesson-pro,.hero-pro,.exercise-grid,.truth-grid,.lang-grid,.two-col,.three-col,.mini-grid,.synthesis-grid{grid-template-columns:1fr}
    }
  `;

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function prettyWeekday(value) {
    const map = { segunda: "Segunda", terca: "Terça", quarta: "Quarta", quinta: "Quinta", sexta: "Sexta", sabado: "Sábado", domingo: "Domingo" };
    return map[value] || String(value || "");
  }

  function lessonNumberFromPath() {
    const match = window.location.pathname.match(/dia-(\\d{3})\\.html/i);
    return match ? Number(match[1]) : null;
  }

  function lessonFile(number) {
    return `dia-${String(number).padStart(3, "0")}.html`;
  }

  function readState() {
    try { return JSON.parse(localStorage.getItem(stateKey) || "{}"); } catch { return {}; }
  }

  function saveState(state) {
    localStorage.setItem(stateKey, JSON.stringify(state));
  }

  function subjectGuide(subject) {
    return subjectGuides[subject] || subjectGuides["Integração"];
  }

  function refsFor(subject) {
    return refsBySubject[subject] || refsBySubject["Integração"];
  }

  function expandBullet(subject, bullet) {
    const text = (bullet || "").toLowerCase();
    if (subject === "Meta Ads") {
      if (text.includes("funil")) return "Funil aqui não é etiqueta. É uma forma de separar pessoas em momentos diferentes da jornada, para evitar pressão igual sobre públicos desiguais.";
      if (text.includes("objetivo")) return "Objetivo define o tipo de resultado que o sistema vai tentar maximizar. Escolher errado distorce toda a entrega e gera leitura confusa depois.";
      if (text.includes("abo") || text.includes("cbo") || text.includes("orc")) return "Orçamento precisa servir ao aprendizado. Quando você quer controle fino entre conjuntos, tende a usar mais separação; quando quer deixar o sistema redistribuir, aceita mais consolidação.";
      if (text.includes("posicion")) return "Placements não são detalhe visual. Eles interferem em custo, volume, formato criativo e comportamento do clique.";
      if (text.includes("ctr")) return "CTR ajuda a ler atenção e aderência de mensagem, mas só ganha sentido quando comparado a CPC, frequência, contexto de público e resultado final.";
      if (text.includes("frequ")) return "Frequência mostra repetição, não saturação automática. Ela precisa ser lida com queda de CTR, estabilidade de volume e resposta do CPA.";
      if (text.includes("utm")) return "UTM e naming não são perfumaria. Eles protegem a leitura da campanha, facilitam auditoria e reduzem retrabalho na operação.";
      return "Transforme este tópico em pergunta prática: o que muda na sua conta quando você realmente aplica esta ideia, e o que quebra quando ignora?";
    }
    if (subject === "Google Ads") {
      if (text.includes("search")) return "Search capta demanda declarada. A força dele está em casar consulta, anúncio e página com o máximo de relevância possível.";
      if (text.includes("pmax")) return "PMAX amplia cobertura e usa sinais de intenção, asset e conversão para encontrar oportunidade em múltiplos canais. Ela complementa Search, não substitui raciocínio.";
      if (text.includes("correspond")) return "Correspondência é alavanca de precisão. Ela determina até onde você abre a porta para novas consultas e quanto esforço precisará em negativas.";
      if (text.includes("assets") || text.includes("extens")) return "Assets e extensões aumentam relevância percebida, ocupam mais espaço na SERP e ajudam o sistema a combinar mensagens mais úteis.";
      if (text.includes("termos")) return "O relatório de termos revela a distância entre o que você acha que está comprando e o que o usuário realmente digitou.";
      return "Pergunte-se sempre: este elemento está melhorando a relevância entre busca, mensagem e página, ou só aumentando volume?";
    }
    if (subject === "Traqueamento") {
      if (text.includes("pixel")) return "Pixel é importante, mas não substitui GA4 nem GTM. Cada peça cobre uma parte da mensuração e da governança da coleta.";
      if (text.includes("evento")) return "Evento é um registro de ação. Conversão ou key event é o evento que você escolhe tratar como mais valioso para leitura e/ou otimização.";
      if (text.includes("gtm")) return "GTM acelera a gestão porque centraliza disparos, versionamento e depuração sem depender de alteração manual espalhada pelo site.";
      if (text.includes("duplic")) return "Evento duplicado cria ruído estatístico, contamina o algoritmo e pode inflar leitura de performance.";
      if (text.includes("capi") || text.includes("servidor")) return "CAPI fortalece a mensuração ao enviar sinais também do servidor, reduzindo perdas típicas do navegador.";
      return "Sempre volte à pergunta central: este dado está sendo coletado do jeito certo, com o valor certo e no lugar certo da jornada?";
    }
    if (subject === "n8n" || subject === "n8n + CRM") {
      if (text.includes("trigger") || text.includes("gatilho")) return "Trigger define o começo da automação. Sem ele claro, o fluxo até pode existir, mas não sabe quando deve começar.";
      if (text.includes("webhook")) return "Webhook é uma porta de entrada. Ele recebe dados de fora e dispara o restante do workflow.";
      if (text.includes("erro") || text.includes("debug")) return "Fluxo bom não é o que nunca falha; é o que avisa, registra e permite corrigir rápido quando falha.";
      if (text.includes("planilha") || text.includes("crm")) return "Enviar dado para planilha ou CRM não é fim em si mesmo. O valor está em transformar dado em próxima ação.";
      if (text.includes("follow")) return "Follow-up automatizado só funciona quando tem regra clara, dono da tarefa e momento adequado.";
      return "Traduza este bloco para a prática: qual processo repetitivo da sua rotina pode virar fluxo confiável com começo, decisão e saída bem definidos?";
    }
    if (subject === "CRM") {
      if (text.includes("pipeline")) return "Pipeline é o mapa visual do processo comercial. Ele existe para reduzir ambiguidade e mostrar o próximo passo de cada lead.";
      if (text.includes("lead quente") || text.includes("sla")) return "Lead quente esfria rápido quando não há tempo de resposta adequado. SLA disciplina essa urgência.";
      if (text.includes("follow")) return "Follow-up não é insistência vazia. É continuidade estruturada de uma conversa com contexto e intenção.";
      if (text.includes("gargalo")) return "Gargalo comercial precisa ser lido por etapa: resposta, qualificação, reunião, proposta e fechamento.";
      return "Pergunte sempre: esta regra do CRM melhora clareza de decisão e velocidade de ação, ou é só campo a mais para preencher?";
    }
    if (subject === "Prospecção ativa") {
      if (text.includes("icp")) return "ICP não é uma descrição genérica do cliente ideal. É um recorte que melhora sua chance de acerto na abordagem e no fechamento.";
      if (text.includes("decisor") || text.includes("lead")) return "Falar com o decisor certo economiza ciclos. Falar com o contato errado cria falsa sensação de prospecção.";
      if (text.includes("qualifica")) return "Qualificar antes do contato eleva relevância da mensagem e reduz desperdício de energia com empresa sem aderência.";
      return "Toda prospecção melhora quando você sabe quem abordar, por que abordar e qual hipótese de dor quer validar.";
    }
    if (subject === "Vendas") {
      if (text.includes("dor") || text.includes("diagn")) return "Diagnóstico forte revela impacto, urgência e contexto. Sem isso, proposta vira pacote genérico com preço solto.";
      if (text.includes("obje")) return "Objeção mal lida parece resistência; objeção bem lida costuma ser pedido de contexto, segurança ou enquadramento melhor.";
      if (text.includes("fech")) return "Fechamento é consequência de condução clara. Sem pedido de próximo passo, a call termina e a venda evapora.";
      return "Venda consultiva exige escuta, síntese e condução. O objetivo não é vencer o cliente numa argumentação, mas ajudá-lo a decidir.";
    }
    return "Use este bloco para conectar o estudo ao seu trabalho real. Quando a ideia entra na rotina, ela deixa de ser conteúdo e vira ferramenta.";
  }

  function quizAnswer(lesson, question) {
    const guide = subjectGuide(lesson.subject);
    const bulletLine = Array.isArray(lesson.bullets) ? lesson.bullets.slice(0, 2).join(" e ") : "";
    if (lesson.type === "revisao") return `Nesta revisão, a resposta boa é a que consegue recuperar a lógica da semana sem depender da apostila aberta. Use o objetivo da aula — ${escapeHtml(lesson.objective)} — e conecte isso com ${escapeHtml(bulletLine)}. Se a sua resposta só repete palavras soltas, ainda falta domínio operacional.`;
    if (lesson.type === "teste") return `No teste prático, a melhor resposta mostra critério. Ela precisa transformar ${escapeHtml(lesson.task)} em passos observáveis, justificando hipótese, ação e forma de validação. Pense na régua central deste assunto: ${escapeHtml(guide.core)}`;
    return `Uma boa resposta precisa conectar a pergunta ao objetivo da aula — ${escapeHtml(lesson.objective)} — e ao núcleo do assunto: ${escapeHtml(guide.core)}. Sempre que possível, amarre sua resposta a ${escapeHtml(bulletLine)} e a uma decisão prática da conta ou do processo.`;
  }

  function buildReviewSection(lesson, previous) {
    const prompts = Array.isArray(lesson.review) && lesson.review.length ? lesson.review : [`Sem consultar, explique o ponto central de “${previous ? previous.title : "a aula anterior"}”.`, "Cite 3 ideias que ainda estão claras na memória.", "O que você aplicaria hoje deste conteúdo?", "Qual foi a maior confusão conceitual até aqui?"];
    return `
      <section class="pro-section">
        <span class="section-label">1. Revisão ativa da aula anterior</span>
        <h2>Comece puxando da memória</h2>
        <p>Antes de estudar o conteúdo de hoje, recupere ativamente o que veio antes. O objetivo não é acertar tudo de primeira, e sim revelar o que já está consolidado e o que ainda precisa de reforço.</p>
        <div class="quiz-list">${prompts.map((item, index) => `<div class="quiz-item"><strong>Pergunta ${index + 1}</strong><p>${escapeHtml(item)}</p></div>`).join("")}</div>
        <div class="quote-box">Regra da etapa: responda primeiro sem olhar. Só depois compare com suas anotações ou com a própria apostila.</div>
      </section>
    `;
  }

  function buildContentCore(lesson) {
    const guide = subjectGuide(lesson.subject);
    return `
      <section class="pro-section">
        <span class="section-label">2. Modelo mental da aula</span>
        <h2>O que você precisa entender de verdade hoje</h2>
        <p>${escapeHtml(guide.core)}</p>
        <p>${escapeHtml(guide.why)}</p>
        <div class="note-strong"><strong>Ponto-chave:</strong> ${escapeHtml(lesson.objective)}</div>
        <div class="three-col" style="margin-top:16px">${(lesson.bullets || []).map((bullet) => `<div class="map-card"><h3>${escapeHtml(bullet)}</h3><p>${escapeHtml(expandBullet(lesson.subject, bullet))}</p></div>`).join("")}</div>
      </section>
      <section class="pro-section">
        <span class="section-label">3. Exemplo guiado</span>
        <h2>Como este conteúdo aparece no mundo real</h2>
        <p>${escapeHtml(guide.example)}</p>
        <div class="truth-grid">
          <div class="truth-card bad"><h3>Aplicação fraca</h3><p>Executar a tarefa sem hipótese, sem critério de leitura e sem ligação com o objetivo da conta ou do processo.</p></div>
          <div class="truth-card good"><h3>Aplicação melhor</h3><p>Usar o conteúdo para tomar uma decisão mais limpa, reduzir ruído operacional e aprender algo observável com a própria execução.</p></div>
        </div>
      </section>
    `;
  }

  function buildReviewCore(lesson, weekLessons) {
    const contentLessons = weekLessons.filter((item) => item.type === "conteudo");
    return `
      <section class="pro-section">
        <span class="section-label">2. Síntese da semana</span>
        <h2>O que esta semana quis te ensinar</h2>
        <p>Uma boa revisão não repete textos. Ela reorganiza o que foi estudado em um modelo mental único. Nesta semana, o objetivo é reconectar os blocos estudados e testar se eles já funcionam como ferramenta de decisão.</p>
        <div class="synthesis-grid">${contentLessons.map((item) => `<div class="synthesis-card"><h3>Dia ${item.dayNumber} · ${escapeHtml(item.title)}</h3><p>${escapeHtml(item.objective)}</p></div>`).join("")}</div>
        <div class="note-strong"><strong>Meta da revisão:</strong> ${escapeHtml(lesson.objective)}</div>
      </section>
      <section class="pro-section">
        <span class="section-label">3. Recuperação sem consulta</span>
        <h2>Reconstrua a semana com suas palavras</h2>
        <div class="quiz-list">${contentLessons.map((item, index) => `<div class="quiz-item"><strong>Bloco ${index + 1}</strong><p>Explique com suas palavras o ponto central de “${escapeHtml(item.title)}” e diga como isso melhora uma decisão prática.</p></div>`).join("")}</div>
      </section>
    `;
  }

  function buildTestCore(lesson) {
    const guide = subjectGuide(lesson.subject);
    return `
      <section class="pro-section">
        <span class="section-label">2. Missão prática</span>
        <h2>Hoje a aula vira entrega</h2>
        <p>O foco do teste é transformar o conhecimento da semana em uma execução verificável. Você não precisa “parecer técnico”; precisa construir um raciocínio que consiga ser defendido com clareza.</p>
        <div class="framework">
          <div class="framework-step"><div class="step-n">1</div><div><strong>Defina o objetivo da tarefa</strong><p>${escapeHtml(lesson.objective)}</p></div></div>
          <div class="framework-step"><div class="step-n">2</div><div><strong>Converta a missão em etapas</strong><p>${escapeHtml(lesson.task)}</p></div></div>
          <div class="framework-step"><div class="step-n">3</div><div><strong>Use a régua do assunto</strong><p>${escapeHtml(guide.core)}</p></div></div>
        </div>
      </section>
      <section class="pro-section">
        <span class="section-label">3. Critério de qualidade</span>
        <h2>Como saber se sua entrega ficou boa</h2>
        <div class="three-col" style="margin-top:16px">
          <div class="check-card"><h3>Diagnóstico</h3><p>A resposta parte de dados, sinais ou etapas observáveis, não de sensação vaga.</p></div>
          <div class="check-card"><h3>Hipótese</h3><p>Existe uma explicação clara para a ação escolhida, conectada ao objetivo da tarefa.</p></div>
          <div class="check-card"><h3>Validação</h3><p>Você sabe o que observar depois para dizer se acertou ou não.</p></div>
        </div>
      </section>
    `;
  }

  function buildAppliedExercise(lesson) {
    return `
      <section class="pro-section">
        <span class="section-label">4. Exercício aplicado</span>
        <h2>Leve o conteúdo para o seu contexto</h2>
        <p>O ponto desta etapa é sair do abstrato. Use seu cliente, sua conta, seu processo comercial ou um caso real recente sempre que possível.</p>
        <div class="exercise-grid">
          <div class="exercise-card"><h3>Tarefa principal</h3><p>${escapeHtml(lesson.task)}</p><ul><li>Escreva a situação atual em 3 a 5 linhas.</li><li>Explique por que esta tarefa importa agora.</li><li>Liste os critérios que usará para avaliar a qualidade da resposta.</li></ul></div>
          <div class="exercise-card"><h3>Checklist de qualidade</h3><ul><li>A tarefa está ligada ao objetivo da aula.</li><li>Existe critério de decisão, não só opinião.</li><li>Você consegue explicar o raciocínio sem enrolar.</li><li>O resultado pode ser reutilizado na rotina.</li></ul></div>
        </div>
        <div class="board"><h3>Quadro de resposta</h3><p>Use este espaço como modelo visual e depois replique no seu caderno, Notion, planilha ou documento.</p><div class="board-lines"><div class="board-line"></div><div class="board-line"></div><div class="board-line"></div><div class="board-line"></div><div class="board-line"></div><div class="board-line"></div></div></div>
      </section>
    `;
  }

  function buildQuizSection(lesson) {
    const questions = Array.isArray(lesson.quiz) && lesson.quiz.length ? lesson.quiz : ["Explique o ponto central desta aula com suas palavras.", "Qual erro esta aula te ajuda a evitar?", "Como você aplicaria isso hoje?"];
    return `
      <section class="pro-section">
        <span class="section-label">5. Mini quiz com gabarito</span>
        <h2>Teste se a ideia realmente ficou</h2>
        <div class="quiz-list">${questions.map((question, index) => `<div class="quiz-item"><strong>${index + 1}. ${escapeHtml(question)}</strong><details class="answer"><summary>Ver gabarito comentado</summary><p>${quizAnswer(lesson, question)}</p></details></div>`).join("")}</div>
      </section>
    `;
  }

  function buildLanguageSection(lesson) {
    const guide = subjectGuide(lesson.subject);
    const englishTasks = lesson.english && Array.isArray(lesson.english.tasks) ? lesson.english.tasks : [];
    const japaneseTasks = lesson.japanese && Array.isArray(lesson.japanese.tasks) ? lesson.japanese.tasks : [];
    return `
      <section class="pro-section">
        <span class="section-label">6. Inglês e japonês aplicados</span>
        <h2>Fechamento curto para consolidar</h2>
        <div class="lang-grid">
          <div class="micro-card"><h3>Inglês · ${escapeHtml((lesson.english && lesson.english.goal) || "10 a 15 minutos")}</h3><p>Vocabulário útil do assunto de hoje: <strong>${escapeHtml(guide.english.join(", "))}</strong>.</p><ul>${englishTasks.map((task) => `<li>${escapeHtml(task)}</li>`).join("")}</ul></div>
          <div class="micro-card"><h3>Japonês · ${escapeHtml((lesson.japanese && lesson.japanese.goal) || "10 a 15 minutos")}</h3><p>Vocabulário útil para repetição: <strong>${escapeHtml(guide.japanese.join(", "))}</strong>.</p><ul>${japaneseTasks.map((task) => `<li>${escapeHtml(task)}</li>`).join("")}</ul></div>
        </div>
      </section>
    `;
  }

  function buildErrorNotebook(lesson) {
    const guide = subjectGuide(lesson.subject);
    return `
      <section class="pro-section">
        <span class="section-label">7. Caderno de erros</span>
        <h2>Registre onde você ainda escorrega</h2>
        <p>Fechar a aula sem registrar erro mantém a ilusão de domínio. Fechar com erro escrito transforma estudo em melhoria real.</p>
        <div class="three-col" style="margin-top:16px">
          <div class="glossary-card"><h3>Erro de conceito</h3><p>O que ainda ficou confuso sobre ${escapeHtml(lesson.title.toLowerCase())}?</p></div>
          <div class="glossary-card"><h3>Erro de execução</h3><p>Em qual momento da prática você tende a travar ou simplificar demais?</p></div>
          <div class="glossary-card"><h3>Erro recorrente</h3><p>${escapeHtml(guide.errors[0] || "Anote aqui o erro que mais se repete na sua rotina.")}</p></div>
        </div>
        <div class="quote-box">Amanhã, antes da próxima aula, volte neste bloco por 3 a 5 minutos. É aqui que a revisão espaçada começa a funcionar a seu favor.</div>
      </section>
    `;
  }

  function buildReferences(lesson) {
    const refs = refsFor(lesson.subject);
    return `
      <section class="pro-section">
        <span class="section-label">8. Base consultada</span>
        <h2>Referências e apoio</h2>
        <p>Estas referências ajudam a manter o conteúdo conectado com a documentação oficial ou com a base metodológica usada no projeto.</p>
        <div class="reference-list">${refs.map((ref) => `<a href="${escapeHtml(ref.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(ref.title)}<small>${escapeHtml(ref.desc)}</small></a>`).join("")}</div>
      </section>
    `;
  }

  function heroFor(lesson) {
    const guide = subjectGuide(lesson.subject);
    return `
      <section class="hero-pro">
        <div class="hero-box">
          <span class="section-label">Resultado esperado</span>
          <h2>O que você precisa sair sabendo hoje</h2>
          <p>${escapeHtml(lesson.objective)}</p>
          <ul>
            <li><strong>Compreender</strong> o núcleo de ${escapeHtml(lesson.title.toLowerCase())}.</li>
            <li><strong>Aplicar</strong> o conteúdo em um caso real do seu contexto.</li>
            <li><strong>Evitar</strong> erros como ${escapeHtml(guide.errors.join(" / "))}.</li>
          </ul>
          <div class="eyeline"><span class="pill">${escapeHtml(prettyWeekday(lesson.weekday))} · Semana ${lesson.week} · Dia ${lesson.dayNumber}</span><span class="pill">${escapeHtml(lesson.subject)} · ${escapeHtml(lesson.type)}</span><span class="pill">Saída prática: 1 entrega aplicável</span></div>
        </div>
        <div class="mini-grid">
          <div class="mini-box"><strong>Por que isto importa</strong><p>${escapeHtml(guide.why)}</p></div>
          <div class="mini-box"><strong>Erro comum</strong><p>${escapeHtml(guide.errors[0] || "Revisar sem critério e aplicar sem hipótese.")}</p></div>
          <div class="mini-box"><strong>Exemplo real</strong><p>${escapeHtml(guide.example)}</p></div>
          <div class="mini-box"><strong>Meta da aula</strong><p>${escapeHtml(lesson.task)}</p></div>
        </div>
      </section>
    `;
  }

  function buildMainContent(lesson, previous, weekLessons) {
    return [buildReviewSection(lesson, previous), lesson.type === "revisao" ? buildReviewCore(lesson, weekLessons) : lesson.type === "teste" ? buildTestCore(lesson) : buildContentCore(lesson), buildAppliedExercise(lesson), buildQuizSection(lesson), buildLanguageSection(lesson), buildErrorNotebook(lesson), buildReferences(lesson)].join("");
  }

  function createPageShell(lesson, number, previous, weekLessons) {
    const title = `Semana ${lesson.week} · Dia ${lesson.dayNumber} · ${lesson.title}`;
    const footerText = `Apostila ${String(number).padStart(3, "0")} gerada a partir do cronograma oficial do projeto.`;
    return `
      <style>${loadingStyle}</style>
      <main class="lesson-shell">
        <div class="container">
          <div class="lesson-pro">
            <article class="card lesson-card">
              <div class="lesson-breadcrumb"><a href="../index.html">Cronograma</a><span>•</span><span>Semana ${lesson.week}</span><span>•</span><span>Dia ${lesson.dayNumber}</span></div>
              <div class="eyebrow">Apostila · ${escapeHtml(prettyWeekday(lesson.weekday))} · ${escapeHtml(lesson.subject)}</div>
              <h1 class="lesson-title">${escapeHtml(title)}</h1>
              <p class="lesson-subtitle">${escapeHtml(lesson.objective)}</p>
              ${heroFor(lesson)}
              <div class="section-stack">${buildMainContent(lesson, previous, weekLessons)}</div>
              <div class="mark-box"><div><strong>Marcar esta apostila como concluída</strong><p>O status é salvo no navegador deste dispositivo para aparecer no cronograma.</p></div><label><input id="completion-switch" class="switch" type="checkbox" aria-label="Marcar apostila como concluída"></label></div>
              <div class="lesson-footer"><div class="footer-actions"><a class="btn btn-secondary" href="../index.html">Voltar ao cronograma</a><a class="btn btn-secondary" id="prev-lesson-link" href="../index.html">Apostila anterior</a><a class="btn btn-primary" id="next-lesson-link" href="#" aria-disabled="true">Próxima apostila</a></div></div>
            </article>
            <aside class="card aside-card">
              <h3>Régua da aula</h3>
              <p>${escapeHtml(subjectGuide(lesson.subject).core)}</p>
              <div class="status-row">
                <div class="aside-mini"><strong>Semana</strong><span class="small-muted">${escapeHtml(plan.weeks.find((w) => w.week === lesson.week)?.theme || "")}</span></div>
                <div class="aside-mini"><strong>Tipo</strong><span class="small-muted">${escapeHtml(lesson.type)}</span></div>
                <div class="aside-mini"><strong>Foco</strong><span class="small-muted">${escapeHtml((plan.weeks.find((w) => w.week === lesson.week)?.focus || "").slice(0, 110))}</span></div>
                <div class="aside-mini"><strong>Saída prática</strong><span class="small-muted">${escapeHtml(lesson.task)}</span></div>
              </div>
              <div class="callout" style="margin-top:16px"><strong>Checklist rápido</strong><p>Antes de encerrar, confirme se você consegue explicar o conteúdo sem depender da leitura literal.</p></div>
              <div class="aside-check"><label><input type="checkbox"> Entendi o objetivo da aula.</label><label><input type="checkbox"> Consigo aplicar o conteúdo a um caso real.</label><label><input type="checkbox"> Registrei pelo menos 1 erro meu.</label><label><input type="checkbox"> Fiz o mini quiz com gabarito.</label><label><input type="checkbox"> Revisei inglês e japonês.</label></div>
              <div class="timeline-card" style="margin-top:16px"><h3>Resumo honesto</h3><p>Se você ainda precisa reler tudo para explicar o conteúdo, a aula ainda não virou ferramenta. Volte ao exercício aplicado e reforce a lógica em voz alta.</p></div>
              <div class="insight-card" style="margin-top:16px"><h3>O que revisar antes da próxima</h3><ul>${(lesson.bullets || []).slice(0, 4).map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("")}</ul></div>
            </aside>
          </div>
        </div>
      </main>
      <footer class="footer"><div class="container">${escapeHtml(footerText)}</div></footer>
    `;
  }

  function setCompletion(lesson, number) {
    const toggle = document.getElementById("completion-switch");
    if (!toggle) return;
    const state = readState();
    toggle.checked = !!state[lesson.id];
    toggle.addEventListener("change", function () {
      const next = readState();
      next[lesson.id] = this.checked;
      saveState(next);
      localStorage.setItem(`seiji.study.complete.${lessonFile(number).replace(".html", "")}`, String(!!this.checked));
    });
  }

  async function wireNavigation(number) {
    const prevLink = document.getElementById("prev-lesson-link");
    const nextLink = document.getElementById("next-lesson-link");
    const prevNumber = number - 1;
    const nextNumber = number + 1;

    if (prevLink) {
      if (prevNumber >= 1) {
        prevLink.href = lessonFile(prevNumber);
      } else {
        prevLink.href = "../index.html";
        prevLink.textContent = "Voltar ao cronograma";
      }
    }

    if (!nextLink) return;
    if (nextNumber > plan.lessons.length) {
      nextLink.href = "../index.html";
      nextLink.textContent = "Fim do cronograma";
      nextLink.removeAttribute("aria-disabled");
      nextLink.classList.remove("next-disabled");
      return;
    }

    const nextFile = lessonFile(nextNumber);
    const apiUrl = `https://api.github.com/repos/${repoConfig.owner}/${repoConfig.repo}/contents/${repoConfig.lessonsDir}/${nextFile}`;

    try {
      const response = await fetch(apiUrl, { headers: { Accept: "application/vnd.github+json" } });
      if (response.ok) {
        nextLink.href = nextFile;
        nextLink.textContent = "Próxima apostila";
        nextLink.removeAttribute("aria-disabled");
        nextLink.classList.remove("next-disabled");
      } else {
        nextLink.href = "#";
        nextLink.textContent = "Próxima apostila ainda não publicada";
        nextLink.setAttribute("aria-disabled", "true");
        nextLink.classList.add("next-disabled");
      }
    } catch {
      nextLink.href = "#";
      nextLink.textContent = "Próxima apostila ainda não publicada";
      nextLink.setAttribute("aria-disabled", "true");
      nextLink.classList.add("next-disabled");
    }
  }

  function renderError(message) {
    document.body.innerHTML = `
      <style>${loadingStyle}</style>
      <main class="lesson-error">
        <div class="container">
          <article class="card">
            <span class="eyebrow">Erro de carregamento</span>
            <h1>Apostila não encontrada</h1>
            <p>${escapeHtml(message)}</p>
            <div class="lesson-footer"><div class="footer-actions"><a class="btn btn-secondary" href="../index.html">Voltar ao cronograma</a></div></div>
          </article>
        </div>
      </main>
    `;
  }

  const number = lessonNumberFromPath();
  if (!number) {
    renderError("Não foi possível identificar o número da apostila pela URL.");
    return;
  }

  const lesson = plan.lessons[number - 1];
  if (!lesson) {
    renderError("Esta apostila ainda não está cadastrada no cronograma oficial.");
    return;
  }

  const previous = number > 1 ? plan.lessons[number - 2] : null;
  const weekLessons = plan.lessons.filter((item) => item.week === lesson.week);
  document.title = `Semana ${lesson.week} · Dia ${lesson.dayNumber} · ${lesson.title}`;
  document.body.innerHTML = createPageShell(lesson, number, previous, weekLessons);
  setCompletion(lesson, number);
  wireNavigation(number);
})();
