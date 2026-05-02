import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAaNj4Pxy_Cmd-80O-_SaCPPzn9JrTkQZg',
  authDomain: 'obrastrack.firebaseapp.com',
  projectId: 'obrastrack',
  storageBucket: 'obrastrack.firebasestorage.app',
  messagingSenderId: '8640583693',
  appId: '1:8640583693:web:e8f4ac39c3d3345ac29d44',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const usuarios = [
  { nome: 'Evandro Queiroz', email: 'empreiteiro@teste.com', senha: 'Obras@123', tipo: 'empreiteiro' },
  { nome: 'Fernando Poerner', email: 'cliente@teste.com',    senha: 'Obras@123', tipo: 'cliente'     },
];

for (const u of usuarios) {
  try {
    // Tenta criar — se já existe, apenas garante o mapeamento de email
    let uid;
    try {
      const { user } = await createUserWithEmailAndPassword(auth, u.email, u.senha);
      uid = user.uid;
      await setDoc(doc(db, 'usuarios', uid), {
        id: uid, nome: u.nome, email: u.email, tipo: u.tipo, obras: [],
      });
      console.log(`✅ Criado ${u.tipo}: ${u.email}`);
    } catch (e) {
      if (e.code === 'auth/email-already-in-use') {
        // Busca o uid pelo documento de usuário existente
        console.log(`⚠️  ${u.email} já existe — garantindo mapeamento de email...`);
        // Tenta login para pegar o uid
        const { signInWithEmailAndPassword } = await import('firebase/auth');
        const cred = await signInWithEmailAndPassword(auth, u.email, u.senha);
        uid = cred.user.uid;
      } else throw e;
    }
    // Garante que o mapeamento email→uid existe
    await setDoc(doc(db, 'emails', u.email), { uid });
    console.log(`✅ Mapeamento email criado: ${u.email} → ${uid}`);
  } catch (e) {
    console.log(`❌ ${u.email}: ${e.message}`);
  }
}

process.exit(0);
