from gql import gql, Client, AIOHTTPTransport
import json
from datetime import datetime
import asyncio
from web3 import Web3
import pandas as pd
import os
from asyncio.exceptions import TimeoutError
from math import sqrt
from time import time, sleep

import logging
logger = logging.getLogger(__name__)  

formatter = '%(asctime)s : %(levelname)s : %(message)s'
logging.basicConfig(format=formatter, level=logging.INFO)


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



current_block = web3.eth.getBlock('latest')["number"]

#
# Helper functions
#

def block_to_timestamp(block):
    return web3.eth.getBlock(block)["timestamp"]


def block_to_datetime(block):
    return datetime.fromtimestamp(block_to_timestamp(block))


def split_num_tokens_fairly(x, dist=1.1):
    return [round(x/dist), x-round(x/dist)]


#
# Queries
# 

def get_initial_blocknum():
    query = gql("""
        {
        pair(id: "0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852") {
            createdAtBlockNumber
            }
        }""")
    blocknum = int(client.execute(query)["pair"]["createdAtBlockNumber"])
    logging.info(f"Our benchmark block is {blocknum}")
    return blocknum


def get_tokens(num=5):
    num_arr = split_num_tokens_fairly(num)
    logging.info(f"Doing {num_arr}, {sum(num_arr)} tokens")
    # Find pairs with ETH as token 0 first.
    query = gql("""
        {
        pairs(first: """ + str(num_arr[1]) + """ where: {token0: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"} orderBy: reserveETH orderDirection: desc) {
            id
            token1 {
                id
                symbol
            }
        }
    }""")
    pairs = client.execute(query)
    results = []
    for pair in pairs["pairs"]:
        results.append(dict(id=pair["token1"]["symbol"].lower(), text=pair["token1"]["symbol"].upper(), pair_id=pair["id"]))

    # Get the ETH pairs with token1 as wETH 
    query = gql("""
        {
        pairs(first: """ + str(num_arr[0]) + """ where: {token1: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"} orderBy: reserveETH orderDirection: desc) {
            id
            token0 {
                id
                symbol
            }
        }
    }""")
    pairs = client.execute(query)
    logging.info("Pair queries complete. Saving to tokens.json")
    for pair in pairs["pairs"]:
        results.append(dict(id=pair["token0"]["symbol"].lower(), text=pair["token0"]["symbol"].upper(), pair_id=pair["id"]))
    with open(os.path.join(datafolder, "tokens.json"), "w") as f:
        f.write(json.dumps(dict(results=results), indent=4))
    logging.info("tokens.json has been updated and saved. Remember to check ROI for missing data")
    

