
import socket
import os

def check_port(port):
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    result = sock.connect_ex(('localhost', port))
    sock.close()
    if result == 0:
        print(f"Port {port} is OPEN (Process is running)")
    else:
        print(f"Port {port} is CLOSED (Free)")

print("Checking port 8004...")
check_port(8004)
