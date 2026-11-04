const CFG = {
  whats: '',
  form: '',
  taxa: 0.10 // 10% somente sobre serviços concluídos
};

const CATS = [
  ['Elétrica', '⚡'],
  ['Encanamento', '💧'],
  ['Limpeza', '✨'],
  ['Pintura', '🖌️'],
  ['Montagem', '🔧']
];

const BASE = {
  'Instalação de chuveiros': 90,
  'Troca de tomadas': 60,
  'Reparos elétricos': 80,
  'Desentupimento': 85,
  'Reparo em torneira': 70,
  'Troca de sifão': 65,
  'Faxina residencial': 110,
  'Passar roupas': 80,
  'Pintura de cômodo': 130,
  'Retoque de portas': 80,
  'Montagem de armário': 100,
  'Instalação de suporte de TV': 75
};

const normStr = s => (s || '')
  .toString()
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .trim();

const CAT_KEYWORDS = {
  'Elétrica': ['eletricista', 'chuveiro', 'tomada', 'disjuntor', 'fiação', 'fiacao', 'curto', 'iluminação', 'iluminacao', 'luz', 'lustre', 'interruptor', '110v', '220v', 'quadro', 'energia', 'reparo elétrico', 'reparo eletrico', 'eletrica'],
  'Encanamento': ['encanador', 'vazamento', 'cano', 'torneira', 'sifão', 'sifao', 'pia', 'ralo', 'privada', 'descarga', 'desentupimento', 'esgoto', 'água', 'agua', 'infiltração', 'infiltracao', 'caixa acoplada', 'hidráulica', 'hidraulica', 'encanamento'],
  'Limpeza': ['diarista', 'faxina', 'passar', 'roupa', 'higienização', 'higienizacao', 'vidro', 'limpeza', 'pós-obra', 'pos-obra', 'piso', 'azulejo', 'banheiro', 'cozinha', 'organização', 'organizacao'],
  'Pintura': ['pintor', 'parede', 'teto', 'tinta', 'massa', 'corrida', 'textura', 'gesso', 'porta', 'verniz', 'acabamento', 'lixamento', 'rolo', 'pintura'],
  'Montagem': ['montador', 'móvel', 'movel', 'moveis', 'guarda-roupa', 'armário', 'armario', 'mesa', 'estante', 'cama', 'suporte', 'tv', 'painel', 'nicho', 'prateleira', 'dobradiça', 'dobradica', 'gaveta', 'montagem']
};

// Coordenadas Reais de São Paulo (Pinheiros / Faria Lima / Rebouças - USP)
const USER_COORDS = [-23.5615, -46.6850];

// Raio de busca atual em km (dinâmico: 3, 5, 8, 12 km)
let currentRadiusKm = 5;

// Estilo do mapa: 'modern' (1) Moderno), 'street' (2) Ruas), 'sat' (Satélite)
let mapStyle = 'modern';

const MAP_STYLES = {
  modern: {
    base: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    ref: null,
    maxNative: 19,
    label: '1) Moderno'
  },
  street: {
    base: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    ref: null,
    maxNative: 19,
    label: '2) Ruas'
  },
  sat: {
    base: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    ref: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
    maxNative: 19,
    label: 'Satélite'
  }
};

