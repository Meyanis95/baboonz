import axios from "axios";
import { useEffect, useState, propTypes } from "react";
import Form from "../components/Form";
import NotConnected from "../components/NotConnected";
import Dashboard from "../components/Dashboard";

function Home({ signer, address, isConnected }) {
  const [safes, SetSafes] = useState();
  const [firstTime, setFirstTime] = useState(true);

  useEffect(() => {
    const userHaveSafe = async () => {
      const options = {
        params: {
          userAddress: address,
        },
      };
      return axios
        .get("/checkSafe", options)
        .then((response) => {
          const { data } = response;
          if (data.length > 0) {
            setFirstTime(false);
            return data;
          }
        })
        .catch((error) => {
          console.log("erreur", error);
        });
    };

    if (address) {
      const checkUser = async () => {
        const rep = await userHaveSafe();
        SetSafes(rep);
      };
      checkUser();
    }
  }, [address]);

  return (
    <>
      {isConnected ? (
        safes ? (
          <Dashboard safes={safes} address={address} signer={signer} />
        ) : (
          <Form signer={signer} address={address} firstTime={firstTime} />
        )
      ) : (
        <NotConnected />
      )}
    </>
  );
}

export default Home;
