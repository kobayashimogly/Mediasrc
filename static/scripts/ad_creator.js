function loadAdCreatorTool(content) {
  content.innerHTML = `
    <div class="p-8">
      <h2 class="text-2xl font-bold mb-4">記事内広告作成 - 基本情報</h2>

      <!-- 基本情報フォーム -->
      <form id="basicInfoForm" class="space-y-4">
        <!-- タイトル -->
        <div>
          <label class="block font-bold mb-2">タイトル</label>
          <input type="text" id="title" class="w-full border rounded p-2" placeholder="広告タイトルを入力" required>
        </div>

        <!-- 出し分け -->
        <div>
          <label class="block font-bold mb-2">出し分け</label>
          <div class="flex space-x-4">
            <label><input type="checkbox" id="pc" checked> PC</label>
            <label><input type="checkbox" id="sp" checked> SP</label>
          </div>
        </div>

        <!-- 広告ID -->
        <div id="idSelection">
          <label class="block font-bold mb-2">広告IDの設定</label>
          <div id="idTypeRadios" class="flex items-center space-x-4">
            <label><input type="radio" name="idType" value="same" checked> 同じID</label>
            <label><input type="radio" name="idType" value="different"> 別のID</label>
          </div>
          <!-- 同じID入力 -->
          <div id="sameIdSection" class="mt-4">
            <input type="text" id="adId" class="w-full border rounded p-2" placeholder="広告IDを入力 (例: 0823)" required>
          </div>
          <!-- 別のID入力 -->
          <div id="differentIdSection" class="mt-4 hidden">
            <div class="space-y-2">
              <input type="text" id="pcAdId" class="w-full border rounded p-2" placeholder="PC用広告IDを入力 (例: 0823)" required>
              <input type="text" id="spAdId" class="w-full border rounded p-2" placeholder="SP用広告IDを入力 (例: 0823)" required>
            </div>
          </div>
        </div>

        <!-- 誘導先 -->
        <div>
          <label class="block font-bold mb-2">誘導先</label>
          <select id="destination" class="w-full border rounded p-2" required>
            <option value="lp">LP</option>
            <option value="line">LINE</option>
          </select>
        </div>

        <!-- LPID入力 -->
        <div id="lpIdSection" class="mt-4">
          <label class="block font-bold mb-2">LP ID</label>
          <div id="sameLpIdSection">
            <input type="text" id="lpId" class="w-full border rounded p-2" placeholder="LP IDを入力 (例: 477)" required>
          </div>
          <div id="differentLpIdSection" class="hidden space-y-2">
            <input type="text" id="pcLpId" class="w-full border rounded p-2" placeholder="PC用LP IDを入力 (例: 477)" required>
            <input type="text" id="spLpId" class="w-full border rounded p-2" placeholder="SP用LP IDを入力 (例: 477)" required>
          </div>
        </div>

        <!-- LINE URL入力 -->
        <div id="lineUrlSection" class="mt-4 hidden">
          <label class="block font-bold mb-2">LINE URL</label>
          <div class="space-y-2">
            <input type="text" id="pcLineUrl" class="w-full border rounded p-2" placeholder="PC用LINE URLを入力" required>
            <input type="text" id="spLineUrl" class="w-full border rounded p-2" placeholder="SP用LINE URLを入力" required>
          </div>
        </div>

        <button type="button" id="nextStep" class="px-4 py-2 bg-blue-500 text-white rounded mt-4">次へ進む</button>
      </form>
    </div>
  `;

  setupFormInteractions();
}

let basicInfo = {}; // グローバルで基本情報を保持

