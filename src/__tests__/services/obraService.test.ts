jest.mock('../../config/firebase', () => ({ db: {} }));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(() => ({})),
  doc: jest.fn(() => ({})),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(() => ({})),
  where: jest.fn(() => ({})),
}));

import { addDoc, updateDoc, deleteDoc, getDoc, getDocs } from 'firebase/firestore';
import {
  criarObra,
  buscarObra,
  listarObrasPorEmpreiteiro,
  listarObrasPorCliente,
  atualizarObra,
  deletarObra,
  adicionarMaterial,
  adicionarMaoDeObra,
  vincularClientePorEmail,
  buscarClientesDaObra,
  desvincularCliente,
} from '../../services/obraService';
import { Obra, Material, MaoDeObra, Usuario } from '../../types';

const mockAddDoc = addDoc as jest.Mock;
const mockUpdateDoc = updateDoc as jest.Mock;
const mockDeleteDoc = deleteDoc as jest.Mock;
const mockGetDoc = getDoc as jest.Mock;
const mockGetDocs = getDocs as jest.Mock;

const obraBase: Omit<Obra, 'id'> = {
  titulo: 'Casa Residencial',
  localizacao: 'Florianópolis/SC',
  valorTotal: 200000,
  dataInicio: '2025-08-01',
  dataPrevisaoFim: '2025-12-01',
  status: 'em_andamento',
  empreiteiroId: 'emp-1',
  clientesIds: [],
  materiais: [],
  maoDeObra: [],
  demandas: [],
};

const materialBase: Material = {
  id: 'mat-1',
  nome: 'Cimento',
  quantidade: 20,
  unidade: 'saco',
  valorUnitario: 35,
  dataCompra: '2025-09-01',
};

const mdoBase: MaoDeObra = {
  id: 'mdo-1',
  descricao: 'Pedreiro',
  profissional: 'Carlos Souza',
  valorDiaria: 250,
  diasTrabalhados: 15,
};

