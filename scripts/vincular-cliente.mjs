import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, doc, updateDoc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAaNj4Pxy_Cmd-80O-_SaCPPzn9JrTkQZg',
  authDomain: 'obrastrack.firebaseapp.com',
  projectId: 'obrastrack',
  storageBucket: 'obrastrack.firebasestorage.app',
  messagingSenderId: '8640583693',
  appId: '1:8640583693:web:e8f4ac39c3d3345ac29d44',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Busca uid do cliente pelo mapeamento de email
const emailSnap = await getDoc(doc(db, 'emails', 'cliente@teste.com'));
const { uid: clienteUid } = emailSnap.data();
console.log(`Cliente UID: ${clienteUid}`);

// Busca obras do empreiteiro de teste
const empreiteiroUid = 'FyhrchzjDbaggDU1HZKSV5F85wk1';
const q = query(collection(db, 'obras'), where('empreiteiroId', '==', empreiteiroUid));
const snap = await getDocs(q);

if (snap.empty) {
  console.log('❌ Nenhuma obra encontrada para o empreiteiro de teste.');
  process.exit(1);
}

for (const obra of snap.docs) {
  const data = obra.data();
  if (data.clientesIds?.includes(clienteUid)) {
    console.log(`⚠️  "${data.titulo}" — cliente já vinculado.`);
    continue;
  }
  const novosIds = [...(data.clientesIds || []), clienteUid];
  await updateDoc(doc(db, 'obras', obra.id), { clientesIds: novosIds });
  console.log(`✅ Cliente vinculado à obra "${data.titulo}" (${obra.id})`);
}

process.exit(0);
