# React + Vite

このテンプレートは、Vite で React を動かすための最小構成です。HMR（ホットリロード）といくつかの ESLint ルールが含まれています。

現在、公式プラグインは2つあります。

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) — [Oxc](https://oxc.rs) を使用
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) — [SWC](https://swc.rs/) を使用

## React Compiler

React Compiler は、開発時・ビルド時のパフォーマンスへの影響を考慮して、このテンプレートでは有効化されていません。追加したい場合は[こちらのドキュメント](https://react.dev/learn/react-compiler/installation)を参照してください。

## ESLint 設定の拡張

本番向けのアプリケーションを開発する場合は、TypeScript を導入し、型情報を使った lint ルールを有効にすることをおすすめします。TypeScript と [`typescript-eslint`](https://typescript-eslint.io) をプロジェクトに組み込む方法は、[TS テンプレート](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts)を参照してください。
