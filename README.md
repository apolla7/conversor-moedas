# Conversor de Moedas para Compras Internacionais

## Sobre o Projeto

Conversor de Moedas que utiliza a cotação PTAX do Banco Central para calcular o custo final de compras internacionais no cartão de crédito, incluindo spread bancário e IOF.

## Funcionalidades

*   Busca automática da cotação PTAX de venda mais recente do Banco Central do Brasil.
*   Seleção de diversas moedas estrangeiras (USD, EUR, GBP, etc.).
*   Lista configurável de bancos emissores de cartão com seus respectivos percentuais de spread.
*   Cálculo automático do IOF (Imposto sobre Operações Financeiras) de 3,38%.
*   Opção para remover o IOF do cálculo e visualizar o valor sem o imposto.
*   Detalhamento completo do cálculo: valor da PTAX, valor do spread, cotação com spread, valor em BRL sem IOF, valor do IOF e valor total em BRL.

## Tecnologias Utilizadas

*   Next.js
*   React
*   TypeScript
*   Tailwind CSS
*   Lucide Icons
*   API de Cotações do Banco Central do Brasil (Olinda)
*   Deploy via Vercel

## Como Usar

1.  Selecione a moeda estrangeira desejada.
2.  Insira o valor da compra na moeda estrangeira.
3.  Escolha o banco emissor do seu cartão de crédito.
4.  (Opcional) Marque "Remover IOF?" para ver o cálculo sem este imposto.
5.  Clique em "Calcular Conversão" para ver o resultado detalhado.
