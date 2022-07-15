import { Link } from "react-router-dom";

export default function Navbar({
  web3Modal,
  address,
  connectedNetwork,
  logoutOfWeb3Modal,
  connectWallet,
}) {
  return (
    <header className="bg-slate-900">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="w-full py-6 flex items-center justify-between border-b border-indigo-500 lg:border-none">
          <div className="flex items-center text-white font-phosphate text-3xl">
            <Link to={"/"}>BABOONZ</Link>
          </div>
          <div className="space-x-3">
            {web3Modal ? (
              web3Modal.cachedProvider ? (
                <>
                  {address && (
                    <>
                      {" "}
                      <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                        <svg
                          className="-ml-1 mr-1.5 h-2 w-2 text-indigo-400"
                          fill="currentColor"
                          viewBox="0 0 8 8"
                        >
                          <circle cx={4} cy={4} r={3} />
                        </svg>
                        {address.toString().slice(0, 4) +
                          "..." +
                          address.substr(-4)}
                      </span>
                    </>
                  )}
                  {connectedNetwork && (
                    <>
                      {" "}
                      <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                        <svg
                          className="-ml-1 mr-1.5 h-2 w-2 text-indigo-400"
                          fill="currentColor"
                          viewBox="0 0 8 8"
                        >
                          <circle cx={4} cy={4} r={3} />
                        </svg>
                        {connectedNetwork}
                      </span>
                    </>
                  )}
                  <button
                    type="button"
                    key="logoutbutton"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={logoutOfWeb3Modal}
                  >
                    logout
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  key="loginbutton"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  /* type={minimized ? "default" : "primary"}     too many people just defaulting to MM and having a bad time */
                  onClick={connectWallet}
                >
                  Connect Wallet
                </button>
              )
            ) : (
              <></>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
