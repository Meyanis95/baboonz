import { useState } from "react";
import Form from "../components/Form";
import NotConnected from "../components/NotConnected";
import Dashboard from "../components/Dashboard";
import axios from "axios";
import { useEffect } from "react";

function Home({ signer, address, isConnected }) {
  const [safes, SetSafes] = useState();

  useEffect(() => {
    const userHaveSafe = async () => {
      const options = {
        params: {
          userAddress: address,
        },
      };
      return await axios
        .get(`/checkSafe`, options)
        .then(function (response) {
          const { data } = response;
          if (data.length > 0) {
            return data;
          }
        })
        .catch(function (error) {
          console.log("erreur", error);
        });
    };

    if (address) {
      const checkUser = async () => {
        let rep = await userHaveSafe();
        SetSafes(rep);
      };
      checkUser();
    }
  }, [address]);

  return (
    <>
      {isConnected ? (
        safes ? (
          <>
            <Dashboard safes={safes} />
          </>
        ) : (
          <>
            <Form signer={signer} address={address} />
          </>
        )
      ) : (
        <NotConnected />
      )}
    </>
  );
}

export default Home;
