from Gathers import uniswapv2

import logging
logger = logging.getLogger(__name__)  

formatter = '%(asctime)s : %(levelname)s : %(message)s'
logging.basicConfig(format=formatter, level=logging.INFO)

UPDATE_TOKEN_LIST = False
FORCE_RESTART = False


if __name__ == "__main__":
    logging.info("Ignore the above message. We are only using web3 for getting latest block and converting blocks into timestamps")
    
    # Contrary to popular belif, we don't need to update the token list. Once we have a suffecient list, we can simply use that. That also enables us to edit it to our desires, instead of relying on top pools. It also gives us the ability to not refetch the list every time a popular token is created.
    
    if UPDATE_TOKEN_LIST:
        num = 100
        uniswapv2.get_tokens(num)
    if FORCE_RESTART:
        restart_required = FORCE_RESTART
    else:
        restart_required = uniswapv2.check_for_restart()
        logging.info(f"Restart of data is {'reccomended' if restart_required else 'not reccomended'}. We follow the reccomendation.")
    uniswapv2.get_roi(restart=restart_required, resolution=50) # The resolution has a direct corrolation to how many rounds we need to fecth. It is, therefore, reccomended to keep it relativly low.
