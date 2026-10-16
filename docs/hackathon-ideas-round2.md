# Hackathon "Agents on Open Rails" — ronda 2: precedentes y evaluación de 3 ideas

Fecha: 2026-10-10 · Origen: workflow `deep-research` (101 agentes, 25 claims verificados: 17 confirmados, 8 refutados)
Continúa `docs/hackathon-ideas.md`. Restricción del usuario: una persona, TypeScript, ~4 semanas, **terminar y presentar** vale más que impresionar.

> Parte 1 = hechos verificados. Parte 2 = mi evaluación (opinión). Parte 3 = qué no se verificó.
> Ningún criterio de jurado del hackathon actual está confirmado.

---

## Parte 1 — Hechos verificados

### 1.1 Qué ganó antes (patrones)
| Evento | Ganadores | Dato útil | Confianza |
|---|---|---|---|
| **Celo Onchain Agents** (may–jun 2026, 73 proyectos, US$5K en CELO) | 1º RemitRoute (agente always-on de finanzas con reglas en lenguaje natural) · 2º AjoAI (ahorro rotativo dentro de MiniPay) · 3º Monipay (intents de pago desde X, Telegram y Discord) | Hubo premios **aparte** por actividad on-chain (Spawn Protocol, "Most Activity") y por ranking ERC-8004 | alta |
| **Arc / lablab** (ene 2026) | OmniAgentPay 1º y Arc Merchant (micropagos x402) 2º, en un side-track de Google | Son otra cadena; la página no explica por qué ganaron | media |
| **Algorand x402 Berlín** (jun 2026) | Erster (verificación de confianza paga) y Liminal x402 (enrutamiento a proveedor confiable) 1º; Lockpay (escrow por hitos) 2º | Tema repetido: confianza entre agentes que se pagan (inferencia del recap) | media |
| **Solana x402** (oct–nov 2025, hasta US$135K) | 5 tracks (Trustless Agent, API Integration, MCP Server, Dev Tool, Agent Application) | Plantilla de entrega: **open source, video de demo ≤3 min, documentación y despliegue** | alta |

Fuentes: https://celo-devs.beehiiv.com/p/congrats-onchain-agents-hackathon-winners · https://lablab.ai/blog/agentic-commerce-on-arc-ai-hackathon · https://algorand.co/blog/agentic-commerce-x402-hackathon-berlin-recap · https://solana.com/x402/hackathon

Patrón que se repite (inferencia, no cifra): ganan agentes con **un caso de uso claro y entendible**, con **actividad on-chain medible** y una **interfaz conocida** (Telegram, MiniPay, X). No ganaron las ideas grandes y abstractas.

### 1.2 Estado del mercado x402 (confianza: media, métodos discutidos)
- TRM: tras filtrar autopagos, flujos de 1–2 pagadores y vendedores con menos de 10 compradores, el volumen cae cerca de la mitad. Solo **0,6%–7,5%** del comercio filtrado parece agéntico.
- Artemis estima ~50% de transacciones artificiales (wash trading). Visa/Artemis: ~4.000 wallets concentran ~90% del gasto ajustado.
- x402.org reporta ~75,4M de transacciones y ~US$24M en 30 días (cifra de titular).
- **Lectura defendible:** la demanda agente-a-agente real está en gran parte sin probar. No presentar la demo como "mercado".
- Fuentes: https://www.trmlabs.com/trm-tech-blog/whos-actually-paying-measuring-ai-agent-payments-onchain · https://forkast.news/?p=127370 · https://thedefiant.io/news/infrastructure/visa-s-sheffield-pegs-adjusted-x402-volume-at-19m
- **No citar** (refutadas): "volumen diario real US$28–40K", "ticket promedio US$0,32 / 95% señalización", "x402 acumulado de solo US$52,7M", "Visa fija US$19M como prueba de volumen minúsculo".

### 1.3 Infraestructura Celo
- El facilitador x402 de Celo es hosteado y open source, con liquidación de ~1 s y gas menor a US$0,001 (cifras del operador). Hay una guía de terceros con servidor funcional usando `paymentMiddleware`, `HTTPFacilitatorClient` y `ExactEvmScheme` en `eip155:42220` (votos 2-1).
  Fuente: https://celo-devs.beehiiv.com/p/agentic-payments-defai-hackathon
- Ya se había verificado en la ronda anterior (`x402.celo.org/skill.md`, 2026-10-09) que soporta **wARS, wBRL y wCOP**. En esta ronda no se reconfirmó; se mantiene como dato de la ronda 1.
- Textile FX opera wARS y wBRL con respaldo de Tribeca Park Capital (3-0). Uniswap no aparece nombrado. Sin datos de profundidad ni volumen.

### 1.4 Escrow con juez LLM (precedentes)
- **TrustLayer / AI-Trustless Escrow** (ETHOnline 2025): escrow PYUSD con GPT-4o + reglas, evidencia en IPFS con raíz Merkle on-chain. Si la confianza es menor a 0,90, pasa a un panel de 3 árbitros con multisig 2-de-3. Estaba en Sepolia con token mock.
  Fuente: https://ethglobal.com/showcase/ai-trustless-escrow-eg79v
- **Lockpay** (escrow por hitos, sin LLM juez) ganó 2º en Agentic Commerce en Algorand (US$2.000).
- Los diseños existentes **no dejan al LLM decidir solo** (lectura 2-1; es inferencia, la página no lo explica).

---

## Parte 2 — Evaluación de tus 3 ideas (opinión mía)

