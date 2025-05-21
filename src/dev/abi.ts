export const ABI = [
  {
    "type": "impl",
    "name": "HelloStarknetImpl",
    "interface_name": "thefloxtv_subscription_contract::IHelloStarknet"
  },
  {
    "type": "struct",
    "name": "thefloxtv_subscription_contract::UserState",
    "members": [
      {
        "name": "amount",
        "type": "core::integer::u64"
      },
      {
        "name": "date",
        "type": "core::integer::u64"
      },
      {
        "name": "user_address",
        "type": "core::starknet::contract_address::ContractAddress"
      }
    ]
  },
  {
    "type": "interface",
    "name": "thefloxtv_subscription_contract::IHelloStarknet",
    "items": [
      {
        "type": "function",
        "name": "fetch_user",
        "inputs": [
          {
            "name": "user_address",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "thefloxtv_subscription_contract::UserState"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "subscribe",
        "inputs": [],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "get_subscription_amount",
        "inputs": [],
        "outputs": [
          {
            "type": "core::integer::u64"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "adjust_subscription_token",
        "inputs": [
          {
            "name": "new_token",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "new_amount",
            "type": "core::integer::u64"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "get_subscription_token",
        "inputs": [],
        "outputs": [
          {
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "state_mutability": "view"
      }
    ]
  },
  {
    "type": "constructor",
    "name": "constructor",
    "inputs": [
      {
        "name": "_token_address",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "name": "_subscription_amount",
        "type": "core::integer::u64"
      }
    ]
  },
  {
    "type": "event",
    "name": "thefloxtv_subscription_contract::HelloStarknet::Event",
    "kind": "enum",
    "variants": []
  }
] as const;
