import json
from datetime import datetime
from web3 import Web3
import pandas as pd
import os
from math import sqrt, ceil
from time import time, sleep
from multiprocessing import Pool
import logging

logger = logging.getLogger(__name__)

formatter = "%(asctime)s : %(levelname)s : %(message)s"
logging.basicConfig(format=formatter, level=logging.INFO)


alchemy = "https://eth-mainnet.alchemyapi.io/v2/crJBCdgZbHdSqbyNFQth0IcPOuGO9MaW"
infura = "https://mainnet.infura.io/v3/4e3b160a19f845858bd42d301f00222e"

web3 = Web3(Web3.HTTPProvider(alchemy))
infura_web3 = Web3(Web3.HTTPProvider(infura))  # It is cheaper
logger.info([web3.isConnected(), infura_web3.isConnected()])


def block_to_timestamp(block):
    return infura_web3.eth.getBlock(block)["timestamp"]


import warnings

warnings.filterwarnings("ignore")

dirname = os.path.dirname(__file__)
if not os.path.isdir(os.path.join(dirname, "../", "data")):
    os.mkdir(os.path.join(dirname, "../", "data"))
if not os.path.isdir(os.path.join(dirname, "../", "data", "bancor")):
    os.mkdir(os.path.join(dirname, "../", "data", "bancor"))
if not os.path.isdir(os.path.join(dirname, "../", "data", "bancor", "roi")):
    os.mkdir(os.path.join(dirname, "../", "data", "bancor", "roi"))
datafolder = os.path.join(dirname, "../", "data", "bancor")


with open(os.path.join(datafolder, "pool_path.json"), "r") as f:
    pool_construction = json.load(f)

with open(os.path.join(datafolder, "abi.json"), "r") as f:
    abi = json.load(f)

with open(os.path.join(datafolder, "tokens.json"), "r") as f:
    tokens = json.load(f)

csv_tokens = pd.read_csv(os.path.join(datafolder, "tokens.csv"))


tokens_to_scan = pd.read_csv(os.path.join(datafolder, "tokens.csv"))
# 'ETH' 'LINK' 'USDC' 'USDT' 'WBTC' 'DAI' 'OCEAN' 'YFI' 'REN' 'renBTC' 'SNX' 'ANT' 'RPL' 'NMR' 'MKR'
def in_df(df, li):
    dfs = []
    for i in li:
        dfs.append(tokens_to_scan[tokens_to_scan["reserve symbol"] == i])
    return pd.concat(dfs)


#tokens_to_scan = in_df(
#     tokens_to_scan,
#     [
#         "ETH",
#         "LINK",
#         "USDC",
#         "USDT",
#         "WBTC",
#         "DAI",
#         "OCEAN",
#         "YFI",
#         "REN",
#         "renBTC",
#         "AAVE",
#         "SNX",
#         "ANT",
#         "RPL",
#         "NMR",
#         "MKR",
#         "wNXM"
#     ],
# )


resolution = 1000  # * 10  # Blocks
latest = round(web3.eth.getBlock("latest")["number"]/1000)*1000-1000

# df: block, timestamp, reserve0, reserve1, totalsupply, reserve0tkn, reserve1tkn



