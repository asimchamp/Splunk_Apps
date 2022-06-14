from os import path
from glob import glob

# (lazy|dangerous) method to load all modules. 
__all__ = [path.basename(f)[:-3] for f in glob(path.dirname(__file__) + "/*.py")]

