# ToiNavi / 近くのトイレマップ

現在地から近くのトイレを探せる、レビュー付きのトイレマップアプリです。OpenStreetMap / Overpass APIから周辺の公衆トイレを取得し、失敗した場合はサンプルデータにフォールバックします。

## ストア提出情報

| 項目 | 内容 |
|------|------|
| Privacy Policy URL | `https://toilet-finder-lovat.vercel.app/privacy` |
| Support URL | `https://toilet-finder-lovat.vercel.app/support` |
| Terms URL | `https://toilet-finder-lovat.vercel.app/terms` |
| Contact | toinavi012@gmail.com |

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

## ネイティブアプリ実機テスト手順（Android / iOS）

Capacitorでビルドしたネイティブアプリを、Android Studio または Xcode で実機テストする手順です。

### 共通：Webアプリをビルドしてネイティブに同期する

Webアプリのソースを変更するたびに、以下の手順でビルドと同期が必要です。

```bash
npm run build        # Next.js を out/ へ静的エクスポート
npx cap sync         # out/ を ios/android 両方へコピー（または android / ios を指定）
```

### Android（Windows・Mac 共通）

**前提：** Android Studio がインストール済みであること。

1. Webアプリをビルドして同期します。

   ```bash
   npm run build
   npx cap sync android
   ```

2. Android Studio でプロジェクトを開きます。

   ```bash
   npx cap open android
   ```

   `npx cap open android` が失敗する場合（Android Studio が見つからない場合）は、Android Studio から直接 `android/` フォルダを開いてください。

3. Android Studio が起動したら、**Gradle sync** が完了するまで待ちます（初回は数分かかることがあります）。

4. 実機またはエミュレータを選択して ▶ Run を押します。

5. アプリ起動後、以下を確認します。

   - 位置情報の許可ダイアログが表示される（「アプリの使用時のみ許可」を選択）
   - 現在地周辺のトイレ一覧が表示される
   - 地図タブで地図とトイレピンが表示される
   - Google Maps 経路案内リンクが開く
   - お気に入り・レビュー投稿が動作する

### Android エミュレーターで確認する（実機がない場合）

Android 実機がなくても、Android Studio のエミュレーターで動作確認できます。

#### 1. プロジェクトをビルドして Android Studio で開く

```bash
npm run build
npx cap sync android
npx cap open android
```

`npx cap open android` が失敗する場合は、Android Studio から **File → Open** で `android/` フォルダを直接開いてください。

#### 2. エミュレーターを作成する

1. Android Studio のメニュー **Tools → Device Manager** を開きます。
2. **Create Device** を押します。
3. 端末モデルの一覧から **Pixel 7** など Pixel 系を選び、**Next** を押します。
4. システムイメージの選択画面で **API 34**（または API 24 以上）を選びます。初回は **Download** が必要です。
5. **Finish** を押してエミュレーターを作成します。
6. Device Manager の ▶ ボタンを押してエミュレーターを起動します。

#### 3. エミュレーターに位置情報を設定する

エミュレーターはデフォルトでは GPS 信号がありません。以下の手順でテスト用座標を設定します。

1. 起動中のエミュレーター右側のツールバーにある **「…」（Extended Controls）** を押します。
2. 左メニューから **Location** を選びます。
3. 以下の座標を入力します（仙台駅付近）。

   | 項目 | 値 |
   |------|-----|
   | Latitude | `38.260247` |
   | Longitude | `140.882514` |

4. **Set Location** を押します。

#### 4. アプリを実行して確認する

1. Android Studio 上部のデバイス選択で起動中のエミュレーターを選びます。
2. ▶ Run を押します。
3. アプリが起動したら、以下を確認します。

   - アプリが起動する
   - 位置情報の許可ダイアログが表示される（「アプリの使用時のみ許可」を選択）
   - 現在地から近くのトイレが検索される
   - マップタブで地図が表示される
   - トイレのピンを押すとカードが表示される
   - カードから詳細画面が開く
   - Google Maps 経路案内リンクが開く
   - お気に入り登録できる
   - レビュー投稿できる
   - 通報できる

#### 5. エミュレーター確認に関する注意

- Android 実機がなくてもエミュレーターで開発確認は可能です。
- Google Play への公開前には **クローズドテスト**（内部テストトラック）が必要です。
- 新規個人開発者アカウントでは、**12人以上のテスターが14日間** アプリをテストすることが Google Play の要件です。
- エミュレーターでの確認後、最終的には実機での動作確認も推奨します。

#### 動作確認済み環境（2026-05-24）

