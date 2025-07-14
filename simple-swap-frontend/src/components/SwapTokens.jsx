import { useState } from 'react';
import { ethers } from 'ethers';
import simpleSwapAbi from '../abi/simpleSwap.json';
import erc20Abi from '../abi/erc20.json';
import { getAddresses } from '../utils/contractaddresses';

const SwapTokens = ({ signer }) => {
  const [tokenA, setTokenA] = useState('');
  const [tokenB, setTokenB] = useState('');
  const [amount, setAmount] = useState('');

  const { simpleSwap: contractAddress } = getAddresses();

  const swapExactTokensForTokens = async () => {
    if (!tokenA || !tokenB || !signer || !amount) {
      return alert("🛑 Completá todos los campos y conectá la wallet.");
    }

    try {
      const userAddress = await signer.getAddress();
      const contract = new ethers.Contract(contractAddress, simpleSwapAbi, signer);
      const tokenContract = new ethers.Contract(tokenA, erc20Abi, signer);

      const amountIn = ethers.parseUnits(amount, 18);
      const deadline = Math.floor(Date.now() / 1000) + 600;

      // ✅ Aprobación previa si no existe
      const allowance = await tokenContract.allowance(userAddress, contractAddress);
      if (allowance < amountIn) {
        const txApprove = await tokenContract.approve(contractAddress, ethers.MaxUint256);
        await txApprove.wait();
      }

      // 🔄 Swap
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
    </div>
  );
};

export default SwapTokens;
