import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { UserType, Usuario } from '../types';

export async function registrar(
  nome: string,
  email: string,
  senha: string,
  tipo: UserType
) {
  const { user } = await createUserWithEmailAndPassword(auth, email, senha);
  const usuario: Usuario = { id: user.uid, nome, email, tipo, obras: [] };
  await setDoc(doc(db, 'usuarios', user.uid), usuario);
  return usuario;
}

export async function login(email: string, senha: string) {
  return signInWithEmailAndPassword(auth, email, senha);
}

export async function logout() {
  return signOut(auth);
}