function setupFormInteractions() {
  const pcCheckbox = document.getElementById("pc");
  const spCheckbox = document.getElementById("sp");
  const idTypeRadios = document.getElementById("idTypeRadios");
  const sameIdSection = document.getElementById("sameIdSection");
  const differentIdSection = document.getElementById("differentIdSection");
  const lpIdSection = document.getElementById("lpIdSection");
  const sameLpIdSection = document.getElementById("sameLpIdSection");
  const differentLpIdSection = document.getElementById("differentLpIdSection");
  const destinationSelect = document.getElementById("destination");
  const lineUrlSection = document.getElementById("lineUrlSection");
  const nextStepButton = document.getElementById("nextStep");

  function toggleIdSections() {
    if (pcCheckbox.checked && spCheckbox.checked) {
      idTypeRadios.classList.remove("hidden");
      if (document.querySelector('input[name="idType"]:checked').value === "same") {
        sameIdSection.classList.remove("hidden");
        differentIdSection.classList.add("hidden");
        sameLpIdSection.classList.remove("hidden");
        differentLpIdSection.classList.add("hidden");
      } else {
        sameIdSection.classList.add("hidden");
        differentIdSection.classList.remove("hidden");
        sameLpIdSection.classList.add("hidden");
        differentLpIdSection.classList.remove("hidden");
      }
    } else {
      idTypeRadios.classList.add("hidden");
      sameIdSection.classList.remove("hidden");
      differentIdSection.classList.add("hidden");
      sameLpIdSection.classList.remove("hidden");
      differentLpIdSection.classList.add("hidden");
    }
  }

  pcCheckbox.addEventListener("change", toggleIdSections);
  spCheckbox.addEventListener("change", toggleIdSections);

  destinationSelect.addEventListener("change", () => {
    if (destinationSelect.value === "lp") {
      lpIdSection.classList.remove("hidden");
      lineUrlSection.classList.add("hidden");
    } else {
      lpIdSection.classList.add("hidden");
      lineUrlSection.classList.remove("hidden");
    }
  });

  const idTypeRadioButtons = document.querySelectorAll('input[name="idType"]');
  idTypeRadioButtons.forEach((radio) => {
    radio.addEventListener("change", toggleIdSections);
  });

  nextStepButton.addEventListener("click", () => {
    const requiredInputs = Array.from(document.querySelectorAll("#basicInfoForm input[required]")).filter(
      (input) => !input.closest(".hidden")
    );

    let allFilled = true;
    requiredInputs.forEach((input) => {
      if (!input.value.trim()) {
        allFilled = false;
        input.classList.add("border-red-500");
      } else {
        input.classList.remove("border-red-500");
      }
    });

    if (!allFilled) {
      alert("全ての必須項目を入力してください！");
    } else {
      basicInfo = collectBasicInfo();
      console.log("Basic Info Collected:", basicInfo);

      loadAdStructureStep();
    }
  });
}

function loadAdStructureStep() {
  const content = document.querySelector("#content");
  content.innerHTML = `
    <div class="p-8">
      <h2 class="text-2xl font-bold mb-4">広告構成</h2>
      <div class="flex space-x-8">
        <!-- 左側の選択項目 -->
        <div class="w-1/3 bg-gray-100 p-4 rounded shadow">
          <h3 class="text-xl font-bold mb-4">選択項目</h3>
          <div class="mb-4">
            <h4 class="text-lg font-bold mb-2">本文・画像</h4>
            <div class="space-y-2">
              <div class="bg-gray-300 py-2 px-4 rounded w-full draggable" draggable="true" data-type="text">文章</div>
              <div class="bg-gray-300 py-2 px-4 rounded w-full draggable" draggable="true" data-type="image">画像</div>
            </div>
          </div>
          <div class="mb-4">
            <button class="accordion-toggle text-lg font-bold mb-2 w-full text-left">- CSS　＋</button>
            <div class="accordion-content hidden">
              <img src="https://s3.ap-northeast-1.amazonaws.com/rea.media.assets/digmedia/kobatool1280.png" alt="説明画像" class="mb-4 rounded shadow">
              <div class="space-y-2">
                <div class="bg-gray-300 py-2 px-4 rounded w-full draggable" draggable="true" data-type="article-style">記事誘導風</div>
                <div class="bg-gray-300 py-2 px-4 rounded w-full draggable" draggable="true" data-type="例文①">例文①</div>
                <div class="bg-gray-300 py-2 px-4 rounded w-full draggable" draggable="true" data-type="例文②">例文②</div>
                <div class="bg-gray-300 py-2 px-4 rounded w-full draggable" draggable="true" data-type="例文③">例文③</div>
              </div>
            </div>
          </div>
          <div class="mb-4">
            <button class="accordion-toggle text-lg font-bold mb-2 w-full text-left">- ボタン　＋</button>
            <div class="accordion-content hidden">
              <img src="https://s3.ap-northeast-1.amazonaws.com/rea.media.assets/digmedia/kobatool12123.png" alt="説明画像" class="mb-4 rounded shadow">
              <div class="space-y-2">
                <div class="bg-gray-300 py-2 px-4 rounded w-full draggable" draggable="true" data-type="ボタン①">ボタン①</div>
                <div class="bg-gray-300 py-2 px-4 rounded w-full draggable" draggable="true" data-type="ボタン②">ボタン②</div>
                <div class="bg-gray-300 py-2 px-4 rounded w-full draggable" draggable="true" data-type="ボタン③">ボタン③</div>
              </div>
            </div>
          </div>
        </div>
        <!-- 右側の構成 -->
        <div class="w-2/3 bg-gray-100 p-4 rounded shadow">
          <h3 class="text-xl font-bold mb-4">広告構成</h3>
          <div id="adStructure" class="min-h-[200px] bg-white p-4 rounded border-dashed border-2 border-gray-300">
            ドラッグ＆ドロップで項目を追加してください
          </div>
          <button id="generateAd" class="px-4 py-2 bg-yellow-500 text-white rounded mt-4">広告を生成</button>
        </div>
      </div>
    </div>
  `;
  setupDragAndDrop();
  setupAccordion();
  setupAdGeneration();
}

