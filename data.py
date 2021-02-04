from Gathers import uniswapv2
from Gathers import sushiswap

import logging


logfile = "log.log"

formatter = "%(asctime)s : %(levelname)s : %(message)s"
logging.basicConfig(
    format=formatter,
    level=logging.INFO,  handlers=[logging.FileHandler(logfile)]
)
logger = logging.getLogger(__name__)


UPDATE_TOKEN_LIST = False
FORCE_RESTART = False


if __name__ == "__main__":

    # UPDATE TOKEN LIST
    # uniswapv2.get_tokens(num=200)
    # sushiswap.get_tokens(num=100)

    
    # # UNISWAP
    try:
        uniswapv2.get_roi()
        uniswapv2.filesjson()
    except Exception as E:
        print(E)
    


    # # SUSHISWAP
    try:
        sushiswap.get_roi()
        sushiswap.filesjson()
    except Exception as E:
        print(E)


    # BANCOR
    try:
        print("bancor_init")
        from Gathers import bancor_init
        print("bancor gather")
        from Gathers import bancor
        print("bancor parser")
        from Gathers import bancor_parser
    except Exception as E:
        raise E
