# Toilet Finder / 近くのトイレマップ

現在地から近いトイレをすばやく探すスマホファーストのNext.jsアプリです。OpenStreetMap / Overpass APIから周辺の公衆トイレを取得し、失敗した場合はサンプルデータにフォールバックします。

## 起動方法

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:3000` を開いてください。位置情報の許可が必要です。

## Vercel公開手順

このプロジェクトはNext.jsアプリとしてVercelが自動認識できる構成です。特別な環境変数は不要です。

1. ローカルで公開前チェックを実行します。

```bash
npm install
npm run lint
npm run build
npm audit
```

2. GitHubにこのプロジェクトをpushします。
3. [Vercel](https://vercel.com/) にログインします。
4. **Add New Project** を選び、GitHubの対象リポジトリをImportします。
5. Framework Presetが `Next.js` になっていることを確認します。
6. Build and Output Settingsは基本的に変更不要です。
   - Install Command: `npm install`
   - Build Command: `npm run build`
   - Output Directory: 空欄またはNext.jsの自動設定
7. Environment Variablesは、このMVPでは追加不要です。将来Supabaseへ移行する場合は `.env.example` を参考に追加してください。
8. **Deploy** を押して公開します。
9. 公開後、VercelのProduction URLを開いて実機確認を行います。

OpenStreetMap / Overpass APIはクライアント側から取得します。APIが失敗した場合はサンプルデータへフォールバックします。

## 公開前チェック

```bash
npm install
npm run lint
npm run build
npm audit
```

- TypeScriptエラーは `npm run build` で確認します。
- 不要な `console.log` や `debugger` がないことを確認します。
- `.env.local` や秘密情報をGitに含めないでください。
- `.gitignore` で `.env*.local`, `.next/`, `node_modules/`, `.vercel/` を除外しています。
- このMVPでは環境変数は不要です。`.env.example` は将来のSupabase移行用のメモとして置いています。

## スマホ実機確認チェックリスト

公開後、VercelのProduction URLで確認してください。位置情報はHTTPS環境で動作します。

- iPhone Safariで開く
- iPhone Chromeで開く
- Android Chromeで開く
- 現在地取得の許可ダイアログが表示される
- 位置情報許可後に一番近いトイレが表示される
- 位置情報拒否時の案内UIが表示される
- 地図が表示される
- 現在地ピンが表示される
- トイレピンが表示される
- Google Maps経路リンクが開く
- レビュー投稿がlocalStorageに保存される
- 再読み込み後もレビューが残る
- フィルターが動く
- スマホ幅で下部ナビが押しやすい

## Vercel公開後に起きやすい問題

- LeafletはSSRで壊れやすいため、地図ページでは `dynamic import` と `ssr: false` を使っています。
- `window`, `localStorage`, `sessionStorage`, `navigator.geolocation` はクライアント側だけで使う構成です。
- 現在地取得はHTTPSまたはlocalhostで動作します。VercelのProduction URLはHTTPSなので実機確認できます。
- Overpass APIが混雑・失敗した場合はサンプルデータへフォールバックします。
- 地図タイルはOpenStreetMapの公開タイルを使用しています。高トラフィック運用に進む場合はタイルプロバイダやキャッシュ戦略を検討してください。
- 本番URLで地図が崩れる場合は、Leaflet CSSが `app/globals.css` で読み込まれているか確認してください。

## Security Notes

`npm audit` では、PostCSS由来のmoderate advisoryが2件出ます。経路は `next@16.2.6 -> postcss@8.4.31` です。

内容はPostCSSのCSS stringify周りのXSS advisoryです。このMVPではユーザー入力CSSを受け取らず、PostCSSで信頼できないCSSをHTMLの`style`タグへ埋め込む処理もないため、現時点の実用リスクは低いと判断しています。

`npm audit fix --force` はNext.jsの大幅ダウングレードを提案するため実行しません。Next.js側が `postcss >= 8.5.10` を取り込んだ安定版を出したら、`next` を更新して再確認してください。

公開前チェックとして、以下を実行します。

```bash
npm run build
npm audit
```

## Supabase準備メモ

レビュー保存と「使えました / 使えなかった」の利用確認はSupabaseに対応しています。`NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` が未設定の場合はSupabaseへ接続せず、今まで通りlocalStorageだけで動きます。

Supabaseを使う場合は、Supabaseで `reviews` と `confirmations` テーブルを作成します。

| column | type | note |
| --- | --- | --- |
| `id` | `uuid` | primary key, default `gen_random_uuid()` |
| `toilet_id` | `text` | OSM id or generated app toilet id |
| `rating` | `numeric` | overall rating |
| `cleanliness` | `int2` | 1-5 |
| `crowding` | `int2` | 1-5 |
| `usability` | `int2` | 1-5 |
| `facilities` | `int2` | 1-5 |
| `comment` | `text` | nullable |
| `created_at` | `timestamptz` | default `now()` |

`confirmations` はレビューを書かないユーザーがワンタップで利用可否を共有するためのテーブルです。

| column | type | note |
| --- | --- | --- |
| `id` | `uuid` | primary key, default `gen_random_uuid()` |
| `toilet_id` | `text` | OSM id or generated app toilet id |
| `status` | `text` | `available` or `unavailable` |
| `created_at` | `timestamptz` | default `now()` |

### Supabase設定手順

1. Supabaseで新しいProjectを作成します。
2. SQL Editorを開き、下のSQLを実行して `reviews`, `confirmations` テーブルとRLSポリシーを作成します。
3. Project Settings > API から `Project URL` と `anon public key` をコピーします。
4. VercelのProject Settings > Environment Variablesに以下を設定します。
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Vercelで再デプロイします。
6. 投稿したレビューが別端末でも表示されるか確認します。

### reviews / confirmations テーブル作成SQL

匿名ユーザーはレビューと利用確認の読み取り・作成のみ可能にしています。更新・削除は許可していません。連打防止はアプリ側のlocalStorageで簡易的に行っていますが、本格運用ではIPや認証、Edge Functionなどで追加制御してください。

```sql
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  toilet_id text not null,
  rating numeric,
  cleanliness int2 not null,
  crowding int2 not null,
  usability int2 not null,
  facilities int2 not null,
  comment text,
  created_at timestamptz not null default now()
);

