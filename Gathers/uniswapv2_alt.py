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
import numpy as np
from multiprocessing import Pool
import signal
import _thread

import logging

logger = logging.getLogger(__name__)

# formatter = '%(asctime)s : %(levelname)s : %(message)s'
# logging.basicConfig(format=formatter, level=logging.INFO)


infura = "https://mainnet.infura.io/v3/4e3b160a19f845858bd42d301f00222e"

web3 = Web3(Web3.HTTPProvider(infura))
print(web3.isConnected())

import warnings

warnings.filterwarnings("ignore")

ENDPOINT = "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2"

transport = AIOHTTPTransport(url=ENDPOINT)

client = Client(transport=transport, fetch_schema_from_transport=True)


#
# Globals

dirname = os.path.dirname(__file__)
if not os.path.isdir(os.path.join(dirname, "../", "data")):
    os.mkdir(os.path.join(dirname, "../", "data"))
if not os.path.isdir(os.path.join(dirname, "../", "data", "uniswapv2")):
    os.mkdir(os.path.join(dirname, "../", "data", "uniswapv2"))
datafolder = os.path.join(dirname, "../", "data", "uniswapv2")


current_block = web3.eth.getBlock("latest")["number"]

current_block = round(current_block/1000)*1000-1000

#
# Helper functions
#


def block_to_timestamp(block):
    return web3.eth.getBlock(block)["timestamp"]


def block_to_datetime(block):
    return datetime.fromtimestamp(block_to_timestamp(block))

#
# Queries
#


def query_data(pair, blocknumber, tries=5):
    exchange_data = [] 
    for i in range(1, tries + 1):
        try:
            query_txt = (
                '''
                {
                pair(block: {number: '''
                + str(blocknumber)
                + '''} id: "'''
                + pair
                + '''" ) {
                    id
                    reserve0
                    reserve1
                    totalSupply
                    volumeToken0
                    }
                }'''
            )
            query = gql(query_txt)
            responce = client.execute(query)
            return responce["pair"]
        except Exception as E:
            # logger.error(E)
            logger.info(
                f"Query broke. Potentially bad connection. We will try again in {i*10} second, trying {tries-i} more times."
            )
            sleep(i*10)
        else:
            break
    logger.info("We can't continue. ")  # Saving data")
    print(E)
    raise KeyboardInterrupt


def get_initial_blocknum(pair):
    query = gql(
        '''
        {
        pair(id: "''' + pair + '''") {
            createdAtBlockNumber
            }
        }'''
    )
    blocknum = int(client.execute(query)["pair"]["createdAtBlockNumber"])
    # logger.info(f"Our benchmark block is {blocknum}")
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


def query_function(pair, resolution=1000):  #TODO make resolution configurable
    stop = False
    try:
        storage_df = pd.read_csv(
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
        startblock = int(storage_df.iloc[-1]["block"]) + resolution
    except (FileNotFoundError, IndexError):
        storage_df = pd.DataFrame(columns=["block", "timestamp", "reserve0", "reserve1", "total supply", "trade volume", "price", "sINV"])
        startblock = round(get_initial_blocknum(pair["pair_id"])/1000)*1000+1000
        
        
    data = []
    try:
        for blocknumber in range(startblock, current_block, resolution):
            print(blocknumber, pair["id"])
            exchange_data = query_data(pair["pair_id"], blocknumber)

            if float(exchange_data["totalSupply"]) == 0:
                continue
            if float(exchange_data["reserve1"]) / float(exchange_data["reserve0"]) < 10 ** (-18):
                continue

            
            blocknumber_timestamp = block_to_timestamp(int(blocknumber))
            
            data.append(
                [int(blocknumber),
                blocknumber_timestamp,
                exchange_data["reserve0"],
                exchange_data["reserve1"],
                exchange_data["totalSupply"],
                exchange_data["volumeToken0"]]
            )
    except KeyboardInterrupt:
        stop = True
    data_df = pd.DataFrame(data, columns=["block", "timestamp", "reserve0", "reserve1", "total supply", "trade volume"])
    data_df["price"] = data_df["reserve0"].apply(float)/data_df["reserve1"].apply(float)
    data_df["sINV"] = (data_df["reserve0"].apply(float)*data_df["reserve1"].apply(float)).apply(sqrt)/data_df["total supply"].apply(float)
    
    storage_df = storage_df.append(data_df)
    
    
    storage_df.to_csv(os.path.join(datafolder, "roi", pair["id"]) + ".csv", index=False)
    if stop:
        raise KeyboardInterrupt

    return (pair, True)


def get_roi(restart=False, resolution=1000):
    with open(os.path.join(datafolder, "tokens.json"), "r") as f:
        pairs = json.load(f)["results"]
        
    
    pool = Pool(processes=3)
    pool.map(
        query_function,
        pairs
    )
    try:
        pool.join()
    except KeyboardInterrupt:
        pool.terminate()
        pool.join()
        
    # for pair in pairs:
    #     query_function(pair, resolution)  #TODO Async it
        


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
    # num = 20
    # get_tokens(num)
    restart_required = check_for_restart()
    get_roi(restart=restart_required, resolution=1000)
