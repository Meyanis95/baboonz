import { Fragment, useEffect, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { ethers } from "ethers";
import axios from "axios";
import { BeakerIcon } from "@heroicons/react/solid";

function Loader() {
  return (
    <div class="flex text-center h-60">
      <div role="status" className="m-auto">
        <svg
          class="inline mr-2 w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
          viewBox="0 0 100 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
            fill="currentColor"
          />
          <path
            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
            fill="currentFill"
          />
        </svg>
        <span className="sr-only">Loading...</span>
        <h3 className="mt-5">Sending funds to your squad...</h3>
      </div>
    </div>
  );
}

export default function DepositEth({
  showModal,
  setShowModal,
  userAddress,
  injectedProvider,
  safeWalletAddress,
  signer,
}) {
  const [ethAmount, setEthAmount] = useState(0);
  const [ethAmountInUSD, setEthAmountInUSD] = useState(0);
  const [gasPriceInGwei, setGasPriceInGwei] = useState(0);
  const [userBalanceInEth, setUserBalanceInEth] = useState(0);
  const [userBalanceInUSD, setUserBalanceInUSD] = useState(0);
  const [ethPrice, setEthPrice] = useState(0);
  const [loading, setLoading] = useState(false);

  const cancelButtonRef = useRef(null);

  useEffect(() => {
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

    fetchEthPrice();
  }, [userBalanceInEth]);

  useEffect(() => {
    const getGasPrice = async () => {
      var gasPrice = await injectedProvider.getGasPrice();
      gasPrice = ethers.utils.formatUnits(gasPrice, "gwei");
      setGasPriceInGwei(parseInt(gasPrice).toFixed());
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
  }, [injectedProvider, userAddress]);

  const handleEthChange = (e) => {
    setEthAmount(e.target.value);
    setEthAmountInUSD(parseFloat(e.target.value) * ethPrice);
  };

  const sendEth = async () => {
    setLoading(true);
    const tx = {
      // from: userAddress,
      to: safeWalletAddress,
      value: ethers.utils.parseEther(ethAmount),
      // nonce: await injectedProvider.getTransactionCount(userAddress),
      // gasLimit: ethers.utils.hexlify(10000), // 100000
      // gasPrice: gasPriceInGwei,
    };
    try {
      const tx_result = await signer.sendTransaction(tx);
      setLoading(false);
    } catch (error) {
      console.log(error);
      window.alert(error.message);
    }
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
                {loading ? (
                  <Loader />
                ) : (
                  <div>
                    <div className="flex justify-between border-b border-gray-200">
                      <Dialog.Title
                        as="h3"
                        className="text-lg pb-2 leading-6 font-medium text-gray-900"
                      >
                        Deposit ETH
                      </Dialog.Title>
                      <span className="mb-3 inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-indigo-600">
                        <BeakerIcon
                          className="-ml-0.5 mr-2 h-4 w-4"
                          aria-hidden="true"
                        />
                        {gasPriceInGwei && gasPriceInGwei}
                      </span>
                    </div>
                    <div className="flex mt-3 sm:mt-5 justify-between">
                      <div className="mt-2 ">
                        <p className="text-sm text-slate-900">
                          Your ETH Balance
                        </p>
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
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
