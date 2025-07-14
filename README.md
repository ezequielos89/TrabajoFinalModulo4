# 💱 SimpleSwap - Trabajo Práctico Módulo 4

Este proyecto corresponde al Trabajo Práctico del **Módulo 4** de Blockchain, donde se implementa un frontend en React para interactuar con el contrato inteligente `SimpleSwap`, desarrollado en el Módulo 3.

El objetivo es permitir a los usuarios conectar su billetera, obtener precios de tokens, realizar swaps entre dos tokens ERC-20 y manejar liquidez, con pruebas unitarias que aseguren su correcto funcionamiento.

---

## 🚀 Funcionalidades

- ✅ Conexión con billetera (MetaMask)
- ✅ Obtener el precio entre dos tokens (`getPrice`)
- ✅ Realizar swaps (`swapExactTokensForTokens`)
- ✅ Aprobación automática de tokens si es necesario
- ✅ Testing de contrato con cobertura superior al 50%

---

## 🛠️ Tecnologías usadas

- [Solidity](https://soliditylang.org/)
- [Hardhat](https://hardhat.org/)
- [React + Vite](https://vitejs.dev/)
- [Ethers.js](https://docs.ethers.org/)
- [MetaMask](https://metamask.io/)
- [OpenZeppelin](https://docs.openzeppelin.com/contracts)

---

## 📦 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/ezequielos89/TrabajoFinalModulo4.git
cd TrabajoFinalModulo4/simpleSwap
----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
Instalar dependencias del backend (contrato)
npm install

Correr Hardhat localmente
En una terminal nueva:
npx hardhat node
Esto levanta una blockchain local en localhost:8545

Deploy del contrato
En otra terminal (con node corriendo):
npx hardhat run scripts/deploy.js --network localhost
Guardá la dirección del contrato que se despliega para usar en el frontend
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
Frontend
Ir al directorio del frontend
cd ../simple-swap-frontend

Instalar dependencias del frontend
npm install

Iniciar la app
npm run dev
Abre tu navegador en: http://localhost:5173
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
Testing
Para correr los tests del contrato y generar el informe de cobertura:
npx hardhat coverage
