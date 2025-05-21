import { useState } from "react";
import "./App.css";
import {
  Connector,
  useAccount,
  useConnect,
  useContract,
  useDisconnect,
  useProvider,
  type Abi
} from "@starknet-react/core";
import {
  type StarknetkitConnector,
  useStarknetkitConnectModal
} from "starknetkit";

import contract_abi from "./dev/thefloxtv_subscription_contract_HelloStarknet.contract_class.json";
import erc20_contract_abi from "./erc20/dev/erc20_erc20.contract_class.json";
// import { ABI } from "./dev/abi.ts";
import { TransactionExecutionStatus } from "starknet";

interface IUser {
  amount: BigInt;
  date: BigInt;
  user_address: BigInt;
}

const Page = () => {
  const { disconnect } = useDisconnect();
  const { address, account } = useAccount();

  const [userState, setUserState] = useState<IUser>();
  const contract_address =
    "0x0520588f2e74b510940c9e41f272b38652333d870eb43816b68732804076417c";

  const strk_token_address =
    "0x04718f5a0Fc34cC1AF16A1cdee98fFB20C31f5cD61D6Ab07201858f4287c938D";

  // let abi_ = contract_abi.abi;

  const { connect, connectors } = useConnect();
  const { starknetkitConnectModal } = useStarknetkitConnectModal({
    connectors: connectors as StarknetkitConnector[]
  });

  const { provider } = useProvider();

  async function connectWallet() {
    const { connector } = await starknetkitConnectModal();
    if (!connector) {
      return;
    }
    await connect({ connector: connector as Connector });
  }

  // const abi = ABI as Abi;

  // const { contract } = useContract({
  //   abi,
  //   address: contract_address,
  //   provider: provider
  // });

  // const contract1 = new Contract(
  //   contract_abi.abi,
  //   contract_address,
  //   provider
  // ).typedv2(contract_abi.abi as Abi);

  const { contract: contract1 } = useContract({
    abi: contract_abi.abi as Abi,
    address: contract_address,
    provider: provider
  });

  // const erc20Contract = new Contract(
  //   erc20_contract_abi.abi,
  //   strk_token_address,
  //   provider
  // ).typedv2(erc20_contract_abi.abi as Abi);

  const { contract: erc20Contract } = useContract({
    abi: erc20_contract_abi.abi as Abi,
    address: strk_token_address,
    provider: provider
  });

  const fetchUserData = async () => {
    if (!contract1 || !address) return;

    try {
      const response = await (contract1.call as any)("fetch_user", [address]);

      setUserState(response);
      console.log("User state:", response);
      return response;
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchSubscriptionAmount = async () => {
    if (!contract1 || !address) return;
    try {
      const response: BigInt = (await contract1.call(
        "get_subscription_amount"
      )) as unknown as BigInt;
      console.log("Subscription Amount:", response);
      return response;
    } catch (error) {
      console.error("Error fetching subscripption amount:", error);
      throw Error("Couldn't fetch subscription amount");
    }
  };

  const handleApprove = async () => {
    if (!erc20Contract || !account) return;

    try {
      const subscription_amount = await fetchSubscriptionAmount();
      if (!subscription_amount)
        throw Error("Couldnt fetch subscription amount at approval");
      const amountBigInt = BigInt(subscription_amount.toString());
      const LOW_PART = BigInt(2) ** BigInt(128);
      const low = (amountBigInt % LOW_PART).toString(); // Low 128 bits
      const high = (amountBigInt / LOW_PART).toString(); // High 128 bits

      await account.execute([
        {
          contractAddress: strk_token_address,
          entrypoint: "approve",
          calldata: [contract_address, low, high]
        }
      ]);
      // await erc20Contract.invoke(
      //   "approve",
      //   [contract_address, subscription_amount],
      //   { nonce }
      // );
      return true;
    } catch (error) {
      console.error("Error approving contract to spend on behalf:", error);
      return false;
    }
  };

  const handleSubscribe = async () => {
    if (!contract1 || !account) return;

    try {
      // For write operations, use invoke instead of call

      // const is_approved = await handleApprove();
      // if (!is_approved) throw Error("Approval failed at subscription");

      const response = await account.execute([
        {
          contractAddress: contract_address,
          entrypoint: "subscribe",
          calldata: []
        }
      ]);
      console.log("Subscribe transaction hash:", response.transaction_hash);

      console.log("Waiting for confirmation...");
      const waitForTx = await provider.waitForTransaction(
        response.transaction_hash,
        {
          successStates: [TransactionExecutionStatus.SUCCEEDED]
        }
      );
      console.log(waitForTx);
      // You can wait for transaction confirmation if needed

      console.log("Transaction confirmed!");

      // Refresh user data after subscription
      fetchUserData();
    } catch (err) {
      console.error("Error subscribing:", err);
      throw err;
    }
  };

  return (
    <>
      <div className="card flex flex-col gap-2 max-w-[1024px] overflow-x-hidden">
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
        <button
          onClick={async () => {
            if (address) {
              const user_state = await fetchUserData();

              console.log(user_state);
            } else {
              connectWallet();
            }
          }}
        >
          fetch current user
        </button>
        <button
          onClick={async () => {
            if (address) {
              await handleApprove();
            } else {
              connectWallet();
            }
          }}
        >
          Handle Approve
        </button>
        <button
          onClick={async () => {
            if (address) {
              await handleSubscribe();
            } else {
              connectWallet();
            }
          }}
        >
          Subscribe for streaming
        </button>
      </div>
      {userState && (
        <div className="flex w-full max-w-80 flex-col rounded-2xl gap-4 p-6 font-black bg-gray-100 min-h-64 h-fit text-black">
          <div className="__user_amount">
            Amount Paid: {Number(userState.amount)}
          </div>
          <div className="__user_amount">
            Subscription Ends: {Number(userState.date)} --{" "}
            {formatTimestamp(userState.date.toString())}
          </div>
          <div className="__user_amount flex-wrap text-wrap w-full">
            User Address: 0x
            {truncateString(userState.user_address.toString(16))}
          </div>
        </div>
      )}
    </>
  );
};

export default Page;

function truncateString(
  text: string,
  charsAtStart: number = 6,
  charsAtEnd: number = 4
): string {
  if (!text) return "";

  // If the string is shorter than the total characters we want to show, return it as is
  if (text.length <= charsAtStart + charsAtEnd) {
    return text;
  }

  // For hex strings that start with "0x", we might want to include that prefix in addition to the chars
  const hasHexPrefix = text.startsWith("0x");
  const actualStart = hasHexPrefix ? Math.max(2, charsAtStart) : charsAtStart;

  const start = text.substring(0, hasHexPrefix ? actualStart + 2 : actualStart);
  const end = text.substring(text.length - charsAtEnd);

  return `${start}...${end}`;
}

function formatTimestamp(
  timestamp: number | bigint | string,
  includeTime: boolean = true
): string {
  // Convert to number if it's a BigInt or string
  const timestampNum =
    typeof timestamp === "bigint" || typeof timestamp === "string"
      ? Number(timestamp)
      : timestamp;

  // Create a Date object (JavaScript uses milliseconds, so multiply by 1000)
  const date = new Date(timestampNum * 1000);

  // Options for formatting
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric"
  };

  // Add time options if requested
  if (includeTime) {
    options.hour = "2-digit";
    options.minute = "2-digit";
    options.second = "2-digit";
    options.timeZoneName = "short";
  }

  // Format the date according to the user's locale
  return date.toLocaleDateString(undefined, options);
}
