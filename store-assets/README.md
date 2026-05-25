# store-assets

Google Play Console にアップロードする素材を管理するフォルダです。

## ファイル一覧

| ファイル | 用途 | サイズ |
|----------|------|--------|
| `feature-graphic.png` | Google Play フィーチャーグラフィック | 1024×500 |
| `screenshots/` | Google Play スクリーンショット保存用 | 各端末サイズ |

## アップロード先

Google Play Console → アプリのページ → メインのストアの掲載情報 → グラフィックアセット

---

## スクリーンショット撮影手順（Android Emulator）

### 事前準備

1. Android Emulator（Pixel 8 など）を起動する
2. エミュレーター上で ToiNavi を開く

### 撮影コマンド

撮りたい画面を表示した状態で、以下のコマンドをプロジェクトルートで実行する：

```powershell
npm run shot:home       # ホーム画面       -> store-assets/screenshots/home.png
npm run shot:map        # マップ画面       -> store-assets/screenshots/map.png
npm run shot:detail     # トイレ詳細画面   -> store-assets/screenshots/detail.png
npm run shot:favorites  # お気に入り画面   -> store-assets/screenshots/favorites.png
npm run shot:reviews    # レビュー画面     -> store-assets/screenshots/reviews.png
```

任意のファイル名で撮りたい場合は直接スクリプトを呼び出す：

```powershell
powershell -ExecutionPolicy Bypass -File scripts/capture-screenshot.ps1 my-screen
# -> store-assets/screenshots/my-screen.png
```

### 画像サイズの確認

撮影後、スクリプトが自動的に解像度を表示します：

```
Saved: C:\...\store-assets\screenshots\home.png
Size: 1080 x 2400 px
```

手動で確認したい場合：

```powershell
Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile("store-assets\screenshots\home.png")
Write-Host "$($img.Width) x $($img.Height)"
$img.Dispose()
```

### Google Play のスクリーンショット要件

| 項目 | 要件 |
|------|------|
| 形式 | PNG または JPEG |
| 最小サイズ | 320px（短辺） |
| 最大サイズ | 3840px（長辺） |
| 最大ファイルサイズ | 8MB |
| 枚数 | 2〜8枚（画面タイプごと） |

Pixel 8 エミュレーターは 1080×2400 を出力するため要件を満たします。

### トラブルシューティング

**「No Android devices/emulators found」と表示される**
→ エミュレーターが起動しているか確認。`%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe devices` で接続確認。

**「adb not found」と表示される**
→ Android Studio から SDK Platform-Tools をインストールする（SDK Manager → SDK Tools → Android SDK Platform-Tools）。
