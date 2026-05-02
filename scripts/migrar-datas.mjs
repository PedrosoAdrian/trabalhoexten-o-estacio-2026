import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

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

function normalizar(data) {
  if (!data) return data;
  // YYYY/MM/DD → YYYY-MM-DD
  if (/^\d{4}\/\d{2}\/\d{2}$/.test(data)) return data.replace(/\//g, '-');
  // DD/MM/YYYY → YYYY-MM-DD
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(data)) {
    const [dia, mes, ano] = data.split('/');
    return `${ano}-${mes}-${dia}`;
  }
  return data;
}

const snap = await getDocs(collection(db, 'obras'));
let atualizadas = 0;

for (const obra of snap.docs) {
  const { dataInicio, dataPrevisaoFim } = obra.data();
  const novaInicio = normalizar(dataInicio);
  const novaFim = normalizar(dataPrevisaoFim);

  if (novaInicio !== dataInicio || novaFim !== dataPrevisaoFim) {
    await updateDoc(doc(db, 'obras', obra.id), {
      dataInicio: novaInicio,
      dataPrevisaoFim: novaFim,
    });
    console.log(`✅ "${obra.data().titulo}": ${dataInicio} → ${novaInicio} | ${dataPrevisaoFim} → ${novaFim}`);
    atualizadas++;
  } else {
    console.log(`— "${obra.data().titulo}": datas já no formato correto`);
  }
}

console.log(`\n${atualizadas} obra(s) atualizada(s).`);
process.exit(0);
