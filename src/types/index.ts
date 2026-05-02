export type UserType = 'empreiteiro' | 'cliente';

export type ObraStatus = 'planejamento' | 'em_andamento' | 'concluida' | 'pausada';

export type DemandaTipo = 'mudanca' | 'nova_demanda';

export type DemandaStatus = 'pendente' | 'em_analise' | 'aprovada' | 'rejeitada';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  tipo: UserType;
  obras: string[];
}

export interface Material {
  id: string;
  nome: string;
  quantidade: number;
  unidade: string;
  valorUnitario: number;
  dataCompra: string;
}

export interface MaoDeObra {
  id: string;
  descricao: string;
  profissional: string;
  valorDiaria: number;
  diasTrabalhados: number;
}

export interface Demanda {
  id: string;
  titulo: string;
  descricao: string;
  tipo: DemandaTipo;
  status: DemandaStatus;
  clienteId: string;
  dataCriacao: string;
  resposta?: string;
}

export interface Obra {
  id: string;
  titulo: string;
  localizacao: string;
  valorTotal: number;
  dataInicio: string;
  dataPrevisaoFim: string;
  status: ObraStatus;
  empreiteiroId: string;
  clientesIds: string[];
  materiais: Material[];
  maoDeObra: MaoDeObra[];
  demandas: Demanda[];
}
