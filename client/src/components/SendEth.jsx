import { Fragment, useEffect, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { ethers } from "ethers";
import axios from "axios";

export default function SendEth({
  showModal,
  setShowModal,
  userAddress,
  injectedProvider,
  safeWalletAddress,
  signer,
}) {
  const [open, setOpen] = useState(false);
  const [ethAmount, setEthAmount] = useState(0);
  const [ethAmountInUSD, setEthAmountInUSD] = useState(0);
  const [gasPrice, setGasPrice] = useState(0);
  const [gasPriceInGwei, setGasPriceInGwei] = useState(0);
  const [userBalanceInEth, setUserBalanceInEth] = useState(0);
  const [userBalanceInUSD, setUserBalanceInUSD] = useState(0);
  const [ethPrice, setEthPrice] = useState(0);

  const cancelButtonRef = useRef(null);

  const fetchEthPrice = async () => {
    if (userBalanceInEth) {
      return await axios
        .get(`/getEthPrice`)
        .then(function (response) {
          const { ethereum } = response.data.data;
          let userBalance = ethereum.usd * userBalanceInEth;
          setUserBalanceInUSD(userBalance);
          setEthPrice(ethereum.usd);
        })
        .catch(function (error) {
          console.log("erreur", error);
        });
    }
  };

  useEffect(() => {
    fetchEthPrice();
  }, [userBalanceInEth]);

  useEffect(() => {
    const getGasPrice = async () => {
      let gasPrice = await injectedProvider.getGasPrice();
      setGasPriceInGwei(gasPrice);
      gasPrice = ethers.utils.formatUnits(gasPrice, "gwei");
      setGasPrice(gasPrice);
    };

    if (injectedProvider) {
      getGasPrice();
    }
  }, [injectedProvider]);

  useEffect(() => {
    const getUserBalance = async () => {
      if (injectedProvider && userAddress) {
        let balance = await injectedProvider.getBalance(userAddress);
        balance = ethers.utils.formatEther(balance);
        setUserBalanceInEth(balance);
      }
    };
    getUserBalance();
  }, [injectedProvider]);

  const handleEthChange = (e) => {
    setEthAmount(e.target.value);
    setEthAmountInUSD(parseFloat(e.target.value) * ethPrice);
  };

  const sendEth = async () => {
    const tx = {
      // from: userAddress,
      to: safeWalletAddress,
      value: ethers.utils.parseEther(ethAmount),
      // nonce: await injectedProvider.getTransactionCount(userAddress),
      // gasLimit: ethers.utils.hexlify(10000), // 100000
      // gasPrice: gasPriceInGwei,
    };
    const lele = await signer.sendTransaction(tx);
    console.log(lele);
  };

  return (
    <Transition.Root show={showModal} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        initialFocus={cancelButtonRef}
        onClose={setShowModal}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end sm:items-center justify-center min-h-full p-4 text-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full sm:p-6">
                <div>
                  <Dialog.Title
                    as="h3"
                    className="text-lg pb-2 leading-6 font-medium text-gray-900 border-b border-gray-200"
                  >
                    Deposit ETH
                  </Dialog.Title>
                  <div className="flex mt-3 sm:mt-5 justify-between">
                    <div className="mt-2 ">
                      <p className="text-sm text-slate-900">Your ETH Balance</p>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        {userBalanceInEth &&
                          parseFloat(userBalanceInEth).toFixed(2)}{" "}
                        ETH
                      </p>
                    </div>
                  </div>
                  <div className="mt-1 text-right">
                    <p className="text-sm text-gray-500">
                      {userBalanceInUSD?.toFixed(2)}$
                    </p>
                  </div>
                  <div className="mt-5">
                    <label
                      htmlFor="price"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Deposit to your squad treasury
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        type="text"
                        name="price"
                        id="price"
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md"
                        placeholder="0.00"
                        aria-describedby="price-currency"
                        onChange={(e) => {
                          handleEthChange(e);
                        }}
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span
                          className="text-gray-500 sm:text-sm"
                          id="price-currency"
                        >
                          ETH
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-1 text-right">
                    <p className="text-sm text-gray-500">
                      {ethAmountInUSD ? ethAmountInUSD.toFixed(2) : "-- "} $
                    </p>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                    onClick={() => sendEth()}
                  >
                    Deposit
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                    onClick={() => setShowModal(false)}
                    ref={cancelButtonRef}
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
