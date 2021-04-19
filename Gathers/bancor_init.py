# from gql import gql, Client, AIOHTTPTransport
import json
from datetime import datetime
import asyncio
from web3 import Web3
import pandas as pd
import os
from asyncio.exceptions import TimeoutError
from math import sqrt, ceil
from time import time, sleep

import logging

logger = logging.getLogger(__name__)

formatter = "%(asctime)s : %(levelname)s : %(message)s"
logging.basicConfig(format=formatter, level=logging.INFO)


infura = "https://mainnet.infura.io/v3/4e3b160a19f845858bd42d301f00222e"

web3 = Web3(Web3.HTTPProvider(infura))
print(web3.isConnected())


import warnings

warnings.filterwarnings("ignore")

# ENDPOINT = "https://graphql.bitquery.io"

# transport = AIOHTTPTransport(url=ENDPOINT)

# client = Client(transport=transport, fetch_schema_from_transport=True)


dirname = os.path.dirname(__file__)
if not os.path.isdir(os.path.join(dirname, "../", "data")):
    os.mkdir(os.path.join(dirname, "../", "data"))
if not os.path.isdir(os.path.join(dirname, "../", "data", "bancor")):
    os.mkdir(os.path.join(dirname, "../", "data", "bancor"))
datafolder = os.path.join(dirname, "../", "data", "bancor")


with open(os.path.join(datafolder, "abi.json"), "r") as f:
    abi = json.load(f)


def split_data(data):
    blocks = []
    for block_index in range(int((len(data) - 2) / 64) + 1):
        blocks.append(data[2:][64 * (block_index - 1) : 64 * block_index])
    return blocks[1:]


#
# Create list of convert upgrade events
#
#

converter_addresses = [
    "0xCFF01c40fA47faFF359b6B31eBAc86F7958Be486",
    "0x92F18a07808b4e05DD4786955F3A69957a67D724",
    "0x7DfB5180878B43C6Ff5aA6A2Ea55Db20Bcc87410"
]
converters = []
# for address in converter_addresses:
#     converters.append(web3.eth.contract(address=address, abi=abi["ConverterUpgrader"]))
# Converters created


#
# ConverterUpgrade
# topic0 0x522b846327aea07106ec4d64ae4b6d6dea47689884dab650fd3a1f2e1d6a2701
#
latest = web3.eth.getBlock("latest")["number"]
start_block = 10566778
data = []
for ConverterUpgrade_address in converter_addresses:
    logs = web3.eth.getLogs(
        dict(
            fromBlock=start_block,
            toBlock=latest,
            address=ConverterUpgrade_address,
            topics=[
                "0x522b846327aea07106ec4d64ae4b6d6dea47689884dab650fd3a1f2e1d6a2701"
            ],
        )
    )
    for log in logs:
        block = log["blockNumber"]
        tx = web3.toHex(log["transactionHash"])
        fromConverter = Web3.toChecksumAddress(
            "0x" + web3.toHex(primitive=log["topics"][1])[26:]
        )
        toConverter = Web3.toChecksumAddress(
            "0x" + web3.toHex(primitive=log["topics"][2])[26:]
        )
        name = None
        data.append([block, tx, name, fromConverter, toConverter])


converterDataframe = pd.DataFrame(
    data,
    columns=[
        "Block",
        "Transaction",
        "Name",
        "fromConverter",
        "toConverter",
    ],
)
# logger.info("\n" + str(converterDataframe))

# Getting pool names
with open(os.path.join(datafolder, "pools.json"), "r") as f:
    pool_translator = json.load(f)

with open(os.path.join(datafolder, "pool_tokens.json"), "r") as f:
    tokens = json.load(f)

