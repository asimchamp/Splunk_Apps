# This file implements util functions to capture params for onnx model upload (REST handler).
# Could not be added to existing `telemetry_util.py` because of numpy imports
import time

import cexc
from util.error_util import safe_func

logger = cexc.get_logger('telemetry_logger')


@safe_func
def log_onnx_model_upload_time(interval):
    logger.debug("command=onnx_model_validate_and_upload, onnx_upload_time=%f" % interval)


@safe_func
def log_onnx_model_upload_size_on_disk(size):
    logger.debug("command=onnx_model_size_mb, onnx_model_size_on_disk=%f" % size)


@safe_func
def log_onnx_model_input_shape(dim, input_shape, df_shape):
    logger.debug(
        f"command=onnx_input_shape, col_dimension={dim}, onnx_input_shape={input_shape}, dataframe_shape={df_shape}"
    )


class Timer(object):
    def __enter__(self):
        self.start = time.time()
        return self

    def __exit__(self, *args):
        self.end = time.time()
        self.interval = self.end - self.start