alter table public.reviews enable row level security;

create policy "Anyone can read reviews"
on public.reviews
for select
to anon
using (true);

create policy "Anyone can create reviews"
on public.reviews
for insert
to anon
with check (
  toilet_id <> ''
  and cleanliness between 1 and 5
  and crowding between 1 and 5
  and usability between 1 and 5
  and facilities between 1 and 5
  and (rating is null or rating between 1 and 5)
  and char_length(coalesce(comment, '')) <= 1000
);

create table public.confirmations (
  id uuid primary key default gen_random_uuid(),
  toilet_id text not null,
  status text not null,
  created_at timestamptz not null default now(),
  constraint confirmations_status_check check (status in ('available', 'unavailable'))
);

alter table public.confirmations enable row level security;

create policy "Anyone can read confirmations"
on public.confirmations
for select
to anon
using (true);

create policy "Anyone can create confirmations"
on public.confirmations
for insert
to anon
with check (
  toilet_id <> ''
  and status in ('available', 'unavailable')
);
```

ローカルで試す場合は `.env.example` を `.env.local` にコピーして設定します。

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## 主な機能

- Geolocation APIで現在地を取得
- Haversine formulaで距離を計算
- 徒歩時間を `80m = 約1分` で概算
- 一番近いトイレを上部に大きく表示
- 近い順のトイレ一覧
- OpenStreetMap / Leaflet の地図表示
- 現在地マーカーとトイレピン
- Google Mapsの徒歩経路を起動
- localStorageへのレビュー保存
- 清潔さ、混雑度、使いやすさ、設備、コメントのレビュー投稿
- 多目的、24時間、評価4以上、500m以内、清潔さ高めのフィルター
- 位置情報未許可時の案内と手動地点選択UI
- PWA化しやすい `manifest.json`

## 構成

```text
app/
  page.tsx
  map/page.tsx
  toilet/[id]/page.tsx
components/
  BottomNav.tsx
  EmptyState.tsx
  FilterBar.tsx
  LoadingState.tsx
  NearestToiletCard.tsx
  ReviewForm.tsx
  ReviewList.tsx
  ToiletCard.tsx
  ToiletMap.tsx
lib/
  distance.ts
  confirmations.ts
  location.ts
  reviews.ts
  supabase.ts
  toilets.ts
  types.ts
  utils.ts
```

## 今後の拡張案

- Supabaseにレビュー保存を移行
- Overpass APIの結果をサーバー側API Routeでキャッシュ
- Google Placesや自治体オープンデータとの統合
- 写真投稿、混雑状況のリアルタイム共有
- PWAアイコン、オフラインキャッシュ、ホーム画面追加対応
- 多言語対応とアクセシビリティ検証の強化
