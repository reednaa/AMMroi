from gql import gql, Client, AIOHTTPTransport
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

# formatter = '%(asctime)s : %(levelname)s : %(message)s'
# logging.basicConfig(format=formatter, level=logging.INFO)


infura = "https://mainnet.infura.io/v3/4e3b160a19f845858bd42d301f00222e"

web3 = Web3(Web3.HTTPProvider(infura))
print(web3.isConnected())

import warnings

warnings.filterwarnings("ignore")

ENDPOINT = "https://api.thegraph.com/subgraphs/name/zippoxer/sushiswap-subgraph-fork"


transport = AIOHTTPTransport(url=ENDPOINT)

client = Client(transport=transport, fetch_schema_from_transport=True)


#
# Globals

dirname = os.path.dirname(__file__)
if not os.path.isdir(os.path.join(dirname, "../", "data")):
    os.mkdir(os.path.join(dirname, "../", "data"))
if not os.path.isdir(os.path.join(dirname, "../", "data", "sushiswap")):
    os.mkdir(os.path.join(dirname, "../", "data", "sushiswap"))
datafolder = os.path.join(dirname, "../", "data", "sushiswap")


current_block = web3.eth.getBlock("latest")["number"]

current_block = round(current_block/1000)*1000-1000

#
# Helper functions
#


def block_to_timestamp(block):
    return web3.eth.getBlock(block)["timestamp"]


def block_to_datetime(block):
    return datetime.fromtimestamp(block_to_timestamp(block))


def split_num_tokens_fairly(x, dist=1.1):
    return [round(x / dist), x - round(x / dist)]


def dividor(array, parts=0, length=0):  # Need either parts or length
    if length:
        size = length
        parts = ceil(len(array) / size)
    else:
        size = ceil(len(array) / parts)
    for part in range(0, parts):
        yield array[size * part : size + size * part]


#
# Queries
#


def query_data(all_pairs, df_dic, arr_dic, id_to_symbol, blocknumber, tries=5):
    exchange_data = []
    for pairs in dividor(all_pairs, length=1000):  # The dividor doesn't work very well. 
        for i in range(1, tries + 1):
            try:
                query_txt = (
                    """
                    {
                    pairs(block: {number: """
                    + str(blocknumber)
                    + """} where: {id_in: """
                    + json.dumps(pairs)
                    + """ }) {
                        id
                        reserve0
                        reserve1
                        totalSupply
                        volumeToken0
                        }
                    }"""
                )
                query = gql(query_txt)
                responce = client.execute(query)
                exchange_data += responce["pairs"]
            except Exception as E:
                # logger.error(E)
                logger.info(
                    f"Query broke. Potentially bad connection. We will try again in {i*10} second, trying {tries-i} more times."
                )
                sleep(i*10)
            else:
                break
        if i == tries:
            logger.info("We can't continue. Saving data")
            for key in arr_dic:
                df = pd.DataFrame(arr_dic[key], columns=["block", "timestamp", "reserve0", "reserve1", "total supply", "trade volume"])
                df["price"] = df["reserve0"].apply(float)/df["reserve1"].apply(float)
                df["sINV"] = (df["reserve0"].apply(float)*df["reserve1"].apply(float)).apply(sqrt)/df["total supply"].apply(float)
                
                df = df_dic[key].append(df)
                
                df.to_csv(os.path.join(datafolder, "roi", id_to_symbol[key]) + ".csv", index=False)
            raise (gql.transport.exceptions.TransportServerError)
    return exchange_data


def get_initial_blocknum():
    query = gql(
        """
        {
        pair(id: "0x397ff1542f962076d0bfe58ea045ffa2d347aca0") {
            createdAtBlockNumber
            }
        }"""
    )
    blocknum = int(client.execute(query)["pair"]["createdAtBlockNumber"])
    logger.info(f"Our benchmark block is {blocknum}")
    return blocknum


def get_tokens(num=5):
    logger.info(f"Doing {num} tokens")
    # Find pairs with ETH as token 0 first.
    query = gql(
        """
        {
        pairs(first: """
        + str(int(num))
        + """ orderBy: trackedReserveETH orderDirection: desc) {
            id
            token0 {
                id
                symbol
            }
            token1 {
                id
                symbol
            }
        }
    }"""
    )
    pairs = client.execute(query)
    results = []
    for pair in pairs["pairs"]:
        results.append(
            dict(
                id=f'{pair["token0"]["symbol"].lower()}&{pair["token1"]["symbol"].lower()}',
                pair_id=pair["id"],
            )
        )
    pairs = client.execute(query)
    logger.info("Pair queries complete. Saving to tokens.json")
    with open(os.path.join(datafolder, "tokens.json"), "w") as f:
        f.write(json.dumps(dict(results=results), indent=4))
    logger.info(
        "tokens.json has been updated and saved. Remember to check ROI for missing data"
    )


