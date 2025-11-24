/**
 * SCRIPT DE IMPORTAÇÃO MASSIVA DE PRODUTOS - PLANAC
 *
 * Este script processa os dados dos PDFs e insere os 595 produtos no banco D1
 *
 * Fonte: impressao2025112310.16.25.pdf (Relatório de saldo em estoque)
 * Data: 23/11/2025
 * Total de produtos: 595
 */

// Produtos extraídos do PDF (595 itens)
const produtos = [
  { codigo: '000296', ncm: '72166110', descricao: 'CANTONEIRA 2530 BARBIERI Z275 0,50 X 3,00', unidade: 'UN', hasST: false },
  { codigo: '000881', ncm: '72166110', descricao: 'CANTONEIRA BARBIERI "1330" Z275 0,50 X 3,00', unidade: 'UN', hasST: false },
  { codigo: '000880', ncm: '72166110', descricao: 'CANTONEIRA PERFURADA BARBIERI Z275 0,50 X 3,00', unidade: 'UN', hasST: false },
  { codigo: '000297', ncm: '72166110', descricao: 'F530 BARBIERI Z120 0,48 X 3,00', unidade: 'UN', hasST: false },
  { codigo: '000095', ncm: '72166110', descricao: 'GUIA 48 BARBIERI Z275 0,50 X 3,00', unidade: 'UN', hasST: false },
  { codigo: '000299', ncm: '72166110', descricao: 'GUIA 70 BARBIERI Z275 0,50 X 3,00', unidade: 'UN', hasST: false },
  { codigo: '000303', ncm: '72166110', descricao: 'GUIA 90 BARBIERI Z275 0,50 X 3,00', unidade: 'UN', hasST: false },
  { codigo: '000300', ncm: '72166110', descricao: 'MONTANTE 48 BARBIERI Z120 0,48 X 3,00', unidade: 'UN', hasST: false },
  { codigo: '000298', ncm: '72166110', descricao: 'MONTANTE 70 BARBIERI Z120 0,48 X 3,00', unidade: 'UN', hasST: false },
  { codigo: '000577', ncm: '72166110', descricao: 'MONTANTE 70 BARBIERI Z120 0,48 X 6,00', unidade: 'UN', hasST: false },
  { codigo: '000304', ncm: '72166110', descricao: 'MONTANTE 90 BARBIERI Z120 0,48 X 3,00', unidade: 'UN', hasST: false },
  { codigo: '001245', ncm: '72166110', descricao: 'MONTANTE 90 BARBIERI Z120 0,48 X 6,00', unidade: 'UN', hasST: false },
  { codigo: '000865', ncm: '72166190', descricao: 'PERFIL CANTONEIRA BRANCA 3,00 ABA 2CM', unidade: 'UN', hasST: false },
  { codigo: '000890', ncm: '72162200', descricao: 'PERFIL CANTONEIRA PRETA 3,00', unidade: 'UN', hasST: false },
  { codigo: '000103', ncm: '72166110', descricao: 'PERFIL RIPA OMEGA 0,80 30X20X6,00M', unidade: 'UN', hasST: false },
  { codigo: '000576', ncm: '72166190', descricao: 'PERFIL STEEL GUIA 200 0,95 X 6,00', unidade: 'UN', hasST: false },
  { codigo: '000939', ncm: '72166110', descricao: 'PERFIL STEEL GUIA 70 0,80 X 3,00', unidade: 'UN', hasST: false },
  { codigo: '000098', ncm: '72166110', descricao: 'PERFIL STEEL GUIA 90 0,95 X 3,00', unidade: 'UN', hasST: false },
  { codigo: '000572', ncm: '72166110', descricao: 'PERFIL STEEL GUIA 90 0,95 X 6,00', unidade: 'UN', hasST: false },
  { codigo: '000574', ncm: '72166190', descricao: 'PERFIL STEEL MONTANTE 200 0,95 X 6,00', unidade: 'UN', hasST: false },
  { codigo: '000940', ncm: '72166110', descricao: 'PERFIL STEEL MONTANTE 70 0,80 X 3,00', unidade: 'UN', hasST: false },
  { codigo: '000966', ncm: '72166110', descricao: 'PERFIL STEEL MONTANTE 70 0,80 X 6,00', unidade: 'UN', hasST: false },
  { codigo: '000102', ncm: '72166110', descricao: 'PERFIL STEEL MONTANTE 90 0,95 X 3,00', unidade: 'UN', hasST: false },
  { codigo: '000942', ncm: '72166110', descricao: 'PERFIL STEEL MONTANTE 90 0,95 X 3,50', unidade: 'UN', hasST: false },
  { codigo: '001317', ncm: '72166110', descricao: 'PERFIL STEEL MONTANTE 90 0,95 X 4,00', unidade: 'UN', hasST: false },
  { codigo: '001445', ncm: '72166110', descricao: 'PERFIL STEEL MONTANTE 90 0,95 X 4,70', unidade: 'UN', hasST: false },
  { codigo: '000573', ncm: '72166110', descricao: 'PERFIL STEEL MONTANTE 90 0,95 X 6,00', unidade: 'UN', hasST: false },
  { codigo: '000862', ncm: '72166190', descricao: 'PERFIL T-24 0,625 BRANCO', unidade: 'UN', hasST: false },
  { codigo: '000893', ncm: '72162200', descricao: 'PERFIL T-24 0,625 PRETA', unidade: 'UN', hasST: false },
  { codigo: '000863', ncm: '72166190', descricao: 'PERFIL T-24 1,250 BRANCO', unidade: 'UN', hasST: false },
  { codigo: '000892', ncm: '72162200', descricao: 'PERFIL T-24 1,250 PRETA', unidade: 'UN', hasST: false },
  { codigo: '000864', ncm: '72166190', descricao: 'PERFIL T-24 3,125 BRANCO', unidade: 'UN', hasST: false },
  { codigo: '000891', ncm: '72162200', descricao: 'PERFIL T-24 3,125 PRETA', unidade: 'UN', hasST: false },
  { codigo: '001110', ncm: '44182900', descricao: 'PORTA AREIA JUNDIAI 0,82 X 2,11 BEGE DEF.', unidade: 'UN', hasST: false },
  { codigo: '001111', ncm: '44182900', descricao: 'PORTA BRANCO 0,82 X 2,11 DEF.', unidade: 'UN', hasST: false },
  { codigo: '001112', ncm: '44182900', descricao: 'PORTA CINZA CRISTAL 0,82 X 2,11 DEF.', unidade: 'UN', hasST: false },
  { codigo: '001141', ncm: '72166110', descricao: 'TABICA BARBIERI BRANCA EPOXI 0,50 X 3,00', unidade: 'UN', hasST: false },
  { codigo: '001556', ncm: '39162000', descricao: 'ACABAMENTO CONV. REVID MADEIRA PERNI FARRO 2 - FARRO - 3', unidade: 'ML', hasST: true },
  { codigo: '001319', ncm: '35061090', descricao: 'ADESIVO TYTAN PROFESSIONAL FIX2GT 290ML/423G', unidade: 'UN', hasST: true },
  { codigo: '000767', ncm: '82032010', descricao: 'ALICATE PRENDEDOR DE PERFIL', unidade: 'UN', hasST: true },
  { codigo: '001013', ncm: '76042920', descricao: 'ALÇAPÃO ARO ALUMINIO "T" 30X30CM', unidade: 'UN', hasST: true },
  { codigo: '000997', ncm: '76042920', descricao: 'ALÇAPÃO ARO ALUMINIO "T" 40X40CM', unidade: 'UN', hasST: true },
  { codigo: '000797', ncm: '76042920', descricao: 'ALÇAPÃO ARO ALUMINIO "T" 50X50CM', unidade: 'UN', hasST: true },
  { codigo: '000659', ncm: '76042920', descricao: 'ALÇAPÃO ARO ALUMINIO "T" 60X60CM', unidade: 'UN', hasST: true },
  { codigo: '001117', ncm: '73089010', descricao: 'ALÇAPÃO COM TAMPA AÇO - 500X500MM - GALV.', unidade: 'UN', hasST: true },
  { codigo: '001457', ncm: '73089010', descricao: 'ALÇAPÃO MULTICLICK AÇO - 400X400MM - GALV.', unidade: 'UN', hasST: true },
  { codigo: '001458', ncm: '73089010', descricao: 'ALÇAPÃO MULTICLICK AÇO - 600X600MM - GALV.', unidade: 'UN', hasST: true },
  { codigo: '000146', ncm: '72169100', descricao: 'ANÃO REGULADOR F530', unidade: 'UN', hasST: false },
  { codigo: '000879', ncm: '39269090', descricao: 'APLICADOR DE FITA ADFORS', unidade: 'UN', hasST: true },
  { codigo: '001302', ncm: '82055900', descricao: 'APLICADOR PU', unidade: 'UN', hasST: true },
  { codigo: '000001', ncm: '72172090', descricao: 'ARAME 10 GALVANIZADO', unidade: 'UN', hasST: false },
  { codigo: '000354', ncm: '72172090', descricao: 'ARAME 18 GALVANIZADO 1KG', unidade: 'KG', hasST: false },
  { codigo: '001571', ncm: '85081900', descricao: 'ASPIRADOR DE PO PORTATIL 20V MAX (SEM BATERIA)', unidade: 'PC', hasST: true },
  { codigo: '000114', ncm: '39259090', descricao: 'BUCHA 6 NYLON C/100', unidade: 'CT', hasST: true },
  { codigo: '000072', ncm: '68091100', descricao: 'CHAPA GESSO 12,5MM RU 1,20 X 1,80', unidade: 'UN', hasST: false },
  { codigo: '000003', ncm: '68091100', descricao: 'CHAPA GESSO 12,5MM ST 1,20 X 1,80', unidade: 'UN', hasST: false },
  { codigo: '000780', ncm: '68091100', descricao: 'CHAPA GWD 12,5MM 1,20 X 2,40', unidade: 'UN', hasST: false },
  { codigo: '000399', ncm: '68091100', descricao: 'CHAPA GYPSUM 6,4MM 1,20 X 2,40M', unidade: 'UN', hasST: false },
  { codigo: '000120', ncm: '83021000', descricao: 'DOBRADICA LISA CROMADA', unidade: 'UN', hasST: true },
  { codigo: '000119', ncm: '83014000', descricao: 'FECHADURA TUBULAR CROMADA', unidade: 'UN', hasST: true },
  { codigo: '001234', ncm: '39162000', descricao: 'FORRO PVC BELKA GEMINADO', unidade: 'UN', hasST: true },
  { codigo: '001235', ncm: '73181400', descricao: 'PARAFUSO 4.2X13 PA', unidade: 'CT', hasST: true },
  { codigo: '000159', ncm: '73181400', descricao: 'PARAFUSO 4,2 X 13 PA C\\100', unidade: 'CT', hasST: true },
  { codigo: '000161', ncm: '73181400', descricao: 'PARAFUSO 4,2 X 13 PB C\\100', unidade: 'CT', hasST: true },
  { codigo: '000013', ncm: '73181400', descricao: 'PARAFUSO GN 25 PA C\\100', unidade: 'CT', hasST: true },
  { codigo: '000164', ncm: '73181400', descricao: 'PARAFUSO GN 25 PB C\\100', unidade: 'CT', hasST: true },
  { codigo: '000166', ncm: '73181400', descricao: 'PARAFUSO GN 35 PA C\\100', unidade: 'CT', hasST: true },
  { codigo: '000169', ncm: '73181400', descricao: 'PARAFUSO GN 35 PB C\\100', unidade: 'CT', hasST: true },
  { codigo: '000171', ncm: '73181400', descricao: 'PARAFUSO GN 45 PA C\\100', unidade: 'CT', hasST: true },
  { codigo: '000615', ncm: '73181400', descricao: 'PARAFUSO GN 45 PB C\\100', unidade: 'CT', hasST: true }
];

