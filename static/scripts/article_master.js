function loadArticleMaster(content) {
    content.innerHTML = `
      <div class="grid grid-cols-2 gap-6">
        <!-- 左 -->
        <div>
          <h2 class="text-lg font-bold mb-2">エディター</h2>
          <div id="editor" class="border rounded p-4" style="height: 400px;"></div> <!-- 高さを固定 -->
          <button id="splitButton" class="px-4 py-2 bg-blue-500 text-white rounded mt-4">分割する</button>
          <div id="output01" class="mt-4"></div>
        </div>
  
        <!-- 右 -->
        <div>
          <h2 class="text-lg font-bold mb-2">フォーマットエディタ</h2>
          <div class="flex gap-2 mb-4">
            <button id="formatButton" class="px-4 py-2 bg-green-500 text-white rounded">作成する</button>
            <button id="copyButton" class="px-4 py-2 bg-gray-600 text-white rounded">コピーする</button>
          </div>
          <div id="output02" class="border rounded h-96 p-4 overflow-auto"></div>
        </div>
      </div>
  
      <!-- 結果 -->
      <button id="generateButton" class="px-4 py-2 bg-yellow-500 text-white rounded mt-4">結果生成</button>
      <div id="charCount" class="mt-4"></div>
      <div id="resultWrapper" class="mt-4">
        <div id="result" class="border rounded p-4"></div>
      </div>
    `;
  
    const quill = new Quill("#editor", {
      theme: "snow",
      placeholder: "ここに文章を入力または貼り付けてください...",
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline"], 
          [{ list: "ordered" }, { list: "bullet" }], 
          ["link", "image"],
        ],
        clipboard: {
          matchVisual: false, 
        },
      },
    });
  
    document.getElementById("splitButton").addEventListener("click", () => {
      const text = quill.getText().trim();
      if (!text) {
        alert("エディターに内容がありません。");
        return;
      }
  
      const maxLength = 4000;
      const outputElement = document.getElementById("output01");
      outputElement.innerHTML = "";
  
      let remainingText = text;
  
      while (remainingText.length > 0) {
        const chunk = remainingText.substring(0, maxLength);
        remainingText = remainingText.substring(maxLength);
        const textarea = document.createElement("textarea");
        textarea.value = chunk;
        textarea.rows = 6;
        textarea.className = "w-full border rounded p-2 mb-4";
        textarea.onclick = () => textarea.select();
        outputElement.appendChild(textarea);
      }
    });
  
    document.getElementById("formatButton").addEventListener("click", () => {
      const html = quill.root.innerHTML;
      if (!html.trim()) {
        alert("エディターに内容がありません。");
        return;
      }
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;
    
      const formatted = [];
      for (const child of tempDiv.childNodes) {
        if (child.nodeType === Node.TEXT_NODE) {
          const text = child.textContent.trim();
          if (text) {
            const sentences = text.split(/(?<=[。！？\!\.])\s*/);
            sentences.forEach(s => {
              if (s.trim()) formatted.push(`<p>${s.trim()}</p>`);
            });
          }
          continue;
        }
        if (/^H[1-6]$/.test(child.tagName)) {
          formatted.push(child.outerHTML);
          continue;
        }
    
        if (
          child.tagName === "P" &&
          (!child.textContent.trim() || child.innerHTML.match(/^(&nbsp;|<br\s*\/?>)*$/))
        ) {
          continue;
        }
        formatted.push(child.outerHTML);
      }
    
      document.getElementById("output02").innerHTML = formatted.join("\n");
    });
    
    document.getElementById("copyButton").addEventListener("click", () => {
      const outputDiv = document.getElementById("output02");
      const rawHtml = outputDiv.innerHTML.trim();
    
      if (!rawHtml) {
        alert("コピーする内容がありません。");
        return;
      }
    
      // スタイルを排除したいなら DOM で再パースしてから取得
      const temp = document.createElement("div");
      temp.innerHTML = rawHtml;
    
      const cleaned = [];
      for (const child of temp.childNodes) {
        if (child.nodeType === Node.ELEMENT_NODE) {
          if (/^H[1-6]$/.test(child.tagName)) {
            cleaned.push(`<${child.tagName}>${child.textContent.trim()}</${child.tagName}>`);
          } else if (child.tagName === "P") {
            const text = child.textContent.trim();
            if (text) cleaned.push(`<p>${text}</p>`);
          }
        }
      }
    
      const cleanHtml = cleaned.join("\n");
    
      // コピー処理
      const textarea = document.createElement("textarea");
      textarea.value = cleanHtml;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    
      // 通知
      const btn = document.getElementById("copyButton");
      const originalText = btn.textContent;
      btn.textContent = "コピーしました！";
      btn.disabled = true;
    
      setTimeout(() => {
        btn.textContent = originalText;
        btn.disabled = false;
      }, 1500);
    });    
    
  }
  