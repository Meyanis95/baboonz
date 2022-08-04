import { PlusSmIcon, ClockIcon } from "@heroicons/react/outline";
import { CheckIcon, PlusCircleIcon } from "@heroicons/react/solid";
import { EthSignSignature } from "@gnosis.pm/safe-core-sdk";

export default function PendingTxOpen({
  ownersCount,
  voteCount,
  pendingTx,
  amount,
  creationDate,
  txHash,
  recipientAddress,
  hasAlreadySigned,
  safeSdk,
  safeService,
  isSigned,
  setIsExecuted,
  isExecuted,
}) {
  function WaitingSignatures() {
    return (
      <li>
        <div className="relative pb-8">
          <span
            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
            aria-hidden="true"
          />
          <div className="relative flex space-x-3">
            <div>
              <span className="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white bg-orange-400">
                <ClockIcon className="h-5 w-5 text-white" aria-hidden="true" />
              </span>
            </div>
            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
              <div>
                <p className="text-sm text-gray-500">
                  Confirmations ({voteCount} of {ownersCount})
                </p>
              </div>
            </div>
          </div>
        </div>
      </li>
    );
  }

  function Signed() {
    return (
      <li>
        <div className="relative pb-8">
          <span
            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
            aria-hidden="true"
          />
          <div className="relative flex space-x-3">
            <div>
              <span className="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white bg-green-400">
                <CheckIcon className="h-5 w-5 text-white" aria-hidden="true" />
              </span>
            </div>
            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
              <div>
                <p className="text-sm text-gray-500">
                  Signed ({voteCount} of {ownersCount})
                </p>
              </div>
            </div>
          </div>
        </div>
      </li>
    );
  }

  function ValidatedSignatures({ signer }) {
    return (
      <li>
        <div className="relative pb-8">
          <div className="relative flex space-x-3">
            <div>
              <span className="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white bg-white">
                <PlusCircleIcon
                  className="h-5 w-5 text-green-300"
                  aria-hidden="true"
                />
              </span>
            </div>
            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
              <div>
                <p className="text-sm text-gray-500">
                  {signer && signer.slice(0, 6) + "..." + signer.slice(-4)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </li>
    );
  }

  const handleSigning = async () => {
    const hash = pendingTx.safeTxHash;
    let signature = await safeSdk.signTransactionHash(hash);
    let result = await safeService.confirmTransaction(hash, signature.data);
    console.log(result);
  };

  const handleExecution = async () => {
    const safeTransactionData = {
      to: pendingTx.to,
      value: pendingTx.value,
      data: "0x0000000000000000000000000000000000000000",
      operation: pendingTx.operation,
      safeTxGas: pendingTx.safeTxGas,
      baseGas: pendingTx.baseGas,
      gasPrice: pendingTx.gasPrice,
      gasToken: pendingTx.gasToken,
      refundReceiver: pendingTx.refundReceiver,
      nonce: pendingTx.nonce,
    };
    const safeTransaction = await safeSdk.createTransaction(
      safeTransactionData
    );
    pendingTx.confirmations.forEach((confirmation) => {
      const signature = new EthSignSignature(
        confirmation.owner,
        confirmation.signature
      );
      safeTransaction.addSignature(signature);
    });

    console.log("safe Transaction: ", safeTransaction);

    const executeTxResponse = await safeSdk.executeTransaction(safeTransaction);
    const receipt =
      executeTxResponse.transactionResponse &&
      (await executeTxResponse.transactionResponse.wait());
    console.log(receipt);
    setIsExecuted(true);
  };

  return (
    <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
      {" "}
      <div className="flex mt-5 divide-x">
        <div className="w-3/5 h-30 pr-5 border-">
          <dl className="divide-y divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-gray-500">
                Send {amount && amount} ETH to:
              </dt>
              <dd className="mt-1 flex text-sm sm:mt-0 sm:col-span-2">
                <span className="flex-grow">
                  {recipientAddress && recipientAddress}
                </span>
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-gray-500">
                Safe transaction hash:
              </dt>
              <dd className="mt-1 flex text-sm sm:mt-0 sm:col-span-2">
                <span className="flex-grow">
                  {txHash && txHash.slice(0, 10) + "..." + txHash.slice(-10)}
                </span>
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-gray-500">
                Transaction created at:
              </dt>
              <dd className="mt-1 flex text-sm sm:mt-0 sm:col-span-2">
                <span className="flex-grow">
                  {creationDate &&
                    creationDate.slice(0, 10) +
                      " " +
                      creationDate.slice(11, 19)}
                </span>
              </dd>
            </div>
          </dl>
        </div>
        <div className="flex flex-col w-2/5 h-30 pl-5">
          <div className="flow-root py-4 sm:py-5">
            <ul className="-mb-8">
              <li>
                <div className="relative pb-8">
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white bg-green-400">
                        <PlusSmIcon
                          className="h-5 w-5 text-white"
                          aria-hidden="true"
                        />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm text-gray-500">
                          Transaction created
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
              {isSigned ? <Signed /> : <WaitingSignatures />}
              {pendingTx?.confirmations.map((element, index) => (
                <ValidatedSignatures signer={element.owner} index={index} />
              ))}
            </ul>
          </div>
          <div className="flex mt-auto justify-between">
            {isExecuted ? (
              <span
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-300"
              >
                Executed
              </span>
            ) : (
              <div className="mt-auto w-full text-center">
                {isSigned ? (
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-300 hover:bg-indigo-200"
                    onClick={() => {
                      handleExecution();
                    }}
                  >
                    Execute Tx
                  </button>
                ) : hasAlreadySigned ? (
                  <span
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-300"
                  >
                    Confirmed
                  </span>
                ) : (
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-300 hover:bg-indigo-200"
                    onClick={() => {
                      handleSigning();
                    }}
                  >
                    Confirm
                  </button>
                )}
              </div>
            )}
            <div className="mt-auto w-full text-center">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-300 hover:bg-indigo-200"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      </div>
      {/*  */}
    </div>
  );
}
