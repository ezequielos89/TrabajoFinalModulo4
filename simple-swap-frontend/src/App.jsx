import { useState } from 'react';
import ConnectWallet from './components/connectWallet';
import GetPrice from './components/getPrice';
import SwapTokens from './components/SwapTokens';
import { getAddresses } from './utils/contractaddresses';

const addresses = getAddresses();

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);

  return (
    <div className="App" style={{ padding: '2rem' }}>
      <h1>SimpleSwap Frontend</h1>

      <ConnectWallet
        setProvider={setProvider}
        setSigner={setSigner}
        setAccount={setAccount}
      />

      {account && (
        <div>
          <p>Cuenta conectada: {account}</p>
          <p><strong>Dirección SimpleSwap:</strong> {addresses.simpleSwap}</p>
        </div>
      )}

      {provider && <GetPrice provider={provider} />}
      {signer && <SwapTokens signer={signer} />}
    </div>
  );
}

export default App;
