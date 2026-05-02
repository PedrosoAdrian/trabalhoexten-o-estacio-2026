jest.mock('../../config/firebase', () => ({ auth: {}, db: {} }));

jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(() => ({})),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
}));

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { setDoc } from 'firebase/firestore';
import { registrar, login, logout } from '../../services/authService';

const mockCreateUser = createUserWithEmailAndPassword as jest.Mock;
const mockSignIn = signInWithEmailAndPassword as jest.Mock;
const mockSignOut = signOut as jest.Mock;
const mockSetDoc = setDoc as jest.Mock;

describe('authService', () => {
  beforeEach(() => jest.clearAllMocks());

  // ── registrar ────────────────────────────────────────────────────────────
  describe('registrar', () => {
    it('cria usuário no Firebase Auth e retorna objeto Usuario', async () => {
      mockCreateUser.mockResolvedValue({ user: { uid: 'uid-123' } });
      mockSetDoc.mockResolvedValue(undefined);

      const resultado = await registrar('João Silva', 'joao@test.com', 'senha123', 'empreiteiro');

      expect(mockCreateUser).toHaveBeenCalledWith({}, 'joao@test.com', 'senha123');
      expect(resultado).toMatchObject({
        id: 'uid-123',
        nome: 'João Silva',
        email: 'joao@test.com',
        tipo: 'empreiteiro',
        obras: [],
      });
    });

    it('persiste o usuário e o mapeamento email→uid no Firestore (2 setDoc)', async () => {
      mockCreateUser.mockResolvedValue({ user: { uid: 'uid-456' } });
      mockSetDoc.mockResolvedValue(undefined);

      await registrar('Maria', 'maria@test.com', 'abc123', 'cliente');

      expect(mockSetDoc).toHaveBeenCalledTimes(2);
    });

    it('propaga erro quando o Firebase Auth falha', async () => {
      mockCreateUser.mockRejectedValue(new Error('email já em uso'));

      await expect(
        registrar('Erro', 'duplicado@test.com', '123456', 'cliente')
      ).rejects.toThrow('email já em uso');
    });
  });

  // ── login ─────────────────────────────────────────────────────────────────
  describe('login', () => {
    it('chama signInWithEmailAndPassword com as credenciais corretas', async () => {
      mockSignIn.mockResolvedValue({ user: { uid: 'uid-1' } });

      await login('joao@test.com', 'senha123');

      expect(mockSignIn).toHaveBeenCalledWith({}, 'joao@test.com', 'senha123');
    });

    it('propaga erro de credencial inválida', async () => {
      mockSignIn.mockRejectedValue(new Error('auth/wrong-password'));

      await expect(login('x@x.com', 'errada')).rejects.toThrow('auth/wrong-password');
    });
  });

  // ── logout ────────────────────────────────────────────────────────────────
  describe('logout', () => {
    it('chama signOut com a instância de auth', async () => {
      mockSignOut.mockResolvedValue(undefined);

      await logout();

      expect(mockSignOut).toHaveBeenCalledWith({});
      expect(mockSignOut).toHaveBeenCalledTimes(1);
    });
  });
});
