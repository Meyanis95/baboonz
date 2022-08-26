import {
  ArrowUpIcon,
  UsersIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/outline";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { timeSince } from "../../helpers/timesince";
import PendingTxOpen from "./PendingTxOpen";

export default function PendingTx({
  pendingTx,
  numOwners,
  userAddress,
  safeSdk,
  safeService,
}) {
  const [amount, setAmount] = useState(0);
  const [time, setTime] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [voteCount, setVoteCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [creationDate, setCreationDate] = useState("");
  const [txHash, setTxHash] = useState("");
  const [hasAlreadySigned, setHasAlreadySigned] = useState();
  const [isSigned, setIsSigned] = useState(false);
  const [isExecuted, setIsExecuted] = useState(false);

  useEffect(() => {
    if (pendingTx) {
      let amountReceived = pendingTx.value;
      setAmount(ethers.utils.formatEther(amountReceived));

      let submissionDate = pendingTx.submissionDate;
      const interval = timeSince(submissionDate);
      setTime(interval);
      setCreationDate(submissionDate);

      let signaturesCount = pendingTx.confirmations.length;
      setVoteCount(signaturesCount);

      let address = pendingTx.to;
      setRecipientAddress(address);

      let hash = pendingTx.safeTxHash;
      setTxHash(hash);

      pendingTx.confirmations.map((element) => {
        if (element.owner === userAddress) {
          setHasAlreadySigned(true);
        } else {
          setHasAlreadySigned(false);
        }
        return pendingTx;
      });

      if (signaturesCount === numOwners) {
        setIsSigned(true);
      }
    }
  }, [pendingTx, numOwners, userAddress]);

  const handleOpen = () => {
    if (open === false) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  };

  return (
    <div className="mt-10 mb-20 bg-white px-2 py-4 border-b border-gray-300 sm:px-6 shadow overflow-hidden sm:rounded-lg">
      <div className="-ml-4 -mt-2 py-3 flex items-center justify-between flex-wrap sm:flex-nowrap">
        <div className="flex ml-4 mt-2 w-full justify-around">
          <h3 className="flex items-center text-lg leading-6 font-medium text-gray-900">
            <ArrowUpIcon className="h-5 w-5 mr-1 rotate-45 text-red-500" /> Send
          </h3>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {amount && amount} ETH
          </h3>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {time && time}
          </h3>
          <h3 className="flex items-center text-md leading-6 font-small text-slate-400">
            <UsersIcon className="h-4 w-4 mr-1" />
            {voteCount && voteCount} out of {numOwners && numOwners}
          </h3>
          {isSigned ? (
            isExecuted ? (
              <h3 className="flex items-center text-md leading-6 font-small text-green-400">
                Executed
              </h3>
            ) : (
              <h3 className="flex items-center text-md leading-6 font-small text-gray-900">
                Signed
              </h3>
            )
          ) : (
            <h3 className="flex items-center text-md leading-6 font-small text-orange-400">
              Pending
            </h3>
          )}
        </div>
        <div className="ml-4 mt-2 flex-shrink-0">
          <button
            type="button"
            className="mb-2 relative inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-slate-900"
            onClick={() => {
              handleOpen();
            }}
          >
            {open ? (
              <ChevronUpIcon className="h-4 w-4" />
            ) : (
              <ChevronDownIcon className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
      {open && (
        <PendingTxOpen
          ownersCount={numOwners}
          voteCount={voteCount}
          pendingTx={pendingTx}
          amount={amount}
          creationDate={creationDate}
          txHash={txHash}
          recipientAddress={recipientAddress}
          hasAlreadySigned={hasAlreadySigned}
          setHasAlreadySigned={setHasAlreadySigned}
          safeSdk={safeSdk}
          safeService={safeService}
          isSigned={isSigned}
          setIsSigned={setIsSigned}
          setIsExecuted={setIsExecuted}
          isExecuted={isExecuted}
        />
      )}
    </div>
  );
}
