(function () {
  if (!window.studyPlan || !Array.isArray(window.studyPlan.lessons)) return;

  const lessonOverrides = {
    1: {
      objective: "Entender como separar aquisição, remarketing e recorrência sem misturar estágio de consciência, meta de campanha e expectativa de performance.",
      bullets: [
        "Campanha, conjunto e anúncio cumprem papéis diferentes na leitura da conta",
        "Topo, meio e fundo de funil mudam mensagem, público e expectativa de CPA",
        "Público frio, morno e quente não devem receber a mesma lógica de anúncio",
        "Misturar intenção diferente no mesmo conjunto destrói clareza de diagnóstico",
        "Estrutura boa é a que facilita decisão, não a que parece mais sofisticada"
      ],
      task: "Escolha um e-commerce real que você atende. Entregue um desenho de estrutura com 3 camadas: aquisição, remarketing e recorrência. Para cada camada, defina objetivo, público, tipo de criativo, métrica principal e o que faria você pausar ou escalar.",
      quiz: [
        "Qual é a diferença prática entre campanha, conjunto e anúncio quando você precisa diagnosticar um problema de performance?",
        "Em que situação faz sentido usar público de engajamento e por que isso não substitui remarketing de site?",
        "Que sinais mostram que sua estrutura está complexa demais para o volume de verba e dados disponíveis?"
      ],
      review: [
        "Escreva por que estudar tráfego de forma mais disciplinada é importante para sua renda, sua confiança e sua tomada de decisão.",
        "Defina o que seria, para você, uma conta de mídia bem estruturada.",
        "Liste três erros que você já cometeu ou vê com frequência ao montar campanhas.",
        "Explique como você pretende estudar sem transformar o plano em acúmulo de leitura sem aplicação.",
        "Escreva qual resultado concreto quer gerar nas próximas 12 semanas com este projeto."
      ],
      english: {
        goal: "10 a 15 minutos",
        tasks: [
          "Traduza e explique em português: campaign structure, cold audience, retargeting, funnel stage, conversion event.",
          "Escreva 3 frases em inglês aplicadas ao seu trabalho, por exemplo sobre prospecting, retargeting ou campaign performance.",
          "Leia as 3 frases em voz alta por 2 minutos, focando clareza e ritmo."
        ]
      },
      japanese: {
        goal: "10 a 15 minutos",
        tasks: [
          "Revise kana ou vocabulário básico por repetição ativa.",
          "Escreva 3 frases curtas ligadas a trabalho, estudo e rotina.",
          "Leia em voz alta por 2 minutos e tente reconhecer o que ainda trava sem consultar."
        ]
      }
    },
    2: {
      objective: "Aprender a escolher objetivo, verba, posicionamentos e naming de forma coerente com a fase da campanha e com a necessidade de leitura posterior.",
      bullets: [
        "Objetivo de campanha não é detalhe técnico: ele influencia como o sistema busca resultado",
        "ABO ajuda quando você precisa controlar teste e distribuição inicial com mais precisão",
        "CBO ajuda quando há volume e variação suficiente para o algoritmo redistribuir melhor",
        "Posicionamento automático é ponto de partida, não dogma intocável",
        "Naming bem feito reduz erro operacional, acelera análise e melhora comunicação"
      ],
      task: "Monte uma campanha de vendas para um cliente real usando sua convenção de nomenclatura. Entregue: nome da campanha, 2 conjuntos, 3 criativos, racional de ABO ou CBO, decisão sobre posicionamentos e regra de orçamento inicial.",
      quiz: [
        "Quando ABO tende a ser melhor escolha do que CBO em uma fase inicial de teste?",
        "Por que naming ruim parece detalhe pequeno, mas atrasa leitura, reporting e otimização?",
        "Em que cenário faz sentido sair de posicionamentos automáticos para um recorte mais controlado?"
      ],
      review: [
        "Sem consultar, reconstrua a lógica da aula anterior sobre estrutura por funil e públicos.",
        "Liste três decisões que hoje você tomaria de forma mais clara ao separar aquisição, remarketing e recorrência.",
        "Explique onde sua estrutura atual ainda mistura intenção ou estágio de consciência.",
        "Escreva um resumo de 5 linhas do que ficou vivo na memória sem reler a apostila.",
        "Registre qual ponto da aula anterior você ainda não conseguiria ensinar para outra pessoa."
      ],
      english: {
        goal: "10 a 15 minutos",
        tasks: [
          "Traduza e explique: campaign objective, budget allocation, automatic placements, ad set naming, creative testing.",
          "Escreva 3 frases em inglês sobre como você organizaria uma campaign structure.",
          "Leia em voz alta por 2 minutos e ajuste a pronúncia das palavras técnicas."
        ]
      },
      japanese: {
        goal: "10 a 15 minutos",
        tasks: [
          "Revise kana ou vocabulário básico por repetição ativa.",
          "Escreva 3 frases curtas ligadas a rotina profissional e estudo.",
          "Faça leitura em voz alta por 2 minutos, priorizando repetição consistente."
        ]
      }
    },
    3: {
      objective: "Ler CTR, CPM, CPC, CPA e frequência como conjunto de sinais, evitando conclusões rasas baseadas em uma única métrica isolada.",
      bullets: [
        "CTR ajuda a ler aderência entre anúncio e público, mas não decide sozinho",
        "CPC é consequência de combinação entre CPM, CTR e qualidade da entrega",
