from django.http import HttpResponse, HttpResponseServerError
from django.db import connections
from django.db.utils import OperationalError
import logging

logger = logging.getLogger(__name__)

def health_check(request):
    try:
        # Test database connection
        db_conn = connections['default']
        c = db_conn.cursor()
        c.execute('SELECT 1')
        c.close()
        return HttpResponse("OK")
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return HttpResponseServerError(f"Health check failed: {str(e)}")