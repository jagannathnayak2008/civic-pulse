import sys
import os
import subprocess
import time
import webbrowser

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(ROOT_DIR, "civicpulse", "frontend")

def main():
    print("\n" + "=" * 65)
    print("  [CIVICPULSE] Autonomous Civic Incident Intelligence Platform")
    print("=" * 65)
    print("  Starting Backend on  http://localhost:8000")
    print("  Starting Frontend on http://localhost:3000")
    print("=" * 65 + "\n", flush=True)

    # 1. Start Backend Process
    backend_cmd = [sys.executable, os.path.join(ROOT_DIR, "run_backend.py")]
    backend_proc = subprocess.Popen(backend_cmd, cwd=ROOT_DIR)

    # 2. Start Frontend Process (npm.cmd on Windows)
    npm_bin = "npm.cmd" if sys.platform == "win32" else "npm"
    frontend_cmd = [npm_bin, "run", "dev"]
    frontend_proc = subprocess.Popen(frontend_cmd, cwd=FRONTEND_DIR, shell=(sys.platform == "win32"))

    time.sleep(2)
    print("\n[INFO] Both servers are running!")
    print("  -> Press CTRL+C to stop both servers simultaneously.\n", flush=True)

    try:
        backend_proc.wait()
        frontend_proc.wait()
    except KeyboardInterrupt:
        print("\n[INFO] Shutting down CivicPulse servers...", flush=True)
        backend_proc.terminate()
        frontend_proc.terminate()
        print("[OK] Stopped successfully.")

if __name__ == "__main__":
    main()

