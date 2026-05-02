import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Obra, Material, MaoDeObra, Usuario } from '../types';

export async function criarObra(obra: Omit<Obra, 'id'>) {
  const ref = await addDoc(collection(db, 'obras'), obra);
  return { ...obra, id: ref.id } as Obra;
}

export async function buscarObra(id: string) {
  const snap = await getDoc(doc(db, 'obras', id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Obra) : null;
}

export async function listarObrasPorEmpreiteiro(empreiteiroId: string) {
  const q = query(collection(db, 'obras'), where('empreiteiroId', '==', empreiteiroId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Obra));
}

export async function listarObrasPorCliente(clienteId: string) {
  const q = query(collection(db, 'obras'), where('clientesIds', 'array-contains', clienteId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Obra));
}

export async function atualizarObra(id: string, dados: Partial<Obra>) {
  await updateDoc(doc(db, 'obras', id), dados as Record<string, unknown>);
}

export async function deletarObra(id: string) {
  await deleteDoc(doc(db, 'obras', id));
}

export async function adicionarMaterial(obraId: string, material: Material, materiais: Material[]) {
  await updateDoc(doc(db, 'obras', obraId), { materiais: [...materiais, material] });
}

export async function adicionarMaoDeObra(obraId: string, mdo: MaoDeObra, lista: MaoDeObra[]) {
  await updateDoc(doc(db, 'obras', obraId), { maoDeObra: [...lista, mdo] });
}

export async function vincularClientePorEmail(
  obraId: string,
  email: string,
  clientesIds: string[]
): Promise<string[]> {
  const emailSnap = await getDoc(doc(db, 'emails', email));
  if (!emailSnap.exists()) {
    throw new Error('Cliente não encontrado. Peça para ele se cadastrar primeiro.');
  }
  const { uid } = emailSnap.data() as { uid: string };
  if (clientesIds.includes(uid)) {
    throw new Error('Este cliente já está vinculado a esta obra.');
  }
  const novosIds = [...clientesIds, uid];
  await updateDoc(doc(db, 'obras', obraId), { clientesIds: novosIds });
  return novosIds;
}

export async function buscarClientesDaObra(clientesIds: string[]): Promise<Usuario[]> {
  if (clientesIds.length === 0) return [];
  const snaps = await Promise.all(
    clientesIds.map((uid) => getDoc(doc(db, 'usuarios', uid)))
  );
  return snaps
    .filter((s) => s.exists())
    .map((s) => ({ id: s.id, ...s.data() } as Usuario));
}

export async function desvincularCliente(
  obraId: string,
  clienteId: string,
  clientesIds: string[]
): Promise<string[]> {
  const novosIds = clientesIds.filter((id) => id !== clienteId);
  await updateDoc(doc(db, 'obras', obraId), { clientesIds: novosIds });
  return novosIds;
}
