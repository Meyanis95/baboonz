import { useState, useEffect } from "react";
import axios from "axios";
import Blockies from "react-blockies";
import { Link } from "react-router-dom";
import { PlusSmIcon } from "@heroicons/react/solid";
import { ethers } from "ethers";
import EthersAdapter from "@gnosis.pm/safe-ethers-lib";
import SafeServiceClient from "@gnosis.pm/safe-service-client";

export const myBlockies = (_seed) => (
  <Blockies seed={_seed} size={10} scale={3} />
);

export default function Dashboard({ safes, address, signer }) {
  const [squads, setSquads] = useState([]);
  // const [safeService, setSafeService] = useState();

  // useEffect(() => {
  //   if (signer) {
  //     const setSafeClient = async () => {
  //       const ethAdapter = new EthersAdapter({
  //         ethers,
  //         signer: signer,
  //       });

  //       const txServiceUrl = "https://safe-transaction.rinkeby.gnosis.io";
  //       const safeService = new SafeServiceClient({ txServiceUrl, ethAdapter });
  //       setSafeService(safeService);
  //     };

  //     setSafeClient();
  //   }
  // }, [signer]);

  useEffect(() => {
    const getSquadInfos = async (squadId) => {
      const options = {
        params: {
          squadId: squadId,
        },
      };
      return await axios
        .get(`/getSafeById`, options)
        .then(function (response) {
          const { data } = response;
          if (data) {
            return data;
          }
        })
        .catch(function (error) {
          console.log("erreur", error);
        });
    };

    if (safes && squads.length === 0) {
      const fetchAll = async () => {
        for (const safe of safes) {
          const rep = await getSquadInfos(safe.safe_id);
          setSquads((squads) => [...squads, rep]);
        }
        return;
      };
      fetchAll();
    }
  }, [safes]);

  return (
    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 mt-10">
      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {squads &&
          [...squads].map((element, index) => (
            <li
              key={index}
              className="col-span-1 bg-white rounded-lg shadow divide-y divide-gray-200 hover:shadow-md"
            >
              <Link to={`/safes/${element?.contract_address}`}>
                <div className="w-full flex items-center justify-between p-6 space-x-6">
                  <div className="flex-1 truncate">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-gray-900 text-sm font-medium truncate">
                        {element?.name || "Squad #" + index}
                      </h3>
                      <span className="flex-shrink-0 inline-block px-2 py-0.5 text-green-800 text-xs font-medium bg-green-100 rounded-full">
                        Owner
                      </span>
                    </div>
                    <p className="mt-1 text-gray-500 text-sm truncate">
                      {element?.contract_address}
                    </p>
                  </div>
                  <div className="rounded-full">
                    <Blockies
                      seed={element?.contract_address}
                      size={15}
                      scale={4}
                      className="rounded-full"
                    />
                  </div>
                </div>
              </Link>
            </li>
          ))}
        <li className="col-span-1 items-center content-center bg-white rounded-lg shadow divide-y divide-gray-200 hover:shadow-md">
          <Link to={`/form`}>
            <div className="w-full h-full flex items-center justify-between p-6 space-x-6">
              <div className="flex items-center space-x-3">
                <PlusSmIcon
                  className="h-10 w-10 bg-slate-900 text-white rounded-full"
                  aria-hidden="true"
                />
              </div>
              <div className="flex-1 truncate">Create a new squad</div>
            </div>
          </Link>
        </li>
      </ul>
    </div>
  );
}
