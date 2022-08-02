import './App.css';
import Home from './components/Home';
import Navbar from './components/Navbar';
import Safe from './views/Safe';
import Landing from './views/Landing'
import Safes from './views/Safes';
import { useEffect, useState } from 'react';
import axios from "axios";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { createClient } from "@supabase/supabase-js";
import { Route, Routes } from 'react-router-dom';


const INFURA_ID = "460f40a260564ac4a4f4b3fffb032dad";

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

function App() {
  const [address, setAddress] = useState(null);
  const [signer, setSigner] = useState(null);
  const [injectedProvider, setInjectedProvider] = useState();
  const [connectedNetwork, setConnectedNetwork] = useState();
  const [web3Modal, setWeb3Modal] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // initiate web3modal
    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          bridge: "https://polygon.bridge.walletconnect.org",
          infuraId: INFURA_ID,
          rpc: {
            1: `https://mainnet.infura.io/v3/${INFURA_ID}`,
            100: "https://dai.poa.network", // xDai
          },
        },
      },
    };

    const newWeb3Modal = new Web3Modal({
      cacheProvider: true, // very important
      network: "mainnet",
      providerOptions,
    });

    setWeb3Modal(newWeb3Modal);
  }, []);

  async function connectWallet() {
    const web3provider = await web3Modal.connect();

    addListeners(web3provider);

    const provider = new ethers.providers.Web3Provider(web3provider);
    setInjectedProvider(provider);

    const signer = await provider.getSigner();
    setSigner(signer);

    const network = await provider.getNetwork();
    setConnectedNetwork(network.name);
    const _address = await signer.getAddress();
    console.log("Connected user address => ", _address);
    setAddress(_address);
    if (!localStorage.getItem("user_id")) {
      await signIn(_address, signer);
    }
    setIsConnected(true)
  }

  useEffect(() => {
    if (injectedProvider) {
      const changeNetwork = async () => {
        const network = await injectedProvider.getNetwork();
        setConnectedNetwork(network.name);  
      }
      // const changeAddress = async () => {
      //   const signer = await injectedProvider.getSigner();
      //   const address = await signer.getAddress();
      //   setAddress(address) 
      //   refreshId(address)
      // }
      changeNetwork();
      //changeAddress();
    }
  }, [injectedProvider])

  const addListeners = (provider) => {
    provider.on("chainChanged", (chainId) => {
      console.log(`chain changed to ${chainId}! updating providers`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });

    provider.on("accountsChanged", () => {
      console.log(`account changed!`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
      window.location.reload()
    });

    // Subscribe to session disconnection
    provider.on("disconnect", (code, reason) => {
      console.log(code, reason);
      logoutOfWeb3Modal();
      localStorage.removeItem("supa_token");
      localStorage.removeItem("user_id");
      setIsConnected(false)
    });
  };

  // const checkUser = async () => {
  //   const { data } = await supabase.from("users").select();
  //   console.log(data);
  // };

  //This function is not necessary for the moment as we reload the dom when the user is changing account
  // const refreshId = async (_address) => {
  //   const options = {
  //     params: { data: _address },
  //   };
  //   localStorage.removeItem('user_id')

  //   const { id } = await axios
  //     .get(`/signup`, options)
  //     .then(async function (response) {
  //       const { id } = response.data;
  //       return { id };
  //     })
  //     .catch(function (error) {
  //       console.log("erreur", error);
  //     });

  //   localStorage.setItem('user_id', id)
  //   console.log("account changed, user id => ", id)
  // }

  const signIn = async (address, signer) => {
    console.log("Verifying your account, with the following addres:", address);
    const options = {
      params: { data: address },
    };

    const { nonce, id } = await axios
      .get(`/signup`, options)
      .then(async function (response) {
        const { nonce, id } = response.data;
        return { nonce, id };
      })
      .catch(function (error) {
        console.log("erreur", error);
      });

    console.log("Sign the message with the nonce ...");
    const signature = await signer.signMessage(nonce);
    console.log("Here it`s the signature", signature);
    localStorage.setItem('user_id', id)

    const optionsverify = {
      params: { eth_address: address, signature: signature, nonce: nonce },
    };
    const { user, token } = await axios
      .get(`/verify`, optionsverify)
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        console.log("erreur", error);
      });
    console.log(user);
    console.log("Loging completed!!!");

    await supabase.auth.setAuth(token);
    localStorage.setItem("supa_token", token);
  };

  const logoutOfWeb3Modal = async () => {
    await web3Modal.clearCachedProvider();
    if (
      injectedProvider &&
      injectedProvider.provider &&
      typeof injectedProvider.provider.disconnect == "function"
    ) {
      await injectedProvider.provider.disconnect();
    }
    localStorage.removeItem("supa_token");
    localStorage.removeItem("user_id");
    setTimeout(() => {
      window.location.reload();
    }, 1);
  };

  useEffect(() => {
    // connect automatically and without a popup if user is already connected
    if (web3Modal && web3Modal.cachedProvider) {
      connectWallet();
    }
  }, [web3Modal]);


  return (
      <Routes>
        <Route path="/" element={<Navbar web3Modal = {web3Modal}
            address = {address}
            connectedNetwork = {connectedNetwork}
            logoutOfWeb3Modal = {logoutOfWeb3Modal}
            connectWallet = {connectWallet}/>}>
        <Route index element={<Home  signer={signer} address={address} isConnected={isConnected}/>}/>
        <Route path="safes" element={<Safes />}>
          <Route path=":safeAddress" element={<Safe injectedProvider={injectedProvider} userAddress={address} signer={signer}/>} />
        </Route>
        <Route path="/landing" element={<Landing />}/>
        </Route>
      </Routes>)
}

export default App;