def get_roi(restart=False, resolution=1500):
    with open(os.path.join(datafolder, "tokens.json"), "r") as f:
        pairs = json.load(f)["results"]
    
    all_pairs = []
    df_dic = {}
    id_to_symbol = {}
    for pair in pairs:
        all_pairs.append(pair["pair_id"])
        if not os.path.isfile(os.path.join(datafolder, "roi", pair["id"])+".csv") or restart:
            _df = pd.DataFrame(columns=["block", "timestamp", "ROI", "Token Price", "Trade Volume", "sINV"])
            _df.to_csv(os.path.join(datafolder, "roi", pair["id"]) +".csv", index=False)
        id_to_symbol[pair["pair_id"]] = pair["id"]
        
        df_dic[pair["pair_id"]] = pd.read_csv(os.path.join(datafolder, "roi", pair["id"]) +".csv")
        

    #TODO adjust the token, delete incorrect ones and adjust the list to solve the other ones. Then complete the remanining
    # Get dataframe for all pairs.
    if restart:
        blocknumber = get_initial_blocknum()
    else:
        try:
            blocknumber = df_dic[all_pairs[0]]["block"][-1]
        except IndexError:
            logging.info("It seems like we are restarting anyway. If this is a mistake, cancel now.")
            sleep(0.8)
            for pair in pairs:
                all_pairs.append(pair["pair_id"])
                _df = pd.DataFrame(columns=["block", "timestamp", "ROI", "Token Price", "Trade Volume", "sINV"])
                _df.to_csv(os.path.join(datafolder, "roi", pair["id"]) +".csv", index=False)
                id_to_symbol[pair["pair_id"]] = pair["id"]
            
                df_dic[pair["pair_id"]] = pd.read_csv(os.path.join(datafolder, "roi", pair["id"]) +".csv")
            blocknumber = get_initial_blocknum()

    set_time = time()
    
    while blocknumber < current_block:
        blocknumber_timestamp = block_to_timestamp(blocknumber)
        tryings = 4
        for i in range(1,tryings+1):
            try:
                query = gql("""
                    {
                    pairs(block: {number: """ + str(blocknumber) + """} where: {id_in: """ + json.dumps(all_pairs) + """} orderBy: reserve0 orderDirection: desc) {
                        id
                        reserve0
                        reserve1
                        totalSupply
                        volumeToken0
                        }
                    }""")
                pairs = client.execute(query)
            except gql.transport.exceptions.TransportServerError:
                logging.info(f"We lost connection. We will try again in {i} second, trying {tryings-i} more times.")
                sleep(i)
            finally:
                break
        if i == tryings:
            logging.info("We can't continue. Saving data")
            for key in df_dic:
                df_dic[key].to_csv(os.path.join(datafolder, "roi", id_to_symbol[key]) +".csv", index=False)
            raise(gql.transport.exceptions.TransportServerError)
        for pair in pairs["pairs"]:
            if float(pair["totalSupply"]) == 0:
                continue
            # print(id_to_symbol[pair["id"]])
            _df = df_dic[pair["id"]]
            try:
                sINV_zero = _df["sINV"][0]
                prev_trade_volume = sum(_df["Trade Volume"])
            except:  # This exception triggers when the list is empty. (Since then it is missing row 0). We need a benchmark for that. For this, we will create a unique situation, where we will set the sINV_zero to 0, as that cannot happen. We will then detect this when writing the data and set it to 1. (Since the return at t0 is 1.)
                sINV_zero = 0
                prev_trade_volume = 0
            sINV = sqrt(float(pair["reserve1"])*float(pair["reserve0"]))/float(pair["totalSupply"])
            data = {"block": blocknumber, "timestamp": blocknumber_timestamp, "ROI": sINV/sINV_zero if sINV_zero != 0 else 1, "Token Price": float(pair["reserve1"])/float(pair["reserve0"]), "Trade Volume": float(pair["volumeToken0"])-prev_trade_volume, "sINV": sINV}
            df_dic[pair["id"]] = df_dic[pair["id"]].append(data, ignore_index=True)
        
        rounds_per_set = 50
        if round((current_block-blocknumber)/resolution) % rounds_per_set == 0:
            logging.info(f"{current_block-blocknumber} blocks remaning, {round((current_block-blocknumber)/resolution)} rounds left. Last set took {round(time()-set_time,3)} seconds, {round((time()-set_time)/rounds_per_set,3)} seconds per round. Time remaning: {round((time()-set_time)/rounds_per_set*(current_block-blocknumber)/resolution)} seconds")
            set_time = time()
        blocknumber += resolution
    
    for key in df_dic:
        df_dic[key].to_csv(os.path.join(datafolder, "roi", id_to_symbol[key]) +".csv", index=False)


def check_for_restart():
    with open(os.path.join(datafolder, "tokens.json"), "r") as f:
        pairs = json.load(f)["results"]
    
    for pair in pairs:
        if not os.path.isfile(os.path.join(datafolder, "roi", pair["id"])+".csv"):
            logging.info(f"{pair['id']} is missing")
            return True
    return False


if __name__ == "__main__":
    #If data has not been created, run below function. Otherwise, not.
    num = 20
    get_tokens(num)   
    restart_required = check_for_restart()
    get_roi(restart=restart_required, resolution=1500)

