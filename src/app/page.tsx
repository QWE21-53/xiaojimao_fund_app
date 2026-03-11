"use client";

import { useEffect, useMemo, useState } from "react";

type FundLite = {
  code: string;
  name: string;
};

const LS_KEY = "fund-pulse.watchlist.v1";

function loadWatchlist(): FundLite[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x) => x && typeof x.code === "string" && typeof x.name === "string")
      .map((x) => ({ code: x.code, name: x.name }));
  } catch {
    return [];
  }
}

function saveWatchlist(list: FundLite[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

export default function HomePage() {
  const [q, setQ] = useState("");
  const [watchlist, setWatchlist] = useState<FundLite[]>([]);

  useEffect(() => {
    setWatchlist(loadWatchlist());
  }, []);

  const results = useMemo(() => {
    const query = q.trim();
    if (!query) return [];

    // MVP: local mock search. Next step: replace with /api/search calling a real data source.
    const mock: FundLite[] = [
      { code: "110022", name: "易方达消费行业" },
      { code: "161725", name: "招商中证白酒" },
      { code: "005827", name: "易方达蓝筹精选" },
      { code: "012414", name: "中欧医疗健康" },
      { code: "000051", name: "华夏沪深300" },
    ];

    return mock.filter(
      (x) => x.code.includes(query) || x.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [q]);

  function addToWatchlist(f: FundLite) {
    setWatchlist((prev) => {
      if (prev.some((x) => x.code === f.code)) return prev;
      const next = [f, ...prev];
      saveWatchlist(next);
      return next;
    });
  }

  function removeFromWatchlist(code: string) {
    setWatchlist((prev) => {
      const next = prev.filter((x) => x.code !== code);
      saveWatchlist(next);
      return next;
    });
  }

  return (
    <main className="container">
      <header className="header">
        <div className="brand">
          <div className="kicker">xjm and xb</div>
          <h1 className="h1">基金实时估算</h1>
        </div>
        <div className="note">
          估算结果仅用于参考；最终以基金公司披露的净值为准。
        </div>
      </header>

      <section className="card">
        <div className="cardInner">
          <div className="row">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="搜索基金：输入代码或简称（示例：110022 / 医疗 / 白酒）"
              className="input"
            />
          </div>

          {results.length > 0 && (
            <div className="list" aria-label="search-results">
              {results.map((f) => (
                <div key={f.code} className="item">
                  <div className="meta">
                    <div className="name">{f.name}</div>
                    <div className="code">{f.code}</div>
                  </div>
                  <button className="btn" onClick={() => addToWatchlist(f)}>
                    加入自选
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="sectionTitle">
        <h2 className="h2">我的自选（游客本地保存）</h2>
        <div className="count">{watchlist.length} 只</div>
      </section>

      {watchlist.length === 0 ? (
        <div className="empty">还没有自选基金。上面搜索后点“加入自选”。</div>
      ) : (
        <div className="list" aria-label="watchlist">
          {watchlist.map((f) => (
            <div key={f.code} className="item">
              <div className="meta">
                <div className="name">{f.name}</div>
                <div className="code">{f.code}</div>
              </div>
              <button className="btn btnDanger" onClick={() => removeFromWatchlist(f.code)}>
                移除
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="footer">
        下一步：接入真实基金搜索与实时估算；登录后把自选同步到云端。
      </div>
    </main>
  );
}
