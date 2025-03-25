function loadAddiffTool(content) {
    content.innerHTML = `
    <h2 class="text-2xl font-bold mb-4">テキスト比較ツール ver.koba</h2>
      <div class="flex flex-col items-center space-y-4 p-4">
        <div class="flex w-full space-x-4">
          <textarea id="original-text" class="w-1/2 h-40 p-4 border border-gray-300 rounded" placeholder="元のテキストを入力"></textarea>
          <textarea id="modified-text" class="w-1/2 h-40 p-4 border border-gray-300 rounded" placeholder="比較対象のテキストを入力"></textarea>
        </div>
        <div class="flex space-x-4">
          <button id="compare-button" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">比較を実行</button>
          <button id="reset-button" class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">リセット</button>
        </div>
        <div class="w-full mt-4">
          <h3 class="text-lg font-bold mb-2">比較結果</h3>
          <div class="flex space-x-4">
            <div class="w-1/2 p-4 border border-gray-300 rounded bg-gray-50">
              <h4 class="text-md font-semibold mb-2">元のテキスト</h4>
              <div id="diff-original" class="whitespace-pre-wrap"></div>
            </div>
            <div class="w-1/2 p-4 border border-gray-300 rounded bg-gray-50">
              <h4 class="text-md font-semibold mb-2">変更後のテキスト</h4>
              <div id="diff-modified" class="whitespace-pre-wrap"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    setupDiffTool();
}

function setupDiffTool() {
    const compareButton = document.getElementById("compare-button");
    const resetButton = document.getElementById("reset-button");
    const originalText = document.getElementById("original-text");
    const modifiedText = document.getElementById("modified-text");
    const diffOriginal = document.getElementById("diff-original");
    const diffModified = document.getElementById("diff-modified");

    compareButton.addEventListener("click", () => {
        const original = originalText.value;
        const modified = modifiedText.value;

        if (!original && !modified) {
            diffOriginal.innerHTML = "<p class='text-red-500'>入力がありません。</p>";
            diffModified.innerHTML = "<p class='text-red-500'>入力がありません。</p>";
            return;
        }

        const diff = Diff.diffChars(original, modified); // 文字単位の比較（空白含む）
        displaySideBySideDiff(diff, diffOriginal, diffModified);
    });

    resetButton.addEventListener("click", () => {
        originalText.value = "";
        modifiedText.value = "";
        diffOriginal.innerHTML = "";
        diffModified.innerHTML = "";
    });
}

function displaySideBySideDiff(diff, originalContainer, modifiedContainer) {
    originalContainer.innerHTML = ""; // 初期化
    modifiedContainer.innerHTML = ""; // 初期化

    diff.forEach(part => {
        const originalSpan = document.createElement("span");
        const modifiedSpan = document.createElement("span");

        if (part.added) {
            modifiedSpan.textContent = part.value;
            modifiedSpan.className = "bg-green-200 text-green-800 font-bold"; // 追加部分
        } else if (part.removed) {
            originalSpan.textContent = part.value;
            originalSpan.className = "bg-red-200 text-red-800 font-bold "; // 削除部分
        } else {
            originalSpan.textContent = part.value;
            modifiedSpan.textContent = part.value;
            originalSpan.className = "text-gray-800"; // 変更なし
            modifiedSpan.className = "text-gray-800"; // 変更なし
        }

        originalContainer.appendChild(originalSpan);
        modifiedContainer.appendChild(modifiedSpan);
    });
}

// ページが読み込まれたら自動で初期化
document.addEventListener("DOMContentLoaded", () => {
  const content = document.getElementById("content");
  if (content) {
    loadAddiffTool(content);
  }
});

