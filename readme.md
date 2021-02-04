# AMMroi

amm.vav.me makes it easy to play around with impermanent loss for more than 300 pairs across Bancor (~16), Sushiswap (~100) and Uniswap (~200).
It provides a convient way to understand and see how some people might never have noticed impermanent loss while others might have been impacted a lot. It all depends on the time you deposited.


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