| 項目 | 結果 |
|------|------|
| 環境 | Pixel 8 API 34 Emulator（Android Studio） |
| App ID | com.toinavi.app |
| 現在地取得 | ✓ 成功（仙台駅付近） |
| 仙台駅周辺の実在トイレ表示 | ✓ 成功 |
| マップ・トイレピン表示 | ✓ 成功 |
| Google Maps 経路案内 | ✓ 成功 |
| 手動検索（東京・新宿など） | ✓ 成功 |

### iOS（Mac 必須）

**前提：** Mac 環境であること。Xcode がインストール済みであること。Apple Developer アカウント（無料プランで実機テスト可能）。

1. Webアプリをビルドして同期します。

   ```bash
   npm run build
   npx cap sync ios
   ```

2. Xcode でプロジェクトを開きます。

   ```bash
   npx cap open ios
   ```

3. Xcode が起動したら、左のナビゲーターで `App` ターゲットを選択し、**Signing & Capabilities** を開きます。

   - **Team** に自分の Apple ID を設定します。
   - Bundle Identifier は `com.toinavi.app` のままでOKです。

4. 実機を USB で接続し、上部のデバイス選択で対象を選んで ▶ Run を押します。

5. 初回実機テストでは、iPhoneの **設定 → 一般 → VPNとデバイス管理** から開発者アプリを信頼してください。

6. アプリ起動後、以下を確認します。

   - 位置情報の許可ダイアログが表示される
   - 現在地周辺のトイレ一覧が表示される
   - 地図タブで地図とトイレピンが表示される
   - Google Maps 経路案内リンクが開く
   - お気に入り・レビュー投稿が動作する

### 注意事項

- Webアプリのソースを変更した場合は、必ず `npm run build && npx cap sync` を再実行してからネイティブで確認してください。
- iOS のビルドは Mac 環境が必要です。Windows では Android のみ確認できます。
- ストアへ提出する前に、App Store Connect / Google Play Console で **署名・証明書の設定** が別途必要です。
- ストア審査には **アプリアイコン（1024×1024px）** とスクリーンショットが必要です。現在のアイコンはプレースホルダーのため、提出前に差し替えてください。

## ホーム画面に追加する手順

PWA対応として `manifest.json` と192px/512pxアイコンを用意しています。Vercel公開後のHTTPS URLで確認してください。

### iPhone Safari

1. SafariでProduction URLを開きます。
2. 画面下の共有ボタンを押します。
3. **ホーム画面に追加** を選びます。
4. 名前が `ToiNavi` になっていることを確認して **追加** を押します。
5. ホーム画面のアイコンから起動し、下部ナビと現在地取得が見やすいか確認します。

### Android Chrome

1. ChromeでProduction URLを開きます。
2. 右上のメニューを開きます。
3. **ホーム画面に追加** または **アプリをインストール** を選びます。
4. `ToiNavi` を追加します。
5. ホーム画面のアイコンから起動し、地図・検索・経路案内を確認します。

## Vercel公開後に起きやすい問題

- LeafletはSSRで壊れやすいため、地図ページでは `dynamic import` と `ssr: false` を使っています。
- `window`, `localStorage`, `sessionStorage`, `navigator.geolocation` はクライアント側だけで使う構成です。
- 現在地取得はHTTPSまたはlocalhostで動作します。VercelのProduction URLはHTTPSなので実機確認できます。
- Overpass APIが混雑・失敗した場合はサンプルデータへフォールバックします。
- オフライン時は画面上部に「ネットワークに接続できません」と表示します。完全なオフラインキャッシュは今後の拡張対象です。
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

レビュー保存、「使えました / 使えなかった」の利用確認、トイレ情報の通報はSupabaseに対応しています。`NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` が未設定の場合はSupabaseへ接続せず、今まで通りlocalStorageだけで動きます。

Supabaseを使う場合は、Supabaseで `reviews`, `confirmations`, `reports` テーブルを作成します。

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

`reports` は「場所が違う」「閉鎖されている」「情報が古い」などのデータ品質改善用の通報テーブルです。

| column | type | note |
| --- | --- | --- |
| `id` | `uuid` | primary key, default `gen_random_uuid()` |
| `toilet_id` | `text` | OSM id or generated app toilet id |
| `reason` | `text` | report reason |
| `comment` | `text` | nullable |
| `created_at` | `timestamptz` | default `now()` |

### Supabase設定手順

1. Supabaseで新しいProjectを作成します。
2. SQL Editorを開き、下のSQLを実行して `reviews`, `confirmations`, `reports` テーブルとRLSポリシーを作成します。
3. Project Settings > API から `Project URL` と `anon public key` をコピーします。
4. VercelのProject Settings > Environment Variablesに以下を設定します。
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Vercelで再デプロイします。
6. 投稿したレビューが別端末でも表示されるか確認します。

