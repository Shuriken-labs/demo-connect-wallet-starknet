import Page from "./Page";
import { sepolia } from "@starknet-react/chains";
import { StarknetConfig, publicProvider } from "@starknet-react/core";

import { InjectedConnector } from "starknetkit/injected";

const connectors = [
  new InjectedConnector({
    options: { id: "argentX", name: "Argent X" }
  }),
  new InjectedConnector({
    options: { id: "braavos", name: "Braavos" }
  })
  // new WebWalletConnector({ url: "https://web.argent.xyz" })
];

function App() {
  const chains = [sepolia];
  const provider = publicProvider();
  // const connectors = [argent(), braavos()];
  return (
    <StarknetConfig chains={chains} provider={provider} connectors={connectors}>
      <Page />
    </StarknetConfig>
  );
}

export default App;