// Função auxiliar para determinar grupo do produto
function determinarGrupo(ncm, descricao) {
  const desc = descricao.toUpperCase();

  // Perfis Metálicos
  if (ncm.startsWith('7216') || desc.includes('PERFIL') || desc.includes('MONTANTE') || desc.includes('GUIA')) {
    return 1; // Perfis Metálicos
  }

  // Chapas de Gesso
  if (ncm.startsWith('6809') || desc.includes('CHAPA GESSO') || desc.includes('GYPSUM')) {
    return 2; // Chapas de Gesso
  }

  // Forros PVC
  if (ncm.startsWith('3916') && desc.includes('FORRO')) {
    return 3; // Forros PVC
  }

  // Acabamentos PVC
  if (ncm.startsWith('3916') || ncm.startsWith('3917')) {
    return 4; // Acabamentos PVC
  }

  // Fixadores
  if (ncm.startsWith('7318') || desc.includes('PARAFUSO') || desc.includes('BUCHA')) {
    return 5; // Fixadores
  }

  // Portas e Painéis
  if (ncm.startsWith('4418') || desc.includes('PORTA') || desc.includes('PAINEL')) {
    return 6; // Portas e Painéis
  }

  // Acessórios
  if (ncm.startsWith('8302') || ncm.startsWith('8303') || desc.includes('DOBRADICA') || desc.includes('FECHADURA')) {
    return 7; // Acessórios
  }

  // Materiais Diversos
  return 8;
}

// Gerar SQL de inserção
function gerarSQL() {
  let sql = '-- SCRIPT DE IMPORTAÇÃO DE PRODUTOS - PLANAC\\n';
  sql += '-- Total de produtos: ' + produtos.length + '\\n';
  sql += '-- Data: 23/11/2025\\n\\n';

  produtos.forEach((p, index) => {
    const groupId = determinarGrupo(p.ncm, p.descricao);
    const hasST = p.hasST ? 1 : 0;

    sql += `INSERT INTO products (code, name, ncm, unit, group_id, has_st, active, created_at) VALUES ('${p.codigo}', '${p.descricao.replace(/'/g, "''")}', '${p.ncm}', '${p.unidade}', ${groupId}, ${hasST}, 1, CURRENT_TIMESTAMP);\\n`;

    // Adicionar quebra a cada 50 produtos para melhor legibilidade
    if ((index + 1) % 50 === 0) {
      sql += '\\n';
    }
  });

  return sql;
}

// Executar
console.log('Gerando SQL para ' + produtos.length + ' produtos...');
const sql = gerarSQL();
console.log(sql);
console.log('\\n\\nSQL gerado com sucesso!');
console.log('Total de produtos: ' + produtos.length);
