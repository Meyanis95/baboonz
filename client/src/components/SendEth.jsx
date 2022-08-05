import { Fragment, useEffect, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { ethers } from "ethers";
import axios from "axios";
import { BeakerIcon } from "@heroicons/react/solid";

export const EIP712_SAFE_TX_TYPE = {
  // "SafeTx(address to,uint256 value,bytes data,uint8 operation,uint256 safeTxGas,uint256 baseGas,uint256 gasPrice,address gasToken,address refundReceiver,uint256 nonce)"
  SafeTx: [
    { type: "address", name: "to" },
    { type: "uint256", name: "value" },
    { type: "bytes", name: "data" },
    { type: "uint8", name: "operation" },
    { type: "uint256", name: "safeTxGas" },
    { type: "uint256", name: "baseGas" },
    { type: "uint256", name: "gasPrice" },
    { type: "address", name: "gasToken" },
    { type: "address", name: "refundReceiver" },
    { type: "uint256", name: "nonce" },
  ],
};

export default function SendEth({
  showSendEthModal,
  setShowSendEthModal,
  userAddress,
  safeWalletAddress,
  contractBalanceInEth,
  contractBalanceInUSD,
  safeSdk,
  safeService,
  signer,
  nonce,
}) {
  const [ethAmount, setEthAmount] = useState(0);
  const [ethAmountInUSD, setEthAmountInUSD] = useState(0);
  const [ethPrice, setEthPrice] = useState(0);
  const [recipientAddress, setRecipientAddress] = useState(0);
  const [chainId, setChainId] = useState();

  const cancelButtonRef = useRef(null);

  useEffect(() => {
    const fetchEthPrice = async () => {
      return await axios
        .get(`/getEthPrice`)
        .then(function (response) {
          const { ethereum } = response.data.data;

          setEthPrice(ethereum.usd);
        })
        .catch(function (error) {
          console.log("erreur", error);
        });
    };

    fetchEthPrice();
  }, []);

  useEffect(() => {
    const setChainIds = async () => {
      const chain_id = await signer.getChainId();
      setChainId(chain_id);
      console.log("Chain id: ", chain_id);
    };
    if (signer) {
      setChainIds();
    }
  }, [signer]);

  const handleEthChange = (e) => {
    setEthAmount(ethers.utils.parseEther(e.target.value).toString());
    setEthAmountInUSD(parseFloat(e.target.value) * ethPrice);
  };

  const createTransaction = async () => {
    const transaction = {
      to: recipientAddress,
      value: ethAmount,
      data: "0x0000000000000000000000000000000000000000",
      nonce: nonce,
    };
    console.log(transaction);
    try {
      const safeTransaction = await safeSdk.createTransaction(transaction);
      //const safeTxHash = await safeSdk.getTransactionHash(safeTransaction);
      console.log(safeTransaction);
      const _safeTxHash = (safe, safeTx, chainId) => {
        return ethers.utils._TypedDataEncoder.hash(
          { verifyingContract: safe.address, chainId },
          EIP712_SAFE_TX_TYPE,
          safeTx
        );
      };
      const safeTxHash = _safeTxHash(
        {
          address: safeWalletAddress,
        },
        safeTransaction.data,
        chainId
      );
      console.log("safeTxHash: ", safeTxHash);
      const senderSignature = await safeSdk.signTransactionHash(safeTxHash);
      const safeAddress = safeWalletAddress;
      const senderAddress = userAddress;
      const transactionConfig = {
        safeAddress,
        safeTxHash,
        safeTransactionData: safeTransaction.data,
        senderAddress,
        senderSignature: senderSignature.data,
      };
      console.log("transaction config: ", transactionConfig);
      const result = await safeService.proposeTransaction(transactionConfig);
      console.log(result);
    } catch (error) {
      console.log(error);
      window.alert(error.message);
    }
  };

  return (
    <Transition.Root show={showSendEthModal} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        initialFocus={cancelButtonRef}
        onClose={setShowSendEthModal}
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
                  <div className="flex justify-between border-b border-gray-200">
                    <Dialog.Title
                      as="h3"
                      className="text-lg pb-2 leading-6 font-medium text-gray-900"
                    >
                      Create a transaction
                    </Dialog.Title>
                  </div>
                  <div className="flex mt-3 sm:mt-5 justify-between">
                    <div className="mt-2 ">
                      <p className="text-sm text-slate-900">
                        ETH Contract Balance
                      </p>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        {contractBalanceInEth &&
                          parseFloat(contractBalanceInEth).toFixed(4)}{" "}
                        ETH
                      </p>
                    </div>
                  </div>
                  <div className="mt-1 text-right">
                    <p className="text-sm text-gray-500">
                      {contractBalanceInUSD?.toFixed(2)}$
                    </p>
                  </div>
                  <div className="mt-5">
                    <label
                      htmlFor="price"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Choose amount to send
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
                  <div className="mt-5">
                    <label
                      htmlFor="price"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Recipient address
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        type="text"
                        name="price"
                        id="price"
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md"
                        placeholder="0x..."
                        aria-describedby="price-currency"
                        onChange={(e) => {
                          setRecipientAddress(e.target.value);
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                    onClick={() => {
                      createTransaction();
                    }}
                  >
                    Create transaction
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                    onClick={() => setShowSendEthModal(false)}
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
