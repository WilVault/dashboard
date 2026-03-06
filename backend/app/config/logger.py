import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s'
)

log = logging.getLogger(__name__)



'''

Use it anywhere in your app, for example:

    from app.config.logger import log

    log.info('Something happened')
    log.error('Something broke')

'''