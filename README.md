![Banner BeeOnTime](./mgt/listily_logo.png)

<br>

<p align="center">
    <a href="#sobre"> Sobre o projeto</a> &nbsp |&nbsp &nbsp
    <a href="#entregas"> Entregas </a> &nbsp |&nbsp &nbsp
    <a href="#tecnologias"> Tecnologias utilizadas </a> &nbsp |&nbsp &nbsp   
    <a href="#backlog"> Backlog do produto </a> &nbsp |&nbsp &nbsp
    <a href="#autores"> Equipe </a> &nbsp |&nbsp &nbsp
    <a href="#links"> Links Úteis </a> 
</p>

<span id="sobre">

# 📑 Sobre o projeto

O Listily é um aplicativo projetado para ajudar os usuários a comparar preços de supermercado de maneira prática e eficiente. Ele oferece uma plataforma para que os consumidores possam visualizar e comparar os preços de diferentes produtos em supermercados, facilitando a escolha do melhor custo-benefício ao fazer suas compras.

<br>

<span id="backlog">

# 🎯 Backlog do Produto

| RFN | Rank | Prioridade | User story | Estimativa | Sprint | Critérios de aceitação |
|-----|------|------------|------------|------------|--------|-------------------------|
| 04 | 01 | Alta | Eu como ADMINISTRADOR e USUÁRIO COMUM desejo visualizar as estações conectadas | 08 | 1 | - TODOS OS USUÁRIOS devem visualizar as estações conectadas; <br> - Todas as estações devem exibir o nome e imagem referente; <br> - Paginação contendo 15 itens cada; Barra de pesquisa por nome; |
| 04 | 02 | Alta | Eu como ADMINISTRADOR E USUÁRIO COMUM desejo visualizar os parâmetros dentro de uma estação. | 03 | 1 | - TODOS OS USUÁRIOS devem visualizar os parâmetros das estações e suas devidas unidades se cadastradas; <br> - Parâmetros sem unidade de medida definida devem ser sinalizados por meio um elemento gráfico; |
| 04 | 03 | Alta | Eu como ADMINISTRADOR desejo cadastrar e alterar parâmetros de uma estação. | 05 | 1 | - O ADMINISTRADOR deve conseguir alterar as unidades de medida dos parâmetros de uma estação em específico; <br> - Os parâmetros não alterados devem permanecer com seus respectivos valores após alteração de outros; <br> - Deve ser gravada a data da alteração de tal parâmetro; |
| 04 | 04 | Alta | Eu como ADMINISTRADOR desejo alterar o nome e imagem da estação conectada. | 02 | 1 | - O ADMINISTRADOR deve conseguir alterar o nome e imagem de uma estação; <br> - O nome ou imagem não alterado deve permanecer o mesmo após alteração do outro; <br> - Nome é um campo obrigatório; |
| 07 | 05 | Alta | Eu como ADMINISTRADOR desejo efetuar login para acessar funcionalidades exclusivas do meu papel. | 08 | 1 | - O ADMINISTRADOR deve conseguir efetuar login devidamente na aplicação; |
| 07 | 06 | Baixa | Eu como SUPER ADMINISTRADOR desejo cadastrar outros usuários administradores para facilitar a administração da aplicação. | 03 | 1 | - O SUPER ADMINISTRADOR deve conseguir cadastrar devidamente um novo administrador; | 
| 07 | 07 | Baixa | Eu como ADMINISTRADOR desejo alterar minhas próprias informações de cadastro para a manutenção do perfil. | 02 | 1 | - O ADMINISTRADOR deve conseguir alterar suas informações com sucesso; |
| 05 | 08 | Baixa |Eu como ADMINISTRADOR desejo cadastrar tipos de alertas para visualizar que tipo de alertas os usuários poderão receber. | 03 | 1 | - O ADMINISTRADOR deve conseguir cadastrar/editar tipos com sucesso; <br> - TODOS OS USUÁRIOS devem poder visualizar os tipos de alertas cadastrados | 
| 02 | 09 | Alta | Eu como ADMINISTRADOR desejo receber dados simulados para alimentar a aplicação. | 13 | 2 | A aplicação deve receber dados (mockados por hora) dos sensores devidamente; <br> - A aplicação deve armazenar os dados da aplicação devidamente; <br> - A aplicação deve garantir a recepção dos dados mesmo sob requisições grandes; |
| 02 | 10 | Alta | Eu como ADMINISTRADOR E USUÁRIO COMUM desejo que os dados recebidos sejam interpretados para dados palpáveis. | 05 | 2 | - A aplicação deve interpretar os dados recebidos conforme os parâmetros configurados por estação. | 
| 03 | 11 | Média | Eu como ADMINISTRADOR E USUÁRIO COMUM desejo visualizar uma dashboard com gráficos informativos sobre a variação dos parâmetros das estações. | 08 | 2 | As dashboards devem possuir filtros por período e estação; <br> - O usuário deve ter a capacidade de definir a unidade de medida padrão da dashboard; <br> - As dashboards devem apresentar conceitos estatísticos; | 
| 01 | 13 | Alta | Eu como ADMINISTRADOR desejo conectar estações à aplicação para poder exibir e manipular seus parâmetros. | 05 | 3 | - A estação deve ter a capacidade de se conectar a aplicação por wifi; <br> - A instalação da estação deve ser simples e rápida; |
| 02 | 14 | Alta | Eu como ADMINISTRADOR desejo receber parâmetros das estações para administrar e visualizar tais dados. | 08 | 3 | - A estação deve coletar os parâmetros à partir dos sensores e enviá-los para o broker (datalogger); <br> - A estação deve garantir que, mesmo que um data não tenha sida coletado devidamente, os outros sejam enviados sem problemas; |
| 05 | 15 | Média | Eu como ADMINISTRADOR E USUÁRIO COMUM desejo receber alertas sobre condições meteorológicas extremas. | 08 | 3 | - O ADMINISTRADOR E USUÁRIO COMUM devem receber alertas sob condições meteorológicas extremas; <br> - O alerta deve ser exibido tanto em notificação do website bem como fora dele (Notificações do navegador); |
| 06 | 16 | Baixa | Eu como USUÁRIO COMUM desejo visualizar guias explicativos sobre os parâmetros e sua coleta para compreender os conceitos físicos por trás dos mesmos. | 05 | 3 | Os guias devem ser ilustrados atrativos para o público infanto-juvenil; <br> - Todos os parâmetros devem apresentar os guias com informações sobre, a coleta, a unidade de medida, a física e no que isso afeta o ambiente (no caso de situação excessiva ou escassa); <br> - Além disso guias sobre a estação; |

