# Planejamento do Desenvolvimento da Plataforma Atlética Engênios

## Introdução
A plataforma **Atlética Engênios** trata do domínio de **gestão de atléticas universitárias**, reunindo em um único sistema o cadastro de membros da diretoria, o controle de estoque de produtos e o acompanhamento financeiro.

## **1. Ajustes sugeridos da primeira interação (25/02)**
Na primeira interação, foram feitas as seguintes decisões e ajustes para aprimorar o projeto:

- **Escolha do front-end:** Inicialmente, React foi considerado, mas optamos por **Next.js** devido ao melhor suporte para SEO e SSR (Server-Side Rendering), essencial para a futura expansão da plataforma.
- **Adoção do Fastify:** Para melhor performance, escolhemos **Fastify** no back-end ao invés de Express.js.

---

## **2. Requisitos Funcionais e Não Funcionais**

### **Requisitos Funcionais**

1. **Cadastro de Membros da Diretoria**
   - Cada membro poderá se cadastrar com nome, sexo, e-mail e curso na Atlética.
   - O usuário pode ser definido se faz parte ou não da diretoria através de um admin.
   
2. **Autenticação e Controle de Acesso**
   - Login seguro com **JWT**.
   - Apenas membros da diretoria terão acesso à área administrativa.
   
3. **Gestão de Cursos**
   - Cursos cadastrados previamente.
   - Membros vinculam-se a um curso no momento do cadastro.
   
4. **Gerenciamento Financeiro**
   - Controle de entrada e saída de caixa.
   - Filtros de tipo de transação, ordenação de maior valor, registro de usuário no ato da transação, e etc.

---

### **Requisitos Não Funcionais**

1. **Escalabilidade**: O sistema deve suportar um aumento no número de membros sem perda de desempenho.
2. **Segurança**: Implementação de **JWT**, hashing de senhas e restrições de acesso.
3. **Performance**: Uso do **Fastify** para API rápida e **Next.js** para renderização otimizada.
4. **Banco de Dados Gerenciado**: **Supabase** para facilitar autenticação e armazenamento de dados.
5. **Versionamento e Colaboração**: Código hospedado no **GitHub**, seguindo boas práticas de Git.
6. **Responsividade**: Design responsivo via **Tailwind CSS**.
7. **Integração Contínua (CI/CD)**: Implementação para deploy e testes automatizados.

---

## **3. Estratégia de Desenvolvimento e Arquitetura**

### **Arquitetura do Projeto**
Optamos por uma **arquitetura monolítica modular**, pois:

**Fácil de gerenciar no início do projeto**.

**Menos complexa do que microsserviços**.

**Escalável futuramente se necessário**.

**O back-end pode se comunicar facilmente com Next.js via API REST**.


#### **Tecnologias Escolhidas e Justificativa**

| Camada | Tecnologia | Justificativa |
|--------|-------------|-----------------|
| **Front-end** | **Next.js + Tailwind CSS** | Melhor para SEO, escalável e responsivo. |
| **Back-end** | **Node.js + Fastify** | Rápido, otimizado para APIs e modular. |
| **Banco de Dados** | **Supabase** | Fácil autenticação e armazenamento de dados. |
| **Autenticação** | **JWT** | Segurança e controle de acesso. |
| **Versionamento** | **GitHub** | Centralizado e fácil colaboração. |


---

## **4 Plano de Trabalho e Atividades**

O desenvolvimento será dividido em **três fases principais**, seguindo um ciclo ágil:

### **Fase 1: Configuração e Setup Inicial**
Criar repositório no GitHub.  
Criar estrutura de pastas do projeto. 
Desenvolver o design no FIGMA para o desenvolvimento.
Criar tarefas de gestão de software no Jira para dividir os trabalhos.
Configurar Next.js com Tailwind CSS.  
Configurar Fastify e criar primeira rota REST.  
Criar conexão com o banco de dados Supabase.  


### **Fase 2: Implementação de Funcionalidades Básicas**
Criar CRUD de membros da diretoria.  
Implementar autenticação JWT.  
Criar sistema de login com validação de acesso.  

### **Fase 3: Expansão do Projeto**
Criar sistema de movimentação financeira.
Melhorias na interface e experiência do usuário.
Testes e deploy final.

## **5. Integração Contínua (CI)**

O repositório possui um workflow definido em `.github/workflows/ci.yml`.
Ele é executado sempre que há `push` ou `pull_request` para as branches `main` e `develop`.
Duas etapas de teste são realizadas:

1. **test-backend**
   - checkout do código
   - instalação do Node.js v18
   - instalação das dependências em `back-end`
   - execução dos testes com `npm test -- --passWithNoTests`

2. **test-frontend**
   - mesmos passos para o diretório `front-end`

Até o momento não foi adotada a metodologia **TDD** e não existe configuração de ambiente de produção.
