import pathlib, urllib.request
root = pathlib.Path('.')
files = [
  ("https://raw.githubusercontent.com/payloadcms/payload/main/templates/blank/src/app/%28payload%29/layout.tsx", "app/(payload)/layout.tsx"),
  ("https://raw.githubusercontent.com/payloadcms/payload/main/templates/blank/src/app/%28payload%29/custom.scss", "app/(payload)/custom.scss"),
  ("https://raw.githubusercontent.com/payloadcms/payload/main/templates/blank/src/app/%28payload%29/admin/importMap.js", "app/(payload)/cms/importMap.js"),
  ("https://raw.githubusercontent.com/payloadcms/payload/main/templates/blank/src/app/%28payload%29/admin/%5B%5B...segments%5D%5D/page.tsx", "app/(payload)/cms/[[...segments]]/page.tsx"),
  ("https://raw.githubusercontent.com/payloadcms/payload/main/templates/blank/src/app/%28payload%29/admin/%5B%5B...segments%5D%5D/not-found.tsx", "app/(payload)/cms/[[...segments]]/not-found.tsx"),
  ("https://raw.githubusercontent.com/payloadcms/payload/main/templates/blank/src/app/%28payload%29/api/%5B...slug%5D/route.ts", "app/(payload)/api/[...slug]/route.ts"),
]
for url, rel in files:
    out = root / rel
    out.parent.mkdir(parents=True, exist_ok=True)
    print('Downloading', url)
    urllib.request.urlretrieve(url, out)
    print('Wrote', out)
