import { useState } from 'react';
import { ethers } from 'ethers';

export default function ConnectWallet({ setProvider, setSigner, setAccount }) {
  const [error, setError] = useState('');

  async function connect() {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const account = await signer.getAddress();
        setProvider(provider);
        setSigner(signer);
        setAccount(account);
        setError('');
      } catch (err) {
        setError('Error conectando MetaMask');
      }
    } else {
      setError('Por favor instala MetaMask');
    }
  }

  return (
    <div>
      <button onClick={connect} className="btn btn-primary">
        Conectar Wallet
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
