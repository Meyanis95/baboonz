import "./App.css";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { createClient } from "@supabase/supabase-js";
import { Route, Routes } from "react-router-dom";
import Form from "./components/Form";
import Safes from "./views/Safes";
import Landing from "./views/Landing";
import SafeDisplay from "./views/SafeDisplay";
import Navbar from "./components/Navbar";
import Home from "./views/Home";

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
    const address = await signer.getAddress();
    setAddress(address);
    if (!localStorage.getItem("user_id")) {
      await signIn(address, signer);
    }
    setIsConnected(true);
  }

  useEffect(() => {
    if (injectedProvider) {
      const changeNetwork = async () => {
        const network = await injectedProvider.getNetwork();
        setConnectedNetwork(network.name);
      };
      // const changeAddress = async () => {
      //   const signer = await injectedProvider.getSigner();
      //   const address = await signer.getAddress();
      //   setAddress(address)
      //   refreshId(address)
      // }
      changeNetwork();
      // changeAddress();
    }
  }, [injectedProvider]);

  const addListeners = (provider) => {
    provider.on("chainChanged", (chainId) => {
      console.log(`chain changed to ${chainId}! updating providers`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });

    provider.on("accountsChanged", () => {
      console.log("account changed!");
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
      localStorage.removeItem("user_id");
      window.location.reload();
    });

    // Subscribe to session disconnection
    provider.on("disconnect", (code, reason) => {
      console.log(code, reason);
      logoutOfWeb3Modal();
      localStorage.removeItem("supa_token");
      localStorage.removeItem("user_id");
      setIsConnected(false);
    });
  };

  const signIn = async (address, signer) => {
    console.log("Verifying your account, with the following addres:", address);
    const options = {
      params: { data: address },
    };

    const { nonce, id } = await axios
      .get("/signup", options)
      .then(async (response) => {
        const { nonce, id } = response.data;
        return { nonce, id };
      })
      .catch((error) => {
        console.log("erreur", error);
      });

    const signature = await signer.signMessage(nonce);
    localStorage.setItem("user_id", id);

    const optionsverify = {
      params: { eth_address: address, signature, nonce },
    };
    const { token } = await axios
      .get("/verify", optionsverify)
      .then((response) => response.data)
      .catch((error) => {
        console.log("erreur", error);
      });

    await supabase.auth.setAuth(token);
    localStorage.setItem("supa_token", token);
  };

  const logoutOfWeb3Modal = async () => {
    await web3Modal.clearCachedProvider();
    if (
      injectedProvider &&
      injectedProvider.provider &&
      typeof injectedProvider.provider.disconnect === "function"
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
      <Route
        path="/"
        element={
          <Navbar
            web3Modal={web3Modal}
            address={address}
            connectedNetwork={connectedNetwork}
            logoutOfWeb3Modal={logoutOfWeb3Modal}
            connectWallet={connectWallet}
          />
        }
      >
        <Route index element={<Landing />} />
        <Route path="safes" element={<Safes />}>
          <Route
            path=":safeAddress"
            element={
              <SafeDisplay
                injectedProvider={injectedProvider}
                userAddress={address}
                signer={signer}
              />
            }
          />
        </Route>
        <Route
          path="/home"
          element={
            <Home signer={signer} address={address} isConnected={isConnected} />
          }
        />
        <Route
          path="/form"
          element={<Form signer={signer} address={address} />}
        />
      </Route>
    </Routes>
  );
}

export default App;
