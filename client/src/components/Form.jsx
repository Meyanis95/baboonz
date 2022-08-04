import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import EthersAdapter from "@gnosis.pm/safe-ethers-lib";
import { SafeFactory } from "@gnosis.pm/safe-core-sdk";
import axios from "axios";
import { useEffect } from "react";
import { XCircleIcon } from "@heroicons/react/solid";
import { CheckCircleIcon, ExclamationCircleIcon } from "@heroicons/react/solid";
import Loader from "./Loader";

const Form = ({ signer, address }) => {
  const [ethAdapter, setEthAdapter] = useState(null);
  const [threshold, setThreshold] = useState();
  const [name, setName] = useState("");
  const [members, setMembers] = useState([{ name: "", address: address }]);
  const [loading, setLoading] = useState(false);
  let navigate = useNavigate();
  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    if (signer) {
      const ethAdapter = new EthersAdapter({
        ethers,
        signer: signer,
      });
      setEthAdapter(ethAdapter);
    }
  }, [signer]);

  useEffect(() => {
    setMembers([{ name: "", address: address }]);
  }, [address]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const inputs = [...members];
    const owners = [];
    inputs.forEach((addr) => {
      if (/^0x[a-fA-F0-9]{40}$/.test(addr.address)) {
        owners.push(addr.address);
      }
    });
    await deploySafe(owners, threshold);
    console.log("Owners of the multisig =>", owners);
  };

  let handleChange = (i, e) => {
    let newMembers = [...members];
    newMembers[i][e.target.name] = e.target.value;
    setMembers(newMembers);
  };

  let addFormFields = () => {
    setMembers([...members, { name: "", address: "" }]);
  };

  let removeFormFields = (i) => {
    let newMembersValues = [...members];
    newMembersValues.splice(i, 1);
    setMembers(newMembersValues);
  };

  const linkSafe = async (userId, safeId) => {
    const options = {
      params: {
        userId: userId,
        safeId: safeId,
      },
    };
    await axios
      .get(`/linkSafe`, options)
      .then(function (response) {
        console.log(response.data);
        return response.data;
      })
      .catch(function (error) {
        console.log("erreur", error);
      });
  };

  const deploySafe = async (owners, threshold) => {
    setLoading(true);
    const safeFactory = await SafeFactory.create({ ethAdapter });
    const safeAccountConfig = {
      owners: owners,
      threshold: threshold,
    };
    try {
      const safeSdk = await safeFactory.deploySafe({ safeAccountConfig });
      const newSafeAddress = safeSdk.getAddress();
      console.log(newSafeAddress);
      const safe_id = await createSafe(
        newSafeAddress,
        members,
        threshold,
        name
      );
      await linkSafe(userId, safe_id);
      navigate(`/safes/${newSafeAddress}`);
      setLoading(false);
      return newSafeAddress;
    } catch (error) {
      setLoading(false);
      window.alert("oups something went wrong!", error);
      return error;
    }
  };

  const isAddressValid = (addr) => {
    return ethers.utils.isAddress(addr);
  };

  const AddressValid = () => {
    return (
      <CheckCircleIcon className="h-5 w-5 text-green-500" aria-hidden="true" />
    );
  };

  const AddressInvalid = () => {
    return (
      <ExclamationCircleIcon
        className="h-5 w-5 text-red-500"
        aria-hidden="true"
      />
    );
  };

  const createSafe = async (safeAddress, owners, threshold, name) => {
    const options = {
      params: {
        safeAddress: safeAddress,
        owners: owners,
        threshold: threshold,
        name: name,
      },
    };
    return await axios
      .get(`/createSafe`, options)
      .then(function (response) {
        console.log(response.data.data[0].id);
        const safe_id = response.data.data[0].id;
        return safe_id;
      })
      .catch(function (error) {
        console.log("erreur", error);
      });
  };

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <XCircleIcon
                    className="h-5 w-5 text-red-400"
                    aria-hidden="true"
                  />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    This app is still in alpha
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Use it only on testnets (Rinkeby, Goerli, ...)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-6 mt-10 mb-20">
              <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                <div className="md:grid md:grid-cols-3 md:gap-6">
                  <div className="md:col-span-1">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                      Create your squad
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Build your squad by adding members via their Ethereum
                      address.
                    </p>
                  </div>
                  <div className="mt-5 md:mt-0 md:col-span-2">
                    <form className="space-y-6" action="#" method="POST">
                      <div className="grid grid-cols-3 gap-6">
                        <div className="col-span-3 sm:col-span-2 space-y-5">
                          <label className="text-sm">Name of your squad</label>
                          <input
                            type="text"
                            name="name"
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="Wise Baboon Club..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                          />
                          {members.map((element, index) => (
                            <div className="" key={index}>
                              <label className="block text-xs font-small text-gray-700">
                                Member #{index + 1}
                              </label>
                              <div className="mt-1">
                                <label className="text-sm">Name</label>
                                <input
                                  type="text"
                                  name="name"
                                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                  placeholder="Name..."
                                  value={element.name || ""}
                                  onChange={(e) => handleChange(index, e)}
                                />
                                <label className="text-sm">Address</label>
                                <div className="relative rounded-md shadow-sm">
                                  <input
                                    type="text"
                                    name="address"
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                    placeholder="0x..."
                                    value={element.address || ""}
                                    onChange={(e) => handleChange(index, e)}
                                  />
                                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    {isAddressValid(element.address) ? (
                                      <AddressValid />
                                    ) : (
                                      <AddressInvalid />
                                    )}
                                  </div>
                                </div>
                                {!isAddressValid(element.address) && (
                                  <p
                                    className="mt-2 text-sm text-red-600"
                                    id="email-error"
                                  >
                                    This address is not valid.
                                  </p>
                                )}
                              </div>
                              {index ? (
                                <button
                                  type="button"
                                  className="inline-flex items-center mt-3 px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-500 bg-red-100 hover:bg-red-200"
                                  onClick={() => removeFormFields(index)}
                                >
                                  Remove this member
                                </button>
                              ) : null}
                            </div>
                          ))}
                          <div>
                            <button
                              type="button"
                              className="inline-flex items-center mt-3 px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                              onClick={() => addFormFields()}
                            >
                              Add a member
                            </button>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="about"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Set a threshold
                        </label>
                        <div>
                          <select
                            id="location"
                            name="location"
                            className="mt-1 block w-1/3 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                            defaultValue="Canada"
                            value={threshold}
                            onChange={(e) => setThreshold(e.target.value)}
                          >
                            {members.map((element, index) => (
                              <option key={index}>{index + 1}</option>
                            ))}
                          </select>
                        </div>
                        <p className="mt-2 text-sm text-gray-500">
                          Number of signatures needed to validate a transaction.
                        </p>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={handleSubmit}
                >
                  Deploy
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Form;
