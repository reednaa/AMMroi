# AMMroi

---

Data is stored in this branch: https://github.com/Lindgrenium/AMMroi/tree/gh-pages

---

amm.vav.me is a small webapp dedicated to showchasing the performance of platforms with funigble liquidity. The main focus on the webapp is ease of use.


## How to use:
1. Pick the exchange you want to look at pairs from.
2. Pick asset 1.
3. Pick asset 2.
4. The first (or second) datapoint is automatically selected. It is reccomended you pick a later one.
5. (Optional) Select if you want to view the return with an impermanent loss insurance product.
6. Add Chart.


# Calculations
All calculations assume the pool uses the constant product market maker, specifically, the following formula is true for t0 < t1. 
- x0 · y0 < x1 · y1.

## Impermanent loss
- IL = 2 · sqrt(r_1/r_0)/(1+r_1/r_0) = 2 · sqrt(r_0/r_1)/(1+r_0/r_1)
where r is the price.

If possible, the program tries to create as few queries as possible. However, this means it is incapable of understanding where it should start collecting data from. It, therefore, relies on a check to see if it should continue from the most recent block it has stored or start over.
## Fees
- Fees = Return - 1 = sINV1/sINV0 - 1 = (sqrt(x1·y1)/ts1) / (sqrt(x0·y0)/ts0) - 1
where ts is the total supply of pool tokens.



# Data colelction
The tool uses data.py as an automatable way to easily update the data in 1 go. It connects to TheGraph, Infura and Alchemy.

TheGraph is used for
- Sushiswap
- Uniswap

Alchemy is used for
- Bancor

Infura is used to convert blocks into timestamps.
