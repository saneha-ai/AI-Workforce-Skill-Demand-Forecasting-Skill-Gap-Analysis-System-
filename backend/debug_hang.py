
import sys
import os
import time

print("Start...")
start = time.time()

print("Importing numpy...")
import numpy as np
print(f"NumPy imported in {time.time()-start:.2f}s")

try:
    print("Importing alibi_detect...")
    import alibi_detect
    print(f"alibi_detect imported in {time.time()-start:.2f}s")
except Exception as e:
    print(f"Error importing alibi_detect: {e}")

try:
    print("Importing alibi_detect.cd...")
    from alibi_detect import cd
    print(f"alibi_detect.cd imported in {time.time()-start:.2f}s")
except Exception as e:
    print(f"Error importing alibi_detect.cd: {e}")

try:
    print("Importing KSDrift...")
    from alibi_detect.cd import KSDrift
    print(f"KSDrift imported in {time.time()-start:.2f}s")
except Exception as e:
    print(f"Error importing KSDrift: {e}")

print("Done.")
