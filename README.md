# Reversi (Othello) in Node.js

シンプルなリバーシ（オセロ）のゲームロジックと、簡易的なCLIインターフェースを備えたNode.jsアプリケーションです。JestによるテストとGitHub ActionsによるCI設定を含みます。

## 必要要件
- Node.js 24 以上

## セットアップ
1. 依存関係をインストールします。
   ```bash
   npm install
   ```
2. テストを実行します。
   ```bash
   npm test
   ```
3. CLIゲームを起動します。
   ```bash
   npm start
   ```
   `row,col` 形式で座標を入力してプレイできます。`exit` で終了します。

4. Webブラウザでプレイする場合はサーバーを起動します。
   ```bash
   npm run start:web
   ```
   `http://localhost:3000` を開くと、ブラウザから盤面をクリックしてプレイできます。

## プロジェクト構成
- `src/reversi.js`: ボード生成、合法手判定、石の反転などのコアロジック。
- `src/index.js`: 簡易CLI実装。
- `__tests__/reversi.test.js`: Jestによるユニットテスト。
- `.github/workflows/ci.yml`: GitHub ActionsによるテストCI。