<br>

<span id="entregas">

# 🏁 Entregas de Sprints

Cada entrega foi realizada a partir da criação de uma **tag** em cada repositório, além da criação de uma branch neste repositório com um relatório completo de tudo o que foi desenvolvido naquela sprint.
| Sprint | Previsão de entrega | Status | Histórico |
|:--:|:----------:|:-------------------|:-------------------------------------------------:|
| 01 | 08/09/2025 a 28/09/2025 | Em andamento | [Ver relatório]() |
| 02 | 06/10/2025 a 26/10/2025 | Em breve | [Ver relatório]() |
| 03 | 03/11/2025 a 23/11/2025 | Em breve |  [Ver relatório]()|

<br />

<span id="tecnologias">

# 🛠️ Tecnologias Utilizadas

As seguintes ferramentas, linguagens, bibliotecas e tecnologias foram usadas na construção do projeto:

![Typescript](https://img.shields.io/badge/TypeScript-20232A?style=for-the-badge&logo=typescript&logoColor=007ACC)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node%20js-20232A?style=for-the-badge&logo=nodedotjs&logoColor=339933)
![Next](https://img.shields.io/badge/Nextjs-20232A?style=for-the-badge&logo=next.js&logoColor=23ED8B00)
![Express](https://img.shields.io/badge/Expressjs-20232A?style=for-the-badge&logo=express&logoColor=23ED8B00)
![Arduino](https://img.shields.io/badge/Arduino-20232A?style=for-the-badge&logo=arduino&logoColor=00979D)
![Docker](https://img.shields.io/badge/docker-20232A?style=for-the-badge&logo=docker&logoColor=87CEEB)
![MySQL](https://img.shields.io/badge/mysql-20232A?style=for-the-badge&logo=mysql&logoColor=4682B4)
![MongoDB](https://img.shields.io/badge/MongoDB-20232A?style=for-the-badge&logo=mongodb&logoColor=234ea94b)
![CSS3](https://img.shields.io/badge/css3-20232A?style=for-the-badge&logo=css3&logoColor=4682B4)
![Figma](https://img.shields.io/badge/figma-20232A?style=for-the-badge&logo=figma&logoColor=800000)
![Discord](https://img.shields.io/badge/Discord-20232A?style=for-the-badge&logo=discord&logoColor=61DAFB)
![Jira](https://img.shields.io/badge/Jira-20232A?style=for-the-badge&logo=Jira&logoColor=4169E1)

<br>


## DoR (Definition of Ready) 

- **User Stories completas:** Todos os requisitos descritos em User Stories planejadas para caber na sprint.
- **Tarefas detalhadas e atribuídas:** Cada User Story deve ter ao menos uma task detalhada e atribuída a um responsável.
- **Critérios de aceitação definidos:** Cada User Story deve ter critérios de aceitação bem estabelecidos.
- **Estimativas definidas:** Todas as User Stories devem ter uma estimativa de esforço/tamanho feita pelo time
- **Wireframe/Mockup aprovados:** O cliente deve ter validado e aprovado os protótipos visuais.
- **Modelo de dados finalizado:** Estrutura de dados completamente definida e documentada.
- **Testes de aceitação definidos:** Incluindo testes sugeridos pelo cliente e testes de aceitação.
- **Ambiente de desenvolvimento pronto:** O time deve ter acesso a todos os ambientes, ferramentas e permissões necessárias.

<br>

## DoD (Definition of Done) 

- **Critérios de aceitação validados:** Todos os critérios de aceitação foram atendidos e verificados com testes apropriados.
- **Execução de testes adequados:** Testes unitários, de integração e de aceitação foram realizados para garantir a estabilidade e funcionamento correto da aplicação.
- **Código-fonte completo e padronizado:** O código está 100% implementado, refatorado e segue as boas práticas e padrões de qualidade definidos.
- **Commits organizados e documentados:** Os commits seguem a nomenclatura acordada, são claros, segmentados e possuem histórico bem documentado.
- **Guia de instalação detalhado:** A documentação de instalação é clara e completa, permitindo que qualquer usuário ou desenvolvedor configure e execute a aplicação sem dificuldades.
- **Manual do usuário disponível:** Um manual foi criado para orientar o cliente sobre o funcionamento da aplicação.

<br>

<span id="links">

# 🔗 Links úteis
- [Modelo lógico do Banco de Dados](https://drive.google.com/file/d/12QT37gpqIwlUWXJmurE72GGgu8Mt4sjX/view?usp=sharing)
- [Product backlog detalhado](https://docs.google.com/document/d/1vjvclXg3ROMe8RTefvWXqM33MQ0H1MwmVwH9GwyZX0k/edit?usp=sharing)
- [Wireframe da aplicação](https://www.figma.com/design/I2ve5ty4HGnBXGKYEpamqh/Atmos?node-id=0-1&p=f&t=etRZoSKjtiXJjEUf-0)
- [Arquitetura do projeto](https://drive.google.com/file/d/1Z24zyW6E9l9ZoS8rbZVUWsgV5O73bVz_/view?usp=sharing)
<br>


<span id="autores">

# 👥 Equipe


|    Função     | Nome                                  |                                                                                                                                                      LinkedIn & GitHub                                                                                                                                                      |
| :-----------: | :------------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| Team Member   | Eric Lourenço Mendes da Silva      |         [![Linkedin Badge](https://img.shields.io/badge/Linkedin-blue?style=flat-square&logo=Linkedin&logoColor=white)]() [![GitHub Badge](https://img.shields.io/badge/GitHub-111217?style=flat-square&logo=github&logoColor=white)](https://github.com/ericloumendes)        |