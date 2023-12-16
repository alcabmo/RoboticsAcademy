#!/usr/bin/env python
import os

import time
import threading
import multiprocessing
import subprocess
import sys
import re
import json
import importlib

from hal import HAL

if __name__ == "__main__":
    hal = HAL()
    img = hal.getImage()
    print("Hello")

