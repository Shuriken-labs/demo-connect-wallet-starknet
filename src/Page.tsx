import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import {
  argent,
  Connector,
  useAccount,
  useConnect,
  useDisconnect
} from "@starknet-react/core";
import {
  type StarknetkitConnector,
  useStarknetkitConnectModal
} from "starknetkit";

const Page = () => {
  const [count, setCount] = useState(0);
  const { disconnect } = useDisconnect();

  const { connect, connectors } = useConnect();
  const { starknetkitConnectModal } = useStarknetkitConnectModal({
    connectors: connectors as StarknetkitConnector[]
  });

  async function connectWallet() {
    const { connector } = await starknetkitConnectModal();
    if (!connector) {
      return;
    }
    await connect({ connector: connector as Connector });
  }
  const { address } = useAccount();

  return (
    <>
      <div className="card">
        <button
          onClick={() => {
            if (address) {
              disconnect();
            } else {
              connectWallet();
            }
          }}
        >
          {address
            ? address?.slice(0, 6) + "..." + address?.slice(-4)
            : "Connect wallet"}
        </button>
      </div>
    </>
  );
};

export default Page;
