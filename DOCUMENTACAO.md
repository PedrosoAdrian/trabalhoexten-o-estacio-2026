# Documentação Técnica — ObrasTrack

> **App mobile para gestão de obras de empreiteiros**  
> Aluno: Adrian Lopes Cavalcanti | Parceiro: Concept Parede Pronta Ltda

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Stack de Tecnologias](#2-stack-de-tecnologias)
3. [Estrutura de Pastas](#3-estrutura-de-pastas)
4. [Arquitetura do Sistema](#4-arquitetura-do-sistema)
5. [Persistência de Dados — Firebase Firestore](#5-persistência-de-dados--firebase-firestore)
6. [Autenticação — Firebase Auth](#6-autenticação--firebase-auth)
7. [Comunicações Externas](#7-comunicações-externas)
8. [Fluxo de Navegação](#8-fluxo-de-navegação)
9. [Testes Automatizados](#9-testes-automatizados)

---

## 1. Visão Geral

O ObrasTrack é um aplicativo Android desenvolvido com **React Native + Expo**. Ele resolve um problema real da Concept Parede Pronta: a gestão de obras era feita em cadernos e WhatsApp, sem controle de custos, prazo ou comunicação formal com clientes.

O app tem **dois perfis de usuário**:

| Perfil | O que pode fazer |
|--------|-----------------|
| **Empreiteiro** | Criar/editar obras, registrar materiais e mão de obra, vincular clientes, responder demandas |
| **Cliente** | Visualizar obras vinculadas ao seu perfil, enviar sugestões de mudança, acompanhar respostas |

---

## 2. Stack de Tecnologias

### Plataforma Mobile

| Tecnologia | Versão | Papel |
|-----------|--------|-------|
| **React Native** | 0.81.5 | Framework para criar apps nativos com JavaScript/TypeScript |
| **Expo** | ~54.0.33 | Conjunto de ferramentas que facilita build, desenvolvimento e deploy do React Native |
| **TypeScript** | ~5.9.2 | Tipagem estática sobre o JavaScript — garante segurança de tipos em todo o projeto |

**Por que React Native + Expo?**  
Permite escrever um único código em TypeScript/JavaScript que roda como app nativo Android (e iOS). O Expo elimina a necessidade de configurar Android Studio manualmente para desenvolvimento.

---

### Backend as a Service (BaaS) — Firebase

| Serviço Firebase | Versão SDK | Papel |
|-----------------|-----------|-------|
| **Firebase Auth** | firebase ^10.14.1 | Autenticação de usuários (e-mail/senha) |
| **Cloud Firestore** | firebase ^10.14.1 | Banco de dados NoSQL em nuvem, com sincronização em tempo real |

**Por que Firebase?**  
Elimina a necessidade de criar um servidor backend próprio. O Firestore oferece sincronização em tempo real (cliente e empreiteiro veem dados atualizados sem refresh manual), e o Firebase Auth cuida de todo o fluxo de login/cadastro com segurança.

---

### Navegação

| Tecnologia | Versão | Papel |
|-----------|--------|-------|
| **React Navigation** | ^7.x | Gerencia a troca de telas no app |
| `@react-navigation/native-stack` | ^7.14.12 | Navegação em pilha (empilha/desempilha telas) |

---

### Persistência Local

| Tecnologia | Versão | Papel |
|-----------|--------|-------|
| **AsyncStorage** | 2.2.0 | Armazenamento chave-valor no dispositivo — usado para manter o usuário logado entre sessões |

---

### Testes

| Tecnologia | Versão | Papel |
|-----------|--------|-------|
| **Jest** | (via jest-expo) | Framework de testes JavaScript/TypeScript |
| **jest-expo** | ~54.0.0 | Preset do Jest configurado para projetos Expo |

---

## 3. Estrutura de Pastas

```
tcc-adrian/
├── src/
│   ├── __tests__/                   ← Testes automatizados
│   │   ├── utils/
│   │   │   └── uuid.test.ts
│   │   └── services/
│   │       ├── authService.test.ts
│   │       ├── obraService.test.ts
│   │       └── demandaService.test.ts
│   │
│   ├── config/
│   │   └── firebase.ts              ← Inicialização do Firebase (Auth + Firestore)
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx          ← Estado global de autenticação (React Context)
│   │
│   ├── navigation/
│   │   ├── AppNavigator.tsx         ← Roteador principal (decide qual nav mostrar)
│   │   ├── AuthNavigator.tsx        ← Telas públicas (Login, Cadastro)
│   │   ├── EmpreiteiroNavigator.tsx ← Telas privadas do empreiteiro
│   │   └── ClienteNavigator.tsx     ← Telas privadas do cliente
│   │
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx      ← Tela de login (e-mail + senha)
│   │   │   └── RegisterScreen.tsx   ← Tela de cadastro (nome, e-mail, senha, perfil)
│   │   ├── empreiteiro/
│   │   │   ├── DashboardScreen.tsx           ← Lista todas as obras
│   │   │   ├── NovaObraScreen.tsx            ← Formulário para criar obra
│   │   │   ├── EditarObraScreen.tsx          ← Formulário para editar obra
│   │   │   ├── ObraDetalhesScreen.tsx        ← Detalhes completos da obra
│   │   │   ├── MateriaisScreen.tsx           ← Gestão de materiais da obra
│   │   │   ├── MaoDeObraScreen.tsx           ← Gestão de mão de obra
│   │   │   └── DemandasEmpreiteiroScreen.tsx ← Ver e responder demandas
│   │   └── cliente/
│   │       ├── MinhasObrasScreen.tsx          ← Lista obras do cliente
│   │       └── ObraDetalhesClienteScreen.tsx  ← Detalhes (somente leitura)
│   │
│   ├── services/
│   │   ├── authService.ts     ← Funções: registrar, login, logout
│   │   ├── obraService.ts     ← CRUD de obras, materiais, mão de obra, clientes
│   │   └── demandaService.ts  ← Criar e responder demandas
│   │
│   ├── types/
│   │   └── index.ts           ← Todos os tipos e interfaces TypeScript
│   │
│   └── utils/
│       └── uuid.ts            ← Gerador de IDs únicos (UUID v4)
│
├── assets/                    ← Ícones e imagens do app
├── App.tsx                    ← Ponto de entrada: envolve tudo com AuthProvider
├── app.json                   ← Configuração do Expo (nome, package, versão)
├── package.json               ← Dependências e scripts
└── tsconfig.json              ← Configuração do TypeScript
```

---

## 4. Arquitetura do Sistema

O app segue uma arquitetura em **3 camadas**:

```
┌─────────────────────────────────────────┐
│           TELAS (Screens)               │  Camada de Apresentação
│  Exibem dados, capturam entrada do      │
│  usuário, chamam os services            │
└────────────────┬────────────────────────┘
                 │ chama
┌────────────────▼────────────────────────┐
│           SERVICES                      │  Camada de Negócio / Acesso a Dados
│  authService, obraService,              │
│  demandaService                         │
│  Contém toda lógica de acesso ao        │
│  Firebase (Firestore + Auth)            │
└────────────────┬────────────────────────┘
                 │ fala com
┌────────────────▼────────────────────────┐
│           FIREBASE                      │  Camada de Infraestrutura (externa)
│  Firebase Auth  →  autenticação         │
│  Firestore      →  banco de dados       │
└─────────────────────────────────────────┘
```

**Estado global** é gerenciado pelo `AuthContext` (React Context API), que disponibiliza o usuário logado para todas as telas sem precisar passar props manualmente.

---

## 5. Persistência de Dados — Firebase Firestore

### O que é o Firestore?

O **Cloud Firestore** é um banco de dados NoSQL orientado a documentos, hospedado na nuvem do Google. Diferente de bancos relacionais (como MySQL), o Firestore organiza os dados em **coleções** e **documentos** (similar a pastas e arquivos JSON).

### Como os dados são organizados

O projeto usa **3 coleções** no Firestore:

```
Firestore
├── usuarios/        (coleção)
│   └── {uid}/       (documento — um por usuário)
│       ├── id: string
│       ├── nome: string
│       ├── email: string
│       ├── tipo: "empreiteiro" | "cliente"
│       └── obras: string[]
│
├── obras/           (coleção)
│   └── {obraId}/    (documento — um por obra)
│       ├── id: string
│       ├── titulo: string
│       ├── localizacao: string
│       ├── valorTotal: number
│       ├── dataInicio: string        (formato "YYYY-MM-DD")
│       ├── dataPrevisaoFim: string
│       ├── status: "planejamento" | "em_andamento" | "concluida" | "pausada"
│       ├── empreiteiroId: string     (uid do empreiteiro dono da obra)
│       ├── clientesIds: string[]     (array de uids dos clientes vinculados)
│       ├── materiais: Material[]     (array embutido — veja abaixo)
│       ├── maoDeObra: MaoDeObra[]    (array embutido)
│       └── demandas: Demanda[]       (array embutido)
│
└── emails/          (coleção auxiliar para busca por e-mail)
    └── {email}/     (documento — ex: "joao@test.com")
        └── uid: string
```

### Por que Materiais, Mão de Obra e Demandas ficam dentro da Obra?

Essa estratégia se chama **embedded document** (documento embutido). Em vez de criar coleções separadas para materiais e mão de obra, eles são armazenados diretamente como arrays dentro do documento da obra.

**Vantagens neste projeto:**
- Ao buscar uma obra, já vêm todos os seus dados numa única leitura (menos chamadas ao banco)
- O Firestore cobra por leitura de documento — menos documentos = menor custo
- Simplifica o código: sem joins, sem múltiplas queries

**Trade-off:** documentos têm limite de 1 MB. Para obras com poucos materiais/demandas (caso do empreiteiro piloto), isso não é problema.

### A coleção `emails`

É uma coleção auxiliar criada especificamente para resolver um problema de segurança: o Firestore não permite buscar usuários por e-mail diretamente sem expor a coleção inteira. A solução adotada foi criar um documento para cada e-mail registrado:

```
emails/joao@test.com  →  { uid: "abc123" }
```

Quando o empreiteiro digita o e-mail de um cliente para vinculá-lo à obra, o app busca nessa coleção para descobrir o `uid` sem precisar fazer um `where('email', '==', ...)` na coleção `usuarios`.

### Como os dados fluem na prática

**Exemplo — empreiteiro cria uma obra:**

```
1. Tela NovaObraScreen preenche formulário
2. Chama criarObra(dados) no obraService
3. obraService chama addDoc(collection(db, 'obras'), dados)
4. Firestore cria o documento e retorna um ID gerado automaticamente
5. A tela navega para o Dashboard que lista a nova obra
```

**Exemplo — cliente vê sua obra:**

```
1. ClienteNavigator renderiza MinhasObrasScreen
2. Tela chama listarObrasPorCliente(usuario.id)
3. obraService faz query: where('clientesIds', 'array-contains', clienteId)
4. Firestore retorna todos os documentos de obras onde o uid do cliente está no array
5. Tela renderiza a lista
```

### Sincronização em Tempo Real

O Firestore suporta **listeners em tempo real** (`onSnapshot`). O projeto usa `getDoc`/`getDocs` (leitura única), que é suficiente para o caso de uso atual — os dados são recarregados ao navegar entre telas. Para uma versão futura, seria possível trocar para `onSnapshot` e ter atualizações automáticas na tela sem recarregar.

---

## 6. Autenticação — Firebase Auth

### Fluxo de Cadastro

```
RegisterScreen
    │
    ├─ usuário preenche: nome, e-mail, senha, tipo (empreiteiro/cliente)
    │
    └─ authService.registrar()
           │
           ├─ 1. createUserWithEmailAndPassword(auth, email, senha)
           │      → Firebase Auth cria conta e retorna { user: { uid } }
           │
           ├─ 2. setDoc(db, 'usuarios', uid, { id, nome, email, tipo, obras: [] })
           │      → Salva perfil no Firestore
           │
           └─ 3. setDoc(db, 'emails', email, { uid })
                  → Cria mapeamento email→uid para vincular clientes
```

### Fluxo de Login

```
LoginScreen
    │
    └─ authService.login(email, senha)
           │
           └─ signInWithEmailAndPassword(auth, email, senha)
                  → Firebase valida as credenciais
                  → Retorna o usuário autenticado
                  → AuthContext detecta a mudança via onAuthStateChanged
                  → Busca o perfil no Firestore (coleção usuarios)
                  → AppNavigator redireciona para a tela correta (empreiteiro ou cliente)
```

### Persistência de Sessão

O Firebase Auth é configurado com **AsyncStorage como persistence**:

```typescript
// src/config/firebase.ts
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
```

Isso significa que quando o usuário fecha e reabre o app, ele **continua logado** automaticamente — o token de autenticação fica salvo no armazenamento local do dispositivo.

### AuthContext — Estado Global de Autenticação

O `AuthContext` (em `src/contexts/AuthContext.tsx`) é um componente React que:

1. Fica "ouvindo" o Firebase Auth com `onAuthStateChanged`
2. Quando o estado muda (login/logout), atualiza o estado interno
3. Busca o documento do usuário no Firestore para ter o campo `tipo`
4. Disponibiliza `{ user, usuario, loading }` para todas as telas via hook `useAuth()`

```typescript
// Qualquer tela pode usar:
const { usuario } = useAuth();
console.log(usuario.tipo); // "empreiteiro" ou "cliente"
```

---

## 7. Comunicações Externas

O app se comunica com **um único serviço externo: o Firebase** (Google Cloud). Não há servidor próprio.

### Firebase Authentication

- **Protocolo:** HTTPS (REST API interna do SDK)
- **Endpoint:** `https://identitytoolkit.googleapis.com/`
- **O que trafega:** e-mail, senha (hash), tokens JWT de sessão
- **SDK usado:** `firebase/auth` (Firebase Web SDK v10, modular)

### Cloud Firestore

- **Protocolo:** gRPC sobre HTTPS (o SDK abstrai completamente)
- **Endpoint:** `https://firestore.googleapis.com/` / `wss://...` (para listeners)
- **O que trafega:** documentos JSON (leitura e escrita)
- **Autenticação das requisições:** feita automaticamente pelo SDK usando o token JWT do usuário logado

### Segurança das Credenciais

As credenciais do Firebase (`apiKey`, `projectId`, etc.) ficam expostas no arquivo `src/config/firebase.ts`. Isso é **esperado e seguro** para apps mobile Firebase — a segurança real é implementada via **Firestore Security Rules** no painel do Firebase, que controlam quem pode ler/escrever o quê. A `apiKey` do Firebase não é uma chave secreta; ela identifica o projeto, não autentica o servidor.

### Diagrama de Comunicação

```
┌──────────────────────────────────────────────────────┐
│                   App (Android)                       │
│                                                       │
│  ┌─────────────┐    ┌─────────────┐                  │
│  │   Screens   │───▶│  Services   │                  │
│  └─────────────┘    └──────┬──────┘                  │
│                            │                          │
│              ┌─────────────▼──────────────┐          │
│              │    Firebase SDK (local)     │          │
│              │  (firebase npm package)     │          │
│              └─────────────┬──────────────┘          │
└────────────────────────────┼─────────────────────────┘
                             │ HTTPS / gRPC
              ┌──────────────▼──────────────┐
              │         Google Cloud         │
              │                              │
              │  ┌──────────────────────┐   │
              │  │   Firebase Auth      │   │
              │  │  (autenticação)      │   │
              │  └──────────────────────┘   │
              │  ┌──────────────────────┐   │
              │  │   Cloud Firestore    │   │
              │  │  (banco de dados)    │   │
              │  └──────────────────────┘   │
              └──────────────────────────────┘
```

---

## 8. Fluxo de Navegação

```
App.tsx
└── AuthProvider (contexto global)
    └── AppNavigator
        │
        ├── [usuário não logado] ──▶ AuthNavigator
        │                               ├── LoginScreen
        │                               └── RegisterScreen
        │
        ├── [usuario.tipo === 'empreiteiro'] ──▶ EmpreiteiroNavigator
        │                                           ├── DashboardScreen     (inicial)
        │                                           ├── ObraDetalhesScreen
        │                                           ├── NovaObraScreen
        │                                           ├── EditarObraScreen
        │                                           ├── MateriaisScreen
        │                                           ├── MaoDeObraScreen
        │                                           └── DemandasEmpreiteiroScreen
        │
        └── [usuario.tipo === 'cliente'] ──▶ ClienteNavigator
                                                ├── MinhasObrasScreen       (inicial)
                                                └── ObraDetalhesClienteScreen
```

O `AppNavigator` consulta o `AuthContext` para decidir qual navegador exibir. Enquanto o app verifica o estado do login (loading), exibe um spinner.

---

## 9. Testes Automatizados

### Como executar

```bash
# Instalar dependências (necessário após adicionar jest-expo)
yarn install

# Executar todos os testes
yarn test

# Executar com relatório de cobertura
yarn test:coverage
```

### O que é testado

Os testes cobrem a **camada de services** — a lógica de negócio que não depende de interface gráfica. O Firebase é substituído por **mocks** (objetos falsos controlados) durante os testes.

| Arquivo de Teste | O que testa |
|-----------------|-------------|
| `uuid.test.ts` | Formato do UUID gerado (v4, unicidade, hífens) |
| `authService.test.ts` | registrar, login, logout — fluxos de sucesso e erro |
| `obraService.test.ts` | CRUD completo + vinculação/desvinculação de clientes |
| `demandaService.test.ts` | Criar demanda, responder demanda, validações de lista |

**Total: 26 casos de teste**

### Por que mockar o Firebase?

Testes que chamam o Firebase real precisam de internet, são lentos, cobram por leitura/escrita e podem modificar dados de produção. Os mocks substituem as funções do Firebase por funções falsas que retornam valores controlados:

```typescript
// Em vez de chamar o Firebase de verdade:
mockGetDoc.mockResolvedValue({
  exists: () => true,
  id: 'obra-123',
  data: () => ({ titulo: 'Casa', ... }),
});

// O service comporta-se como se o Firestore tivesse retornado esse documento.
```

---

*Documento gerado em Maio/2026 | Projeto ObrasTrack K*