// Catálogo Expandido de Profissionais com Fotos de Rosto Reais, Portfólio e Avaliações Verificadas
const P0 = [
  // --- Dentro de 5 km (Raio Padrão) ---
  {
    id: 'p1',
    n: 'João Silva',
    foto: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=300&q=80',
    t: 'Eletricista residencial',
    nota: 4.9,
    av: 38,
    km: 1.8,
    lat: -23.5540,
    lng: -46.6820,
    base: 80,
    cats: ['Elétrica'],
    sobre: 'Eletricista há mais de 10 anos. Atendimento com segurança, pontualidade e garantia de serviço. Deixo tudo limpo ao final.',
    srv: ['Instalação de chuveiros', 'Troca de tomadas', 'Reparos elétricos'],
    portfolio: [
      { url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80', title: 'Quadro de Disjuntores Novo', desc: 'Instalação de barramento blindado e dispositivo DR para proteção da residência.' },
      { url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80', title: 'Infraestrutura e Fiação Residencial', desc: 'Troca de cabos antigos de 4mm por fiação antichamas em apartamento.' },
      { url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80', title: 'Iluminação Embutida e Tomadas', desc: 'Instalação de spots de LED e novo padrão de tomadas 10A e 20A.' }
    ],
    rev: [
      ['Mariana R.', 5, 'Chegou no horário e deixou tudo impecável. Recomendo muito!', 'há 2 dias'],
      ['Paulo H.', 5, 'Resolveu o disjuntor que caía há semanas em 20 minutos.', 'há 1 semana'],
      ['Renata C.', 5, 'Muito educado, explicou o motivo do aquecimento e trocou a tomada rápido.', 'há 2 semanas'],
      ['Carlos B.', 4, 'Serviço muito bem feito, com garantia e preço justo.', 'há 1 mês']
    ]
  },
  {
    id: 'p2',
    n: 'Carlos Souza',
    foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    t: 'Instalações elétricas',
    nota: 4.8,
    av: 27,
    km: 3.2,
    lat: -23.5720,
    lng: -46.6980,
    base: 85,
    cats: ['Elétrica'],
    sobre: 'Especialista em fiação antiga e reformas elétricas em apartamentos.',
    srv: ['Instalação de chuveiros', 'Troca de tomadas'],
    portfolio: [
      { url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80', title: 'Medição de Carga e Balanceamento', desc: 'Teste de aterramento e balanceamento de circuitos bifásicos.' },
      { url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80', title: 'Quadro Residencial Atualizado', desc: 'Reforma do quadro de distribuição antigo com identificação dos circuitos.' }
    ],
    rev: [
      ['Fernanda L.', 5, 'Explicou o preço antes e não cobrou nada a mais.', 'há 3 dias'],
      ['Ricardo M.', 4, 'Muito bom serviço, atrasou 10 min por causa da chuva.', 'há 2 semanas'],
      ['Marcos V.', 5, 'Instalou dois chuveiros com fiação dedicada de 6mm. Impecável!', 'há 3 semanas']
    ]
  },
  {
    id: 'p3',
    n: 'Marcos Lima',
    foto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    t: 'Eletricista predial',
    nota: 4.7,
    av: 19,
    km: 4.8,
    lat: -23.5820,
    lng: -46.6710,
    base: 100,
    cats: ['Elétrica'],
    sobre: 'Atendimento técnico com instrumentos certificados e garantia por escrito.',
    srv: ['Reparos elétricos', 'Troca de tomadas'],
    portfolio: [
      { url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80', title: 'Instalação de Lustres e Pendentes', desc: 'Instalação segura de iluminação decorativa em gesso.' },
      { url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80', title: 'Troca de Fiação Geral', desc: 'Substituição completa de rede elétrica predial.' }
    ],
    rev: [
      ['Ana C.', 5, 'Profissional muito organizado e educado.', 'há 4 dias'],
      ['Lucas G.', 5, 'Trouxe todo o ferramental próprio e deixou a área limpa.', 'há 3 semanas'],
      ['Juliana M.', 4, 'Bom atendimento, pontual e atencioso.', 'há 1 mês']
    ]
  },
  {
    id: 'p4',
    n: 'Roberto Mendes',
    foto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
    t: 'Encanador e caça-vazamentos',
    nota: 4.9,
    av: 31,
    km: 1.4,
    lat: -23.5650,
    lng: -46.6780,
    base: 85,
    cats: ['Encanamento'],
    sobre: 'Especialista em vazamentos, desentupimentos e troca de reparos hidráulicos.',
    srv: ['Desentupimento', 'Reparo em torneira', 'Troca de sifão'],
    portfolio: [
      { url: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80', title: 'Tubulação Hidráulica Nova', desc: 'Troca de ramal de água fria com tubulação termofusão sem vazamentos.' },
      { url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80', title: 'Instalação de Misturador Monocomando', desc: 'Instalação e vedação perfeita de cuba e torneira com sifão metálico.' },
      { url: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=600&q=80', title: 'Caça-Vazamento e Reparo de Válvula', desc: 'Identificação eletrônica de infiltração sem quebrar azulejo desnecessário.' }
    ],
    rev: [
      ['Lucas V.', 5, 'Identificou o vazamento na hora sem quebrar a parede errada.', 'há 1 dia'],
      ['Camila P.', 5, 'Rápido e preço justo! Não cobrou nada a mais.', 'há 1 semana'],
      ['Eduardo F.', 5, 'Trocou o reparo da caixa acoplada e regulou a bóia perfeitamente.', 'há 2 semanas'],
      ['Tatiane R.', 4, 'Muito prestativo, serviço limpo e garantido.', 'há 1 mês']
    ]
  },
  {
    id: 'p5',
    n: 'Clara Vasconcelos',
    foto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    t: 'Diarista e higienização',
    nota: 5.0,
    av: 42,
    km: 2.1,
    lat: -23.5510,
    lng: -46.6940,
    base: 110,
    cats: ['Limpeza'],
    sobre: 'Diarista experiente com referências no bairro. Cuidado extremo com móveis e organização.',
    srv: ['Faxina residencial', 'Passar roupas'],
    portfolio: [
      { url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80', title: 'Higienização e Limpeza Fina', desc: 'Limpeza profunda de pisos de madeira, rodapés e estofados.' },
      { url: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=600&q=80', title: 'Cozinha e Armários Organizados', desc: 'Desengorduramento de fogão, coifa e higienização interna de armários.' },
      { url: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=600&q=80', title: 'Banheiro Desinfetado e Vidros Cristalinos', desc: 'Remoção de limo de rejunte e higienização completa de box blindex.' }
    ],
    rev: [
      ['Patrícia M.', 5, 'A melhor diarista que já contratei. Casa cheirosa e impecável.', 'há 2 dias'],
      ['Danilo S.', 5, 'Excelente, muito ágil e confiável. Entreguei a chave sem preocupação.', 'há 1 semana'],
      ['Bruna T.', 5, 'Muito caprichosa! Os vidros do apartamento ficaram transparentes de tão limpos.', 'há 3 semanas'],
      ['Marcelo O.', 5, 'Pontual, discreta e serviço de primeira linha.', 'há 1 mês']
    ]
  },
  {
    id: 'p6',
    n: 'Marcelo Ramos',
    foto: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80',
    t: 'Pintor residencial',
    nota: 4.9,
    av: 22,
    km: 2.8,
    lat: -23.5700,
    lng: -46.6720,
    base: 95,
    cats: ['Pintura'],
    sobre: 'Pintura fina e retoques em portas e gesso. Protejo o chão e os móveis com lona.',
    srv: ['Pintura de cômodo', 'Retoque de portas'],
    portfolio: [
      { url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80', title: 'Pintura Acetinada em Sala', desc: 'Aplicação de massa corrida, lixamento sem pó e tinta acrílica lavável.' },
      { url: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=600&q=80', title: 'Proteção Total com Lonas', desc: 'Isolamento de rodapés, pisos e móveis com lona e fita crepe profissional.' },
      { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80', title: 'Pintura Fina de Portas e Batentes', desc: 'Esmalte sintético à base de água com acabamento espelhado uniforme.' }
    ],
    rev: [
      ['Beatriz F.', 5, 'Trabalho de primeira e não sujou nada.', 'há 3 dias'],
      ['Fernando P.', 5, 'Cortou o teto com perfeição sem manchar a sanca de gesso.', 'há 2 semanas'],
      ['Claudia M.', 4, 'Muito bom pintor, rápido e caprichoso nos cantos.', 'há 1 mês']
    ]
  },
  {
    id: 'p7',
    n: 'Felipe Santos',
    foto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
    t: 'Montador de móveis',
    nota: 4.8,
    av: 35,
    km: 2.4,
    lat: -23.5620,
    lng: -46.7020,
    base: 75,
    cats: ['Montagem'],
    sobre: 'Montagem e desmontagem de armários, mesas, painéis e suportes com nível laser.',
    srv: ['Montagem de armário', 'Instalação de suporte de TV'],
    portfolio: [
      { url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80', title: 'Painel Ripado e Suporte de TV', desc: 'Instalação nivelada a laser com fiação embutida e fixação reforçada.' },
      { url: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=600&q=80', title: 'Guarda-Roupa de 6 Portas', desc: 'Montagem completa de armário grande com alinhamento preciso de gavetas.' },
      { url: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=600&q=80', title: 'Mesa de Jantar e Estante Modular', desc: 'Montagem com ferramentas pneumáticas sem riscar as peças.' }
    ],
    rev: [
      ['Rodrigo T.', 5, 'Montou o guarda-roupa com perfeição, alinhou todas as portas.', 'há 1 dia'],
      ['Sofia L.', 5, 'Super pontual, usou nível laser e não deixou nem um prego fora.', 'há 1 semana'],
      ['André K.', 4, 'Muito rápido e cuidadoso com as quinas dos móveis.', 'há 3 semanas']
    ]
  },

  // --- Prestadores em Raio Expandido (6 a 12 km) ---
  {
    id: 'p8',
    n: 'Thiago Silveira',
    foto: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80',
    t: 'Eletricista industrial e residencial',
    nota: 4.9,
    av: 44,
    km: 7.2,
    lat: -23.5950,
    lng: -46.7210,
    base: 90,
    cats: ['Elétrica'],
    sobre: 'Especialista em quadros elétricos de alta carga, disjuntores e padrão Enel.',
    srv: ['Instalação de chuveiros', 'Reparos elétricos'],
    portfolio: [
      { url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80', title: 'Entrada Padrão Enel e Trifásico', desc: 'Adequação de poste e medição trifásica com ART.' },
      { url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80', title: 'Manutenção Preventiva de Carga', desc: 'Termografia em conexões de alta amperagem.' }
    ],
    rev: [
      ['Gustavo B.', 5, 'Atendeu muito rápido mesmo morando um pouco mais afastado.', 'há 5 dias'],
      ['Rodrigo M.', 5, 'Resolveu o curto circuito do prédio com muita competência.', 'há 3 semanas']
    ]
  },
  {
    id: 'p9',
    n: 'Renato Barbosa',
    foto: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80',
    t: 'Encanador e desentupidora',
    nota: 4.8,
    av: 29,
    km: 8.5,
    lat: -23.5350,
    lng: -46.7250,
    base: 90,
    cats: ['Encanamento'],
    sobre: 'Equipamentos modernos para desentupimento sem quebra-quebra.',
    srv: ['Desentupimento', 'Troca de sifão'],
    portfolio: [
      { url: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80', title: 'Desobstrução e Troca de Ramais', desc: 'Desentupimento mecânico e troca de sifão sanfonado por rígido.' },
      { url: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=600&q=80', title: 'Válvula Hydra e Caixas de Gordura', desc: 'Limpeza e troca de reparos hidráulicos pesados.' }
    ],
    rev: [
      ['Vanessa T.', 5, 'Salvou o feriado desentupindo a pia da cozinha!', 'há 4 dias'],
      ['Fábio S.', 4, 'Ótimo serviço, pontual e muito transparente no valor.', 'há 2 semanas']
    ]
  },
  {
    id: 'p10',
    n: 'Simone Duarte',
    foto: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
    t: 'Diarista e limpeza pós-obra',
    nota: 5.0,
    av: 51,
    km: 6.8,
    lat: -23.5420,
    lng: -46.6600,
    base: 120,
    cats: ['Limpeza'],
    sobre: 'Limpeza pesada, vidros altos e organização residencial com agilidade.',
    srv: ['Faxina residencial', 'Passar roupas'],
    portfolio: [
      { url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80', title: 'Limpeza Pós-Obra em Cobertura', desc: 'Remoção de tinta em vidros e higienização pesada de porcelanato.' },
      { url: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=600&q=80', title: 'Organização de Despensa e Armários', desc: 'Padronização de potes e etiquetagem completa.' }
    ],
    rev: [
      ['Helena R.', 5, 'Perfeita! Muito atenciosa e detalhista.', 'há 2 dias'],
      ['Marcos A.', 5, 'Limpeza pós-reforma incrível, tirou todo o pó de gesso.', 'há 1 mês']
    ]
  },
  {
    id: 'p11',
    n: 'Eduardo Prado',
    foto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    t: 'Pintor e aplicador de texturas',
    nota: 4.8,
    av: 18,
    km: 9.8,
    lat: -23.6120,
    lng: -46.6620,
    base: 105,
    cats: ['Pintura'],
    sobre: 'Pintura externa, impermeabilização e textura projetada.',
    srv: ['Pintura de cômodo', 'Retoque de portas'],
    portfolio: [
      { url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80', title: 'Textura Projetada e Pintura Externa', desc: 'Aplicação de textura acrílica hidro-repelente em parede externa.' },
      { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80', title: 'Verniz e Restauração de Madeira', desc: 'Tratamento de deck e pergolado com verniz marítimo fosco.' }
    ],
    rev: [
      ['Alexandre M.', 5, 'Serviço profissional e caprichado.', 'há 1 semana'],
      ['Luciana V.', 4, 'Trabalho muito bom, entregou dentro do prazo combinado.', 'há 3 semanas']
    ]
  },
  {
    id: 'p12',
    n: 'Valter Nogueira',
    foto: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=300&q=80',
    t: 'Marceneiro e montador de planejados',
    nota: 4.9,
    av: 33,
    km: 11.2,
    lat: -23.6200,
    lng: -46.7150,
    base: 85,
    cats: ['Montagem'],
    sobre: 'Ajuste de portas de correr, dobradiças e montagem de móveis complexos.',
    srv: ['Montagem de armário', 'Instalação de suporte de TV'],
    portfolio: [
      { url: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=600&q=80', title: 'Armários Planejados de Cozinha', desc: 'Montagem e fixação em alvenaria com alinhamento milimétrico de portas.' },
      { url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80', title: 'Ajuste Fino de Portas de Correr', desc: 'Troca de roldanas e amortecedores em guarda-roupa embutido.' }
    ],
    rev: [
      ['Marina K.', 5, 'Montou uma cozinha inteira sem nenhum defeito.', 'há 3 dias'],
      ['Leandro B.', 5, 'Marceneiro de verdade, ajustou portas empenadas com facilidade.', 'há 2 semanas']
    ]
  }
];
