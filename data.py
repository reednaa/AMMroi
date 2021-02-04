from Gathers import uniswapv2_alt as uniswapv2
# from Gathers import sushiswap

import logging


logfile = "log.log"

formatter = "%(asctime)s : %(levelname)s : %(message)s"
logging.basicConfig(
    format=formatter,
    level=logging.INFO,  # handlers=[logging.FileHandler(logfile)]
)
logger = logging.getLogger(__name__)


UPDATE_TOKEN_LIST = False
FORCE_RESTART = False


if __name__ == "__main__":
    logger.info(
        "Ignore the above message. We are only using web3 for getting latest block and converting blocks into timestamps"
    )

    # Contrary to popular belif, we don't need to update the token list. Once we have a suffecient list, we can simply use that. That also enables us to edit it to our desires, instead of relying on top pools. It also gives us the ability to not refetch the list every time a popular token is created.

    if UPDATE_TOKEN_LIST:
        uniswapv2.get_tokens(num=200)
        # sushiswap.get_tokens(num=100)
    if FORCE_RESTART:
        restart_required_uniswap = FORCE_RESTART
        restart_required_sushiswap = FORCE_RESTART
    else:
        restart_required_uniswap = uniswapv2.check_for_restart()
        # restart_required_sushiswap = sushiswap.check_for_restart()
        # logger.info(
        #     f"Restart of data is {'reccomended' if [restart_required_uniswap, restart_required_sushiswap] else 'not reccomended'}. We follow the reccomendation."
        # )
    uniswapv2.get_roi(
        restart=restart_required_uniswap, resolution=1000
    )  # The resolution has a direct corrolation to how many rounds we need to fecth. It is, therefore, reccomended to keep it relativly low.
    uniswapv2.filesjson()

    # sushiswap.get_roi(restart=restart_required_sushiswap, resolution=1000)
    # sushiswap.filesjson()

    #
    # BANCOR
    #

    # from Gathers import bancor_init
    # from Gathers import bancor
    # from Gathers import bancor_parser
