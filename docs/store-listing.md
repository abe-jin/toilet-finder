# Google Play ストア掲載情報

Google Play Console に入力するための情報をまとめたドキュメントです。

---

## アプリ名

```
ToiNavi
```

---

## 短い説明（80文字以内）

```
現在地から近くのトイレを探せる、シンプルなトイレマップアプリ。
```

---

## 詳しい説明（4000文字以内）

```
ToiNaviは、現在地から近くのトイレを探せるトイレマップアプリです。

外出中に「近くのトイレがどこにあるか分からない」と感じたとき、現在地周辺のトイレを地図上で確認できます。

主な機能：
・現在地周辺のトイレ検索
・距離と徒歩時間の表示
・地図上でのトイレ表示
・Google Mapsによる経路案内
・お気に入り保存
・レビュー投稿
・使えました / 使えませんでした の報告
・情報の通報
・駅名・地名での検索

掲載情報はOpenStreetMap等の公開情報をもとにしています。
実際の利用可否や営業時間は現地状況と異なる場合があります。
施設や店舗のルールに従ってご利用ください。

位置情報は、現在地周辺のトイレ検索のみに使用します。
バックグラウンドで位置情報を取得しません。
```

---

## URL

| 項目 | URL |
|------|-----|
| Privacy Policy URL | `https://toilet-finder-lovat.vercel.app/privacy` |
| Support URL | `https://toilet-finder-lovat.vercel.app/support` |

---

## アプリカテゴリ・対象年齢

| 項目 | 内容 |
|------|------|
| カテゴリ | 旅行・地域 |
| 対象年齢 | 全年齢（Everyone） |

---

## Data Safety（データの安全性）

Google Play Console の「データの安全性」セクションへの回答です。

| 質問 | 回答 |
|------|------|
| このアプリはユーザーのデータを収集または共有しますか？ | いいえ（位置情報は端末内でのみ使用し、サーバーへ送信しません） |
| 位置情報の収集 | 使用中のみ（前景）、共有なし |
| 暗号化転送 | はい（HTTPS） |
| データ削除リクエスト | 対応可能（アプリのデータはすべて端末内に保存されており、アプリ削除で消去されます） |

---

## Google Play 提出用素材チェックリスト

### 必須素材

- [ ] **512×512 アプリアイコン**（PNG、透過なし）
  - 元素材：`assets/icon-only.png` をリサイズして使用
- [x] **1024×500 フィーチャーグラフィック**（PNG または JPEG）
  - 保存済み：`store-assets/feature-graphic.png`
- [x] **Androidスマホ スクリーンショット 2枚以上**（最大8枚、16:9 または 9:16）
  - 撮影済み：`store-assets/screenshots/` に5枚保存（1080×2400px、adb screencap）

### スクリーンショット撮影済み一覧

アップロード推奨順：

| 順番 | ファイル | 画面 | サイズ | 容量 |
|------|----------|------|--------|------|
| 1 | `screenshots/home.png` | ホーム画面（現在地周辺のトイレ一覧） | 1080×2400 | 238KB |
| 2 | `screenshots/map.png` | マップ画面（地図とトイレピン） | 1080×2400 | 2176KB |
| 3 | `screenshots/detail.png` | 詳細画面（トイレ詳細・経路案内ボタン） | 1080×2400 | 209KB |
| 4 | `screenshots/favorites.png` | お気に入り画面（保存済みトイレ一覧） | 1080×2400 | 235KB |
| 5 | `screenshots/reviews.png` | レビュー画面（最近のレビュー一覧） | 1080×2400 | 181KB |

### URL・ポリシー

- [x] プライバシーポリシー URL：`https://toilet-finder-lovat.vercel.app/privacy`
- [x] サポート URL：`https://toilet-finder-lovat.vercel.app/support`

### Console 設定

- [ ] Data Safety セクション回答
- [ ] アプリカテゴリ設定（旅行・地域）
- [ ] 対象年齢設定（全年齢）
- [ ] コンテンツレーティング アンケート回答
- [ ] 価格設定（無料）

---

## AAB（Android App Bundle）生成手順

### 前提：keystore と keystore.properties は Git 管理しない

- `android/app/release.keystore` → `.gitignore` 済み、コミット禁止
- `android/keystore.properties` → `.gitignore` 済み、コミット禁止
- サンプルファイル `android/keystore.properties.example` はコミット可

### Step 1: upload key（release.keystore）を作成する（初回のみ）

```powershell
keytool -genkey -v `
  -keystore android/app/release.keystore `
  -alias toinavi `
  -keyalg RSA -keysize 2048 -validity 10000
```

> **重要**: 生成したパスワードと keystore ファイルを安全な場所（クラウドストレージ等）にバックアップしてください。  
> 紛失するとアプリの更新ができなくなります。

### Step 2: keystore.properties を作成する（初回のみ）

```powershell
Copy-Item android/keystore.properties.example android/keystore.properties
```

`android/keystore.properties` を開き、実際のパスワード・エイリアスを入力してください：

```properties
storeFile=app/release.keystore
storePassword=実際のパスワード
keyAlias=toinavi
keyPassword=実際のパスワード
```

### Step 3: AAB を生成する

```powershell
# Windows PowerShell
cd android
.\gradlew.bat bundleRelease
```

```bash
# macOS / Linux / Git Bash
cd android
./gradlew bundleRelease
```

生成先：
```
android/app/build/outputs/bundle/release/app-release.aab
```

### Step 4: Google Play Console にアップロードする

1. Google Play Console → アプリ → リリース → 内部テスト → 新しいリリースを作成
2. `app-release.aab` をアップロード
3. Play App Signing が自動的に有効になる（初回のみ）

### Play App Signing について

| 用語 | 説明 |
|------|------|
| upload key | 自分で作成した keystore（`release.keystore`）で署名する鍵 |
| app signing key | Google Play が管理・配布に使う鍵（自動管理） |

初回 AAB 提出時に Play App Signing に自動登録されます。  
upload key を紛失しても、Play Console の申請で継続可能です。

---

## 次のステップ

1. `keytool` で `release.keystore` を生成する（上記 Step 1）
2. `keystore.properties` を作成する（上記 Step 2）
3. `.\gradlew.bat bundleRelease` で AAB を生成する（上記 Step 3）
4. Google Play Console でアプリを登録する
5. 内部テストトラックに AAB をアップロードする
6. クローズドテスト（12人以上 × 14日間）を実施する
7. 本番公開申請を行う
