import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { simpleSwapABI } from '../abi/simpleSwapABI';

const CONTRACT_ADDRESS = '0x25FC33b454Fb485e57484861439dE64F95B749AB';
export default function SimpleSwapUI({ signer }) {
  const [tokenA, setTokenA] = useState('');
  const [tokenB, setTokenB] = useState('');
  const [amountIn, setAmountIn] = useState('');
  const [amountOutMin, setAmountOutMin] = useState('');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState('');
  const [contract, setContract] = useState(null);

  useEffect(() => {
    if (signer) {
      const instance = new ethers.Contract(CONTRACT_ADDRESS, simpleSwapABI, signer);
      setContract(instance);
    }
  }, [signer]);

  const fetchPrice = async () => {
    try {
      const p = await contract.getPrice(tokenA, tokenB);
      setPrice(ethers.formatUnits(p.toString(), 18));
    } catch (err) {
      setStatus('Error al obtener precio: ' + err.message);
    }
  };

  const swapTokens = async () => {
    try {
      const path = [tokenA, tokenB];
      const deadline = Math.floor(Date.now() / 1000) + 600; // 10 min

      const tokenAContract = new ethers.Contract(tokenA, simpleSwapABI, signer);
      const txApprove = await tokenAContract.approve(CONTRACT_ADDRESS, ethers.parseUnits(amountIn, 18));
      await txApprove.wait();

      setStatus('Swappeando...');
      const tx = await contract.swapExactTokensForTokens(
        ethers.parseUnits(amountIn, 18),
        ethers.parseUnits(amountOutMin, 18),
        path,
        await signer.getAddress(),
        deadline
      );
      await tx.wait();
      setStatus('✅ Swap exitoso');
    } catch (err) {
      setStatus('❌ Error en el swap: ' + err.message);
    }
  };

  return (
    <div>
      <h2>SimpleSwap UI</h2>
      <input placeholder="Dirección Token A" value={tokenA} onChange={e => setTokenA(e.target.value)} />
      <input placeholder="Dirección Token B" value={tokenB} onChange={e => setTokenB(e.target.value)} />
      <input placeholder="Cantidad a intercambiar" value={amountIn} onChange={e => setAmountIn(e.target.value)} />
      <input placeholder="Mínimo a recibir" value={amountOutMin} onChange={e => setAmountOutMin(e.target.value)} />

      <button onClick={swapTokens}>Realizar Swap</button>
      <button onClick={fetchPrice}>Obtener Precio</button>

      {price && <p>💱 Precio: {price}</p>}
      {status && <p>{status}</p>}
    </div>
  );
}