function setupAccordion() {
  const toggles = document.querySelectorAll(".accordion-toggle");
  toggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const content = toggle.nextElementSibling;
      content.classList.toggle("hidden");
    });
  });
}

function setupDragAndDrop() {
  const draggables = document.querySelectorAll(".draggable");
  const adStructure = document.getElementById("adStructure");

  draggables.forEach((draggable) => {
    draggable.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", e.target.dataset.type);
    });
  });

  adStructure.addEventListener("dragover", (e) => {
    e.preventDefault();
  });

  adStructure.addEventListener("drop", (e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData("text/plain");
    addItemToStructure(type);
  });
}

function addItemToStructure(type) {
  const adStructure = document.getElementById("adStructure");
  const newItem = document.createElement("div");
  newItem.classList.add("p-2", "bg-gray-200", "rounded", "mt-2", "flex", "justify-between", "items-center");
  newItem.setAttribute("data-type", type);

  let formContent = "";

  switch (type) {
    case "text":
      formContent = `<textarea class="w-4/5 border rounded p-2 mt-2" placeholder="文章"></textarea>`;
      newItem.innerHTML = `<span>文章</span>${formContent}`;
      break;
    case "image":
      formContent = `
        <input type="text" class="w-2/6 border rounded p-2 mt-2" placeholder="画像URL">
        <input type="text" class="w-2/6 border rounded p-2 mt-2" placeholder="alt属性">
      `;
      newItem.innerHTML = `<span>画像</span>${formContent}`;
      break;
    case "article-style":
      formContent = `
        <input type="text" class="w-2/6 border rounded p-2 mt-2" placeholder="画像URL">
        <input type="text" class="w-2/6 border rounded p-2 mt-2" placeholder="テキスト">
      `;
      newItem.innerHTML = `<span>記事誘導風</span>${formContent}`;
      break;
    case "例文①":
    case "例文②":
    case "例文③":
      formContent = `
        <input type="text" class="w-3/8 border rounded p-2 mt-2" placeholder="タイトル">
        <textarea class="w-5/8 border rounded p-2 mt-2" placeholder="本文"></textarea>
      `;
      newItem.innerHTML = `<span>${type}</span>${formContent}`;
      break;
    case "ボタン①":
    case "ボタン②":
    case "ボタン③":
      formContent = `
        <input type="text" class="w-4/6 border rounded p-2 mt-2" placeholder="ボタンテキスト">
      `;
      newItem.innerHTML = `<span>${type}</span>${formContent}`;
      break;
    default:
      newItem.innerHTML = `<span>未定義項目</span>`;
  }

  const removeButton = document.createElement("button");
  removeButton.textContent = "削除";
  removeButton.classList.add("ml-2", "px-2", "py-1", "bg-red-500", "text-white", "rounded");
  removeButton.addEventListener("click", () => newItem.remove());

  newItem.appendChild(removeButton);
  adStructure.appendChild(newItem);
}
  
