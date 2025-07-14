import { useState } from 'react';
import { ethers } from 'ethers';
import simpleSwapAbi from '../abi/simpleSwapABI.json';

const contractAddress = '0x25FC33b454Fb485e57484861439dE64F95B749AB';

function GetPrice({ provider }) {
  const [tokenA, setTokenA] = useState('');
  const [tokenB, setTokenB] = useState('');
  const [price, setPrice] = useState(null);

  const getPrice = async () => {
    if (!tokenA || !tokenB || !provider) {
      return alert('Completa ambos tokens y conectá la wallet.');
    }

    if (!ethers.isAddress(tokenA) || !ethers.isAddress(tokenB)) {
      return alert('Dirección de token inválida.');
    }

    try {
      const contract = new ethers.Contract(contractAddress, simpleSwapAbi, provider);
      const result = await contract.getPrice(tokenA, tokenB);

      if (result === 0n) {
        alert('No hay liquidez entre estos tokens.');
        return;
      }

      const formatted = ethers.formatUnits(result, 18);
      setPrice(formatted);
    } catch (err) {
      console.error('Error al obtener el precio:', err);
      alert('⚠️ Error al obtener el precio: ' + (err.reason || err.message));
    }
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <h3>Consultar precio entre dos tokens</h3>
      <input
        type="text"
        placeholder="Dirección del Token A"
        value={tokenA}
        onChange={(e) => setTokenA(e.target.value)}
        style={{ marginRight: '10px' }}
      />
      <input
        type="text"
        placeholder="Dirección del Token B"
        value={tokenB}
        onChange={(e) => setTokenB(e.target.value)}
      />
      <br /><br />
      <button onClick={getPrice}>Obtener precio</button>
      {price && <p>Precio actual: {price}</p>}
    </div>
  );
}

export default GetPrice;