def query_data(row_entry):
    its, token_row = row_entry

    pool_token = token_row["pool address"]
    logger.info(tokens[pool_token]["symbol"])
    if tokens[pool_token]["symbol"] in ["BALBNT", "BUSDBNT", "BANDBNT", "BZRXBNT", "COMPBNT", "CROBNT", "ZRXBNT", "RARIBNT", "sBTCBNT", "sUSDBNT", "SXPBNT", "TOMOEBNT", "UMABNT"]:
        #Check if the current total supply is 0
        return 0
    try:
        start = pool_construction[pool_token]["blocks"][0]
    except KeyError as E:
        logger.error(f"{E} on {pool_token}. Skipping")
        return 0
    try:
        tokens[pool_token]
    except KeyError:
        tkn_row = csv_tokens[csv_tokens["pool address"] == pool_token].iloc[0]
        tokens[pool_token] = dict(
            symbol=tkn_row["pool symbol"],
            decimals=18
        )

    # TODO Check if true, then disable line
    if os.path.isfile(
        os.path.join(datafolder, "roi", f"{tokens[pool_token]['symbol']}.raw.csv")
    ):
        df = pd.read_csv(
            os.path.join(datafolder, "roi", f"{tokens[pool_token]['symbol']}.raw.csv")
        )
        try:
            start_number = int(df["block"].iloc[-1]) + resolution
            logger.info(f'{tokens[pool_token]["symbol"]}: {start_number}')
        except IndexError as E:
            start_number = round((start + resolution)/1000)*1000
            logger.info(f'{tokens[pool_token]["symbol"]}: {start_number}, {E}')
            df = pd.DataFrame()
    else:
        start_number = round((start + resolution)/1000)*1000
        logger.info(f'{tokens[pool_token]["symbol"]}: {start_number}, no file')
        df = pd.DataFrame()
    if len(range(start_number, latest, resolution)) == 0:
        return 0




    PoolToken = web3.eth.contract(address=pool_token, abi=abi["DStoken"])
    PoolConverter = web3.eth.contract(
        address=pool_construction[pool_token]["pools"][0],
        abi=abi["StandardPoolConverter"],
    )
    reserve0tkn = PoolConverter.functions.connectorTokens(0).call(
        block_identifier=start + 1
    )
    reserve1tkn = PoolConverter.functions.connectorTokens(1).call(
        block_identifier=start + 1
    )

    # Ensure they are in tokens.json
    if not tokens.get(reserve0tkn):
        erc20 = web3.eth.contract(
            address=reserve0tkn,
            abi=abi["DStoken"],
        )
        logger.info(reserve0tkn)
        decimals = erc20.functions.decimals().call()
        symbol = erc20.functions.symbol().call()
        name = erc20.functions.name().call()
        tokens[reserve0tkn] = dict(symbol=symbol, name=name, decimals=decimals)

        with open(os.path.join(datafolder, "tokens.json"), "w") as f:
            json.dump(tokens, f)
    if not tokens.get(reserve1tkn):
        erc20 = web3.eth.contract(
            address=reserve1tkn,
            abi=abi["DStoken"],
        )
        decimals = erc20.functions.decimals().call()
        symbol = erc20.functions.symbol().call()
        name = erc20.functions.name().call()
        tokens[reserve1tkn] = dict(symbol=symbol, name=name, decimals=decimals)

        with open(os.path.join(datafolder, "tokens.json"), "w") as f:
            json.dump(tokens, f)

    
    stage = 0
    data = []
    for blocknumber in range(start_number, latest, resolution):
        # Find the pool we need to use.
        while (stage != len(pool_construction[pool_token]["blocks"]) - 1) and (
            not (blocknumber < pool_construction[pool_token]["blocks"][stage + 1])
        ):  # Then stage is the correct stage
            stage += 1

        logger.info([
            tokens[pool_token]["symbol"],
            blocknumber,
            stage,
            pool_construction[pool_token]["pools"][stage],
        ])
        # Now we ensured that pool_construction[pool_token]["pool"][stage] is the pool that contains active trading.

        PoolConverter = web3.eth.contract(
            address=pool_construction[pool_token]["pools"][stage],
            abi=abi["StandardPoolConverter"],
        )
        # df: block, timestamp, reserve0, reserve1, totalsupply, reserve0tkn, reserve1tkn
        block = blocknumber
        timestamp = block_to_timestamp(blocknumber)
        totalsupply = PoolToken.functions.totalSupply().call(
            block_identifier=blocknumber
        )
        if totalsupply == 0:
            continue
        try:
            reserve0 = PoolConverter.functions.getConnectorBalance(reserve0tkn).call(
                block_identifier=blocknumber
            )
        except ValueError:
            print("ISSUE:", reserve0tkn)
            continue
        reserve1 = PoolConverter.functions.getConnectorBalance(reserve1tkn).call(
            block_identifier=blocknumber
        )
        if reserve0 == 0 or reserve1 == 0:
            logger.info(
                ["ALERT, reserve0, reserve1",
                reserve0 == 0,
                reserve1 == 0,
                blocknumber,
                "totalsupply",
                totalsupply,]
            )
            continue

        #
        # Calculation
        #
        # price = reserve0 / reserve1
        # sINV = sqrt(reserve0 * reserve1) / totalsupply

        data.append(
            [
                block,
                timestamp,
                reserve0,
                reserve1,
                totalsupply,
                reserve0tkn,
                reserve1tkn,
                # price,
                # sINV,
            ]
        )
        # print(f"{data[0]}, {data[-1]}")
        # data[-1] = [*data[-1], data[-1][8] / data[0][8]]  # This is ROI

    converterDataframe = pd.DataFrame(
        data,
        columns=[
            "block",
            "timestamp",
            "reserve0",
            "reserve1",
            "totalsupply",
            "reserve0tkn",
            "reserve1tkn",
            # "price",
            # "sINV",
            # "roi",
        ],
    )
    
    if len(range(start_number, latest, resolution)) != 0:
        logger.info(f'Saving, {tokens[pool_token]["symbol"]}')
        pd.concat([df, converterDataframe], ignore_index=True).to_csv(
            os.path.join(datafolder, "roi", f"{tokens[pool_token]['symbol']}.raw.csv"),
            index=False,
        )
        logger.info(f'Saved, {tokens[pool_token]["symbol"]}')



for row_entry in tokens_to_scan.iterrows():
    query_data(row_entry)
