
import sys
import os

# Add current directory to path
sys.path.append(os.getcwd())

print("Testing imports...")
try:
    from alibi_detect.cd import KSDrift
    print("SUCCESS: alibi_detect.cd.KSDrift imported")
except ImportError as e:
    print(f"FAILURE: alibi_detect import failed: {e}")
except Exception as e:
    print(f"FAILURE: alibi_detect unexpected error: {e}")

try:
    from drift import DriftMonitor
    print("SUCCESS: drift.DriftMonitor imported")
except ImportError as e:
    print(f"FAILURE: drift import failed: {e}")
except Exception as e:
    print(f"FAILURE: drift unexpected error: {e}")
