import os
import logging


class LogServerOne:
    def __init__(self):
        self.logger = logging.getLogger("mainserver1")
        self.logger.setLevel(logging.INFO)

        # create the logging file handler
        self.fh = logging.FileHandler(os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '\logs\mainserver1.log')

        self.formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        self.fh.setFormatter(self.formatter)

        # add handler to logger object
        self.logger.addHandler(self.fh)

    def set_log(self, data='Start server'):
        self.logger.info(data)