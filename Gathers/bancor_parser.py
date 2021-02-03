import json
from datetime import datetime
import pandas as pd
import os
from math import sqrt, ceil
from time import time, sleep

import logging

logger = logging.getLogger(__name__)

formatter = "%(asctime)s : %(levelname)s : %(message)s"
logging.basicConfig(format=formatter, level=logging.INFO)


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


# 'ETH' 'LINK' 'USDC' 'USDT' 'WBTC' 'DAI' 'OCEAN' 'YFI' 'REN' 'renBTC' 'SNX' 'ANT' 'RPL' 'NMR' 'MKR'

folder = os.listdir(os.path.join(datafolder, "roi"))
def sort_folder(arr):
    dat = []
    for i in arr:
        if (len(i.split(".")) == 3) and (i.split(".")[-1] == "csv") and (i.split(".")[-2] == "raw"):
            dat.append(i)
    return dat
    
def address_to_symbol(x):
    return tokens[x]["symbol"]

def reserve_dict(element, dic, token):
    for i in dic:
        if dic[i][token] == element:
            return i
    return None

tokens_to_parse = sort_folder(folder)        



for pool in tokens_to_parse:
    df = pd.read_csv(os.path.join(datafolder, "roi", pool), dtype={
        "block": str,
        "timestamp": str,
        "reserve0": float,
        "reserve1": float,
        "totalsupply": float,
        "reserve0tkn": str,
        "reserve1tkn": str,
    })
    
    df["reserve0"] = df["reserve0"]/10**tokens[df["reserve0tkn"].iloc[1]]["decimals"]
    df["reserve1"] = df["reserve1"]/10**tokens[df["reserve1tkn"].iloc[1]]["decimals"]
    if reserve_dict(tokens[df["reserve0tkn"].iloc[1]]["symbol"] + "BNT", tokens, "symbol"):
        pool_token = reserve_dict(tokens[df["reserve0tkn"].iloc[1]]["symbol"] + "BNT", tokens, "symbol")
    else:
        pool_token = reserve_dict(tokens[df["reserve1tkn"].iloc[1]]["symbol"] + "BNT", tokens, "symbol")
    
    
    df["totalsupply"] = df["totalsupply"]/10**tokens[pool_token]["decimals"]
    
    df["price"] = df["reserve0"]/df["reserve1"]
    df["sINV"] = df["reserve0"].apply(sqrt)*df["reserve1"].apply(sqrt) / df["totalsupply"]
    
    df["reserve0tkn"] = df["reserve0tkn"].apply(address_to_symbol)
    df["reserve1tkn"] = df["reserve1tkn"].apply(address_to_symbol)
    
    df.to_csv(
        os.path.join(datafolder, "roi", f"{tokens[pool_token]['symbol']}.csv"), index=False
    )

def sort_folder_alt(arr):
    dat = []
    for i in arr:
        if (len(i.split(".")) == 2) and (i.split(".")[-1] == "csv"):
            dat.append(i)
    return dat

with open(os.path.join(datafolder, "files.json"), "w") as f:
    json.dump(sort_folder_alt(os.listdir(os.path.join(datafolder, "roi"))), f)