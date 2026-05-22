# GitHub Push Steps

このプロジェクトをGitHubにpushする手順です。

## 1. GitHubでリポジトリを作る

1. ブラウザで GitHub を開きます。
2. 右上の `+` から **New repository** を選びます。
3. Repository name に `toilet-finder` などを入力します。
4. Public / Private を選びます。
5. **Add a README file** はオフのままにします。
6. **Create repository** を押します。

## 2. このPCからpushする

GitHubが表示するURLを使って、以下の `<YOUR_REPOSITORY_URL>` を置き換えてください。

```bash
git remote add origin <YOUR_REPOSITORY_URL>
git branch -M main
git push -u origin main
```

例:

```bash
git remote add origin https://github.com/your-name/toilet-finder.git
git branch -M main
git push -u origin main
```

## 3. VercelへImportする

1. Vercelを開きます。
2. **Add New Project** を押します。
3. GitHubの `toilet-finder` リポジトリをImportします。
4. Framework Preset が `Next.js` になっていることを確認します。
5. Environment Variables はこのMVPでは不要です。
6. **Deploy** を押します。
