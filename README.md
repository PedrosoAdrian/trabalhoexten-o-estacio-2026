# ObrasTrack

Aplicativo mobile para gestão de obras, desenvolvido como Trabalho de Extensão — Bacharelado em Ciência da Computação, Faculdade Estácio de Sá, Florianópolis/SC.

## Sobre o Projeto

O ObrasTrack conecta empreiteiros e clientes, oferecendo acompanhamento em tempo real de obras residenciais e comerciais. O app resolve problemas comuns de pequenas construtoras: falta de controle de custos, comunicação dispersa e ausência de rastreabilidade de prazos.

**Parceiro:** Concept Parede Pronta Ltda — Florianópolis/SC

## Funcionalidades

### Perfil Empreiteiro
- Cadastro e gestão de obras (status, localização, orçamento, prazo)
- Controle de materiais e mão de obra
- Acompanhamento de custo realizado vs. orçado
- Visualização e resposta a demandas dos clientes

### Perfil Cliente
- Visualização das obras associadas
- Consulta de progresso, cronograma e custos
- Envio de sugestões de mudança e novas demandas
- Acompanhamento do status das demandas

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Mobile | React Native (Expo) + TypeScript |
| Autenticação | Firebase Authentication |
| Banco de Dados | Cloud Firestore |
| Navegação | React Navigation v6 |

## Estrutura do Projeto

```
src/
├── config/          # Configuração do Firebase
├── contexts/        # AuthContext (estado global de autenticação)
├── navigation/      # Navegadores por perfil de acesso
├── screens/
│   ├── auth/        # Login e Cadastro
│   ├── empreiteiro/ # Dashboard, Obras, Demandas
│   └── cliente/     # Minhas Obras, Detalhes
├── services/        # Integração com Firestore
└── types/           # Tipos TypeScript
```

## Como Rodar

### Pré-requisitos
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- App **Expo Go** no celular (Android)

### Instalação

```bash
git clone https://github.com/PAdrianL/trabalho-de-extensao-app.git
cd trabalho-de-extensao-app
npm install
```

### Configuração do Firebase

Edite `src/config/firebase.ts` com as credenciais do seu projeto Firebase:

```ts
const firebaseConfig = {
  apiKey: '...',
  authDomain: '...',
  projectId: '...',
  storageBucket: '...',
  messagingSenderId: '...',
  appId: '...',
};
```

No Firebase Console, ative:
- **Authentication → E-mail/senha**
- **Firestore Database** (modo de teste)

### Executar

```bash
npx expo start
```

Escaneie o QR Code com o app Expo Go.

## Autor

**Adrian Lopes Cavalcanti**
Bacharelado em Ciência da Computação — 7º semestre
Faculdade Estácio de Sá — Florianópolis/SC
Período: Março a Julho de 2026