### reviews / confirmations / reports テーブル作成SQL

匿名ユーザーはレビュー、利用確認、通報の読み取り・作成のみ可能にしています。更新・削除は許可していません。連打防止はアプリ側のlocalStorageで簡易的に行っていますが、本格運用ではIPや認証、Edge Functionなどで追加制御してください。

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

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  toilet_id text not null,
  reason text not null,
  comment text,
  created_at timestamptz not null default now(),
  constraint reports_reason_check check (
    reason in (
      'wrong_location',
      'closed',
      'unavailable',
      'wrong_facilities',
      'inappropriate_review',
      'other'
    )
  )
);

alter table public.reports enable row level security;

create policy "Anyone can read reports"
on public.reports
for select
to anon
using (true);

create policy "Anyone can create reports"
on public.reports
for insert
to anon
with check (
  toilet_id <> ''
  and reason in (
    'wrong_location',
    'closed',
    'unavailable',
    'wrong_facilities',
    'inappropriate_review',
    'other'
  )
  and char_length(coalesce(comment, '')) <= 1000
);
```

ローカルで試す場合は `.env.example` を `.env.local` にコピーして設定します。

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## 主な機能

- Geolocation APIで現在地を取得
- 駅名・地名検索をNominatimで緯度経度に変換
- Haversine formulaで距離を計算
- 徒歩時間を `80m = 約1分` で概算
- 一番近いトイレを上部に大きく表示
- 近い順のトイレ一覧
- OpenStreetMap / Leaflet の地図表示
- 現在地マーカーとトイレピン
- 地図を移動したエリアで再検索
- 検索履歴を直近5件までlocalStorageに保存
- PWA manifest、ホーム画面追加用アイコン、オフライン通知
- Google Mapsの徒歩経路を起動
- よく使うトイレのお気に入り保存
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
  favorites/page.tsx
  reviews/page.tsx
  toilet/page.tsx        # ?id=xxx クエリパラメータでトイレ詳細を表示
  privacy/page.tsx
  support/page.tsx
  terms/page.tsx
components/
  BottomNav.tsx
  EmptyState.tsx
  FavoriteButton.tsx
  FilterBar.tsx
  LocationSearch.tsx
  LoadingState.tsx
  NetworkStatus.tsx
  NearestToiletCard.tsx
  ReviewForm.tsx
  ReviewList.tsx
  ToiletCard.tsx
  ToiletMap.tsx
  ToiletReportForm.tsx
lib/
  distance.ts
  confirmations.ts
  favorites.ts
  geocoding.ts
  geolocation.ts         # Capacitor / ブラウザ Geolocation の抽象化
  location.ts
  reports.ts
  reviews.ts
  supabase.ts
  toilets.ts
  types.ts
  utils.ts
ios/                     # Capacitor iOS プロジェクト
android/                 # Capacitor Android プロジェクト
```

## 保守メモ

- **OGP画像は `public/og-image.png` を差し替えることで変更できます。** 推奨サイズは 1200×630px です。`app/opengraph-image.tsx` が Next.js の ImageResponse でフォールバック画像を自動生成します。
- **Nominatim APIへの連続リクエストを避けること。** [Nominatim使用規約](https://operations.osmfoundation.org/policies/nominatim/)では1秒に1リクエスト以内が求められます。`LocationSearch.tsx` では検索完了後1秒以内の再送信をブロックしています。
- **localStorageのキーは `lib/storage-keys.ts` の `STORAGE_KEYS` で一元管理しています。** 新しいキーを追加する場合はここに定義してください。既存キーの文字列を変えるとユーザーの保存データが消えます。
- **Supabaseの `secret key`（`service_role`）は絶対に公開しないでください。** アプリで使用するのは `anon public key` のみです。`.env.local` や Vercel の環境変数に設定し、コードやGitHubには含めないでください。
- **Vercelの環境変数を変更した場合は、Vercel上でRedeployが必要です。** Vercelのダッシュボード → Project Settings → Environment Variables で変更後、Deployments → Redeploy で反映されます。

## 今後の拡張案

- Supabaseにレビュー保存を移行
- Overpass APIの結果をサーバー側API Routeでキャッシュ
- Google Placesや自治体オープンデータとの統合
- 写真投稿、混雑状況のリアルタイム共有
- PWAアイコン、オフラインキャッシュ、ホーム画面追加対応
- 多言語対応とアクセシビリティ検証の強化
