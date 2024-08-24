# ThinkingMachine
とり天の個人的なWebサイト。コンテンツを除くこのサイト自体はMITライセンスなので自由に使ってください。含まれるコンテンツ（Markdownや画像）は基本的にフリーですが、引用されている資料については引用元の権利が適用されます。

間違いがあって修正したい場合はプルリクエストください。

# Webページに関して
このプログラムはユーザー側でMarkdownのレンダリングを行うことを前提として開発しました。
これによりMarkdownを追加するだけでWebページのソース構造を再レンダリングする必要がなくなりました。
Markdownで記述したコンテンツを**markdown**フォルダに、コンテンツ内で利用する画像はmarkdown内の**img**に入れることで参照できます。

本ページのMarkdownレンダリングエンジンは私が趣味で作ったオレオレエンジンなので、正しくレンダリングされない場合があります。

# ファイル構成
├── index.html :最初のページ  
├── render.html：Markdownのレンダリングを行うページ  
├── css  
│   ├── style.css :Markdownのレンダリング用のcss  
│   └── toppage.css :index.htmlのcss  
├── dist  
│   ├── header.js　:ファイル名の取得などを行う  
│   ├── main.js　:ファイル名の取得などを行う  
│   ├── md_render.js　:Markdownをレンダリングするスクリプト  
│   └── script.js　:目次を生成するスクリプト  
├── markdown　 :コンテンツのMarkdown  
│   └── imgs　: 画像類  
├── src　:コンパイル対象のスクリプト  
│   ├── main.ts  
│   └── md_render.ts  
└── tsconfig.json  