describe('obraService', () => {
  beforeEach(() => jest.clearAllMocks());

  // ── criarObra ─────────────────────────────────────────────────────────────
  describe('criarObra', () => {
    it('cria e retorna obra com id gerado pelo Firestore', async () => {
      mockAddDoc.mockResolvedValue({ id: 'obra-123' });

      const resultado = await criarObra(obraBase);

      expect(mockAddDoc).toHaveBeenCalledTimes(1);
      expect(resultado).toMatchObject({ ...obraBase, id: 'obra-123' });
    });
  });

  // ── buscarObra ────────────────────────────────────────────────────────────
  describe('buscarObra', () => {
    it('retorna obra quando documento existe', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        id: 'obra-123',
        data: () => obraBase,
      });

      const resultado = await buscarObra('obra-123');
      expect(resultado).toMatchObject({ id: 'obra-123', titulo: 'Casa Residencial' });
    });

    it('retorna null quando documento não existe', async () => {
      mockGetDoc.mockResolvedValue({ exists: () => false });

      const resultado = await buscarObra('inexistente');
      expect(resultado).toBeNull();
    });
  });

  // ── listarObrasPorEmpreiteiro ─────────────────────────────────────────────
  describe('listarObrasPorEmpreiteiro', () => {
    it('retorna todas as obras do empreiteiro', async () => {
      mockGetDocs.mockResolvedValue({
        docs: [
          { id: 'obra-1', data: () => ({ ...obraBase }) },
          { id: 'obra-2', data: () => ({ ...obraBase, titulo: 'Loja Comercial' }) },
        ],
      });

      const resultado = await listarObrasPorEmpreiteiro('emp-1');
      expect(resultado).toHaveLength(2);
      expect(resultado[0].id).toBe('obra-1');
      expect(resultado[1].titulo).toBe('Loja Comercial');
    });

    it('retorna array vazio quando empreiteiro não tem obras', async () => {
      mockGetDocs.mockResolvedValue({ docs: [] });

      const resultado = await listarObrasPorEmpreiteiro('emp-sem-obras');
      expect(resultado).toEqual([]);
    });
  });

  // ── listarObrasPorCliente ─────────────────────────────────────────────────
  describe('listarObrasPorCliente', () => {
    it('retorna obras vinculadas ao cliente', async () => {
      mockGetDocs.mockResolvedValue({
        docs: [
          { id: 'obra-1', data: () => ({ ...obraBase, clientesIds: ['cli-1'] }) },
        ],
      });

      const resultado = await listarObrasPorCliente('cli-1');
      expect(resultado).toHaveLength(1);
      expect(resultado[0].clientesIds).toContain('cli-1');
    });

    it('retorna array vazio quando cliente não tem obras', async () => {
      mockGetDocs.mockResolvedValue({ docs: [] });
      const resultado = await listarObrasPorCliente('cli-sem-obra');
      expect(resultado).toEqual([]);
    });
  });

  // ── atualizarObra ─────────────────────────────────────────────────────────
  describe('atualizarObra', () => {
    it('chama updateDoc com os campos fornecidos', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);

      await atualizarObra('obra-123', { status: 'concluida', valorTotal: 210000 });

      expect(mockUpdateDoc).toHaveBeenCalledTimes(1);
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        { status: 'concluida', valorTotal: 210000 }
      );
    });
  });

  // ── deletarObra ───────────────────────────────────────────────────────────
  describe('deletarObra', () => {
    it('chama deleteDoc uma vez', async () => {
      mockDeleteDoc.mockResolvedValue(undefined);

      await deletarObra('obra-123');

      expect(mockDeleteDoc).toHaveBeenCalledTimes(1);
    });
  });

  // ── adicionarMaterial ─────────────────────────────────────────────────────
  describe('adicionarMaterial', () => {
    it('persiste material numa lista vazia', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);

      await adicionarMaterial('obra-123', materialBase, []);

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        { materiais: [materialBase] }
      );
    });

    it('preserva materiais existentes ao adicionar um novo', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);
      const existente: Material = { ...materialBase, id: 'mat-0', nome: 'Areia' };

      await adicionarMaterial('obra-123', materialBase, [existente]);

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        { materiais: [existente, materialBase] }
      );
    });
  });

  // ── adicionarMaoDeObra ────────────────────────────────────────────────────
  describe('adicionarMaoDeObra', () => {
    it('persiste mão de obra numa lista vazia', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);

      await adicionarMaoDeObra('obra-123', mdoBase, []);

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        { maoDeObra: [mdoBase] }
      );
    });

    it('preserva registros existentes ao adicionar novo', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);
      const existente: MaoDeObra = { ...mdoBase, id: 'mdo-0', profissional: 'Eletricista' };

      await adicionarMaoDeObra('obra-123', mdoBase, [existente]);

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        { maoDeObra: [existente, mdoBase] }
      );
    });
  });

  // ── vincularClientePorEmail ───────────────────────────────────────────────
  describe('vincularClientePorEmail', () => {
    it('vincula cliente e retorna lista atualizada de ids', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ uid: 'cli-99' }),
      });
      mockUpdateDoc.mockResolvedValue(undefined);

      const resultado = await vincularClientePorEmail('obra-123', 'cliente@test.com', []);

      expect(resultado).toContain('cli-99');
      expect(resultado).toHaveLength(1);
    });

    it('adiciona novo cliente preservando vínculos existentes', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ uid: 'cli-99' }),
      });
      mockUpdateDoc.mockResolvedValue(undefined);

      const resultado = await vincularClientePorEmail('obra-123', 'novo@test.com', ['cli-1', 'cli-2']);

      expect(resultado).toEqual(['cli-1', 'cli-2', 'cli-99']);
    });

    it('lança erro quando o cliente não está cadastrado no app', async () => {
      mockGetDoc.mockResolvedValue({ exists: () => false });

      await expect(
        vincularClientePorEmail('obra-123', 'naocadastrado@test.com', [])
      ).rejects.toThrow('Cliente não encontrado');
    });

    it('lança erro quando o cliente já está vinculado à obra', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ uid: 'cli-99' }),
      });

      await expect(
        vincularClientePorEmail('obra-123', 'cliente@test.com', ['cli-99'])
      ).rejects.toThrow('já está vinculado');
    });
  });

  // ── buscarClientesDaObra ──────────────────────────────────────────────────
  describe('buscarClientesDaObra', () => {
    it('retorna array vazio sem consultar Firestore quando não há clientes', async () => {
      const resultado = await buscarClientesDaObra([]);

      expect(resultado).toEqual([]);
      expect(mockGetDoc).not.toHaveBeenCalled();
    });

    it('retorna os usuários correspondentes aos ids', async () => {
      const usuarioDados: Usuario = {
        id: 'cli-1', nome: 'Ana Lima', email: 'ana@test.com', tipo: 'cliente', obras: [],
      };
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        id: 'cli-1',
        data: () => usuarioDados,
      });

      const resultado = await buscarClientesDaObra(['cli-1']);

      expect(resultado).toHaveLength(1);
      expect(resultado[0].nome).toBe('Ana Lima');
    });

    it('filtra documentos que não existem no Firestore', async () => {
      mockGetDoc
        .mockResolvedValueOnce({
          exists: () => true,
          id: 'cli-1',
          data: () => ({ id: 'cli-1', nome: 'Ana', email: 'a@t.com', tipo: 'cliente', obras: [] }),
        })
        .mockResolvedValueOnce({ exists: () => false });

      const resultado = await buscarClientesDaObra(['cli-1', 'cli-deletado']);

      expect(resultado).toHaveLength(1);
      expect(resultado[0].id).toBe('cli-1');
    });
  });

  // ── desvincularCliente ────────────────────────────────────────────────────
  describe('desvincularCliente', () => {
    it('remove o cliente e retorna lista atualizada', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);

      const resultado = await desvincularCliente('obra-123', 'cli-2', ['cli-1', 'cli-2', 'cli-3']);

      expect(resultado).toEqual(['cli-1', 'cli-3']);
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        { clientesIds: ['cli-1', 'cli-3'] }
      );
    });

    it('retorna lista inalterada quando o cliente não estava vinculado', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);

      const resultado = await desvincularCliente('obra-123', 'cli-x', ['cli-1', 'cli-2']);

      expect(resultado).toEqual(['cli-1', 'cli-2']);
    });

    it('retorna array vazio ao remover o único cliente', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);

      const resultado = await desvincularCliente('obra-123', 'cli-1', ['cli-1']);

      expect(resultado).toEqual([]);
    });
  });
});
