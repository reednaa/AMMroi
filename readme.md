# AMMroi

The program currently support the following data sources:
- TheGraph

And can gather data from:
- Uniswap v2 - Only ETH & TKN pairs.
- Bancor - Any pair

It works by running data.py. If one wants to configure the program, it is currently done via data.py. The variable num represents the number of tokens the program gathers. 

The tokens are sorted from the most liqud ones.
The Bancor modules requires a tokenlist.

IIf one wants to use a specific tokenlist, they should comment out the token updating command and edit the tokens.json file directly.


If possible, the program tries to create as few queries as possible. However, this means it is incapable of understanding where it should start collecting data from. It, therefore, relies on a check to see if it should continue from the most recent block it has stored or start over.