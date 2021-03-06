import logging


def set_global_logger_level(level):
    logger = logging.getLogger()
    logger.setLevel(level)
    for handler in logger.handlers:
        handler.setLevel(level)

def get_global_logger_level():
    return logging.getLogger().getEffectiveLevel()
