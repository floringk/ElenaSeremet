# Content pull script

## Running the script on Windows

If `python` is not found, use the **Python Launcher** instead:

```powershell
# From repo root (ESSite)
py -m pip install -r scripts/requirements.txt
py scripts/pull_content.py
```

**Text/structure only (no image download):**

```powershell
py scripts/pull_content.py --no-download
```

**Optional:** To make `python` work in PowerShell, reorder PATH so your real Python comes before the Windows Store alias, or use:

```powershell
& "C:\Users\florin.ostafe\AppData\Local\Programs\Python\Python311\python.exe" scripts/pull_content.py
```

(Adjust the path if you use Anaconda: `...\anaconda3\python.exe`.)
