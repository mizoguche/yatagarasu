GitHub の issue $ARGUMENTS の作業をしてください。
次の手順に従ってください。

# 1. Issueの確認

- gh コマンドを使って issue を取得し、作業内容を把握する。

# 2. git worktree 作成

- 最新の origin/main から worktree を作成する
- ブランチ名はすべて半角英数と `/` `-` `_` で issue のタイトルを英訳・要約して命名する
- e.g. `git fetch && git worktree add .git/180_implement_startup_screen -b feature/180_implement_startup_screen`
- **_重要: 以降は worktree ディレクトリ内で作業を行う_**

# 3. Draft Pull Request作成

- empty commit して差分をつくって PR を作成できるようにする
- gh コマンドを使用して PR を作成する
  - タイトル: 日本語で作業内容を端的に表現する
  - 本文: 日本語で変更内容を記述する
    - 最後に `🤖 Generated with [Claude Code](https://claude.ai/code)` を追加
  - --draft フラグを使用してDraft状態で作成
- 認証に問題がある場合は gh auth setup-git で設定することを試す

# 4. 実装

- TDD のフローに従って、要件を1つずつ実装していく
- すべての要件を満たすまで実装する

## 4.1 Test の実装

- issue の要件に従ってテストを実装する
  - issue にテストケースがあればそれに従う

## 4.2 プロダクションコードの実装

- テストが通るように実装する

## 4.3 リファクタリング

- 可読性、拡張性が担保出来るようリファクタリングする
  - **YAGNIになっていないこと**
  - **easy ではなく simple になっていること**

# 5. 品質チェック

`npm run check` が成功することを確認する

# 6. Pull Request を Ready for review にする

- すべての要件を満たした状態で `git push` したら、 PR を ready for review に変更する

# 7. ユーザーの PR Review

- PR を見たユーザーから修正の指示があればそれに従う

# 8. ユーザーが PR をマージする

- ユーザーが PR をマージする

# チェックリスト

- [ ] Issue の内容を確認した
- [ ] worktree を作成し、worktree ディレクトリ内で作業している
- [ ] Draft PR を作成した
- [ ] 各要件に対してTDDサイクルを実施した
  - [ ] 要件1: Red（失敗するテストを書いた）
  - [ ] 要件1: Green（テストが通る最小限の実装をした）
  - [ ] 要件1: Refactor（リファクタリングした）
  - [ ] 要件2: Red（失敗するテストを書いた）
  - [ ] 要件2: Green（テストが通る最小限の実装をした）
  - [ ] 要件2: Refactor（リファクタリングした）
  - [ ] （以降、要件の数だけ繰り返す）
- [ ] 全体のリファクタリングをした
- [ ] 品質チェック (npm run check) が成功した
- [ ] PR を Ready for review にした