function setupAdGeneration() {
  const generateButton = document.getElementById("generateAd");

  if (!generateButton) {
    console.error("広告生成ボタンが見つかりません。");
    return;
  }

  generateButton.addEventListener("click", () => {
    const adStructure = document.getElementById("adStructure");
    if (!adStructure) {
      alert("広告構成が見つかりません。");
      return;
    }

    console.log("Using Basic Info:", basicInfo); 
    const items = Array.from(adStructure.children);
    let outputHtml = `<h3>${basicInfo.title}</h3>\n`;
    items.forEach((item) => {
      const type = item.dataset.type;
      const inputs = item.querySelectorAll("input, textarea");
      const values = Array.from(inputs).map((input) => input.value.trim());
      switch (type) {
        case "text":
          outputHtml += generateTextHtml(values[0]);
          break;
        case "image":
          outputHtml += generateImageHtml(basicInfo, values[0], values[1]);
          break;
        case "article-style":
          outputHtml += generateArticleStyleHtml(basicInfo, values[0], values[1]);
          break;
        case "例文①":
        case "例文②":
        case "例文③":
          outputHtml += generateExampleHtml(type, values[0], values[1]);
          break;
        case "ボタン①":
        case "ボタン②":
        case "ボタン③":
          outputHtml += generateButtonHtml(basicInfo, type, values[0]);
          break;
        default:
          outputHtml += "<!-- 未定義の項目 -->\n";
      }
    });

    displayOutput(outputHtml);
  });
}
  
  function collectBasicInfo() {
    const title = document.getElementById("title")?.value.trim() || "未設定のタイトル";
    const pcChecked = document.getElementById("pc")?.checked || false;
    const spChecked = document.getElementById("sp")?.checked || false;
    const idType = document.querySelector('input[name="idType"]:checked')?.value || "same";
    console.log("Debug: Title -", title);
    console.log("Debug: PC Checked -", pcChecked);
    console.log("Debug: SP Checked -", spChecked);
    console.log("Debug: ID Type -", idType);
    const lpId = idType === "same" ? document.getElementById("lpId")?.value.trim() || "未設定のLPID" : null;
    const pcLpId = idType === "different" ? document.getElementById("pcLpId")?.value.trim() || "未設定のPC LPID" : lpId;
    const spLpId = idType === "different" ? document.getElementById("spLpId")?.value.trim() || "未設定のSP LPID" : lpId;
    console.log("Debug: LP ID -", lpId);
    console.log("Debug: PC LP ID -", pcLpId);
    console.log("Debug: SP LP ID -", spLpId);
    const adId = idType === "same" ? document.getElementById("adId")?.value.trim() || "未設定の広告ID" : null;
    const pcAdId = idType === "different" ? document.getElementById("pcAdId")?.value.trim() || "未設定のPC広告ID" : adId;
    const spAdId = idType === "different" ? document.getElementById("spAdId")?.value.trim() || "未設定のSP広告ID" : adId;
    console.log("Debug: Ad ID -", adId);
    console.log("Debug: PC Ad ID -", pcAdId);
    console.log("Debug: SP Ad ID -", spAdId);
    const destination = document.getElementById("destination")?.value || "lp";
    const pcLineUrl = document.getElementById("pcLineUrl")?.value.trim() || "未設定のPC LINE URL";
    const spLineUrl = document.getElementById("spLineUrl")?.value.trim() || "未設定のSP LINE URL";
    console.log("Debug: Destination -", destination);
    console.log("Debug: PC Line URL -", pcLineUrl);
    console.log("Debug: SP Line URL -", spLineUrl);
  
    const collectedInfo = {
      title,
      pcChecked,
      spChecked,
      idType,
      lpId,
      pcLpId,
      spLpId,
      pcAdId,
      spAdId,
      destination,
      pcLineUrl,
      spLineUrl,
    };
  
    console.log("Collected Basic Info:", collectedInfo);
    return collectedInfo;
  }
  
  function generateTextHtml(text) {
    const formattedHtml = text
      .replace(/([。！])(?!<\/p>)/g, "$1</p><p>")
      .replace(/<\/p>(\s|&nbsp;|<br>)*<p>/g, "</p><p>")
      .replace(/<p>(&nbsp;|\s|<br>)*<\/p>/g, "");
    return `<p>${formattedHtml}</p>\n`;
  }  
  
  function generateImageHtml(info, url, alt) {
    const pcHtml = info.pcChecked
      ? `<p class="pc"><a class="spark" href="${info.destination === 'lp' ? `https://digmee.jp/lp/${info.pcLpId}?creative_id=${info.pcAdId}_pc` : info.pcLineUrl}" id="${info.pcAdId}_pc"><img alt="${alt}" src="${url}" /></a></p>`
      : "";
    const spHtml = info.spChecked
      ? `<p class="sp"><a class="spark" href="${info.destination === 'lp' ? `https://digmee.jp/lp/${info.spLpId}?creative_id=${info.spAdId}_sp` : info.spLineUrl}" id="${info.spAdId}_sp"><img alt="${alt}" src="${url}" /></a></p>`
      : "";
    return `${pcHtml}\n${spHtml}`;
  }  
  
  function generateArticleStyleHtml(info, url, text) {
    return `
  <section class="_clear" id="spark">
    <div class="Relation_container">
      <div class="Relation_box">
        <div class="Relation_box_wrapper">
          <div class="Relation_box_thumbnail">
            <a class="Relation_box_link spark pc" href="https://digmee.jp/lp/${info.lpId}?creative_id=${info.pcAdId}_pc" id="${info.pcAdId}_pc">
              <img alt="${text}" src="${url}" />
            </a>
            <a class="Relation_box_link spark sp" href="https://digmee.jp/lp/${info.lpId}?creative_id=${info.spAdId}_sp" id="${info.spAdId}_sp">
              <img alt="${text}" src="${url}" />
            </a>
          </div>
          <div class="Relation_box_body">
            <p class="Relation_box_title">
              <a class="spark pc" href="https://digmee.jp/lp/${info.lpId}?creative_id=${info.pcAdId}_pc">${text}</a>
              <a class="spark sp" href="https://digmee.jp/lp/${info.lpId}?creative_id=${info.spAdId}_sp">${text}</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>\n`;
  }
  
  function generateExampleHtml(type, title, body) {
    switch (type) {
      case "例文①":
        return `<div class="title-box3"><div class="title-box3-title">${title}</div><div class="title-box3-inner"><p>${body}</p></div></div>\n`;
      case "例文②":
        return `<div class="memobox"><div class="memobox-title">${title}</div><p>${body}</p></div>\n`;
      case "例文③":
        return `<div class="box27 b"><span class="box-title">${title}</span>${body}</div>\n`;
      default:
        return "";
    }
  }
  
  function generateButtonHtml(info, type, text) {
    switch (type) {
      case "ボタン①":
        return generateStyledButtonHtml(
          info,
          "kobabtns2",
          text
        );
      case "ボタン②":
        return generateStructuredButtonHtml(
          info,
          "koba04_button",
          "koba04_section",
          text
        );
      case "ボタン③":
        return generateCustomButtonHtml(
          info,
          "custom-btn btn-11",
          text
        );
      default:
        return "";
    }
  }
  function generateStyledButtonHtml(info, className, text) {
    let outputHtml = "";
    let hasButton = false;
  
    if (info.pcChecked) {
      outputHtml += `
        <div class="${className} pc" id="start-btn"><a class="spark" href="${info.destination === "lp" ? `https://digmee.jp/lp/${info.pcLpId}?creative_id=${info.pcAdId}_pc` : info.pcLineUrl}" id="${info.pcAdId}_pc">${text}</a></div>`;
      hasButton = true;
    }
  
    if (info.spChecked) {
      outputHtml += `
        <div class="${className} sp" id="start-btn"><a class="spark" href="${info.destination === "lp" ? `https://digmee.jp/lp/${info.spLpId}?creative_id=${info.spAdId}_sp` : info.spLineUrl}" id="${info.spAdId}_sp">${text}</a></div>`;
      hasButton = true;
    }
    if (hasButton) {
      outputHtml += `
  <style>
  @keyframes shine {
      0% {
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.3), 0 0 20px rgba(255, 255, 255, 0.2);
      }
      50% {
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.5), 0 0 40px rgba(255, 255, 255, 0.4);
      }
      100% {
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.3), 0 0 20px rgba(255, 255, 255, 0.2);
      }
  }
  @keyframes float {
      0%, 100% {
          transform: translateY(0);
      }
      50% {
          transform: translateY(-10px);
      }
  }
  .kobabtns2 {
      text-align: center;
      margin: 0px auto;
      width: 60%;
      height: auto;
      background-color: #36454f;
      color: #ffffff!important;
      font-weight: 700;
      font-size: 1.7em;
      border-radius: 50px;
      user-select: none;
      animation: shine 0.8s infinite alternate, float 1.5s infinite ease-in-out;
  }
  .kobabtns2 a {
      color: #ffffff!important;
      padding: 20px 0;
      display: block;
  }
  .kobabtns2:hover {
      background-color: #27496d!;
      color: #ffcc00!important;
      box-shadow: 0px 12px 20px rgba(0, 0, 0, 0.5);
      animation: shine 0.6s infinite alternate, float 1s infinite ease-in-out;
  }
  .kobabtns2 a:hover {
      color: #ffcc00!important;
  }
  .kobabtns2:active {
      background-color: #0f171b;
      box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.2);
      transform: translateY(0);
  }
  </style>`;
    }
    return outputHtml;
  }  
  
  function generateStructuredButtonHtml(info, buttonClass, sectionClass, text) {
    let pcHtml = "";
    let spHtml = "";
    if (info.pcChecked) {
      pcHtml = `
        <div class="${sectionClass} pc"><a class="${buttonClass} pc spark" href="${info.destination === "lp" ? `https://digmee.jp/lp/${info.pcLpId}?creative_id=${info.pcAdId}_pc` : info.pcLineUrl}" id="${info.pcAdId}_pc">${text}</a></div>`;
    }
    if (info.spChecked) {
      spHtml = `
        <div class="${sectionClass} sp"><a class="${buttonClass} sp spark" href="${info.destination === "lp" ? `https://digmee.jp/lp/${info.spLpId}?creative_id=${info.spAdId}_sp` : info.spLineUrl}" id="${info.spAdId}_sp">${text}</a></div>`;
    }
    return `${pcHtml}\n${spHtml}`;
  }
  function generateCustomButtonHtml(info, buttonClass, text) {
    let pcHtml = "";
    let spHtml = "";
    if (info.pcChecked) {
      pcHtml = `
        <div class="pc"><p><a class="${buttonClass} spark" href="${info.destination === "lp" ? `https://digmee.jp/lp/${info.pcLpId}?creative_id=${info.pcAdId}_pc` : info.pcLineUrl}" id="${info.pcAdId}_pc">${text}</a></p></div>`;
    }
    if (info.spChecked) {
      spHtml = `
        <div class="sp"><p><a class="${buttonClass} spark" href="${info.destination === "lp" ? `https://digmee.jp/lp/${info.spLpId}?creative_id=${info.spAdId}_sp` : info.spLineUrl}" id="${info.spAdId}_sp">${text}</a></p></div>`;
    }
    return `${pcHtml}\n${spHtml}`;
  }  
  
  function displayOutput(html) {
    let outputContainer = document.getElementById("generated-ad-container");
  
    // 既存のコンテナがない場合は新規作成
    if (!outputContainer) {
      outputContainer = document.createElement("div");
      outputContainer.id = "generated-ad-container";
      outputContainer.classList.add("mt-8", "p-4", "bg-gray-100", "rounded");
      document.querySelector("#content").appendChild(outputContainer);
    }
  
    // 内容を更新
    outputContainer.innerHTML = `
      <textarea class="w-full h-48 border rounded p-2">${html}</textarea>
      <button id="copyButton" class="px-4 py-2 bg-blue-500 text-white rounded mt-4">コピー</button>
    `;
  
    // コピーボタンの動作を設定
    const copyButton = outputContainer.querySelector("#copyButton");
    copyButton.addEventListener("click", () => {
      navigator.clipboard.writeText(html).then(() => {
        alert("HTMLがコピーされました！");
      });
    });
  
    // コンテナまでスクロール
    outputContainer.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  