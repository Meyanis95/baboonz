import axios from "axios";
import { useState } from "react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

export default function Safe(props) {
  const [safeWallet, setSafeWallet] = useState();
  const [contractAddress, setContractAddress] = useState();
  const [owners, setOwners] = useState();
  const [numOwners, setNumOwners] = useState();
  const [threshold, setThreshold] = useState();

  let params = useParams();
  const address = params.safeAddress;

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
    const getData = async () => {
      let safe = await fetchSafe(address);
      setSafeWallet(safe.data[0]);

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
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Your new squad
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Informations about your new squad
            </p>
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
                    >
                      {safeWallet.contract_address}
                    </a>
                  )}
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
      </div>
    </>
  );
}
