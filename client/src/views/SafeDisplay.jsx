import axios from "axios";
import { useState } from "react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import DepositEth from "../components/DepositEth";
import { ethers } from "ethers";
import { Link } from "react-router-dom";
import EthersAdapter from "@gnosis.pm/safe-ethers-lib";
import Safe from "@gnosis.pm/safe-core-sdk";
import SafeServiceClient from "@gnosis.pm/safe-service-client";
import PendingTx from "../components/PendingTx/PendingTx";
import { ArrowLeftIcon } from "@heroicons/react/outline";
import CreateTransaction from "../components/CreateTransaction";

export default function SafeDisplay({ injectedProvider, userAddress, signer }) {
  const [safeWallet, setSafeWallet] = useState();
  const [safeWalletAddress, setSafeWalletAddress] = useState();
  const [owners, setOwners] = useState();
  const [numOwners, setNumOwners] = useState();
  const [showModal, setShowModal] = useState(false);
  const [showSendEthModal, setShowSendEthModal] = useState(false);
  const [safeSdk, setSafeSdk] = useState();
  const [safeService, setSafeService] = useState();
  const [contractBalanceInUSD, setContractBalanceInUSD] = useState(0);
  const [contractBalanceInEth, setContractBalanceInEth] = useState(0);
  const [pendingTx, setPendingTx] = useState();
  const [nonce, setNonce] = useState(0);

  let params = useParams();
  const address = params.safeAddress;

  useEffect(() => {
    if (signer && safeWalletAddress) {
      const setSafe = async () => {
        const ethAdapter = new EthersAdapter({
          ethers,
          signer: signer,
        });
        const safeSdk = await Safe.create({ ethAdapter, safeWalletAddress });
        setSafeSdk(safeSdk);

        const txServiceUrl = "https://safe-transaction.rinkeby.gnosis.io";
        const safeService = new SafeServiceClient({ txServiceUrl, ethAdapter });
        setSafeService(safeService);
      };

      setSafe();
    }
  }, [signer, safeWalletAddress]);

  useEffect(() => {
    const getInfo = async () => {
      const nonce = await safeService.getNextNonce(safeWalletAddress);
      setNonce(nonce);
    };

    if (safeService && safeWalletAddress) {
      getInfo().catch(console.error);
    }
  }, [safeService, safeWalletAddress]);

  useEffect(() => {
    const getPending = async () => {
      const pendingTxs = await safeService.getPendingTransactions(
        safeWalletAddress
      );
      console.log(pendingTxs);
      setPendingTx(pendingTxs.results);
    };

    if (safeService && safeWallet) {
      getPending();
    }
  }, [safeService, safeWallet, safeWalletAddress]);

  const fetchSafe = async (address) => {
    const options = {
      params: {
        safeAddress: address,
      },
    };
    return await axios
      .get(`/getSafe`, options)
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        console.log("erreur", error);
      });
  };

  useEffect(() => {
    const fetchEthPrice = async () => {
      if (contractBalanceInEth) {
        return await axios
          .get(`/getEthPrice`)
          .then(function (response) {
            const { ethereum } = response.data.data;
            let constractBalance = ethereum.usd * contractBalanceInEth;
            setContractBalanceInUSD(constractBalance);
          })
          .catch(function (error) {
            console.log("erreur", error);
          });
      }
    };

    fetchEthPrice();
  }, [contractBalanceInEth]);

  useEffect(() => {
    const getContractBalance = async () => {
      if (injectedProvider && address) {
        const balance = await injectedProvider.getBalance(address);
        setContractBalanceInEth(ethers.utils.formatEther(balance));
      }
    };
    getContractBalance();
  }, [injectedProvider, address]);

  useEffect(() => {
    const getData = async () => {
      let safe = await fetchSafe(address);
      setSafeWallet(safe.data[0]);
      setSafeWalletAddress(safe.data[0].contract_address);

      let numOwners = safe.data[0].owners.length;
      setNumOwners(numOwners);

      let owners = safe.data[0].owners;
      setOwners(owners);

      return;
    };
    getData();
  }, [address]);

  return (
    <>
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 mt-10">
        <div className="flex mb-2 text-md text-gray-500 items-center">
          <ArrowLeftIcon className="h-4 w-4 mr-1" />{" "}
          <Link to={"/home"}>Go back to dashboard</Link>
        </div>
        {safeSdk && safeService && signer && (
          <CreateTransaction
            showSendEthModal={showSendEthModal}
            setShowSendEthModal={setShowSendEthModal}
            contractBalanceInEth={contractBalanceInEth}
            contractBalanceInUSD={contractBalanceInUSD}
            safeSdk={safeSdk}
            safeService={safeService}
            userAddress={userAddress}
            safeWalletAddress={safeWalletAddress}
            signer={signer}
            nonce={nonce}
          />
        )}
        <DepositEth
          showModal={showModal}
          setShowModal={setShowModal}
          userAddress={userAddress}
          injectedProvider={injectedProvider}
          safeWalletAddress={safeWalletAddress}
          signer={signer}
        />
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="flex justify-between px-4 py-5 sm:px-6">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Your squad
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Informations about your squad
              </p>
            </div>
            <div className="space-x-3">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => setShowModal(true)}
              >
                Deposit fund in contract
              </button>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => {
                  setShowSendEthModal(true);
                }}
              >
                Create a transaction
              </button>
            </div>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {safeWallet
                    ? safeWallet.name
                      ? safeWallet.name
                      : "N/A"
                    : "N/A"}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Smart contract address
                </dt>
                <dd className="mt-1 text-sm text-blue-600 sm:mt-0 sm:col-span-2">
                  {safeWallet && (
                    <a
                      href={`https://rinkeby.etherscan.io/address/${safeWallet.contract_address}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {safeWallet.contract_address}
                    </a>
                  )}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Balance in ETH
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {contractBalanceInEth && contractBalanceInEth}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Balance in USD
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {"$" + contractBalanceInUSD?.toFixed(2)}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Number of owners
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {numOwners && numOwners}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Signature threshold
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {safeWallet && safeWallet.threshold}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Owners list
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <ul>
                    {owners &&
                      owners.map((element, index) => (
                        <li key={index}>
                          {JSON.parse(element).name || `Member #${index + 1}`}:{" "}
                          {JSON.parse(element).address}
                        </li>
                      ))}
                  </ul>
                </dd>
              </div>
            </dl>
          </div>
        </div>
        {pendingTx &&
          safeSdk &&
          safeService &&
          pendingTx.map((element, index) => (
            <PendingTx
              pendingTx={element}
              numOwners={numOwners}
              userAddress={userAddress}
              key={index}
              safeSdk={safeSdk}
              safeService={safeService}
            />
          ))}
      </div>
    </>
  );
}
