jest.mock('../../config/firebase', () => ({ db: {} }));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(() => ({})),
  updateDoc: jest.fn(),
}));

import { updateDoc } from 'firebase/firestore';
import { criarDemanda, responderDemanda } from '../../services/demandaService';
import { Demanda } from '../../types';

const mockUpdateDoc = updateDoc as jest.Mock;

const demandaBase: Demanda = {
  id: 'dem-1',
  titulo: 'Trocar portas',
  descricao: 'Substituir portas por madeira maciça',
  tipo: 'mudanca',
  status: 'pendente',
  clienteId: 'cli-1',
  dataCriacao: '2025-10-01',
};

describe('demandaService', () => {
  beforeEach(() => jest.clearAllMocks());

  // ── criarDemanda ──────────────────────────────────────────────────────────
  describe('criarDemanda', () => {
    it('persiste nova demanda numa lista vazia', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);

      await criarDemanda('obra-123', demandaBase, []);

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        { demandas: [demandaBase] }
      );
    });

    it('preserva demandas existentes ao adicionar nova', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);
      const existente: Demanda = { ...demandaBase, id: 'dem-0', titulo: 'Ampliar janelas' };

      await criarDemanda('obra-123', demandaBase, [existente]);

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        { demandas: [existente, demandaBase] }
      );
    });

    it('chama updateDoc exatamente uma vez', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);

      await criarDemanda('obra-123', demandaBase, []);

      expect(mockUpdateDoc).toHaveBeenCalledTimes(1);
    });
  });

  // ── responderDemanda ──────────────────────────────────────────────────────
  describe('responderDemanda', () => {
    it('atualiza status e resposta da demanda correta', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);
      const lista = [demandaBase];

      await responderDemanda('obra-123', 'dem-1', 'aprovada', 'Aprovado conforme orçamento.', lista);

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        {
          demandas: [{
            ...demandaBase,
            status: 'aprovada',
            resposta: 'Aprovado conforme orçamento.',
          }],
        }
      );
    });

    it('não altera demandas com id diferente', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);
      const outra: Demanda = { ...demandaBase, id: 'dem-2', titulo: 'Pintura' };
      const lista = [demandaBase, outra];

      await responderDemanda('obra-123', 'dem-1', 'rejeitada', 'Fora do escopo.', lista);

      const chamada = mockUpdateDoc.mock.calls[0][1] as { demandas: Demanda[] };
      const demandasAtualizadas = chamada.demandas;

      expect(demandasAtualizadas.find((d) => d.id === 'dem-2')).toMatchObject({
        status: 'pendente',
        titulo: 'Pintura',
      });
      expect(demandasAtualizadas.find((d) => d.id === 'dem-1')?.status).toBe('rejeitada');
    });

    it('funciona com todos os status possíveis', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);
      const statusList = ['pendente', 'em_analise', 'aprovada', 'rejeitada'] as const;

      for (const status of statusList) {
        jest.clearAllMocks();
        await responderDemanda('obra-123', 'dem-1', status, 'resposta', [demandaBase]);
        const chamada = mockUpdateDoc.mock.calls[0][1] as { demandas: Demanda[] };
        expect(chamada.demandas[0].status).toBe(status);
      }
    });

    it('não altera nada quando a demanda não existe na lista', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);
      const lista = [demandaBase];

      await responderDemanda('obra-123', 'dem-inexistente', 'aprovada', 'OK', lista);

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        { demandas: [demandaBase] }
      );
    });
  });
});
