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
        "Block": str,
        "Timestamp": str,
        "Reserve0": float,
        "Reserve1": float,
        "totalSupply": float,
        "Reserve0TKN": str,
        "Reserve1TKN": str,
    })
    
    df["Reserve0"] = df["Reserve0"]/10**tokens[df["Reserve0TKN"].iloc[1]]["decimals"]
    df["Reserve1"] = df["Reserve1"]/10**tokens[df["Reserve1TKN"].iloc[1]]["decimals"]
    if reserve_dict(tokens[df["Reserve0TKN"].iloc[1]]["symbol"] + "BNT", tokens, "symbol"):
        pool_token = reserve_dict(tokens[df["Reserve0TKN"].iloc[1]]["symbol"] + "BNT", tokens, "symbol")
    else:
        pool_token = reserve_dict(tokens[df["Reserve1TKN"].iloc[1]]["symbol"] + "BNT", tokens, "symbol")
    
    
    df["totalSupply"] = df["totalSupply"]/10**tokens[pool_token]["decimals"]
    
    df["price"] = df["Reserve0"]/df["Reserve1"]
    df["sINV"] = df["Reserve0"].apply(sqrt)*df["Reserve1"].apply(sqrt) / df["totalSupply"]
    
    df["Reserve0TKN"] = df["Reserve0TKN"].apply(address_to_symbol)
    df["Reserve1TKN"] = df["Reserve1TKN"].apply(address_to_symbol)
    
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