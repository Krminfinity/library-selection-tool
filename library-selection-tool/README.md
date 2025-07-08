# 図書選定リスト作成システム

キーワードで直近1年の新刊書籍を自動検索・抽出し、学術情報センター図書選定リスト（Excel形式）を自動生成するWebアプリケーションです。

## 主な機能

- **キーワード検索**: Google Books APIを使用して直近1年の新刊書籍を検索
- **自動フィルタリング**: 発売日で1年以内の書籍のみ抽出
- **書籍選択**: チェックボックスで複数の書籍を選択可能
- **リスト管理**: 選択した書籍をリストに追加、編集、削除
- **Excel出力**: 元のExcelフォーマットに完全準拠したファイル生成
- **学生情報管理**: 学籍番号と氏名の入力
- **推薦理由記入**: 任意で図書推薦理由を記入可能

## 技術スタック

- **フロントエンド**: React 19 + TypeScript
- **ビルドツール**: Vite 6
- **スタイリング**: Tailwind CSS V4 + ShadCN UI
- **パッケージマネージャー**: Bun
- **外部API**: Google Books API
- **Excel生成**: SheetJS (xlsx)

## セットアップ手順

### 1. 依存関係のインストール

```bash
# bunを使用（推奨）
bun install

# または npm
npm install

# または yarn
yarn install
```

### 2. 開発サーバーの起動

```bash
# bunを使用（推奨）
bun run dev

# または npm
npm run dev

# または yarn
yarn dev
```

### 3. ビルド

```bash
# bunを使用（推奨）
bun run build

# または npm
npm run build

# または yarn
yarn build
```

### 4. プレビュー

```bash
# bunを使用（推奨）
bun run preview

# または npm
npm run preview

# または yarn
yarn preview
```

## デプロイ

### Vercel

1. GitHubリポジトリを作成してコードをプッシュ
2. [Vercel](https://vercel.com)にアクセスしてGitHubアカウントでログイン
3. "Import Project"からリポジトリを選択
4. Build Command: `bun run build` (または `npm run build`)
5. Output Directory: `dist`
6. Deploy

### Netlify

1. GitHubリポジトリを作成してコードをプッシュ
2. [Netlify](https://netlify.com)にアクセスしてGitHubアカウントでログイン
3. "Import from Git"からリポジトリを選択
4. Build command: `bun run build` (または `npm run build`)
5. Publish directory: `dist`
6. Deploy

### GitHub Pages

1. GitHub Actionsを使用したデプロイ設定を`.github/workflows/deploy.yml`に作成
2. Settings > Pages > Source を "GitHub Actions" に設定
3. コードをプッシュすると自動デプロイ

## 使用方法

1. **学生情報入力**: 学籍番号と氏名を入力
2. **キーワード検索**: 検索したいキーワード（例：AI、機械学習、プログラミング）を入力して検索
3. **書籍選択**: 検索結果から必要な書籍をチェックボックスで選択
4. **リストに追加**: 「選択した書籍をリストに追加」ボタンをクリック
5. **編集**: 追加された書籍の情報を必要に応じて編集（価格、ISBNなど）
6. **推薦理由記入**: 任意で図書を推薦する理由を記入
7. **Excel出力**: 「Excelファイルをダウンロード」ボタンでファイル生成

## 注意事項

- Google Books APIは無料ですが、1日のリクエスト制限があります
- 検索は日本語書籍に限定されています
- 発売日が1年以内の書籍のみが表示されます
- 生成されるExcelファイルは元のフォーマットに完全準拠しています

## ライセンス

MIT License