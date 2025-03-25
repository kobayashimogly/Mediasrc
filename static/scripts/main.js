let currentAction = "";

document.querySelectorAll(".menu-item").forEach((button) => {
  button.addEventListener("click", (e) => {
    currentAction = e.target.dataset.action;
    document.getElementById("current-action").textContent = `現在の操作: ${e.target.textContent}`;

    loadContent(currentAction);
  });
});

function loadContent(action) {
  const content = document.getElementById("content");

  if (action === "highlight") {
    loadHighlighterTool(content);
  } else if (action === "article-master") {
    loadArticleMaster(content);
  } else if (action === "js-ad") {
    loadJsAdTool(content); 
  } else if (action === "ad_creator") {
    loadAdCreatorTool(content); 
  } else if (action === "diff-tool") {
    loadAddiffTool(content); 
  } else {
    loadFormatterTool(content, action);
  }
}


function loadFormatterTool(content, action) {
  content.innerHTML = `
    <textarea id="input" class="w-full h-60 p-4 border rounded mb-4" placeholder="ここにコードを貼り付けてください"></textarea>
    <button id="execute" class="px-4 py-2 bg-blue-500 text-white rounded mb-4">実行</button>
    <textarea id="output" class="w-full h-60 p-4 border rounded bg-gray-100 mb-4" readonly></textarea>
    <button id="copy" class="px-4 py-2 bg-yellow-500 text-white rounded">コピー</button>
  `;

  document.getElementById("execute").addEventListener("click", () => {
    const input = document.getElementById("input").value;
    let output = "";

    switch (action) {
      case "js-minify":
        output = input.replace(/\s+/g, " ").trim();
        break;
      case "js-format":
        output = js_beautify(input, { indent_size: 2 });
        break;
      case "css-minify":
        output = input.replace(/\s+/g, "").trim();
        break;
      case "css-format":
        output = css_beautify(input, { indent_size: 2 });
        break;
      case "html-minify":
        output = input.replace(/\s+/g, " ").trim();
        break;
      case "html-format":
        output = html_beautify(input, { indent_size: 2 });
        break;
      default:
        alert("エラー: 不明な操作");
    }

    document.getElementById("output").value = output;
  });

  document.getElementById("copy").addEventListener("click", () => {
    const output = document.getElementById("output").value;
    navigator.clipboard.writeText(output).then(() => {
      alert("コードがコピーされました！");
    });
  });
}
