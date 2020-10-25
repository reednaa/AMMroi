from Gathers import uniswapv2

import logging
logger = logging.getLogger(__name__)  

formatter = '%(asctime)s : %(levelname)s : %(message)s'
logging.basicConfig(format=formatter, level=logging.INFO)

if __name__ == "__main__":
    logging.info("Ignore the above message. We are only using web3 for getting latest block and converting blocks into timestamps")
    num = 30
    uniswapv2.get_tokens(num)   
    restart_required = uniswapv2.check_for_restart()
    logging.info(f"Restart of data is {'reccomended' if restart_required else 'not reccomended'}. We follow the reccomendation.")
    uniswapv2.get_roi(restart=restart_required, resolution=1500)
