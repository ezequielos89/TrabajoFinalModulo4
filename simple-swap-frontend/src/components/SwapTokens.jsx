import { useState } from 'react';
import { ethers } from 'ethers';
import simpleSwapAbi from '../abi/simpleSwap.json';
import erc20Abi from '../abi/erc20.json';
import faucetAbi from '../abi/faucet.json';
import { getAddresses } from '../utils/contractaddresses';

const SwapTokens = ({ signer }) => {
  const [tokenA, setTokenA] = useState('');
  const [tokenB, setTokenB] = useState('');
  const [amount, setAmount] = useState('');
  const { simpleSwap, faucet } = getAddresses();

  // --- SWAP DE TOKENS ---
  const swapExactTokensForTokens = async () => {
    if (!tokenA || !tokenB || !signer || !amount) {
      return alert("🛑 Completá todos los campos y conectá la wallet.");
    }

    try {
      const userAddress = await signer.getAddress();
      const contract = new ethers.Contract(simpleSwap, simpleSwapAbi, signer);
      const tokenContract = new ethers.Contract(tokenA, erc20Abi, signer);

      const amountIn = ethers.parseUnits(amount, 18);
      const deadline = Math.floor(Date.now() / 1000) + 600;

      // Aprobación previa
      const allowance = await tokenContract.allowance(userAddress, simpleSwap);
      if (allowance < amountIn) {
        const txApprove = await tokenContract.approve(simpleSwap, ethers.MaxUint256);
        await txApprove.wait();
      }

      // Swap
      const txSwap = await contract.swapExactTokensForTokens(
        amountIn,
        0,
        [tokenA, tokenB],
        userAddress,
        deadline
      );
      await txSwap.wait();

      alert("✅ Swap exitoso.");
    } catch (err) {
      console.error("❌ Error en el swap:", err);
      alert("❌ Error: " + (err.reason || err.message));
    }
  };

  // --- OBTENER TOKENS DE PRUEBA ---
  const getTestTokens = async () => {
    if (!signer) return alert("🛑 Conectá tu wallet.");
    try {
      const faucetContract = new ethers.Contract(faucet, faucetAbi, signer);
      const tx = await faucetContract.claim();
      await tx.wait();
      alert("✅ Tokens de prueba obtenidos desde el Faucet.");
    } catch (err) {
      console.error("❌ Error al obtener tokens:", err);
      alert("❌ Error: " + (err.reason || err.message));
    }
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2>Swap de Tokens</h2>
      <input
        type="text"
        placeholder="Dirección Token A"
        value={tokenA}
        onChange={(e) => setTokenA(e.target.value)}
        style={{ display: 'block', marginBottom: '10px', width: '100%' }}
      />
      <input
        type="text"
        placeholder="Dirección Token B"
        value={tokenB}
        onChange={(e) => setTokenB(e.target.value)}
        style={{ display: 'block', marginBottom: '10px', width: '100%' }}
      />
      <input
        type="text"
        placeholder="Cantidad a intercambiar"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={{ display: 'block', marginBottom: '10px', width: '100%' }}
      />
      <button onClick={swapExactTokensForTokens}>Hacer Swap</button>
      <hr style={{ margin: '20px 0' }} />
      <button onClick={getTestTokens}>Obtener Tokens de Prueba</button>
    </div>
  );
};

export default SwapTokens;
