'use client';
import Web3 from 'web3';
import { useState, useEffect } from 'react';
import detectEthereumProvider from '@metamask/detect-provider';

const providerRPC = {
  moonbase: 'https://rpc.api.moonbase.moonbeam.network',
};

let web3: Web3 | null = null;

// Initialize web3 with Moonbase RPC
if (typeof window !== 'undefined') {
  web3 = new Web3(providerRPC.moonbase);
}

const rewardTokenAddress = "DEPLOYED_CONTRACT_ADDRESS"; // Replace with your deployed contract address

const rewardTokenABI = [
  // Replace with the actual ABI from artifacts/contracts/RewardToken.sol/RewardToken.json
  // Example ABI
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "transfer",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

let rewardTokenContract: any = null;

if (web3) {
  rewardTokenContract = new web3.eth.Contract(rewardTokenABI, rewardTokenAddress);
}

export default function Home() {
  const [address, setAddress] = useState('');
  const [milestones, setMilestones] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // This will run once when the component is mounted
    if (!rewardTokenContract) {
      console.error('Smart contract not initialized');
      setError('Smart contract not initialized');
    }
  }, []);

  const connectWallet = async () => {
    const provider = await detectEthereumProvider();
    if (provider) {
      try {
        await provider.request({ method: 'eth_requestAccounts' });
        const accounts = await web3!.eth.getAccounts();
        setAddress(accounts[0]);
        setError(null);
      } catch (error) {
        console.error('User rejected the request.');
        setError('User rejected the request.');
      }
    } else {
      console.error('Please install MetaMask!');
      setError('Please install MetaMask!');
    }
  };

  const handleCompleteMilestone = async () => {
    if (milestones >= 5) {
      try {
        await rewardTokenContract.methods.mint(address, web3!.utils.toWei("1", "ether")).send({ from: address });
        alert("Token minted successfully!");
        setMilestones(0);
        setError(null);
      } catch (error) {
        console.error(error);
        setError('Token minting failed!');
      }
    } else {
      setMilestones(milestones + 1);
      setError(null);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Milestone Reward System</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={connectWallet}>Connect MetaMask</button>
      <p>Connected Address: {address}</p>
      <button onClick={handleCompleteMilestone} style={{ marginBottom: '20px' }}>
        Complete Milestone
      </button>
      <p>Milestones Completed: {milestones}</p>
    </div>
  );
}