# Fix the token list first.
pools_to_get = (
    converterDataframe["fromConverter"]
    .append(converterDataframe["toConverter"])
    .unique()
)
logger.info(f"Found {len(pools_to_get)} unique tokens. We have {len(pool_translator)}.")
for i in pools_to_get:
    if pool_translator.get(i):
        pass
    else:
        StandardPoolConverter = web3.eth.contract(
            address=i, abi=abi["StandardPoolConverter"]
        )
        ptToken_address = StandardPoolConverter.functions.token().call()
        if tokens.get("DStoken"):
            pass
        else:
            DStoken = web3.eth.contract(address=ptToken_address, abi=abi["DStoken"])
            decimals = DStoken.functions.decimals().call()
            symbol = DStoken.functions.symbol().call()
            name = DStoken.functions.name().call()
            tokens[ptToken_address] = dict(symbol=symbol, name=name, decimals=decimals)

            with open(os.path.join(datafolder, "pool_tokens.json"), "w") as f:
                json.dump(tokens, f)

        pool_translator[i] = dict(token=ptToken_address)

        with open(os.path.join(datafolder, "pools.json"), "w") as f:
            json.dump(pool_translator, f)

# Getting token names (Just to make sure)
with open(os.path.join(datafolder, "pools.json"), "r") as f:
    pool_translator = json.load(f)

its = 0
for entry in data:
    entry[2] = pool_translator[entry[4]]["token"]
    data[its] = entry
    its += 1


converterDataframe = pd.DataFrame(
    data,
    columns=[
        "Block",
        "Transaction",
        "Name",
        "fromConverter",
        "toConverter",
    ],
)
converterDataframe.sort_values("Block", inplace=True, ignore_index=True)
# We need to fix dublicate paths.
# If there are multiple fromConverter then we should delete the oldest.
converterDataframe.drop_duplicates(subset=['fromConverter'], keep='first', inplace=True, ignore_index=True)
converterDataframe.to_csv(os.path.join(datafolder, "converters.csv"), index=False)

# Construct pool path. We will index by pool token

with open(os.path.join(datafolder, "pool_tokens.json"), "r") as f:
    tokens = json.load(f)

construction = {}
# {
#     "poolToken": {
#         pools: [addr1, addr2, addr3]
#         blocks: [begin1, upgrade1t2, upgrade2t3]
#     }
# }
for pt in tokens:
    if pt in ["0xD6bF84B5D6F4d1288C39f2486688e949B1423E62"]:  # If the pool loop fails, this is likely the culprint. Add the token it failed on here. The issue is that there is no single upgrade path, but someone decided to create multiple. Simply removing outliers are easier than fixing it. (Especially since there was only one when I made the script.) 
        continue
    blocks = []
    pools_zero = str(converterDataframe[converterDataframe["Name"] == pt].iloc[0]["fromConverter"])
    pools = [pools_zero] + list(converterDataframe[converterDataframe["Name"] == pt]["toConverter"])
    print(pools)

    # We will now search for activation for the first pool on in the list.
    start_block = 10566778 - 50000
    try:
        logs = web3.eth.getLogs(
            dict(
                fromBlock=start_block,
                toBlock=latest,
                address=pools_zero,
                topics=[
                    "0x6b08c2e2c9969e55a647a764db9b554d64dc42f1a704da11a6d5b129ad163f2c"
                ],
            )
        )
    except IndexError as E:
        print(pools_zero, pt)
        raise E
    try:
        if (
            web3.toHex(logs[0]["topics"][3])
            == "0x0000000000000000000000000000000000000000000000000000000000000001"
        ):
            log = logs[0]
            blocks.append(log["blockNumber"])
        else:
            if (
                web3.toHex(logs[1]["topics"][3])
                == "0x0000000000000000000000000000000000000000000000000000000000000001"
            ):
                log = logs[1]
                blocks.append(log["blockNumber"])
            else:
                raise Exception("This should not happen. So IDK.")

    except IndexError:
        blocks.append(start_block)

    # Now we need to sort through converterDataframe to get the remaning blocks.

    # print(len(converterDataframe[
    #         converterDataframe["Name"] == pt
    #     ]), len(pools[:-1]))

    
    blocks += list(converterDataframe[converterDataframe["Name"] == pt]["Block"])

    construction[pt] = dict(pools=pools, blocks=blocks)

with open(os.path.join(datafolder, "pool_path.json"), "w") as f:
    json.dump(construction, f)
