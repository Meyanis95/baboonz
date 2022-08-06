import { PlusCircleIcon } from "@heroicons/react/solid";

export default function ValidatedSignatures({ signer, index }) {
  return (
    <li key={index}>
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
