import { useState } from "react";
import Form from "./Form";
import NotConnected from "./NotConnected";
import Dashboard from "./Dashboard";
import axios from "axios";
import { useEffect } from "react";

function Home({ signer, address, isConnected }) {
  const userId = localStorage.getItem("user_id");
  const [safes, SetSafes] = useState();

  useEffect(() => {
    const userHaveSafe = async () => {
      const options = {
        params: {
          userId: userId,
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

    if (userId) {
      const checkUser = async () => {
        let rep = await userHaveSafe();
        SetSafes(rep);
      };
      checkUser();
    }
  }, [userId]);

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
