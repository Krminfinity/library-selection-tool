# デプロイガイド

このプロジェクトは複数のプラットフォームに簡単にデプロイできます。以下に主要なデプロイオプションを示します。

## 🚀 推奨デプロイオプション

### 1. Vercel（最推奨）

**手順:**
1. [Vercel](https://vercel.com)にサインアップ/ログイン
2. GitHubリポジトリをインポート
3. 設定:
   - Build Command: `bun run build`
   - Output Directory: `dist`
   - Install Command: `bun install`
4. デプロイ

**特徴:**
- 自動HTTPS
- CDN配信
- 無料プラン
- GitHub連携で自動デプロイ

### 2. Netlify

**手順:**
1. [Netlify](https://netlify.com)にサインアップ/ログイン
2. "Sites" > "Import from Git"
3. 設定:
   - Build command: `bun run build`
   - Publish directory: `dist`
4. デプロイ

**特徴:**
- 無料プラン
- フォーム処理
- エッジ関数サポート

### 3. GitHub Pages

**手順:**
1. GitHubリポジトリのSettings > Pages
2. Source: "GitHub Actions"
3. 提供済みの`.github/workflows/deploy.yml`が自動実行

**特徴:**
- 完全無料
- GitHub統合
- 自動デプロイ

## 📦 プロジェクト構成

```
library-selection-tool/
├── .github/workflows/     # GitHub Actions設定
│   └── deploy.yml
├── src/                   # ソースコード
│   ├── App.tsx           # メインアプリケーション
│   ├── types.ts          # TypeScript型定義
│   ├── index.css         # スタイル
│   └── components/       # UIコンポーネント
├── public/               # 静的ファイル
├── package.json          # 依存関係
├── vite.config.ts        # Vite設定
├── tsconfig.json         # TypeScript設定
└── README.md             # ドキュメント
```

## 🔧 ローカル開発

```bash
# 依存関係インストール
bun install

# 開発サーバー起動
bun run dev

# ビルド
bun run build

# プレビュー
bun run preview
```

## 🌐 環境変数

現在のバージョンでは環境変数は不要です。Google Books APIは公開APIを使用しています。

## 📋 デプロイ前チェックリスト

- [ ] package.jsonの依存関係が最新
- [ ] TypeScriptエラーなし
- [ ] ビルドが成功
- [ ] プレビューで動作確認
- [ ] README.mdの更新

## 🆘 トラブルシューティング

### ビルドエラーの場合
```bash
# node_modulesを削除して再インストール
rm -rf node_modules
bun install
bun run build
```

### bunが使えない場合
```bash
# npmまたはyarnを使用
npm install
npm run build
```

## 📞 サポート

問題が発生した場合は、以下を確認してください：

1. Node.js 18以上がインストールされているか
2. 依存関係が正しくインストールされているか
3. TypeScriptエラーがないか
4. ビルドコマンドが正しく実行されるか