def get_roi(restart=False, resolution=1000):
    with open(os.path.join(datafolder, "tokens.json"), "r") as f:
        pairs = json.load(f)["results"]

    all_pairs = []
    df_dic = {}
    arr_dic = {}
    id_to_symbol = {}
    for pair in pairs:
        all_pairs.append(pair["pair_id"])
        if (
            not os.path.isfile(os.path.join(datafolder, "roi", pair["id"]) + ".csv")
            or restart
        ):
            _df = pd.DataFrame(
                columns=["block", "timestamp", "reserve0", "reserve1", "total supply", "trade volume", "price", "sINV"]
            )
            _df.to_csv(
                os.path.join(datafolder, "roi", pair["id"]) + ".csv", index=False
            )
        id_to_symbol[pair["pair_id"]] = pair["id"]

        df_dic[pair["pair_id"]] = pd.read_csv(
            os.path.join(datafolder, "roi", pair["id"]) + ".csv",
            dtype={
                "block": int,
                "timestamp": int,
                "reserve0": float,
                "reserve1": float,
                "total supply": float,
                "trade volume": float,
                "price": float,
                "sINV": float
            },
        )
        arr_dic[pair["pair_id"]] = []

    # TODO adjust the token, delete incorrect ones and adjust the list to solve the other ones. Then complete the remanining
    # Get dataframe for all pairs.
    if restart:
        blocknumber = round(get_initial_blocknum()/1000)*1000+1000
    else:
        try:
            blocknumber = int(df_dic["0x397ff1542f962076d0bfe58ea045ffa2d347aca0"]["block"].iloc[-1]) + resolution
        except IndexError:
            logger.info(
                "It seems like we are restarting anyway. If this is a mistake, cancel now."
            )
            sleep(2)
            for pair in pairs:
                all_pairs.append(pair["pair_id"])
                _df = pd.DataFrame(
                    columns=["block", "timestamp", "reserve0", "reserve1", "total supply", "trade volume", "price", "sINV"]
                )
                _df.to_csv(
                    os.path.join(datafolder, "roi", pair["id"]) + ".csv", index=False
                )
                id_to_symbol[pair["pair_id"]] = pair["id"]
                
                arr_dic[pair["pair_id"]] = []
            blocknumber = round(get_initial_blocknum()/1000)*1000+1000

    set_time = time()
    logger.info(
        f"Current, Starting blocknumber {current_block, blocknumber}, difference {current_block-blocknumber} blocks."
    )
    try:
        while blocknumber < current_block:
            blocknumber_timestamp = block_to_timestamp(int(blocknumber))

            exchange_data = query_data(all_pairs, df_dic, arr_dic, id_to_symbol, blocknumber)

            for pair in exchange_data:
                if float(pair["totalSupply"]) == 0:
                    continue
                if float(pair["reserve1"]) / float(pair["reserve0"]) < 10 ** (-16):
                    # This means the token is borderline worthless. If it was below 10**18, then it is literally worthless. In some cases, the pool can be very unbalanced initially and this happens. In those cases, we need to skip ahead untill it has acheived some reserve balances.
                    continue
                # print(id_to_symbol[pair["id"]])
                data = [
                    int(blocknumber),
                    blocknumber_timestamp,
                    pair["reserve0"],
                    pair["reserve1"],
                    pair["totalSupply"],
                    pair["volumeToken0"]
                ]
                arr_dic[pair["id"]].append(data)

            rounds_per_set = 1
            if round((current_block - blocknumber) / resolution) % rounds_per_set == 0:
                logger.info(
                    f"{current_block-blocknumber} blocks remaning, {round((current_block-blocknumber)/resolution)} rounds left. Last set took {round(time()-set_time,3)} seconds, {round((time()-set_time)/rounds_per_set,3)} seconds per round. Time remaning: {round((time()-set_time)/rounds_per_set*(current_block-blocknumber)/resolution)} seconds"
                )
                set_time = time()
            blocknumber += resolution
    except KeyboardInterrupt:
        pass
    logger.info("Saving to .csv")
    for key in arr_dic:
        df = pd.DataFrame(arr_dic[key], columns=["block", "timestamp", "reserve0", "reserve1", "total supply", "trade volume"])
        df["price"] = df["reserve0"].apply(float)/df["reserve1"].apply(float)
        df["sINV"] = (df["reserve0"].apply(float)*df["reserve1"].apply(float)).apply(sqrt)/df["total supply"].apply(float)
        
        df = df_dic[key].append(df)
        
        df.to_csv(os.path.join(datafolder, "roi", id_to_symbol[key]) + ".csv", index=False)


def check_for_restart():
    with open(os.path.join(datafolder, "tokens.json"), "r") as f:
        pairs = json.load(f)["results"]

    for pair in pairs:
        if not os.path.isfile(os.path.join(datafolder, "roi", pair["id"]) + ".csv"):
            logger.info(f"{pair['id']} is missing")
            return True
    return False


def sort_folder_alt(arr):
    dat = []
    for i in arr:
        if (len(i.split(".")) == 2) and (i.split(".")[-1] == "csv"):
            dat.append(i)
    return dat

def filesjson():
    with open(os.path.join(datafolder, "files.json"), "w") as f:
        json.dump(sort_folder_alt(os.listdir(os.path.join(datafolder, "roi"))), f)


if __name__ == "__main__":
    # If data has not been created, run below function. Otherwise, not.
    num = 20
    get_tokens(num)
    restart_required = check_for_restart()
    get_roi(restart=restart_required, resolution=1000)
