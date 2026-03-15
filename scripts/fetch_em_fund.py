import re
import sys
from datetime import datetime

import requests

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"


def fetch_html(url: str) -> str:
    r = requests.get(url, timeout=20, headers={"User-Agent": UA})
    r.raise_for_status()
    r.encoding = r.apparent_encoding or "utf-8"
    return r.text


def parse_estimate_pct(html: str):
    # Try common patterns: estimated rate fields.
    # Eastmoney pages sometimes embed JSON like "gszzl":"-0.23" or similar.
    patterns = [
        r'"gszzl"\s*:\s*"(?P<pct>-?\d+(?:\.\d+)?)"',
        r'gszzl\s*=\s*"(?P<pct>-?\d+(?:\.\d+)?)"',
        r'"gz_gszzl"\s*:\s*"(?P<pct>-?\d+(?:\.\d+)?)"',
    ]
    for p in patterns:
        m = re.search(p, html)
        if m:
            return m.group("pct")
    return None


def main(codes):
    now = datetime.now().strftime("%H:%M")
    for code in codes:
        url = f"https://fund.eastmoney.com/{code}.html"
        try:
            html = fetch_html(url)
            pct = parse_estimate_pct(html)
            if pct is None:
                print(f"{code}: NA (source=eastmoney page, time={now})")
            else:
                print(f"{code}: {pct}% (source=eastmoney page, time={now})")
        except Exception as e:
            print(f"{code}: ERR {type(e).__name__}: {e} (source=eastmoney page, time={now})")


if __name__ == "__main__":
    main(sys.argv[1:])
