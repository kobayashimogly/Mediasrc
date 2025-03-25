function loadHighlighterTool(content) {
    content.innerHTML = `
      <textarea id="input" class="w-full h-40 p-4 border rounded mb-4" placeholder="ここに文章のソースを貼ってください！"></textarea>
      <div class="border rounded p-4 bg-white">
        <h2 class="text-xl font-bold mb-2">エディター</h2>
        <div id="editor" class="h-60 p-2 border rounded overflow-auto"></div>
      </div>
      <div class="space-y-4 mt-4">
        <div class="flex gap-4">
          <button id="mode-highlight" class="mode-button px-4 py-2 text-white rounded">下線モード</button>
          <button id="mode-erase" class="mode-button px-4 py-2 text-white rounded">削除モード</button>
          <button id="mode-blue" class="mode-button px-4 py-2 text-white rounded">青文字モード</button>
          <button id="mode-red" class="mode-button px-4 py-2 text-white rounded">赤文字モード</button>
        </div>
        <button id="execute" class="px-4 py-2 bg-green-500 text-white rounded">実行</button>
        <textarea id="output" class="w-full h-40 p-4 border rounded bg-gray-100" readonly></textarea>
        <button id="copy" class="mt-2 px-4 py-2 bg-yellow-500 text-white rounded">コピー</button>
      </div>
      <style>
        .mode-button {
          background-color: gray;
          transition: background-color 0.3s, transform 0.1s;
        }
        .mode-button:hover {
          background-color: lightgray;
        }
        .mode-button.active {
          background-color: blue;
          transform: scale(1.1);
        }
      </style>
    `;

    const inputArea = document.getElementById("input");
    const editorArea = document.getElementById("editor");
    const outputArea = document.getElementById("output");
    let currentMode = "highlight"; 

    const modeButtons = {
        highlight: document.getElementById("mode-highlight"),
        erase: document.getElementById("mode-erase"),
        blue: document.getElementById("mode-blue"),
        red: document.getElementById("mode-red")
    };

    Object.entries(modeButtons).forEach(([mode, button]) => {
        button.addEventListener("click", () => {
            currentMode = mode;
            updateModeButtons(button);
        });
    });

    inputArea.addEventListener("input", () => {
        editorArea.innerHTML = inputArea.value;
    });

    editorArea.addEventListener("mouseup", () => {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        const range = selection.getRangeAt(0);
        if (currentMode === "highlight") {
            highlightSelection(range);
        } else if (currentMode === "erase") {
            removeHighlight(range);
        } else if (currentMode === "blue") {
            colorSelection(range, "blue");
        } else if (currentMode === "red") {
            colorSelection(range, "red");
        }
    });

    document.getElementById("execute").addEventListener("click", () => {
        outputArea.value = editorArea.innerHTML;
    });

    document.getElementById("copy").addEventListener("click", () => {
        navigator.clipboard.writeText(outputArea.value).then(() => {
            alert("コードがコピーされました！");
        });
    });
}

function updateModeButtons(activeButton) {
    document.querySelectorAll(".mode-button").forEach(button => button.classList.remove("active"));
    activeButton.classList.add("active");
}

function highlightSelection(range) {
    applyStyle(range, "yellow");
}

function colorSelection(range, color) {
    applyStyle(range, color);
}

function applyStyle(range, className) {
    const selection = range.toString().trim();
    if (selection.length === 0) {
        return;
    }
    const span = document.createElement("span");
    span.className = className;
    range.surroundContents(span);
    window.getSelection().removeAllRanges();
}

function removeHighlight(range) {
    const commonAncestor = range.commonAncestorContainer;
    const coloredElements = Array.from(commonAncestor.querySelectorAll("span.yellow, span.blue, span.red, strong"));
    coloredElements.forEach(element => {
        if (range.intersectsNode(element)) {
            const parent = element.parentNode;
            while (element.firstChild) {
                parent.insertBefore(element.firstChild, element);
            }
            parent.removeChild(element);
        }
    });
    window.getSelection().removeAllRanges();
}