### Idea 1 — Servicios agente-a-agente vía x402 (Track 3 / Track 1)
- **Lo bueno:** es lo único con infraestructura confirmada hoy y la más entregable (servidor Express con middleware + cliente que atrapa el 402). Encaja con el patrón de los hackathons x402.
- **Problema 1, demanda:** el mercado real es mucho menor que el titular. Si lo vendés como "mercado de agentes", un jurado informado lo ve como demo.
- **Problema 2, genérica:** "un agente paga cómputo a otro" ya se hizo en todos los hackathons x402. El diferenciador tiene que ser **local**.
- **Problema 3, aritmética de la demo:** "0,05 wARS" es una fracción de centavo porque el peso vale mucho menos que el dólar. En moneda local se cobra en decenas o cientos de pesos. Hay que fijar precios con sentido.
- **Cuidado:** si vos mismo generás los pagos para inflar actividad on-chain, es lo que TRM y Artemis marcan como wash trading. En la demo conviene declararlo.
- **Veredicto:** buena base, mala como idea sola. Necesita un servicio con sentido local.

### Idea 2 — Escrow con juez LLM (Track 1)
- **A favor:** hay precedentes (TrustLayer, Lockpay), es fácil de explicar y usa wARS/wBRL.
- **En contra:**
  - Es un **contrato Solidity que custodia fondos**: riesgo de seguridad sin auditoría. Para una persona en 4 semanas es el mayor riesgo técnico.
  - El LLM como juez es manipulable (prompt injection) y los diseños serios agregan árbitros humanos. Sin eso no es creíble.
  - Hay riesgos legales en LatAm que **no se investigaron**.
  - Es un patrón ya recorrido en hackathons.
- **Variante entregable:** escrow por hitos con liberación por confirmación de ambas partes o por timeout, y el LLM como **asesor** que resume evidencia, no como juez final.
- **Veredicto:** viable solo en versión reducida; no la pondría primera.

### Idea 3 — Micro-arbitraje wARS/wBRL (Track 2)
- **Problema de fondo (conceptual):** wARS y wBRL son monedas distintas. El "precio" wARS/wBRL es el tipo de cambio ARS/BRL, no un precio del mismo activo en dos lugares. Un arbitraje exige comparar contra una referencia externa, y entre ARS oficial, MEP y blue ya hay brechas políticas que no se cierran con un swap on-chain.
- **Sin evidencia:** no hay datos verificados de pools, profundidad, spreads, bots ni MEV. La premisa de respaldo 1:1 **no pasó verificación** (votó 1-2).
- **Riesgo:** ejecutar swaps con fondos propios, con liquidez que puede ser muy baja.
- **Veredicto:** la más riesgosa. La descartaría como proyecto; sí sirve **como medición**: es parte del spike.

---

## Parte 3 — Recomendación (hipótesis mía, no hecho)

### Propuesta: unir la idea original con la Idea 1
En vez de un router que ejecuta, un **servicio x402 vertical, de moneda local, vendido por llamada**:
- **Lado vendedor:** una API que cobra en wARS/wBRL por consulta. Ejemplos: cotización ARS↔BRL comparando rutas, o tipo de cambio de referencia con costo estimado de envío. Es la idea original, ahora **como producto que un agente compra**.
- **Lado comprador:** un agente con presupuesto en moneda local (la idea de la ronda 1) que paga esa API y rinde cuentas en pesos.
- **Interfaz:** bot de Telegram para fijar el presupuesto y ver gastos (el patrón de Monipay), más una página de solo lectura con los links a las transacciones.

Por qué esta combinación: usa solo infraestructura confirmada, tiene un caso de uso local entendible, no depende de la profundidad de wBRL (si no hay, la API cotiza y avisa), y se parece a lo que ganó antes. La Idea 2 reducida queda como extra si sobra tiempo.

### Plan de 4 semanas (estimación mía)
| Semana | Entregable | Punto de corte |
|---|---|---|
| 1 | Spike: `/supported` del facilitador, EIP-3009 en wARS/wBRL, primeras cotizaciones | Si wARS no funciona por x402, se cambia la base |
| 2 | API vendedora con middleware x402 y precios en pesos | Un pago real de punta a punta |
| 3 | Agente comprador con motor de presupuesto + bot de Telegram | Demo corriendo en vivo |
| 4 | Página de solo lectura, README, video ≤3 min, despliegue | Entrega con tiempo de sobra |

### Tradeoffs honestos
- Todo se apoya en que el facilitador acepte wARS en la práctica. Se verifica en la semana 1.
- La demanda no está probada. El valor del proyecto es el **funcionamiento y la claridad**, no el volumen.
- Para firmar pagos hace falta una wallet con fondos. Debe ser una wallet nueva con tope, y el spike sigue sin claves.

---

## Parte 4 — No verificado
- Criterios de jurado y ponderación del hackathon actual; si hay premios por actividad o por pagos x402 (el claim sobre el hackathon de julio con premios por ingresos fue **refutado 0-3**).
- Si el facilitador acepta wFiat en las pruebas reales; si la API key de `x402.celo.org` es self-service; qué servicios hay en `buy`.
- Liquidez, pools y spreads de wARS/wBRL/wMXN; respaldo 1:1 de las wFiat.
- Kleros, UMA, Reality.eth; riesgos legales y de seguridad del escrow; viabilidad del LLM como árbitro.
- Una adjudicación real de Kleros/ClawBank: refutada 1-2.

## Preguntas abiertas (para el spike y los DevRels)
1. ¿El facilitador acepta wARS/wBRL en producción y la API key es self-service?
2. ¿Qué criterios declara la página oficial del hackathon, y hay premios por actividad on-chain?
3. ¿Qué liquidez real hay en Textile FX y Uniswap?
4. ¿Qué servicios existen hoy en `buy` y aceptan moneda local?
