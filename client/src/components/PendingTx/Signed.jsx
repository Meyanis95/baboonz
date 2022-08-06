import { CheckIcon } from "@heroicons/react/solid";

export default function Signed({ voteCount, ownersCount }) {
  return (
    <li key="signed">
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
