import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Demanda, DemandaStatus } from '../types';

export async function criarDemanda(obraId: string, demanda: Demanda, lista: Demanda[]) {
  await updateDoc(doc(db, 'obras', obraId), { demandas: [...lista, demanda] });
}

export async function responderDemanda(
  obraId: string,
  demandaId: string,
  status: DemandaStatus,
  resposta: string,
  lista: Demanda[]
) {
  const atualizadas = lista.map((d) =>
    d.id === demandaId ? { ...d, status, resposta } : d
  );
  await updateDoc(doc(db, 'obras', obraId), { demandas: atualizadas });
}
